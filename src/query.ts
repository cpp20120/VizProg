export function query<T, R>(step1: (data: T[]) => R): (data: T[]) => R;

export function query<T, A, R>(
  step1: (data: T[]) => A,
  step2: (data: A) => R
): (data: T[]) => R;

export function query<T, A, B, R>(
  step1: (data: T[]) => A,
  step2: (data: A) => B,
  step3: (data: B) => R
): (data: T[]) => R;

export function query<T, A, B, C, R>(
  step1: (data: T[]) => A,
  step2: (data: A) => B,
  step3: (data: B) => C,
  step4: (data: C) => R
): (data: T[]) => R;

export function query<T, A, B, C, D, R>(
  step1: (data: T[]) => A,
  step2: (data: A) => B,
  step3: (data: B) => C,
  step4: (data: C) => D,
  step5: (data: D) => R
): (data: T[]) => R;

export function query<T>(...steps: Array<(data: any) => any>): (data: T[]) => any {
  return (data: T[]) => {
    let result: any = data;
    for (const step of steps) {
      result = step(result);
    }
    return result;
  };
}