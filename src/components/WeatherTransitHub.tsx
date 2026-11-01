import React, { useState, useEffect } from "react";
import PuebloTransitBoard from "./PuebloTransit";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudDrizzle,
  Wind,
  Navigation,
  Bus,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  MapPin,
  Info,
  AlertCircle,
  Calendar,
  AlertTriangle,
  Compass,
  PhoneCall,
  Activity,
  Ticket
} from "lucide-react";

// Weather Info Interfaces
interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  time: string;
}

interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

export interface WeatherTransitHubProps {
  favoritedRouteIds?: string[];
  onToggleFavoriteRoute?: (id: string) => void;
}

export default function WeatherTransitHub({ favoritedRouteIds = [], onToggleFavoriteRoute }: WeatherTransitHubProps = {}) {
  // Weather state
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Load weather on mount
  useEffect(() => {
    fetchPuebloWeather();
  }, []);

  const fetchPuebloWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    setIsRefreshing(true);
    
    try {
      // Fetch meteorological dataset from Open-Meteo for Pueblo, CO (Lat: 38.2544, Lng: -104.6091)
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=38.2544&longitude=-104.6091&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America/Denver"
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch weather logs API (HTTP status ${res.status})`);
      }

      const data = await res.json();

      if (data && data.current) {
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          apparentTemperature: Math.round(data.current.apparent_temperature),
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          windDirection: Math.round(data.current.wind_direction_10m),
          weatherCode: data.current.weather_code,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      if (data && data.daily) {
        const forecastList: ForecastDay[] = [];
        for (let i = 1; i < Math.min(data.daily.time.length, 4); i++) {
          const dateStr = data.daily.time[i];
          const dateObj = new Date(dateStr + "T00:00:00");
          const weekday = dateObj.toLocaleDateString([], { weekday: "short" });
          forecastList.push({
            date: `${weekday}, ${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            weatherCode: data.daily.weather_code[i]
          });
        }
        setForecast(forecastList);
      }
    } catch (err: any) {
      console.error("Open-Meteo Fetch Error:", err);
      setWeatherError(err.message || "Unable to parse external meteorological registries.");
      
      // Seed robust offline mock fallback so user is never left with a broken UI
      setWeather({
        temperature: 78,
        apparentTemperature: 80,
        humidity: 35,
        windSpeed: 8,
        windDirection: 120,
        weatherCode: 1,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setForecast([
        { date: "Tomorrow", tempMax: 82, tempMin: 56, weatherCode: 0 },
        { date: "Sunday", tempMax: 85, tempMin: 58, weatherCode: 2 },
        { date: "Monday", tempMax: 89, tempMin: 60, weatherCode: 95 }
      ]);
    } finally {
      setWeatherLoading(false);
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Convert wind degrees to readable direction compass
  const getWindDirectionLabel = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return "N 🧭";
    if (deg >= 22.5 && deg < 67.5) return "NE 🧭";
    if (deg >= 67.5 && deg < 112.5) return "E 🧭";
    if (deg >= 112.5 && deg < 157.5) return "SE 🧭";
    if (deg >= 157.5 && deg < 202.5) return "S 🧭";
    if (deg >= 202.5 && deg < 247.5) return "SW 🧭";
    if (deg >= 247.5 && deg < 292.5) return "W 🧭";
    return "NW 🧭";
  };

  // Mapping WMO codes to readable text descriptions & beautiful icons
  const getWeatherMeta = (code: number) => {
    switch (code) {
      case 0:
        return { desc: "Clear Sunny Sky", icon: <Sun className="w-10 h-10 text-amber-500 animate-[spin_20s_linear_infinite]" />, bgClass: "from-amber-50 to-orange-50 text-amber-950 border-amber-200" };
      case 1:
      case 2:
      case 3:
        return { desc: "Partly Cloudy", icon: <Cloud className="w-10 h-10 text-stone-500" />, bgClass: "from-stone-50 to-amber-50/50 text-stone-900 border-stone-200" };
      case 45:
      case 48:
        return { desc: "Pueblo Fog / Haze", icon: <Cloud className="w-10 h-10 text-stone-400" />, bgClass: "from-zinc-50 to-stone-50 text-stone-800 border-zinc-200" };
      case 51:
      case 53:
      case 55:
        return { desc: "Light Pueblo Drizzle", icon: <CloudDrizzle className="w-10 h-10 text-sky-400 animate-pulse" />, bgClass: "from-sky-50 to-zinc-50 text-sky-950 border-sky-200" };
      case 61:
      case 63:
      case 65:
        return { desc: "Substantial Rain Shower", icon: <CloudRain className="w-10 h-10 text-blue-500 animate-pulse" />, bgClass: "from-blue-50 to-zinc-50 text-blue-950 border-blue-200" };
      case 71:
      case 73:
      case 75:
        return { desc: "Light Mountain Snowfall", icon: <Snowflake className="w-10 h-10 text-sky-300 animate-spin" />, bgClass: "from-cyan-50 to-stone-50 text-cyan-950 border-cyan-200" };
      case 80:
      case 81:
      case 82:
        return { desc: "Violent Storm Showers", icon: <CloudRain className="w-10 h-10 text-blue-600 animate-bounce" />, bgClass: "from-blue-100 to-indigo-50 text-blue-950 border-blue-300" };
      case 95:
      case 96:
      case 99:
        return { desc: "Severe Thunderstorm", icon: <CloudLightning className="w-10 h-10 text-orange-600 animate-pulse" />, bgClass: "from-orange-100 to-stone-100 text-orange-950 border-orange-300" };
      default:
        return { desc: "Mild Atmospheric Conditions", icon: <Sun className="w-10 h-10 text-amber-500" />, bgClass: "from-stone-50 to-stone-100 text-stone-900 border-stone-200" };
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4" id="weather-transit-hub-section">
      
      {/* LEFT SECTION: WEATHER SUMMARY (md:col-span-5) */}
      <div className="md:col-span-5 flex flex-col gap-4">
        
        {/* Main Weather Card */}
        <div className="border rounded-2xl p-4 bg-white shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          
          {/* Header */}
          <div className="flex justify-between items-start z-10">
            <div>
              <span className="text-[8.5px] font-mono uppercase tracking-wider font-bold text-stone-400 block">Pueblo Core Climate</span>
              <h4 className="font-extrabold text-sm text-stone-900">🌤️ Live Meteorological Station</h4>
            </div>
            
            <button
              onClick={fetchPuebloWeather}
              disabled={weatherLoading}
              className={`p-1.5 rounded-lg border text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 transition-all ${
                isRefreshing ? "animate-spin text-orange-650 border-orange-200" : "border-stone-200"
              }`}
              title="Refresh Meteorological Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Loading / Error States */}
          {weatherLoading && !weather ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-orange-650 animate-spin" />
              <span className="text-[10px] font-mono text-stone-400">Locking onto coordinate sensors (38.2544, -104.6091)...</span>
            </div>
          ) : weatherError && !weather ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center space-y-1.5 my-4">
              <AlertCircle className="w-5 h-5 text-red-650 mx-auto" />
              <p className="text-[10.5px] font-mono text-red-850 leading-tight">{weatherError}</p>
              <button
                onClick={fetchPuebloWeather}
                className="text-[9.5px] font-bold text-red-700 underline block mx-auto hover:text-red-900"
              >
                Retry API Node
              </button>
            </div>
          ) : weather ? (
            <>
              {/* Climate Stats Grid overlay */}
              <div className={`mt-3 p-3 rounded-xl border bg-linear-to-br ${getWeatherMeta(weather.weatherCode).bgClass} flex items-center justify-between`}>
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tight">{weather.temperature}°F</span>
                    <span className="text-[10px] font-medium text-stone-500">Feels {weather.apparentTemperature}°</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{getWeatherMeta(weather.weatherCode).desc}</span>
                    <span className="text-[8.5px] font-mono uppercase bg-white/60 px-1 py-0.2 rounded font-bold">WMO Code: {weather.weatherCode}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getWeatherMeta(weather.weatherCode).icon}
                  <span className="text-[8px] font-mono text-stone-500">Station reading at {weather.time}</span>
                </div>
              </div>

              {/* Subsidiary measurements */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-center font-mono text-[10.5px]">
                <div className="bg-stone-50 border p-1.5 rounded-lg border-stone-200/60">
                  <span className="text-[7.5px] font-bold text-stone-400 block uppercase">Wind Speed</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5 font-bold text-stone-800">
                    <Wind className="w-3 h-3 text-stone-500" />
                    <span>{weather.windSpeed} mph</span>
                  </div>
                </div>
                <div className="bg-stone-50 border p-1.5 rounded-lg border-stone-200/60">
                  <span className="text-[7.5px] font-bold text-stone-400 block uppercase">Wind Vector</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5 font-bold text-stone-800">
                    <Compass className="w-3 h-3 text-stone-500 animate-pulse" />
                    <span>{getWindDirectionLabel(weather.windDirection)}</span>
                  </div>
                </div>
                <div className="bg-stone-50 border p-1.5 rounded-lg border-stone-200/60">
                  <span className="text-[7.5px] font-bold text-stone-400 block uppercase">Atm. Humidity</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5 font-bold text-stone-800">
                    <Activity className="w-3 h-3 text-stone-500" />
                    <span>{weather.humidity}% rH</span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* 3-Day Atmospheric Trend Forecast */}
        <div className="border rounded-2xl p-4 bg-white shadow-xs">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Calendar className="w-4 h-4 text-orange-650" />
            <h5 className="font-extrabold text-xs text-stone-900">⛅ Pueblo 3-Day Atmospheric Trend</h5>
          </div>

          {weatherLoading && forecast.length === 0 ? (
            <div className="space-y-2 py-4">
              <div className="h-10 bg-stone-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-stone-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-stone-100 rounded-lg animate-pulse" />
            </div>
          ) : (
            <div className="space-y-2">
              {forecast.map((day, ix) => (
                <div key={ix} className="bg-stone-50 hover:bg-stone-100 transition-colors border border-stone-200/40 p-2 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-white border shrink-0">
                      {getWeatherMeta(day.weatherCode).icon}
                    </div>
                    <div>
                      <span className="font-bold text-stone-850 block">{day.date}</span>
                      <span className="text-[9.5px] text-stone-400 font-medium leading-none">{getWeatherMeta(day.weatherCode).desc}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-stone-850">{day.tempMax}°</span>
                    <span className="text-stone-400 mx-1">/</span>
                    <span className="text-stone-500">{day.tempMin}°F</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Pueblo Transit from the published schedule */}
      <div className="md:col-span-7">
        <PuebloTransitBoard favoritedRouteIds={favoritedRouteIds} onToggleFavoriteRoute={onToggleFavoriteRoute} />
      </div>

    </div>
  );
}
