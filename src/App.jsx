import { useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Skriv venligst et bynavn først.");
      return;
    }

    try {
      setError("");
      setWeather(null);

      /* 1) Hent koordinater */
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          city
        )}&limit=1&appid=${API_KEY}`
      );

      if (!geoRes.ok) throw new Error("geo-error");

      const geoData = await geoRes.json();
      if (geoData.length === 0) {
        setError("Byen blev ikke fundet.");
        return;
      }

      const { lat, lon, name } = geoData[0];

      /* 2) Hent vejrinformation */
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      if (!weatherRes.ok) throw new Error("weather-error");

      const data = await weatherRes.json();

      setWeather({
        city: name,
        temp: data.main.temp,
        icon: data.weather[0].icon,
        description: data.weather[0].description,
      });
    } catch (err) {
      // Du kan differentiere fejltyper her via err.message hvis ønsket
      setError("Der opstod en fejl. Prøv igen.");
    }
  };

  return (
    <div className="weather-app">
      <h1>🌤️ Vejr App</h1>

      <input
        type="text"
        placeholder="Skriv bynavn..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={handleSearch}>Søg</button>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.city}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
          />
          <p>{weather.temp}°C</p>
          <p>{weather.description}</p>
        </div>
      )}
    </div>
  );
}
