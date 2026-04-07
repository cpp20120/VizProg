import React, { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { fetchCities } from '../../api/api';
import { City } from '../../types/types';
import styles from './citySearch.module.css'
interface Props {
    onSelectCity: (city: City) => void;
}

export const CitySearch: React.FC<Props> = ({ onSelectCity }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<City[]>([]);
    const [error, setError] = useState('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce(async (searchQuery: string) => {
            if (!searchQuery) {
                setResults([]);
                return;
            }
            try {
                const cities = await fetchCities(searchQuery);
                setResults(cities);
                setError('');
            } catch {
                setError('Ошибка поиска города');
            }
        }, 500),
        []
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
    };

    return (
        <div className={styles.container}>
            <input
                className={styles.input}
                type="text"
                placeholder="Поиск города..."
                value={query}
                onChange={handleChange}
                data-testid="city-input"
            />

            {error && <div className={styles.error}>{error}</div>}

            {results.length > 0 && (
                <ul className={styles.results} data-testid="search-results">
                    {results.map((c, i) => (
                        <li
                            key={i}
                            className={styles.resultItem}
                            onClick={() => {
                                onSelectCity(c);
                                setResults([]);
                                setQuery('');
                            }}
                        >
                            {c.name}, {c.country}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};