import { describe, it, expectTypeOf } from 'vitest';

describe('DeepReadonly', () => {
  it('should make all properties readonly recursively', () => {
    type Nested = {
      a: string;
      b: {
        c: number;
        d: {
          e: boolean;
        };
      };
      f: () => void;
    };

    type ReadonlyNested = DeepReadonly<Nested>;
    
    expectTypeOf<ReadonlyNested>().toEqualTypeOf<{
      readonly a: string;
      readonly b: {
        readonly c: number;
        readonly d: {
          readonly e: boolean;
        };
      };
      readonly f: () => void;
    }>();
    
    expectTypeOf<ReadonlyNested['f']>().toEqualTypeOf<() => void>();
    
    expectTypeOf<ReadonlyNested['b']['d']['e']>().toEqualTypeOf<boolean>();
  });

  it('should handle primitive types', () => {
    type Primitive = {
      str: string;
      num: number;
      bool: boolean;
      sym: symbol;
    };

    type ReadonlyPrimitive = DeepReadonly<Primitive>;
    
    expectTypeOf<ReadonlyPrimitive>().toMatchObjectType<{
      readonly str: string;
      readonly num: number;
      readonly bool: boolean;
      readonly sym: symbol;
    }>();
  });

  it('should handle arrays and tuples', () => {
    type WithArray = {
      arr: number[];
      tuple: [string, boolean];
    };

    type ReadonlyWithArray = DeepReadonly<WithArray>;
    
    expectTypeOf<ReadonlyWithArray>().toMatchObjectType<{
      readonly arr: readonly number[];
      readonly tuple: readonly [string, boolean];
    }>();
  });
});

describe('PickedByType', () => {
  it('should pick properties of specific type', () => {
    type TestType = {
      name: string;
      age: number;
      email: string;
      isActive: boolean;
      score: number;
    };

    type PickedStrings = PickedByType<TestType, string>;
    type PickedNumbers = PickedByType<TestType, number>;
    type PickedBooleans = PickedByType<TestType, boolean>;

    expectTypeOf<PickedStrings>().toMatchObjectType<{
      name: string;
      email: string;
    }>();

    expectTypeOf<PickedNumbers>().toMatchObjectType<{
      age: number;
      score: number;
    }>();

    expectTypeOf<PickedBooleans>().toMatchObjectType<{
      isActive: boolean;
    }>();
  });

  it('should return empty object if no properties match', () => {
    type TestType = {
      name: string;
      age: number;
    };

    type PickedBooleans = PickedByType<TestType, boolean>;
    
    expectTypeOf<PickedBooleans>().toMatchObjectType<{}>();
  });

  it('should handle union types', () => {
    type TestType = {
      a: string | number;
      b: string;
      c: number;
      d: string | boolean;
    };

    type PickedStringOrNumber = PickedByType<TestType, string | number>;
    
    expectTypeOf<PickedStringOrNumber>().toMatchObjectType<{
      a: string | number;
      b: string;
      c: number;
      //d: string | boolean;
    }>();
  });
});

describe('EventHandlers', () => {
  it('should convert event names to onEvent handlers', () => {
    type Events = {
      click: () => void;
      change: (value: string) => void;
      submit: (data: any) => Promise<void>;
    };

    type Handlers = EventHandlers<Events>;

    expectTypeOf<Handlers>().toMatchObjectType<{
      onClick: () => void;
      onChange: (value: string) => void;
      onSubmit: (data: any) => Promise<void>;
    }>();
  });

  it('should handle different event name formats', () => {
  type Events = {
    mouseEnter: () => void;
    mouseLeave: () => void;
    'custom-event': () => void;
    KEYDOWN: () => void;
    __internal: () => void;
  };

  type Handlers = EventHandlers<Events>;

   expectTypeOf<Handlers>().toMatchTypeOf<{
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onCustomEvent: () => void;
    onKEYDOWN: () => void;
    on__internal: () => void;
  }>();
});

  it('should preserve function signatures', () => {
    type Events = {
      click: (x: number, y: number) => boolean;
      update: <T>(data: T) => Promise<T>;
    };

    type Handlers = EventHandlers<Events>;

    expectTypeOf<Handlers['onClick']>().parameters.toEqualTypeOf<[x: number, y: number]>();
    expectTypeOf<Handlers['onClick']>().returns.toEqualTypeOf<boolean>();
    
    expectTypeOf<Handlers['onUpdate']>().toBeFunction();
  });

  it('should handle empty events object', () => {
    type EmptyEvents = {};
    type Handlers = EventHandlers<EmptyEvents>;
    
    expectTypeOf<Handlers>().toMatchObjectType<{}>();
  });
});
