import { describe, it, expect } from 'vitest';
import { query } from '../query';
import { where, sort, groupBy, having } from '../implementations';
import { Group } from '../types';

describe('query function', () => {
  describe('behavior tests', () => {
    interface User {
      id: number;
      name: string;
      age: number;
      city: string;
    }

    const testData: User[] = [
      { id: 1, name: 'Alice', age: 30, city: 'New York' },
      { id: 2, name: 'Bob', age: 25, city: 'Los Angeles' },
      { id: 3, name: 'Charlie', age: 35, city: 'New York' },
      { id: 4, name: 'David', age: 25, city: 'Chicago' },
      { id: 5, name: 'Eve', age: 30, city: 'New York' },
    ];

    it('should handle single where operation', () => {
      const q = query(
        where<User>()('city', 'New York')
      );
      
      const result = q(testData);
      expect(result).toHaveLength(3);
      expect(result.every(user => user.city === 'New York')).toBe(true);
    });

    it('should handle single sort operation', () => {
      const q = query(
        sort<User>()('age')
      );
      
      const result = q(testData);
      expect(result.map(u => u.age)).toEqual([25, 25, 30, 30, 35]);
    });

    it('should handle single groupBy operation', () => {
      const q = query(
        groupBy<User>()('city')
      );
      
      const result = q(testData);
      expect(result).toHaveLength(3);
      expect(result.find(g => g.key === 'New York')?.items).toHaveLength(3);
      expect(result.find(g => g.key === 'Los Angeles')?.items).toHaveLength(1);
      expect(result.find(g => g.key === 'Chicago')?.items).toHaveLength(1);
    });

    it('should handle where then sort operations', () => {
      const q = query(
        where<User>()('city', 'New York'),
        sort<User>()('age')
      );
      
      const result = q(testData);
      expect(result).toHaveLength(3);
      expect(result.every(user => user.city === 'New York')).toBe(true);
      expect(result.map(u => u.age)).toEqual([30, 30, 35]);
    });

    it('should handle where then groupBy operations', () => {
      const q = query(
        where<User>()('city', 'New York'),
        groupBy<User>()('age')
      );
      
      const result = q(testData);
      expect(result).toHaveLength(2); 
      expect(result.find(g => g.key === 30)?.items).toHaveLength(2);
      expect(result.find(g => g.key === 35)?.items).toHaveLength(1);
    });

    it('should handle groupBy then having operations', () => {
      const q = query(
        groupBy<User>()('age'),
        having<User, 'age'>()(group => group.items.length > 1)
      );
      
      const result = q(testData);
      expect(result).toHaveLength(2); 
      expect(result.find(g => g.key === 30)?.items).toHaveLength(2);
      expect(result.find(g => g.key === 25)?.items).toHaveLength(2);
    });

    it('should handle complete pipeline: where -> groupBy -> having -> sort', () => {
      const q = query(
        where<User>()('city', 'New York'),
        groupBy<User>()('age'),
        having<User, 'age'>()(group => group.items.length > 0),
        sort<Group<User, 'age'>>()('key')
      );
      
      const result = q(testData);
      expect(result).toBeDefined();
    });

    it('should handle multiple where operations', () => {
      const q = query(
        where<User>()('city', 'New York'),
        where<User>()('age', 30)
      );
      
      const result = q(testData);
      expect(result).toHaveLength(2);
      expect(result.every(user => user.city === 'New York' && user.age === 30)).toBe(true);
    });

    it('should handle multiple sort operations', () => {
      const data = [
        { id: 1, name: 'Alice', age: 30, city: 'A' },
        { id: 2, name: 'Bob', age: 25, city: 'B' },
        { id: 3, name: 'Charlie', age: 30, city: 'C' },
      ];
      
      const q = query(
        sort<typeof data[0]>()('age'),
        sort<typeof data[0]>()('name')
      );
      
      const result = q(data);
      expect(result.map(u => u.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array input', () => {
      const q = query(
        where<{ id: number }>()('id', 1)
      );
      
      const result = q([]);
      expect(result).toEqual([]);
    });

    it('should handle where with non-existent value', () => {
      interface Item { id: number; status: string }
      const data: Item[] = [
        { id: 1, status: 'active' },
        { id: 2, status: 'inactive' },
      ];
      
      const q = query(
        where<Item>()('status', 'pending')
      );
      
      const result = q(data);
      expect(result).toEqual([]);
    });

    it('should handle groupBy with empty groups', () => {
      interface Item { category: string }
      const data: Item[] = [];
      
      const q = query(
        groupBy<Item>()('category')
      );
      
      const result = q(data);
      expect(result).toEqual([]);
    });
  });
});