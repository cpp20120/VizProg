type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends Record<string, any>
        ? T[K] extends Function
            ? T[K]
            : DeepReadonly<T[K]>
        : T[K];
};

type PickedByType<T, U> = {
    [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type KebabToCamelCase<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}${KebabToCamelCase<Capitalize<U>>}`
  : S;


type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<KebabToCamelCase<K & string>>}`]: T[K];
} & {};
