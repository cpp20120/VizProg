export type Transform<T, R = T[]> = (data: T[]) => R;

export interface QueryStage {
  readonly stage: string;
}

export interface WhereStage extends QueryStage {
  readonly stage: 'where';
}

export interface GroupByStage extends QueryStage {
  readonly stage: 'groupBy';
}

export interface HavingStage extends QueryStage {
  readonly stage: 'having';
}

export interface SortStage extends QueryStage {
  readonly stage: 'sort';
}

export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T> & WhereStage;

export type Sort<T> = <K extends keyof T>(key: K) => Transform<T> & SortStage;

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupBy<T> = <K extends keyof T>(key: K) => Transform<T, Group<T, K>[]> & GroupByStage;

export type Having<T, K extends keyof T = any> = (
  predicate: (group: Group<T, K>) => boolean
) => Transform<Group<T, K>, Group<T, K>[]> & HavingStage;

export type ValidateOrder<T extends any[]> = 
  T extends [] ? { valid: true } :
  T extends [infer First, ...infer Rest] ?
    First extends WhereStage ? ValidateWhereOrder<First, Rest> :
    First extends GroupByStage ? ValidateGroupByOrder<First, Rest> :
    First extends HavingStage ? { valid: false, error: 'having cannot be the first operation (requires groupBy)' } :
    First extends SortStage ? ValidateSortOrder<First, Rest> :
    { valid: false, error: 'Unknown operation' } :
  { valid: true };

export type ValidateWhereOrder<First, Rest extends any[]> = 
  Rest extends [] ? { valid: true } :
  Rest extends [infer Next, ...infer Tail] ?
    Next extends WhereStage ? ValidateWhereOrder<Next, Tail> :
    Next extends GroupByStage ? ValidateGroupByOrder<Next, Tail> :
    Next extends HavingStage ? { valid: false, error: 'having requires groupBy before it' } :
    Next extends SortStage ? ValidateSortOrder<Next, Tail> :
    { valid: false, error: 'Invalid operation after where' } :
  { valid: true };

export type ValidateGroupByOrder<First, Rest extends any[]> = 
  Rest extends [] ? { valid: true } :
  Rest extends [infer Next, ...infer Tail] ?
    Next extends GroupByStage ? ValidateGroupByOrder<Next, Tail> :
    Next extends HavingStage ? ValidateHavingOrder<Next, Tail> :
    Next extends SortStage ? ValidateSortOrder<Next, Tail> :
    Next extends WhereStage ? { valid: false, error: 'where must come before groupBy' } :
    { valid: false, error: 'Invalid operation after groupBy' } :
  { valid: true };

export type ValidateHavingOrder<First, Rest extends any[]> = 
  Rest extends [] ? { valid: true } :
  Rest extends [infer Next, ...infer Tail] ?
    Next extends HavingStage ? ValidateHavingOrder<Next, Tail> :
    Next extends SortStage ? ValidateSortOrder<Next, Tail> :
    Next extends WhereStage ? { valid: false, error: 'where must come before having' } :
    Next extends GroupByStage ? { valid: false, error: 'groupBy must come before having' } :
    { valid: false, error: 'Invalid operation after having' } :
  { valid: true };

export type ValidateSortOrder<First, Rest extends any[]> = 
  Rest extends [] ? { valid: true } :
  Rest extends [infer Next, ...infer Tail] ?
    Next extends SortStage ? ValidateSortOrder<Next, Tail> :
    { valid: false, error: 'After sort only sort allowed' } :
  { valid: true };