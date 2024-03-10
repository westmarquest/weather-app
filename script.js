// Define constants for API key and API URLs
const apiKey = "873948a2bdc5513f522079bd21994e89";
const geoApiUrl = "https://api.openweathermap.org/geo/1.0/direct";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast";

// Search for a city based on user input
function searchCity() {
  var city = document.getElementById("cityInput").value.trim();
  if (city !== "") {
    geocodeCity(city);
  }
}

// Perform geocoding to get city coordinates
function geocodeCity(city) {
  var apiUrl = `${geoApiUrl}?q=${encodeURIComponent(
    city
  )}&limit=1&appid=${apiKey}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        var latitude = data[0].lat;
        var longitude = data[0].lon;
        fetchWeatherForecast(latitude, longitude);
        displaySearchHistory(city);
      } else {
        alert("City not found");
      }
    })
    .catch((error) => {
      console.error("Error geocoding city:", error);
    });
}

// Fetch weather forecast data using latitude and longitude
function fetchWeatherForecast(latitude, longitude) {
  var apiUrl = `${forecastApiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      updateWeatherForecast(data);
      displayFiveDayForecast(data);
    })
    .catch((error) => {
      console.error("Error fetching weather forecast:", error);
    });
}

// Update the current weather forecast
function updateWeatherForecast(data) {
  var city = data.city.name;
  var today = new Date(); // Get today's date
  var formattedDate = formatDate(today); // Format today's date
  var temperature = data.list[0].main.temp;
  var windSpeed = data.list[0].wind.speed;
  var humidity = data.list[0].main.humidity;

  var weatherEmoji = getWeatherEmoji(data.list[0].weather[0].main); // Get weather emoji based on weather condition

  var dailyForecast = document.getElementById("dailyForecast");
  dailyForecast.innerHTML = `
    <div class="weather-box">
      <h2>${city}  ${formattedDate}</h2>
      <p>${weatherEmoji}</p> <!-- Display weather emoji here -->
      <p>Temperature: ${temperature}°C</p>
      <p>Wind Speed: ${windSpeed} m/s</p>
      <p>Humidity: ${humidity}%</p>
    </div>
  `;
}

// Display the search history
function displaySearchHistory(city) {
  var searchHistoryDiv = document.getElementById("searchHistory");
  var cityButton = document.createElement("button");
  cityButton.textContent = city;
  cityButton.classList.add("city-button");
  cityButton.addEventListener("click", function () {
    geocodeCity(city);
  });
  searchHistoryDiv.appendChild(cityButton);
  searchHistoryDiv.appendChild(document.createElement("br"));

  // Save search history to local storage
  saveSearchHistory(city);
}

// Clear the search history
function clearSearchHistory() {
  var searchHistoryDiv = document.getElementById("searchHistory");
  searchHistoryDiv.innerHTML = ""; // Clear the search history from the DOM
  localStorage.removeItem("searchHistory"); // Remove the search history from local storage
}

// Add event listener to the clear button
document
  .getElementById("clearButton")
  .addEventListener("click", clearSearchHistory);

// Save search history to local storage
function saveSearchHistory(city) {
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  searchHistory.push(city);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

// Load search history from local storage
function loadSearchHistory() {
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  searchHistory.forEach(function (city) {
    displaySearchHistory(city);
  });
}

// Call loadSearchHistory when the page loads
window.addEventListener("load", loadSearchHistory);

// Fetch and display the five-day forecast
function displayFiveDayForecast(data) {
  var forecastSection = document.getElementById("forecast-section");
  forecastSection.innerHTML = "";
  var heading = document.createElement("h2");
  heading.textContent = "5 Day Forecast:";
  forecastSection.appendChild(heading);

  // Get tomorrow's date
  var today = new Date(); // Get today's date
  var tomorrow = new Date(today); // Create a copy of today's date
  tomorrow.setDate(tomorrow.getDate() + 1); // Increment the copy by 1 day

  for (var i = 0; i < 5; i++) {
    var forecastData = data.list[i];
    var formattedDate = formatDate(
      new Date(tomorrow.getTime() + i * 24 * 60 * 60 * 1000)
    ); // Add i * 24 * 60 * 60 * 1000 to tomorrow's date

    var weatherEmoji = getWeatherEmoji(forecastData.weather[0].main); // Get weather emoji based on weather condition

    var temperature = forecastData.main.temp;
    var windSpeed = forecastData.wind.speed;
    var humidity = forecastData.main.humidity;

    var weatherBox = document.createElement("div");
    weatherBox.classList.add("forecast-weather-box");

    weatherBox.innerHTML = `
      <h2>${formattedDate}</h2>
      <p>${weatherEmoji}</p> <!-- Display weather emoji here -->
      <p><strong>Temperature:</strong> ${temperature}°C</p>
      <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
      <p><strong>Humidity:</strong> ${humidity}%</p>
    `;
    forecastSection.appendChild(weatherBox);
  }
}

// Format date in MM/DD/YYYY format
function formatDate(date, offset = 0) {
  var currentDate = new Date(date);
  currentDate.setDate(currentDate.getDate() + offset);
  var day = currentDate.getDate().toString().padStart(2, "0");
  var month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  var year = currentDate.getFullYear();
  return `${month}/${day}/${year}`;
}

function getWeatherEmoji(weather) {
  switch (weather) {
    case "Clear":
      return "☀️"; // Sun emoji
    case "Clouds":
      return "☁️"; // Cloud emoji
    case "Rain":
      return "🌧️"; // Rain emoji
    default:
      return "❓"; // Question mark emoji for unknown weather
  }
}
