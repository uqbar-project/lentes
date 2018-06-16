# Lentes

[![Build Status](https://travis-ci.org/uqbar-project/lentes.svg?branch=master)](https://travis-ci.org/uqbar-project/lentes)
[![npm version](https://badge.fury.io/js/lentes.svg)](https://badge.fury.io/js/lentes)

**Lentes** is an idiomatic TypeScript library for constructing fully typed [lenses](https://medium.com/@dtipson/functional-lenses-d1aba9e52254), a nice functional design pattern for navigating and transforming immutable objects, in a declarative and string-free way.


## Installation

*Lentes* is available on [npm](https://www.npmjs.com), just add it to your project's dependencies:

```bash
# if you use npm
npm install lentes --save

# or, if you rather use yarn
yarn add lentes
```


## So... What are lenses?

This library works around the idea of **Lenses**. You can think of *lens* as a bidirectional transform function that can be used to read or update a field nested deep inside an immutable object. So **instead of doing this:**

```typescript
const user = {
  name: 'User McUserson',
  transactions: [
    {kind: 'buy', ammount: 10 },
    {kind: 'buy', ammount: 20 },
    {kind: 'sell', ammount: 15 }
  ]
}

const updatedUser = {
  ...user,
  transactions: Object.assign([], user.transactions, {[1]: {...user.transactions[1], ammount: 25 }})
}
```

you can **do this:**

```typescript
const user = { ... }
const lens = lens(user).transactions[1].ammount

const updatedUser = lens(user, 25)
```

Lenses might also be used to **replace harcoded strings as object identifiers**. This is specially useful to link objects in separate graphs:

```typescript
const $user = lens(user)

// Instead of the error-prompt alternative:
createTextBox({value: 'user.name'})

// You can write
createTextBox({value: $user.name})
```


## Usage

Use the default export of the library to build *root* lenses:

```typescript
import lens from 'lentes'

// You can create lenses from a type...
const aLensForYourClass = lens<SomeType>()

// ...or a class instance...
const anotherLensForYourClass = lens(new SomeClass())

// ...or any other object.
const lensForThingsWithFoo = lens({foo: 'bar'})
```

Lenses expose the same properties as the types they are built from, which can be used to build **new lenses** pointing to those properties:

```typescript
const yourObject = { x: { ys: [{z: 1}, {z: 2}, {z: 3}] } }
const $yourObject = lens(yourObject)

// This lens points to the z field of the second entry in the ys array of the x field of yourObject.
const l = $yourObject.x.ys[1].z
```

Notice how you can build lens to a certain element of an array by accessing it's index on the array lens. Also, since lens are **fully typed**, you can navigate their interface aided by your favorite IDE autocomplete and invalid accesses will be rejected by the typechecker.

Once you have a lens, you can either apply it with a single argument to **retrieve the pointed value** or apply with a second argument to obtain a copy of the object **with that property updated**:

```typescript
const yourObject = { x: { ys: [{z: 1}, {z: 2}, {z: 3}] } }
const $yourObject = lens(yourObject)
const l = $yourObject.x.ys[1].z

l(yourObject) // returns 2
l(yourObject, 7) // returns { x: { ys: [{z: 1}, {z: 7}, {z: 3}] } }
```

Alternatively, you can use a *function* as second argument. If so, the object will be updated with the result of applying that function to the current value:

```typescript
const yourObject = { x: { ys: [{z: 1}, {z: 2}, {z: 3}] } }
const $yourObject = lens(yourObject)
const l = $yourObject.x.ys

l(yourObject, currentYs => [currentYs[2]]) // returns { x: { ys: [{z: 3}] } }
```

Lenses also convert to sensible strings that can be used as local ids:
```typescript
const yourObject = { x: { ys: [{z: 1}, {z: 2}, {z: 3}] } }
const $yourObject = lens(yourObject)
const l = $yourObject.x.ys[0].z

// All these lines return "/x/ys/0/z/"
l.toString()
l.toPrimitive()
`${l}`
```


## Contributions

Please report any bugs, requests or ideas on [the issues section of this repository](https://github.com/uqbar-project/lentes/issues) and we will try to see to it as soon as possible.
Pull requests are always welcome! Just try to keep them small and clean.


## License

This code is open source software licensed under the [ISC License](https://opensource.org/licenses/ISC) by [The Uqbar Foundation](http://www.uqbar-project.org/). Feel free to use it accordingly.