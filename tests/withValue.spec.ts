import { expect } from 'chai'
import { OtherContext } from './_helpers'
import { background, withValue } from '../src/entry'
import { Context } from '../src/types'

const k1 = 'k'
const k2 = 1
const k3 = Symbol.for('key3')

function expectValues(c: Context, v1?: string, v2?: string, v3?: string) {
  expect(c.value(k1)).to.equal(v1)
  expect(c.value(k2)).to.equal(v2)
  expect(c.value(k3)).to.equal(v3)
}

describe('withValue', () => {
  it('withValue has correct API', () => {
    const c = withValue(background(), k1, 'v')
    expect(c).to.be.not.null
    expect(c.done()).to.be.null
    expect(c.err()).to.be.null
    expect(`${c}`).to.equal('context.background.withValue(k, v)')
  })
  it('provides correct values', () => {
    const c0 = background()
    expectValues(c0)

    const c1 = withValue(background(), k1, 'c1k1')
    expectValues(c1, 'c1k1')

    expect(`${c1}`).to.equal('context.background.withValue(k, c1k1)')

    const c2 = withValue(c1, k2, 'c2k2')
    expectValues(c2, 'c1k1', 'c2k2')

    const c3 = withValue(c2, k3, 'c3k3')
    expectValues(c3, 'c1k1', 'c2k2', 'c3k3')

    const c4 = withValue(c3, k1, '')
    expectValues(c4, '', 'c2k2', 'c3k3')

    const o0 = new OtherContext(background())
    expectValues(o0)

    const o1 = new OtherContext(withValue(background(), k1, 'c1k1'))
    expectValues(o1, 'c1k1')

    const o2 = withValue(o1, k2, 'o2k2')
    expectValues(o2, 'c1k1', 'o2k2')

    const o3 = new OtherContext(c4)
    expectValues(o3, '', 'c2k2', 'c3k3')

    const o4 = withValue(o3, k3, '')
    expectValues(o4, '', 'c2k2', '')
  })
})
