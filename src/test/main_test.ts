import {expect} from 'chai';
import * as lib from '../main';

describe('Stub', () => {
  describe('called', () => {
    it('should determine if stub has been called', () => {
      const stub = lib.spy();
      expect(stub.called).to.equal(false);
      stub.handler();
      expect(stub.called).to.equal(true);
    });
  });

  describe('returned', () => {
    it('should determine if stub returned a given value', () => {
      const stub = lib.stub((x: number) => x + x);
      stub.passThrough();
      stub.handler(5);
      expect(stub.returned(10)).to.equal(true);
      expect(stub.returned(5)).to.equal(false);
    });
  });

  describe('calledWith', () => {
    it('should determine if stub was called with args', () => {
      const stub = lib.spy();
      stub.handler(1, 2);
      expect(stub.calledWith(1, 2)).to.equal(true);
      expect(stub.calledWith(3, 4)).to.equal(false);
    });

    it('should support optional parameters', () => {
      const stub = lib.stub((x: number, y?: number) => [x, y]);

      stub.handler(1, 2);
      stub.handler(1);

      expect(stub.calledWith(1, 2)).to.equal(true);
      expect(stub.calledWith(1)).to.equal(true);
      expect(stub.calledWith(1, 3)).to.equal(false);
    });
  });

  describe('firstCall', () => {
    it('should retrieve the first call', () => {
      const stub = lib.spy();
      stub.handler(1);
      stub.handler(2);
      expect(stub.firstCall).to.deep.equal({
        args: [1],
        returnValue: undefined
      });
    });
  });

  describe('lastCall', () => {
    it('should retrieve the last call', () => {
      const stub = lib.spy();
      stub.handler(1);
      stub.handler(2);
      expect(stub.lastCall).to.deep.equal({
        args: [2],
        returnValue: undefined
      });
    });
  });

  describe('getCall', () => {
    it('should retrieve a specific call', () => {
      const stub = lib.spy();
      stub.handler(1);
      stub.handler(2);

      expect(stub.getCall(0)).to.deep.equal({
        args: [1],
        returnValue: undefined
      });
      expect(stub.getCall(1)).to.deep.equal({
        args: [2],
        returnValue: undefined
      });
    });
  });

  describe('calls', () => {
    it('should return all calls tracked', () => {
      const stub = lib.spy();
      expect(stub.calls.size).to.equal(0);

      stub.handler(1, 2, 3);
      stub.handler('foo');

      expect([...stub.calls]).to.deep.equal([
        {
          args: [1, 2, 3],
          returnValue: undefined
        },
        {
          args: ['foo'],
          returnValue: undefined
        }
      ]);
    });

    it('should track return values', () => {
      const stub = lib.spy();
      stub.returns(1209);
      stub.handler();
      expect([...stub.calls]).to.deep.equal([
        {
          args: [],
          returnValue: 1209
        }
      ]);
    });
  });

  describe('callCount', () => {
    it('should return number of times stub was called', () => {
      const stub = lib.spy();
      expect(stub.callCount).to.equal(0);
      stub.handler();
      expect(stub.callCount).to.equal(1);
      stub.handler();
      expect(stub.callCount).to.equal(2);
    });
  });

  describe('returns', () => {
    it('should set return value', () => {
      const stub = lib.spy();
      stub.returns(1209);
      expect(stub.handler()).to.equal(1209);
      stub.returns('foo');
      expect(stub.handler()).to.equal('foo');
    });
  });

  describe('callsFake', () => {
    it('should set return function', () => {
      const stub = lib.spy();
      stub.callsFake(() => {
        return 1002;
      });
      expect(stub.handler()).to.equal(1002);
    });

    it('should be passed args', () => {
      const stub = lib.spy();
      stub.callsFake((x, y, z) => {
        return [x, y, z];
      });
      expect(stub.handler(1, 2, 3)).to.deep.equal([1, 2, 3]);
    });
  });

  describe('passThrough', () => {
    it('should pass through to original function', () => {
      const Klass = class {
        public someMethod(): number {
          return 105;
        }
      };
      const instance = new Klass();
      const stub = lib.stubMethod(instance, 'someMethod');

      expect(stub.handler()).to.equal(undefined);
      stub.passThrough();
      expect(stub.handler()).to.equal(105);
    });
  });

  describe('reset', () => {
    it('should reset call state', () => {
      const stub = lib.spy();
      stub.handler();

      expect(stub.callCount).to.equal(1);
      expect(stub.called).to.equal(true);
      expect([...stub.calls]).to.deep.equal([
        {
          args: [],
          returnValue: undefined
        }
      ]);

      stub.reset();

      expect(stub.callCount).to.equal(0);
      expect(stub.called).to.equal(false);
      expect([...stub.calls]).to.deep.equal([]);
    });
  });

  describe('restore', () => {
    it('should call restore callback', () => {
      const stub = lib.spy();
      let called = false;
      stub.restoreCallback = (): void => {
        called = true;
      };

      stub.restore();
      expect(called).to.equal(true);
    });
  });
});

describe('restore', () => {
  it('should restore all stubs', () => {
    const Klass = class {
      public someMethod(): number {
        return 105;
      }
    };
    const instance1 = new Klass();
    const instance2 = new Klass();

    const original1 = instance1.someMethod;
    const original2 = instance2.someMethod;

    const stub1 = lib.stubMethod(instance1, 'someMethod');
    const stub2 = lib.stubMethod(instance2, 'someMethod');

    expect(instance1.someMethod).to.equal(stub1.handler);
    expect(instance2.someMethod).to.equal(stub2.handler);

    lib.restore();

    expect(instance1.someMethod).to.equal(original1);
    expect(instance2.someMethod).to.equal(original2);
  });
});

describe('spy', () => {
  it('should create an anonymous stub', () => {
    const spy = lib.spy();
    expect(spy.handler(1, 2, 3)).to.equal(undefined);
    expect(spy.handler()).to.equal(undefined);
    expect([...spy.calls]).to.deep.equal([
      {
        args: [1, 2, 3],
        returnValue: undefined
      },
      {
        args: [],
        returnValue: undefined
      }
    ]);
  });

  it('should create a typed stub', () => {
    const spy = lib.spy<(x: number) => string>();
    const fn: (x: number) => string = spy.handler;
    expect(fn(5)).to.equal(undefined);
  });
});

describe('stub', () => {
  it('should stub a function', () => {
    const fn = (): number => 1500;
    const stub = lib.stub(fn);
    expect(stub.handler()).to.equal(undefined);
    expect(stub.original).to.equal(fn);
    expect([...stub.calls]).to.deep.equal([
      {
        args: [],
        returnValue: undefined
      }
    ]);
  });
});

describe('stubMethod', () => {
  it('should stub given method', () => {
    const Klass = class {
      public someMethod(): number {
        return 105;
      }
    };
    const instance = new Klass();
    const original = instance.someMethod;
    const stub = lib.stubMethod(instance, 'someMethod');

    expect(stub.handler()).to.equal(undefined);
    expect(stub.original).to.equal(original);
    expect(instance.someMethod).to.equal(stub.handler);
    expect([...stub.calls]).to.deep.equal([
      {
        args: [],
        returnValue: undefined
      }
    ]);
  });

  describe('restore', () => {
    it('should restore original method', () => {
      const Klass = class {
        public someMethod(): number {
          return 105;
        }
      };
      const instance = new Klass();
      const original = instance.someMethod;
      const stub = lib.stubMethod(instance, 'someMethod');

      expect(instance.someMethod).to.equal(stub.handler);

      stub.restore();

      expect(instance.someMethod).to.equal(original);
    });
  });
});
