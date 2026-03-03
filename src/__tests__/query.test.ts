import { where, sort, groupBy, having } from '../implementations';
import { query } from '../query';

describe('query pipeline', () => {
  type User = { id: number; name: string; age: number; city: string };
  const users: User[] = [
    { id: 1, name: 'Ivan', age: 30, city: 'Moscow' },
    { id: 2, name: 'Ekaterina', age: 25, city: 'Saint Petersburg' },
    { id: 3, name: 'Dmitry', age: 35, city: 'Moscow' },
    { id: 4, name: 'Mikhail', age: 40, city: 'Saint Petersburg' },
  ];

  const w = where<User>();
  const s = sort<User>();
  const gb = groupBy<User>();
  const h = having<User>();

  it('фильтрует и сортирует', () => {
    const pipeline = query(w('city', 'Moscow'), s('age'));
    expect(pipeline(users)).toEqual([
      { id: 1, name: 'Ivan', age: 30, city: 'Moscow' },
      { id: 3, name: 'Dmitry', age: 35, city: 'Moscow' },
    ]);
  });

  it('сортировка с равными значениями', () => {
    const usersWithEqualAge = [
      { id: 1, name: 'Anna', age: 25, city: 'Moscow' },
      { id: 2, name: 'Boris', age: 25, city: 'Saint Petersburg' },
      { id: 3, name: 'Vladimir', age: 30, city: 'Moscow' },
    ];
    const pipeline = query(s('age'));
    const result = pipeline(usersWithEqualAge);
    expect(result).toHaveLength(3);
    expect(result.map(u => u.age)).toEqual(expect.arrayContaining([25, 25, 30]));
  });

  it('группирует и фильтрует группы', () => {
    const pipeline = query(
      gb('city'),
      h((group) => group.items.length > 1)
    );
    expect(pipeline(users)).toEqual([
      { key: 'Moscow', items: [users[0], users[2]] },
      { key: 'Saint Petersburg', items: [users[1], users[3]] },
    ]);
  });

  it('having отбрасывает группы', () => {
    const extendedUsers = [
      ...users,
      { id: 5, name: 'Tatiana', age: 28, city: 'Kazan' }
    ];
    const pipeline = query(
      gb('city'),
      h((group) => group.items.length > 1)
    );
    const result = pipeline(extendedUsers);
    expect(result).toHaveLength(2);
    expect(result.every(g => g.key !== 'Kazan')).toBe(true);
  });

  it('комбинирует шаги', () => {
    const pipeline = query(
      w('name', 'Dmitry'),
      gb('city'),
      h((group) => group.items.some((u) => u.age > 32))
    );
    expect(pipeline(users)).toEqual([
      { key: 'Moscow', items: [users[2]] },
    ]);
  });

  it('обрабатывает пустой массив', () => {
    const pipeline = query(
      gb('city'),
      h((group) => group.items.length > 1)
    );
    expect(pipeline([])).toEqual([]);
  });

  it('sorts an unsorted array', () => {
    const unsorted = [
      { id: 5, name: 'Zoya', age: 22, city: 'Moscow' },
      { id: 1, name: 'Ivan', age: 30, city: 'Moscow' },
      { id: 3, name: 'Alisa', age: 25, city: 'Saint Petersburg' },
    ];
    const pipeline = query(sort<User>()('age'));
    const result = pipeline(unsorted);
    expect(result.map(u => u.age)).toEqual([22, 25, 30]);
  });
});