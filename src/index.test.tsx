import { expect } from 'chai'
import lens, { Lens } from '.'

class A {
  n: number = 5
  b: B = new B()
  bs: B[] = [new B(), new B()]
}

class B {
  m: number = 7
}

const a = new A()
const o = { n: 5 }

const $A: Lens<A, A> = lens<A>()
const $O = lens<typeof o>()

describe('Lenses', () => {

  it('should be buildable from a type', () => {
    expect(() => lens<A>()).to.not.throw()
  })

  it('should be buildable from an instance', () => {
    expect(() => lens(new A())).to.not.throw()
  })

  it('should be usable to retrieve identity', () => {
    expect($A(a)).to.deep.equal(a)
  })

  it('should be usable to retrieve shallow properties', () => {
    expect($A.n(a)).to.deep.equal(5)
    expect($O.n(o)).to.deep.equal(5)
  })

  it('should be usable to retrieve deep properties', () => {
    expect($A.b.m(a)).to.deep.equal(7)
  })

  it('should be usable to retrieve array elements', () => {
    expect($A.bs[0].m(a)).to.deep.equal(7)
  })

  it('should be usable to update identity', () => {
    const other = new A()
    expect(a).to.not.equal(other)
    expect($A(a, other)).to.equal(other)
  })

  it('should be usable to update shallow properties', () => {
    expect($A.n(a, 12)).to.deep.equal({ ...a, n: 12 })
  })

  it('should be usable to update deep properties', () => {
    expect($A.b.m(a, 12)).to.deep.equal({ ...a, b: { ...a.b, m: 12 } })
  })

  it('should be usable to update array elements', () => {
    expect($A.bs[1].m(a, 12)).to.deep.equal({ ...a, bs: [a.bs[0], { ...a.bs[1], m: 12 }] })
  })

  it('should be usable to update elements by transforming them with a function', () => {
    const other = new B()
    expect($A.bs(a, bs => [...bs, other])).to.deep.equal({ ...a, bs: [...a.bs, other] })
  })

  it('should be convertible to a well formed string id', () => {
    expect(`${$A}`).to.equal('/')
    expect(`${$A.b}`).to.equal('/b/')
    expect(`${$A.b.m}`).to.equal('/b/m/')
    expect(`${$A.bs[1].m}`).to.equal('/bs/1/m/')
    expect($A.bs[1].m.toString()).to.equal('/bs/1/m/')
    expect($A.bs[1].m + '').to.equal('/bs/1/m/')
    expect('' + $A.bs[1].m).to.equal('/bs/1/m/')
  })

})