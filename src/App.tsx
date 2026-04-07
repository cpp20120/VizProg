import { useEffect, useState } from "react";
import "./App.css";

import { DayOfWeekProps } from "./components/DaysOfWeek/DayOfWeek";
import { updateWeather } from "./utils/weather";
import { DayWeather } from "./types/types";
import { WeatherWidget } from "./components/WeatherWidget/weatherWidget";

const App = () => {
    const [city, setCity] = useState("");
    const [days, setDays] = useState<DayWeather[]>([]);
    const [next_days, setNextDays] = useState<DayOfWeekProps[]>([]);
    const [backgound_color, setBackgrounColor] = useState("");
    const [backgound_color_next_days, setBackgrounColorNextDays] = useState("");

    useEffect(() => {
        if (city === "") setCity("London");
        const timer = setTimeout(
            () =>
                updateWeather(
                    city,
                    days,
                    setDays,
                    setBackgrounColor,
                    setBackgrounColorNextDays,
                    setNextDays
                ),
            500
        );
        return () => clearTimeout(timer);
    }, [city, days]);

    return (
        <>
            {days.length !== 0 ? (
                <WeatherWidget
                    days={days}
                    next_days={next_days}
                    city={city}
                    setCity={setCity}
                    backgroundColor={backgound_color}
                    backgroundColorNextDays={backgound_color_next_days}
                />
            ) : (
                <></>
            )}
        </>
    );
};

export default App;