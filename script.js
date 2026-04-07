const apiKey = "e23fdf7cbcd5519543832db3fda3f734";

/* =========================
   CURRENT WEATHER
========================= */

function getWeather() {

   let cityInput = document.getElementById("cityInput");
   if (!cityInput) return;

   let city = cityInput.value.trim();

   if (city === "") {
      alert("Please enter a city name");
      return;
   }

   fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {

         if (data.cod !== 200) {
            alert("City not found");
            return;
         }

         updateWeather(data);
         getForecastByCity(data.name);

      })
      .catch(error => {
         console.log(error);
         alert("Error fetching weather data");
      });

}


/* =========================
   UPDATE CURRENT WEATHER
========================= */

function updateWeather(data) {

   if (!document.getElementById("cityName")) return;

   document.getElementById("cityName").innerText = data.name;

   document.getElementById("temperature").innerText =
      Math.round(data.main.temp) + "°C";

   let condition = data.weather[0].description;
   condition = condition.charAt(0).toUpperCase() + condition.slice(1);

   document.getElementById("condition").innerText = condition;


   let icon = data.weather[0].icon;
   let iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

   document.getElementById("weatherIcon").src = iconUrl;


   document.getElementById("windHighlight").innerText =
      data.wind.speed + " km/h";

   document.getElementById("humidityHighlight").innerText =
      data.main.humidity + "%";

   document.getElementById("pressureHighlight").innerText =
      data.main.pressure + " mb";

   document.getElementById("visibility").innerText =
      (data.visibility / 1000) + " km";


   document.getElementById("sunrise").innerText =
      new Date(data.sys.sunrise * 1000).toLocaleTimeString();

   document.getElementById("sunset").innerText =
      new Date(data.sys.sunset * 1000).toLocaleTimeString();

}


/* =========================
   CURRENT LOCATION WEATHER
========================= */

function getLocationWeather() {

   if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
   }

   navigator.geolocation.getCurrentPosition(

      function (position) {

         let lat = position.coords.latitude;
         let lon = position.coords.longitude;

         fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {

               updateWeather(data);
               getForecastByCoords(lat, lon);

            });

      },

      function () {
         alert("Location access denied. Please enable location.");
      },

      {
         enableHighAccuracy: true,
         timeout: 10000,
         maximumAge: 0
      }

   );

}


/* =========================
   FORECAST BY CITY
========================= */

function getForecastByCity(city) {

   fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => updateForecast(data));

}


/* =========================
   FORECAST BY LOCATION
========================= */

function getForecastByCoords(lat, lon) {

   fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => updateForecast(data));

}


/* =========================
   UPDATE FORECAST CARDS
========================= */

function updateForecast(data) {

   if (!document.getElementById("day1")) return;

   let forecastList = data.list;

   for (let i = 0; i < 5; i++) {

      let forecast = forecastList[i * 8];

      let date = new Date(forecast.dt * 1000);

      let dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      let temp = Math.round(forecast.main.temp) + "°C";

      let icon = forecast.weather[0].icon;
      let iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      document.getElementById("day" + (i + 1)).innerText = dayName;
      document.getElementById("temp" + (i + 1)).innerText = temp;
      document.getElementById("icon" + (i + 1)).src = iconUrl;

   }

}


/* =========================
   ENTER KEY SEARCH
========================= */

document.addEventListener("DOMContentLoaded", function () {

   let input = document.getElementById("cityInput");

   if (input) {
      input.addEventListener("keydown", function (event) {

         if (event.key === "Enter") {
            getWeather();
         }

      });
   }

});


/* =========================
   POPULAR CITIES WEATHER
========================= */

function loadCityWeather(city) {

   fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {

         let temp = Math.round(data.main.temp) + "°C";

         let condition = data.weather[0].description;
         condition = condition.charAt(0).toUpperCase() + condition.slice(1);

         let icon = data.weather[0].icon;
         let iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

         document.getElementById("temp" + city).innerText = temp;
         document.getElementById("cond" + city).innerText = condition;
         document.getElementById("icon" + city).src = iconUrl;

      });

}


/* =========================
   FAVORITES FUNCTIONALITY
========================= */

function addFavorite() {

   let city = prompt("Enter city name");

   if (!city) return;

   let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

   if (favorites.includes(city)) {
      alert("City already added");
      return;
   }

   favorites.push(city);

   localStorage.setItem("favorites", JSON.stringify(favorites));

   loadFavorites();
}


/* Load favorites */

function loadFavorites() {

   let grid = document.getElementById("favGrid");

   if (!grid) return;

   let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

   grid.innerHTML = `<div class="fav-add" onclick="addFavorite()">+</div>`;

   favorites.forEach(city => {

      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
         .then(response => response.json())
         .then(data => {

            let card = document.createElement("div");
            card.className = "fav-city";

            card.innerHTML = `
         <h4>${data.name}</h4>
         <h2>${Math.round(data.main.temp)}°C</h2>
         <p>${data.weather[0].description}</p>
         `;

            grid.appendChild(card);

         });

   });

}


/* =========================
   LAUNCH LOCATION WEATHER
========================= */

function loadLaunchWeather() {

   if (!navigator.geolocation) return;

   navigator.geolocation.getCurrentPosition(function (position) {

      let lat = position.coords.latitude;
      let lon = position.coords.longitude;

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
         .then(response => response.json())
         .then(data => {

            document.getElementById("launchCity").innerText = data.name;

            document.getElementById("launchTemp").innerText =
               Math.round(data.main.temp) + "°C";

            document.getElementById("launchCond").innerText =
               data.weather[0].description;

            document.getElementById("launchRange").innerText =
               Math.round(data.main.temp_max) + "° / " +
               Math.round(data.main.temp_min) + "°";

            document.getElementById("launchWind").innerText =
               "Wind: " + data.wind.speed + " km/h";

            document.getElementById("launchHumidity").innerText =
               "Humidity: " + data.main.humidity + "%";

         });

   });

}


/* =========================
   AUTO LOAD WEATHER
========================= */

window.onload = function () {

   if (document.getElementById("cityName")) {
      getLocationWeather();
   }

   if (document.getElementById("tempDelhi")) {

      loadCityWeather("Delhi");
      loadCityWeather("Mumbai");
      loadCityWeather("Hyderabad");
      loadCityWeather("Bengaluru");

   }

   if (document.getElementById("favGrid")) {
      loadFavorites();
      loadLaunchWeather();
   }

};