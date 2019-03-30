import { expect } from 'chai'
import { background, TODO } from '../src/entry'

describe('empty context', () => {
  it('background has correct API', () => {
    const c = background()
    expect(c).to.be.not.null
    expect(c.done()).to.be.null
    expect(c.err()).to.be.null
    expect(`${c}`).to.equal('context.background')
  })
  it('TODO has correct API', () => {
    const c = TODO()
    expect(c).to.be.not.null
    expect(c.done()).to.be.null
    expect(c.err()).to.be.null
    expect(`${c}`).to.equal('context.TODO')
  })
})
