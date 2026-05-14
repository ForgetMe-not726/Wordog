"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  weatherCode: number;
  city: string;
}

const WEATHER_MAP: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "晴" },
  1: { icon: "🌤️", label: "大部晴朗" },
  2: { icon: "⛅", label: "多云" },
  3: { icon: "☁️", label: "阴" },
  45: { icon: "🌫️", label: "雾" },
  48: { icon: "🌫️", label: "冻雾" },
  51: { icon: "🌦️", label: "小毛毛雨" },
  53: { icon: "🌦️", label: "毛毛雨" },
  55: { icon: "🌧️", label: "大毛毛雨" },
  61: { icon: "🌧️", label: "小雨" },
  63: { icon: "🌧️", label: "中雨" },
  65: { icon: "🌧️", label: "大雨" },
  71: { icon: "🌨️", label: "小雪" },
  73: { icon: "🌨️", label: "中雪" },
  75: { icon: "❄️", label: "大雪" },
  77: { icon: "❄️", label: "雪粒" },
  80: { icon: "🌦️", label: "阵雨" },
  81: { icon: "🌧️", label: "大阵雨" },
  82: { icon: "🌧️", label: "暴阵雨" },
  85: { icon: "🌨️", label: "阵雪" },
  86: { icon: "🌨️", label: "大阵雪" },
  95: { icon: "⛈️", label: "雷暴" },
  96: { icon: "⛈️", label: "冰雹雷暴" },
  99: { icon: "⛈️", label: "强雷暴" },
};

function formatDate(): string {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 周${["日","一","二","三","四","五","六"][now.getDay()]}`;
}

async function getCoords(): Promise<{ lat: number; lon: number; city: string }> {
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        enableHighAccuracy: false,
      });
    });
    const { latitude: lat, longitude: lon } = pos.coords;
    const city = await fetchCity(lat, lon);
    return { lat, lon, city };
  } catch {
    try {
      const r = await fetch("https://ipapi.co/json/");
      const d = await r.json();
      return { lat: d.latitude, lon: d.longitude, city: d.country === "CN" ? d.city : d.city };
    } catch {
      return { lat: 39.9, lon: 116.4, city: "北京" };
    }
  }
}

async function fetchCity(lat: number, lon: number): Promise<string> {
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/geocoding-api?name=&count=1&language=zh&format=json&latitude=${lat}&longitude=${lon}`,
    );
    const d = await r.json();
    if (d.results?.[0]) {
      return d.results[0].name ?? d.results[0].admin1 ?? "未知";
    }
  } catch {}
  return "未知";
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [dateStr, setDateStr] = useState(formatDate());

  useEffect(() => {
    const timer = setInterval(() => setDateStr(formatDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { lat, lon, city } = await getCoords();
        if (cancelled) return;

        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
        );
        const d = await r.json();

        if (cancelled) return;
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          weatherCode: d.current.weather_code,
          city,
        });
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const info = weather ? (WEATHER_MAP[weather.weatherCode] ?? { icon: "🌈", label: "未知" }) : null;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3.5 shadow-sm border border-white/80 flex items-center gap-4">
      <div className="text-4xl leading-none">
        {info?.icon ?? "🌈"}
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-700">
            {weather?.temp ?? "--"}°
          </span>
          <span className="text-sm text-gray-400 font-medium">
            {info?.label ?? "加载中"}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {dateStr}
        </span>
        <span className="text-xs text-gray-400">
          {weather?.city ?? ""}
        </span>
      </div>
    </div>
  );
}
