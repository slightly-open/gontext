import { expect } from 'chai'
import { OtherContext, getPromiseState, wrapWithTimeout } from './_helpers'
import { background, withDeadline, withTimeout } from '../src/entry'
import { Context } from '../src/types'
import DeadlineExceededError from '../src/errors/deadlineExceeded'

async function expectDeadline(c: Context, failAfterMs: number) {
  await wrapWithTimeout(failAfterMs, c.done() as Promise<void>)
  expect(await getPromiseState(c.done())).to.equal('resolved')
  expect(c.err()).to.be.an.instanceOf(DeadlineExceededError)
}

function dateIn(ms: number) {
  return new Date(Date.now() + ms)
}

describe('withDeadline', () => {
  it('withDeadline has correct API', () => {
    const [c] = withTimeout(background(), 500)
    expect(c).to.be.not.null
    expect(c.done()).to.be.not.null
    expect(c.err()).to.be.null
    expect(`${c}`).to.satisfy((s: string) => s.startsWith('context.background.withDeadline('))
  })
  it('withDeadline', async () => {
    let c: Context
    let o: Context
    ; [c] = withDeadline(background(), dateIn(50))
    await expectDeadline(c, 1000)

    ; [c] = withDeadline(background(), dateIn(50))
    o = new OtherContext(c)
    await expectDeadline(o, 1000)

    ; [c] = withDeadline(background(), dateIn(50))
    o = new OtherContext(c)
    ; [c] = withDeadline(o, dateIn(5000))
    await expectDeadline(o, 1000)

    ; [c] = withDeadline(background(), dateIn(-50))
    await expectDeadline(o, 1000)

    ; [c] = withDeadline(background(), new Date())
    await expectDeadline(o, 1000)
  })
})
