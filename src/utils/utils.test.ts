import { describe, it, expect } from 'vitest';
import { getBackgroundClass, formatTime } from './utils';

describe('utils', () => {
    it('getBackgroundClass works correctly', () => {
        expect(getBackgroundClass('')).toBe('bg-default');
        expect(getBackgroundClass('01d')).toBe('bg-clear-day');
        expect(getBackgroundClass('01n')).toBe('bg-clear-night');
        expect(getBackgroundClass('03d')).toBe('bg-cloudy-day');
        expect(getBackgroundClass('09n')).toBe('bg-rain-night');
    });

    it('formatTime formats timestamp correctly based on timezone', () => {
        // 1620000000 = 2021-05-03T00:00:00Z
        // timezone offset = 10800 (3 hours)
        expect(formatTime(1620000000, 10800)).toBe('03:00');
    });
});