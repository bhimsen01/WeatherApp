const apiKey = "fd0d6e558df53f83487aeef08e60ebc8";

function updateDateTime() {
  const now = new Date();
  const formatted = now.toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("dateTime").textContent = formatted;
}
setInterval(updateDateTime, 1000);
updateDateTime();

window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      getWeatherByCoords(latitude, longitude);
    }, () => {
      getWeather("Kathmandu");
    });
  } else {
    getWeather("Kathmandu");
  }
};

function getWeather(cityParam) {
  const city = cityParam || document.getElementById("cityInput").value;
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod === 200) {
        updateWeatherUI(data);
        getForecast(data.name);
        getAirQuality(data.coord.lat, data.coord.lon);
      } else {
        alert("City not found!");
      }
    })
    .catch(() => alert("Weather fetch error"));
}

function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      updateWeatherUI(data);
      getForecast(data.name);
      getAirQuality(lat, lon);
    })
    .catch(() => alert("Location fetch error"));
}

function updateWeatherUI(data) {
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("temp").innerHTML = `${data.main.temp.toFixed(1)}°C<br><span id="description">${data.weather[0].main}</span>`;
  document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("wind").textContent = `${data.wind.speed} km/h`;
  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
  document.getElementById("visibility").textContent = `${(data.visibility / 1000).toFixed(1)} km`;

  updateBackground(data.weather[0].description);
}

function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const forecastCards = document.getElementById("forecastCards");
      forecastCards.innerHTML = "";

      const hourlyContainer = document.getElementById("hourlyForecast");
      hourlyContainer.innerHTML = ""; // Clear previous

      const daily = {};
      let hourlyCount = 0;

      data.list.forEach(item => {
 
        if (hourlyCount < 6) {
          const time = new Date(item.dt_txt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit"
          });

          const div = document.createElement("div");
          div.className = "hour";
          div.innerHTML = `
            <p>${time}</p>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].main}" />
            <p>${item.main.temp.toFixed(1)}°C</p>
          `;
          hourlyContainer.appendChild(div);
          hourlyCount++;
        }


        if (item.dt_txt.includes("12:00:00")) {
          const date = item.dt_txt.split(" ")[0];
          daily[date] = item;
        }
      });

      const days = Object.keys(daily).slice(0, 5);

      days.forEach(date => {
        const forecast = daily[date];
        const day = new Date(date).toLocaleDateString("en-GB", { weekday: "long" });

        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
          <span>${day}</span>
          <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" />
          <span>${forecast.main.temp.toFixed(1)}°C</span>
          <span>${forecast.weather[0].main}</span>
        `;
        forecastCards.appendChild(card);
      });
    })
    .catch(() => console.error("Forecast fetch error"));
}


function getAirQuality(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const aqi = data.list[0].main.aqi;
      const meanings = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
      document.getElementById("airQuality").textContent = `${meanings[aqi - 1]} (${aqi})`;
    })
    .catch(() => {
      document.getElementById("airQuality").textContent = "Unavailable";
    });
}

function updateBackground(weather) {
  const body = document.body;
  const condition = weather.toLowerCase();
  let backgroundUrl = "";

  if (condition.includes("clear")) {
    backgroundUrl = "clear.jpg";
  } else if (condition.includes("cloud")) {
    backgroundUrl = "cloud.avif";
  } else if (condition.includes("rain")) {
    backgroundUrl = "rainy.jpg";
  } else if (condition.includes("snow")) {
    backgroundUrl = "snow.jpg";
  } else if (condition.includes("thunderstorm")) {
    backgroundUrl = "thunderstorm.jpg";
  } else if (condition.includes("haze") || condition.includes("mist") || condition.includes("fog")) {
    backgroundUrl = "haze.avif";
  } else if (condition.includes("wind")) {
    backgroundUrl = "windy.jpg";
  } else if (condition.includes("drizzle")) {
    backgroundUrl = "drizzle.webp";
  } else {
    backgroundUrl = ""; // fallback image
  }

  body.style.backgroundImage = `url('${backgroundUrl}')`;
  body.style.backgroundSize = "cover";
  body.style.backgroundRepeat = "no-repeat";
  body.style.backgroundPosition = "center";


}








