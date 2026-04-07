import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CitySearch } from './citySearch';
import * as api from '../../api/api';

describe('CitySearch', () => {
    beforeEach(() => {
        vi.restoreAllMocks(); // Очищаем моки перед каждым тестом
    });

    it('fetches and displays cities on debounce input', async () => {
        // Надежное мокирование
        vi.spyOn(api, 'fetchCities').mockResolvedValue([
            { name: 'Moscow', lat: 55, lon: 37, country: 'RU' }
        ]);
        const mockSelect = vi.fn();

        render(<CitySearch onSelectCity={mockSelect} />);

        fireEvent.change(screen.getByTestId('city-input'), { target: { value: 'Mos' } });

        await waitFor(() => {
            expect(screen.getByText('Moscow, RU')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Moscow, RU'));
        expect(mockSelect).toHaveBeenCalledWith({ name: 'Moscow', lat: 55, lon: 37, country: 'RU' });
    });

    it('handles empty input', async () => {
        render(<CitySearch onSelectCity={vi.fn()} />);
        const input = screen.getByTestId('city-input');
        fireEvent.change(input, { target: { value: 'Mos' } });
        fireEvent.change(input, { target: { value: '' } });
        await waitFor(() => {
            expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
        });
    });

    it('handles api errors', async () => {
        vi.spyOn(api, 'fetchCities').mockRejectedValue(new Error('API Error'));
        render(<CitySearch onSelectCity={vi.fn()} />);
        fireEvent.change(screen.getByTestId('city-input'), { target: { value: 'ErrorCity' } });

        await waitFor(() => {
            expect(screen.getByText('Ошибка поиска города')).toBeInTheDocument();
        });
    });
});