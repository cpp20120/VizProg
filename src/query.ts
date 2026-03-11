import { QueryStage, ValidateOrder } from './types';

export function query<T, R, S1 extends QueryStage>(
  step1: ((data: T[]) => R) & S1
): ValidateOrder<[S1]> extends { valid: true } ? (data: T[]) => R : never;

export function query<T, A, R, S1 extends QueryStage, S2 extends QueryStage>(
  step1: ((data: T[]) => A) & S1,
  step2: ((data: A) => R) & S2
): ValidateOrder<[S1, S2]> extends { valid: true } ? (data: T[]) => R : never;

export function query<T, A, B, R, S1 extends QueryStage, S2 extends QueryStage, S3 extends QueryStage>(
  step1: ((data: T[]) => A) & S1,
  step2: ((data: A) => B) & S2,
  step3: ((data: B) => R) & S3
): ValidateOrder<[S1, S2, S3]> extends { valid: true } ? (data: T[]) => R : never;

export function query<T, A, B, C, R, S1 extends QueryStage, S2 extends QueryStage, S3 extends QueryStage, S4 extends QueryStage>(
  step1: ((data: T[]) => A) & S1,
  step2: ((data: A) => B) & S2,
  step3: ((data: B) => C) & S3,
  step4: ((data: C) => R) & S4
): ValidateOrder<[S1, S2, S3, S4]> extends { valid: true } ? (data: T[]) => R : never;

export function query<T, A, B, C, D, R, S1 extends QueryStage, S2 extends QueryStage, S3 extends QueryStage, S4 extends QueryStage, S5 extends QueryStage>(
  step1: ((data: T[]) => A) & S1,
  step2: ((data: A) => B) & S2,
  step3: ((data: B) => C) & S3,
  step4: ((data: C) => D) & S4,
  step5: ((data: D) => R) & S5
): ValidateOrder<[S1, S2, S3, S4, S5]> extends { valid: true } ? (data: T[]) => R : never;

export function query<T>(...steps: Array<((data: any) => any) & QueryStage>): (data: T[]) => any {
  return (data: T[]) => {
    let result: any = data;
    for (const step of steps) {
      result = step(result);
    }
    return result;
  };
}