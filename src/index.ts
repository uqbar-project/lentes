const { isArray } = Array
const { assign } = Object

interface LensTransformer<From, To> {
  (target: From, value: To | ((current: To) => To)): From,
  (target: From): To,
  toString(): string,
}

type LensBuilder<From, To> = To extends Array<infer Sub>
  ? ArrayLensBuilder<From, Sub>
  : ObjectLensBuilder<From, To>

type ObjectLensBuilder<From, To> = {
  [Key in keyof To]: Lens<From, To[Key]>
}

interface ArrayLensBuilder<From, To> {
  [index: number]: Lens<From, To>
}

export type Lens<From, To> = LensBuilder<From, To> & LensTransformer<From, To>


type Step<T> = T extends Array<any> ? number : keyof T
type Next<T, K extends Step<T>> =
  T extends Array<infer Sub> ? Sub :
  K extends keyof T ? T[K] :
  never


function id<From>(): Lens<From, From> {
  return new Proxy(((target: From, value?: From) => value ? value : target) as Lens<From, From>, {
    get<K extends Step<From>>(_: Lens<From, From>, key: K, current: Lens<From, From>): Lens<From, Next<From, K>> | (() => string) {
      if (key === Symbol.toPrimitive || key === 'toString') return () => '/'
      return lens<From, From, Next<From, K>>(key, current)
    },
  })
}


function lens<From, Prev, To>(step: Step<Prev>, previous: LensTransformer<From, Prev>): Lens<From, To> {
  return new Proxy(((t: From, _: To) => t) as Lens<From, To>, {
    get<K extends Step<To>>(_: Lens<From, To>, key: K, current: Lens<From, To>): Lens<From, Next<To, K>> | (() => string) {
      if (key === Symbol.toPrimitive || key === 'toString') return () => `${previous}${step}/`
      return lens<From, To, Next<To, K>>(key, current)
    },

    apply(_1, _2, args) {
      function read(target: From): To {
        const prev = previous(target)
        if (isArray(prev) && !isNaN(Number(step))) return prev[step] as any as To
        if (!isArray(prev)) return prev[step as keyof Prev] as any as To
        throw new TypeError(`Invalid step ${step} for ${prev}`)
      }

      function update(target: From, value: To | ((p: To) => To)): From {
        const prev = previous(target)
        const next = typeof value === 'function' ? value(read(target)) : value
        if (isArray(prev) && !isNaN(Number(step))) return previous(target, assign([], prev, { [step]: next }))
        if (!isArray(prev)) return previous(target, assign({}, prev, { [step]: next }))
        throw new TypeError(`Invalid step ${step} for ${prev}`)
      }

      return args[1] === undefined ? read(args[0]) : update(args[0], args[1])
    },
  })

}

export default function <T>(_?: T): Lens<T, T> { return id<T>() }