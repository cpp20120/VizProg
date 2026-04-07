import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCities, fetchForecast, fetchPollution } from './api';

describe('api', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    it('fetchCities success', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => [] } as any);
        await expect(fetchCities('Mos')).resolves.toEqual([]);
    });

    it('fetchCities fail', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false } as any);
        await expect(fetchCities('Mos')).rejects.toThrow('Failed to fetch cities');
    });

    it('fetchForecast fail', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false } as any);
        await expect(fetchForecast(1, 1)).rejects.toThrow('Failed to fetch forecast');
    });

    it('fetchPollution fail', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false } as any);
        await expect(fetchPollution(1, 1)).rejects.toThrow('Failed to fetch pollution');
    });
});