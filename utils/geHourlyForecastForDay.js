import { getWeatherCode } from "./weatherCode.js";
export function geHourlyForecastForDay(hourlyData, selectedday) {
  const { temperature_2m, time, weather_code } = hourlyData;

  const convertedResult = [];

  for (let i = 0; i < time.length; i++) {
    const date = new Date(time[i]);
    const weekdays = date.toLocaleDateString("en-US", { weekday: "long" });

    if (weekdays.toLowerCase() === selectedday.toLowerCase()) {
      convertedResult.push({
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        }), // "3 PM" [source: 1]
        temp: `${Math.round(temperature_2m[i])}°`,
        weatherImgPath: getWeatherCode(weather_code[i]).iconPath,
        weatherlablePath: getWeatherCode(weather_code[i]).label,
      });
    }
  }
  return convertedResult;
}
