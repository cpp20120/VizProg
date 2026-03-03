import { Where, Sort, GroupBy, Group, Having } from './types';

export function where<T>(): Where<T> {
  return (key, value) => (data) => data.filter((item) => item[key] === value);
}

export function sort<T>(): Sort<T> {
  return (key) => (data) =>
    [...data].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
}

export function groupBy<T>(): GroupBy<T> {
  return (key) => (data) => {
    const map = new Map<T[keyof T], Group<T, typeof key>>();
    for (const item of data) {
      const k = item[key];
      if (!map.has(k)) {
        map.set(k, { key: k, items: [] });
      }
      map.get(k)!.items.push(item);
    }
    return Array.from(map.values());
  };
}

export function having<T>(): Having<T> {
  return (predicate) => (groups) => groups.filter(predicate);
}