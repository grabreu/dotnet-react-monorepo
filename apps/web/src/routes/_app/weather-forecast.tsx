import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { WeatherForecastList } from "@/components/WeatherForecastList";
import { getWeatherForecastOptions } from "@/lib/api/@tanstack/react-query.gen";

const RouteComponent = () => {
  const weatherForecastQuery = useSuspenseQuery(getWeatherForecastOptions());

  return (
    <div className="p-2">
      <WeatherForecastList forecasts={weatherForecastQuery.data} />
    </div>
  );
};

export const Route = createFileRoute("/_app/weather-forecast")({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(getWeatherForecastOptions());
  },
  component: RouteComponent,
});
