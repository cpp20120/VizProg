import React from 'react';
import Today from "../Today/Today";
import MainInfo from "../MainInfo/MainInfo";
import Times from "../Times/Times";
import Parametrs from "../Parametrs/Parametrs";
import DaysOfWeek from "../DaysOfWeek/DaysOfWeek";
import { DayWeather } from "../../types/types";
import { DayOfWeekProps } from "../DaysOfWeek/DayOfWeek";
import { DAYS_OF_WEEK } from "../../utils/weather";

interface  WeatherWidgetProps {
    days: DayWeather[];
    next_days: DayOfWeekProps[];
    city: string;
    setCity: (city: string) => void;
    backgroundColor: string;
    backgroundColorNextDays: string;
}

export const  WeatherWidget: React.FC< WeatherWidgetProps> = ({
    days,
    next_days,
    city,
    setCity,
    backgroundColor,
    backgroundColorNextDays,
}) => {
    return (
        <div className="App" style={{ backgroundColor: backgroundColor }}>
            <Today
                DayOfWeek={DAYS_OF_WEEK[days[0].Time.getDay()]}
                DayNumber={days[0].Time.getDate()}
            ></Today>
            <MainInfo
                City={city}
                Temperature={days[0].Temperature}
                WeatherIcon={days[0].Icon}
                OnChangeCity={(new_city: string) => setCity(new_city)}
            ></MainInfo>
            <Times
                Times={[
                    {
                        Time: days[0].Time,
                        Temperature: days[0].Temperature,
                        Icon: days[0].Icon,
                    },
                    {
                        Time: days[1].Time,
                        Temperature: days[1].Temperature,
                        Icon: days[1].Icon,
                    },
                    {
                        Time: days[2].Time,
                        Temperature: days[2].Temperature,
                        Icon: days[2].Icon,
                    },
                    {
                        Time: days[3].Time,
                        Temperature: days[3].Temperature,
                        Icon: days[3].Icon,
                    },
                    {
                        Time: days[4].Time,
                        Temperature: days[4].Temperature,
                        Icon: days[4].Icon,
                    },
                ]}
            ></Times>
            <Parametrs
                Humidity={days[0].Humidity}
                Wind={days[0].Wind}
                AirPressure={days[0].AirPressure}
                UV={days[0].UV}
            ></Parametrs>
            <DaysOfWeek
                Days={next_days}
                style={{ backgroundColor: backgroundColorNextDays }}
            ></DaysOfWeek>
        </div>
    );
};
