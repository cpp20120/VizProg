export interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

export interface WeatherItem {
  dt: number;
  main: { temp: number; humidity: number; pressure: number };
  weather: [{ id: number; main: string; description: string; icon: string }];
  wind: { speed: number };
  dt_txt: string;
}

export interface ForecastResponse {
  list: WeatherItem[];
  city: { name: string; timezone: number };
}

export interface PollutionResponse {
  list: [{ main: { aqi: number } }];
}

export interface DayWeather {
    Time: Date;
    Temperature: number;
    MaxTemperature: number;
    MinTemperature: number;
    Icon: string;
    Humidity: number;
    Wind: number;
    AirPressure: number;
    UV: number;
    POD: string;
}
