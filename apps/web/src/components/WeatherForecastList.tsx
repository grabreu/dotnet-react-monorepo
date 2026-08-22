import type { WeatherForecast } from "@/lib/api";

type WeatherForecastListProps = {
  forecasts: WeatherForecast[];
};

export const WeatherForecastList = ({
  forecasts,
}: WeatherForecastListProps) => {
  if (forecasts.length === 0) {
    return <p className="p-2 text-gray-500">No forecast data available.</p>;
  }

  return (
    <table className="w-full max-w-md border-collapse text-left">
      <thead>
        <tr className="border-b">
          <th className="p-2">Date</th>
          <th className="p-2">Summary</th>
          <th className="p-2 text-right">°C</th>
          <th className="p-2 text-right">°F</th>
        </tr>
      </thead>
      <tbody>
        {forecasts.map((forecast) => (
          <tr key={forecast.date} className="border-b last:border-0">
            <td className="p-2 whitespace-nowrap">{forecast.date}</td>
            <td className="p-2">{forecast.summary}</td>
            <td className="p-2 text-right">{forecast.temperatureC}</td>
            <td className="p-2 text-right">{forecast.temperatureF}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
