// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FunctionLike = (...args: any[]) => any;

export interface StubCall<TArgs, TReturn> {
  readonly args: TArgs;
  readonly returnValue?: TReturn;
  readonly thisValue: unknown;
}

/**
 * Represents a single stubbed function
 */
export class Stub<T extends FunctionLike> {
  /**
   * Wrapped function
   */
  public handler: T;

  /**
   * Function to be called when stub is restored
   */
  public restoreCallback?: () => void;

  /**
   * Original function
   */
  public original: T;

  protected _calls: Set<StubCall<Parameters<T>, ReturnType<T>>> = new Set();
  protected _returnValue?: ReturnType<T>;
  protected _returnFunction?: T;

  /**
   * Whether or not this stub has been called
   */
  public get called(): boolean {
    return this._calls.size > 0;
  }

  /**
   * List of all calls this stub has received
   */
  public get calls(): ReadonlySet<StubCall<Parameters<T>, ReturnType<T>>> {
    return this._calls;
  }

  /**
   * Retrieves an individual call
   * @param index Index of the call to retrieve
   * @return Call at the specified index
   */
  public getCall(index: number): StubCall<Parameters<T>, ReturnType<T>> {
    return [...this._calls][index];
  }

  /**
   * Retrieves the first call
   * @return Call object
   */
  public get firstCall(): StubCall<Parameters<T>, ReturnType<T>> | undefined {
    return this.getCall(0);
  }

  /**
   * Retrieves the last call
   * @return Call object
   */
  public get lastCall(): StubCall<Parameters<T>, ReturnType<T>> | undefined {
    return this.getCall(this.callCount - 1);
  }

  /**
   * Number of times this stub has been called
   */
  public get callCount(): number {
    return this._calls.size;
  }

  /**
   * Constructor
   * @param fn Function being stubbed
   */
  public constructor(fn: T) {
    this.original = fn;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.handler = function handler(
      this: unknown,
      ...args: Parameters<T>
    ): ReturnType<T> | undefined {
      // eslint-disable-next-line no-invalid-this
      return self._handleCall.call(self, this, args);
    } as T;
  }

  /**
   * Processes an individual call to this stub
   * @param thisValue Context of the call (`this`)
   * @param args Arguments passed when being called
   * @return Return value of this call
   */
  protected _handleCall(
    thisValue: unknown,
    args: Parameters<T>
  ): ReturnType<T> | undefined {
    const returnValue = this._returnFunction
      ? this._returnFunction.apply(thisValue, args)
      : this._returnValue;
    this._calls.add({
      args: args,
      thisValue,
      returnValue
    });
    return returnValue;
  }

  /**
   * Specifies the value this stub should return
   * @param val Value to return
   * @return {this}
   */
  public returns(val: ReturnType<T>): this {
    this._returnFunction = undefined;
    this._returnValue = val;
    return this;
  }

  /**
   * Specifies a function to call to retrieve the return value of this
   * stub
   * @param fn Function to call
   * @return {this}
   */
  public callsFake(fn: (...args: Parameters<T>) => ReturnType<T>): this {
    this._returnValue = undefined;
    this._returnFunction = fn as T;
    return this;
  }

  /**
   * Enables pass-through, in that the original function is called when
   * this stub is called.
   * @return {this}
   */
  public passThrough(): this {
    this.callsFake(this.original);
    return this;
  }

  /**
   * Resets call state (e.g. call count, calls, etc.)
   */
  public reset(): void {
    this._calls.clear();
  }

  /**
   * Restores this stub.
   * This behaviour differs depending on what created the stub.
   */
  public restore(): void {
    if (this.restoreCallback) {
      this.restoreCallback();
    }
  }

  /**
   * Asserts that the stub was called with a set of arguments
   * @param args Arguments to assert for
   * @return Whether they were passed or not
   */
  public calledWith(...args: Parameters<T>): boolean {
    return [...this.calls].some(
      (call) =>
        call.args.length === args.length &&
        call.args.every((arg, idx) => args[idx] === arg)
    );
  }

  /**
   * Asserts that the stub returned a given value
   * @param val Value to check for
   * @return Whether the value was ever returned or not
   */
  public returned(val: ReturnType<T>): boolean {
    return [...this.calls].some((call) => call.returnValue === val);
  }
}

export type StubbedFunction<T> = T extends FunctionLike ? T : FunctionLike;

const stubbedMethods = new Set<{restore(): void}>();

/**
 * Stubs a method of a given object.
 * @param obj Object the method belongs to
 * @param method Method name to stub
 * @return Stubbed method
 */
export function stubMethod<TObj, TKey extends keyof TObj>(
  obj: TObj,
  method: TKey
): Stub<StubbedFunction<TObj[TKey]>> {
  const instance = new Stub<StubbedFunction<TObj[TKey]>>(
    obj[method] as StubbedFunction<TObj[TKey]>
  );
  obj[method] = instance.handler as TObj[TKey];
  instance.restoreCallback = (): void => {
    obj[method] = instance.original as TObj[TKey];
    stubbedMethods.delete(instance);
  };
  stubbedMethods.add(instance);
  return instance;
}

/**
 * Spies a method of a given object.
 * @param obj Object the method belongs to
 * @param method Method name to spy
 * @return Stubbed method
 */
export function spyMethod<TObj, TKey extends keyof TObj>(
  obj: TObj,
  method: TKey
): Stub<StubbedFunction<TObj[TKey]>> {
  return stubMethod(obj, method).passThrough();
}

/**
 * Stubs a given function.
 * @param fn Function to stub
 * @return Stubbed function
 */
export function stub<T extends FunctionLike>(fn: T): Stub<T> {
  const result = new Stub<T>(fn);
  return result;
}

/**
 * Creates an anonymous spy.
 * @return Anonymous stub
 */
export function spy<T extends FunctionLike = FunctionLike>(): Stub<T> {
  return new Stub<T>((() => {
    return;
  }) as T);
}

/**
 * Restores all tracked stubs at once.
 */
export function restore(): void {
  for (const stub of stubbedMethods) {
    stub.restore();
  }

  stubbedMethods.clear();
}
