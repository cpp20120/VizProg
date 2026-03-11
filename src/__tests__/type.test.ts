import { describe, it, expect, expectTypeOf } from 'vitest';
import { query } from '../query';
import { where, sort, groupBy, having } from '../implementations';
import { Group, ValidateOrder } from '../types';

describe('type tests', () => {
  interface User {
    id: number;
    name: string;
    age: number;
  }

  it('should return a function that accepts array and returns appropriate type', () => {
    const whereQuery = query(where<User>()('age', 25));
    expectTypeOf(whereQuery).returns.toEqualTypeOf<User[]>();
  });

  it('should return grouped data after groupBy', () => {
    const groupQuery = query(groupBy<User>()('age'));
    expectTypeOf(groupQuery).returns.toEqualTypeOf<Group<User, 'age'>[]>();
  });

  it('should maintain grouped data type through having', () => {
    const havingQuery = query(
      groupBy<User>()('age'),
      having<User, 'age'>()(group => group.items.length > 1)
    );
    expectTypeOf(havingQuery).returns.toEqualTypeOf<Group<User, 'age'>[]>();
  });

  it('should have correct readonly stage types', () => {
    const w = where<User>()('age', 25);
    expectTypeOf(w.stage).toEqualTypeOf<'where'>();

    const s = sort<User>()('age');
    expectTypeOf(s.stage).toEqualTypeOf<'sort'>();

    const g = groupBy<User>()('age');
    expectTypeOf(g.stage).toEqualTypeOf<'groupBy'>();

    const h = having<User, 'age'>()(group => true);
    expectTypeOf(h.stage).toEqualTypeOf<'having'>();
  });

  describe('valid order combinations', () => {
    it('should allow valid query sequences', () => {
      query(
        where<User>()('age', 25),
        groupBy<User>()('name'),
        having<User, 'name'>()(group => group.items.length > 0),
        sort<Group<User, 'name'>>()('key')
      );
    });
  });

  it('ValidateOrder type should work correctly', () => {
    type ValidOrder = ValidateOrder<[
      { stage: 'where' },
      { stage: 'groupBy' },
      { stage: 'having' },
      { stage: 'sort' }
    ]>;
    
    type InvalidOrder = ValidateOrder<[
      { stage: 'sort' },
      { stage: 'where' }
    ]>;

    expectTypeOf<ValidOrder>().toEqualTypeOf<{ valid: true }>();
    
    expectTypeOf<InvalidOrder>().toMatchTypeOf<{ valid: false, error: string }>();
  });

  it('ValidateOrder type should work correctly', () => {
    type ValidOrder = ValidateOrder<[
      { stage: 'where' },
      { stage: 'groupBy' },
      { stage: 'having' },
      { stage: 'sort' }
    ]>;
    
    type InvalidWhereHaving = ValidateOrder<[
      { stage: 'where' },
      { stage: 'having' }
    ]>;

    type InvalidSortWhere = ValidateOrder<[
      { stage: 'sort' },
      { stage: 'where' }
    ]>;

    expectTypeOf<ValidOrder>().toEqualTypeOf<{ valid: true }>();
    
    expectTypeOf<InvalidWhereHaving>().toEqualTypeOf<{ valid: false, error: 'having requires groupBy before it' }>();
    expectTypeOf<InvalidSortWhere>().toEqualTypeOf<{ valid: false, error: 'After sort only sort allowed' }>();
  });
});