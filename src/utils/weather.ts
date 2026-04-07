import axios from "axios";
import React from 'react';
import { DayWeather } from "../types/types";
import { DayOfWeekProps } from "../components/DaysOfWeek/DayOfWeek";

export const API_KEY = "89fb090b41535bd38cde27f3b2ca3ba6";

export const DAYS_OF_WEEK = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export async function getPos(city: string) {
    try {
        const promis = await axios.get(
            `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
        );
        const pos = promis.data[0];
        return [pos.lat, pos.lon];
    } catch (err) {
        console.error("cant load pos");
        return [0, 0];
    }
}

export async function loadData(city: string) {
    const [lat, lon] = await getPos(city);
    let data;
    try {
        const promis = await axios.get(
            `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        data = promis.data.list;
    } catch (err) {
        console.error("cant load weather");
    }
    return data;
}

export async function getWeather(city: string) {
    let days = Array<DayWeather>();

    for (const day of await loadData(city)) {
        days.push({
            Time: new Date(day.dt * 1000),
            Temperature: day.main.temp,
            MaxTemperature: day.main.temp_max,
            MinTemperature: day.main.temp_min,
            Icon: day.weather[0].icon,
            Humidity: day.main.humidity,
            Wind: day.wind.speed,
            AirPressure: day.main.pressure * 0.75,
            UV: 0,
            POD: day.sys.pod,
        });
    }

    return days;
}

export function updateWeather(
    city: string,
    days: Array<DayWeather>,
    setDays: React.Dispatch<React.SetStateAction<DayWeather[]>>,
    setBackgrounColor: React.Dispatch<React.SetStateAction<string>>,
    setBackgrounColorNextDays: React.Dispatch<React.SetStateAction<string>>,
    setNextDays: React.Dispatch<React.SetStateAction<DayOfWeekProps[]>>
) {
    getWeather(city).then((res) => setDays(res));

    if (days.length !== 0) {
        if (days[0].POD === "d") {
            setBackgrounColor("#4d71f2");
            setBackgrounColorNextDays("#708df4");
        } else {
            setBackgrounColor("#010d38");
            setBackgrounColorNextDays("#333D5F");
        }

        const cur_day = days[0].Time.getDay();
        let new_next_days = Array<DayOfWeekProps>();

        for (const day of days) {
            let is_exist = false;
            for (const next_day of new_next_days) {
                if (
                    next_day.DayOfWeek === DAYS_OF_WEEK[day.Time.getDay()] ||
                    cur_day === day.Time.getDay()
                ) {
                    is_exist = true;
                    break;
                }
            }
            if (!is_exist) {
                const day_name = day.Time.getDay();
                let max_temp = day.MaxTemperature;
                let min_temp = day.MinTemperature;
                for (const d of days) {
                    if (d.Time.getDay() === day_name) {
                        if (max_temp < d.MaxTemperature) max_temp = d.MaxTemperature;
                        if (min_temp > d.MinTemperature) min_temp = d.MinTemperature;
                    }
                }
                new_next_days.push({
                    DayOfWeek: DAYS_OF_WEEK[day.Time.getDay()],
                    DayNumber: day.Time.getDate(),
                    WeatherIcon: day.Icon,
                    MaxTemperature: max_temp,
                    MinTemperature: min_temp,
                });
            }
        }

        setNextDays(new_next_days);
    }
}
