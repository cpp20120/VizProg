import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WeatherWidget } from './weatherWidget';
import { DayWeather } from '../../types/types';
import { DayOfWeekProps } from '../DaysOfWeek/DayOfWeek';

// Создаем mock данные для компонента
const mockDays: DayWeather[] = [
    {
        Time: new Date('2024-01-15T12:00:00'),
        Temperature: 20,
        MaxTemperature: 22,
        MinTemperature: 18,
        Icon: '01d',
        Humidity: 50,
        Wind: 5,
        AirPressure: 1000,
        UV: 5,
        POD: 'd'
    },
    {
        Time: new Date('2024-01-15T15:00:00'),
        Temperature: 22,
        MaxTemperature: 22,
        MinTemperature: 18,
        Icon: '01d',
        Humidity: 45,
        Wind: 6,
        AirPressure: 1001,
        UV: 6,
        POD: 'd'
    },
    {
        Time: new Date('2024-01-15T18:00:00'),
        Temperature: 18,
        MaxTemperature: 22,
        MinTemperature: 18,
        Icon: '01n',
        Humidity: 60,
        Wind: 4,
        AirPressure: 999,
        UV: 0,
        POD: 'n'
    },
    {
        Time: new Date('2024-01-15T21:00:00'),
        Temperature: 16,
        MaxTemperature: 22,
        MinTemperature: 18,
        Icon: '01n',
        Humidity: 65,
        Wind: 4,
        AirPressure: 998,
        UV: 0,
        POD: 'n'
    },
    {
        Time: new Date('2024-01-16T00:00:00'),
        Temperature: 15,
        MaxTemperature: 22,
        MinTemperature: 18,
        Icon: '01n',
        Humidity: 70,
        Wind: 3,
        AirPressure: 997,
        UV: 0,
        POD: 'n'
    }
];

const mockNextDays: DayOfWeekProps[] = [
    {
        DayOfWeek: 'Понедельник', MaxTemperature: 20, WeatherIcon: '01d',
        DayNumber: 0,
        MinTemperature: 0
    },
    { DayOfWeek: 'Вторник', MaxTemperature: 18, WeatherIcon: '02d', DayNumber: 1, MinTemperature: 15 },
    { DayOfWeek: 'Среда', MaxTemperature: 15, WeatherIcon: '03d', DayNumber: 2, MinTemperature: 12 },
    { DayOfWeek: 'Четверг', MaxTemperature: 17, WeatherIcon: '01d', DayNumber: 3, MinTemperature: 14 },
    { DayOfWeek: 'Пятница', MaxTemperature: 19, WeatherIcon: '02d', DayNumber: 4, MinTemperature: 16 },
];

describe('WeatherWidget', () => {
    it('renders correctly with all data', () => {
        const mockSetCity = vi.fn();
        
        render(
            <WeatherWidget 
                days={mockDays}
                next_days={mockNextDays}
                city="Moscow"
                setCity={mockSetCity}
                backgroundColor="#ffffff"
                backgroundColorNextDays="#f0f0f0"
            />
        );

        // Проверяем наличие города
        expect(screen.getByText('Moscow')).toBeInTheDocument();
        
        // Проверяем наличие температуры (может быть в разных местах)
        expect(screen.getAllByText('20°').length).toBeGreaterThan(0);
        
        // Проверяем наличие параметров
        expect(screen.getByText(/влажность/i)).toBeInTheDocument();
        expect(screen.getByText(/50/)).toBeInTheDocument();
        
        expect(screen.getByText(/ветер/i)).toBeInTheDocument();
        expect(screen.getByText(/5/)).toBeInTheDocument();
        
        expect(screen.getByText(/давление/i)).toBeInTheDocument();
        expect(screen.getByText(/1000/)).toBeInTheDocument();
    });

    it('renders with different city', () => {
        const mockSetCity = vi.fn();
        
        render(
            <WeatherWidget 
                days={mockDays}
                next_days={mockNextDays}
                city="Saint Petersburg"
                setCity={mockSetCity}
                backgroundColor="#ffffff"
                backgroundColorNextDays="#f0f0f0"
            />
        );

        expect(screen.getByText('Saint Petersburg')).toBeInTheDocument();
    });

    it('applies custom background colors', () => {
        const mockSetCity = vi.fn();
        const backgroundColor = '#ff0000';
        const backgroundColorNextDays = '#00ff00';
        
        const { container } = render(
            <WeatherWidget 
                days={mockDays}
                next_days={mockNextDays}
                city="Moscow"
                setCity={mockSetCity}
                backgroundColor={backgroundColor}
                backgroundColorNextDays={backgroundColorNextDays}
            />
        );

        const appDiv = container.querySelector('.App');
        expect(appDiv).toHaveStyle(`background-color: ${backgroundColor}`);
    });
});