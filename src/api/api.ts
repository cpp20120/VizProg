import { City, ForecastResponse, PollutionResponse } from '../types/types';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';

export const fetchCities = async (query: string): Promise<City[]> => {
    const res = await fetch(`${BASE_URL}/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    return res.json();
};

export const fetchForecast = async (lat: number, lon: number): Promise<ForecastResponse> => {
    const res = await fetch(`${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
};

export const fetchPollution = async (lat: number, lon: number): Promise<PollutionResponse> => {
    const res = await fetch(`${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    if (!res.ok) throw new Error('Failed to fetch pollution');
    return res.json();
};