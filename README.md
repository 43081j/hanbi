# hanbi

hanbi is a rather small and simple library for stubbing and spying on methods
and functions in JavaScript tests.

# Install

```
$ npm i -D hanbi
```

# Usage

## `spy()`

Creates a single "spy" function to be used as input into some other
function.

```ts
const test = spy();
window.addEventListener('load', spy.handler);
spy.called; // true once the event fires
```

## `stub(fn)`

Creates a wrapped version of a given function which tracks any calls.

```ts
const fn = () => 5;
const test = stub(fn);
test.handler(); // 5
test.called; // true
```

## `stubMethod(obj, method)`

Replaces a given method on an object with a wrapped (stubbed) version of it.

```ts
class Foo {
  myMethod() {
    return 5;
  }
}
const instance = new Foo();
const test = stubMethod(instance, 'myMethod');
instance.myMethod(); // undefined
test.called; // true
```

# Stub API

Each of the above mentioned entry points returns a `Stub` which has
several useful methods.

```ts
class Stub {
  /**
   * Wrapped function
   */
  handler;

  /**
   * Function to be called when stub is restored
   */
  restoreCallback;

  /**
   * Original function
   */
  original;

  /**
   * Whether or not this stub has been called
   */
  called;

  /**
   * List of all calls this stub has received
   */
  calls;

  /**
   * Number of times this stub has been called
   */
  callCount;

  /**
   * Specifies the value this stub should return
   * @param val Value to return
   */
  returns(val);

  /**
   * Specifies a function to call to retrieve the return value of this
   * stub
   * @param fn Function to call
   */
  callsFake(fn);

  /**
   * Enables pass-through, in that the original function is called when
   * this stub is called.
   */
  passThrough();

  /**
   * Resets call state (e.g. call count, calls, etc.)
   */
  reset();

  /**
   * Restores this stub.
   * This behaviour differs depending on what created the stub.
   */
  restore();
}
```
