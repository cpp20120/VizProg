import { Where, Sort, GroupBy, Having, Group } from './types';

export function where<T>(): Where<T> {
  return <K extends keyof T>(key: K, value: T[K]) => {
    const fn = (data: T[]) => data.filter((item) => item[key] === value);
    return Object.assign(fn, { stage: 'where' as const });
  };
}

export function sort<T>(): Sort<T> {
  return <K extends keyof T>(key: K) => {
    const fn = (data: T[]) =>
      [...data].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av < bv) return -1;
        if (av > bv) return 1;
        return 0;
      });
    return Object.assign(fn, { stage: 'sort' as const });
  };
}

export function groupBy<T>(): GroupBy<T> {
  return <K extends keyof T>(key: K) => {
    const fn = (data: T[]) => {
      const map = new Map<T[K], Group<T, K>>();
      for (const item of data) {
        const k = item[key];
        if (!map.has(k)) {
          map.set(k, { key: k, items: [] });
        }
        map.get(k)!.items.push(item);
      }
      return Array.from(map.values());
    };
    return Object.assign(fn, { stage: 'groupBy' as const });
  };
}

export function having<T, K extends keyof T>(): Having<T, K> {
  return (predicate: (group: Group<T, K>) => boolean) => {
    const fn = (groups: Group<T, K>[]) => groups.filter(predicate);
    return Object.assign(fn, { stage: 'having' as const });
  };
}