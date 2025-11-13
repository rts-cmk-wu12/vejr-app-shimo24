import { useState } from "react";
import "./app.css"; 

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!city.trim()) return setError("Skriv bynavn.");
    if (!API_KEY) return setError(".env dosyasında VITE_OPENWEATHER_API_KEY yok.");

    try {
      setError(""); setWeather(null); setLoading(true);

      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
      );
      if (!geoRes.ok) throw new Error("geo");
      const geoData = await geoRes.json();
      if (!geoData?.length) return setError("by ikke fundet.");
      const { lat, lon, name, country } = geoData[0];

      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=${API_KEY}`
      );
      if (!weatherRes.ok) throw new Error("weather");
      const data = await weatherRes.json();

      setWeather({
        city: country ? `${name}, ${country}` : name,
        temp: Math.round(data?.main?.temp ?? 0),
        icon: data?.weather?.[0]?.icon || "",
        description: data?.weather?.[0]?.description || "",
      });
    } catch {
      setError("Der opstod en fejl. Prøv igen..");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-app">
      <h1>🌤️ Vejr</h1>
      <div className="controls">
        <input
          placeholder="Skriv bynavn..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Søger..." : "Søg"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {weather && (
        <div className="weather-info">
          <h2>{weather.city}</h2>
          {weather.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description || "Hava"}
              width={80} height={80}
            />
          )}
          <p className="temp">{weather.temp}°C</p>
          {weather.description && <p>{weather.description}</p>}
        </div>
      )}
    </div>
  );
}
