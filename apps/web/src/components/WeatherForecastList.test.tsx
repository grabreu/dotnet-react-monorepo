import { describe, expect, it } from "vitest";
import type { WeatherForecast } from "@/lib/api";
import { render, screen } from "@/testing/testUtils";
import { WeatherForecastList } from "./WeatherForecastList";

describe("WeatherForecastList", () => {
  const forecast: WeatherForecast = {
    date: "2026-08-23",
    summary: "Chilly",
    temperatureC: 5,
    temperatureF: 41,
  };

  it("renders a row per forecast", () => {
    render(
      <WeatherForecastList
        forecasts={[
          forecast,
          { ...forecast, date: "2026-08-24", summary: "Mild" },
        ]}
      />,
    );

    expect(screen.getByText("2026-08-23")).toBeInTheDocument();
    expect(screen.getByText("Chilly")).toBeInTheDocument();
    expect(screen.getByText("2026-08-24")).toBeInTheDocument();
    expect(screen.getByText("Mild")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("renders an empty state when there are no forecasts", () => {
    render(<WeatherForecastList forecasts={[]} />);

    expect(screen.getByText("No forecast data available.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
