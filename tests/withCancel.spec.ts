import { expect } from 'chai'
import { OtherContext, sleep, getPromiseState } from './_helpers'
import { background, withCancel, withValue, withTimeout } from '../src/entry'
import { getParentCancelContext } from '../src/core'
import CanceledError from '../src/errors/canceledError'
import CancelContext from '../src/contexts/cancelContext'
import TimerContext from '../src/contexts/timerContext'

describe('withCancel', () => {
  it('withCancel has correct API', async () => {
    const [c1, cancel] = withCancel(background())
    expect(`${c1}`).to.equal('context.background.withCancel')

    const o = new OtherContext(c1)
    const [c2] = withCancel(o)
    const contexts = [c1, o, c2]
    for (const c of contexts) {
      expect(c.done()).to.be.not.null
      expect(c.done()).to.equal(c.done(), 'c.done() should always return the same instance')
      expect(c.err()).to.be.null
      expect(await getPromiseState(c.done())).to.equal('pending')
    }

    cancel()
    await sleep(10) // let cancellation propagate

    for (const c of contexts) {
      expect(await getPromiseState(c.done())).to.equal('resolved')
      expect(c.err()).to.be.an.instanceOf(CanceledError)
      expect(c.err()).to.equal(c.err(), 'c.err() should always return the same instance')
    }
  })
  it('parent finishes child', async () => {
    // Context tree:
    // parent -> cancelChild
    // parent -> valueChild -> timerChild
    const [parent, cancel] = withCancel(background())
    const [cancelChild] = withCancel(parent)
    const valueChild = withValue(parent, 'key', 'value')
    const [timerChild] = withTimeout(valueChild, 10 * 60 * 60 * 1000)
    expect(await getPromiseState(parent.done())).to.equal('pending')
    expect(await getPromiseState(cancelChild.done())).to.equal('pending')
    expect(await getPromiseState(valueChild.done())).to.equal('pending')
    expect(await getPromiseState(timerChild.done())).to.equal('pending')

    // The parent's children should contain the two cancelable children.
    const pc = parent as CancelContext
    const cc = cancelChild as CancelContext
    const tc = timerChild as TimerContext

    expect(pc._children).to.include(cc)
    expect(pc._children).to.include(tc)
    expect(pc._children).to.have.lengthOf(2)

    expect(getParentCancelContext(cc.context)).to.be.equal(pc)
    expect(getParentCancelContext(tc._cancelContext.context)).to.be.equal(pc)

    cancel()

    expect(pc._children).to.be.null
    for (const c of [parent, cancelChild, valueChild, timerChild]) {
      expect(await getPromiseState(c.done())).to.equal('resolved')
      expect(c.err()).to.be.an.instanceOf(CanceledError)
    }

    // withCancel should return a canceled context on a canceled parent.
    const precanceledChild = withValue(parent, 'key', 'value')
    expect(await getPromiseState(precanceledChild.done())).to.equal('resolved')
    expect(precanceledChild.err()).to.be.an.instanceOf(CanceledError)
  })
  it('child finishes first', async () => {
    const [cancelable] = withCancel(background())
    for (const parent of [background(), cancelable]) {
      const pcok = parent !== background()
      const [child, cancel] = withCancel(parent)
      expect(await getPromiseState(parent.done())).to.equal(pcok ? 'pending' : 'null')
      expect(await getPromiseState(child.done())).to.equal('pending')
      const cc = child as CancelContext
      const pc = parent as CancelContext
      if (pcok) {
        expect(getParentCancelContext(cc.context)).to.equal(pc)
      } else {
        expect(getParentCancelContext(cc.context)).to.be.null
      }

      if (pcok) {
        expect(pc._children).to.include(cc)
        expect(pc._children).to.have.lengthOf(1)
      }

      cancel()

      if (pcok) {
        expect(pc._children).to.be.empty
      }

      // child should be finished.
      expect(await getPromiseState(child.done())).to.equal('resolved')
      expect(child.err()).to.be.an.instanceOf(CanceledError)

      // parent should not be finished.
      expect(await getPromiseState(parent.done())).to.equal(pcok ? 'pending' : 'null')
      expect(parent.err()).to.be.null
    }
  })
})
