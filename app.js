import { getWeatherCode } from "./utils/weatherCode.js";
import { getGeoCoordinates } from "./utils/getGeoCoordinates.js";
import { geHourlyForecastForDay } from "./utils/geHourlyForecastForDay.js";

const unitMenu = document.querySelector(".unit-menu");
const triggerbtn = document.querySelector(".unit-menu__trigger");
const dropdown = document.querySelector(".unit-dropdown");
const systemToggleBtn = document.querySelector(".unit-dropdown__system-btn");
const unitgroups = document.querySelectorAll(".unit-group");
const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-bar");
const countryName = document.querySelector(".country_name");
const cityName = document.querySelector(".country_state");
const mainDisplaytemp = document.querySelector(".dashboard-temp");
const countryCurrentTime = document.querySelector(".country_current_time");
const mainDispalyWeathericon = document.querySelector(".weather-icon");
const feelsLikeTemp = document.querySelector(".Feels_like-value");
const humadity = document.querySelector(".humadity-value");
const windSpeed = document.querySelector(".wind-value");
const precipitation = document.querySelector(".precipitation-value");
const dailyForecastGrid = document.querySelectorAll(".day-card");
const hourleySelectDay = document.querySelector(".houerly-select");
const hourlyContainer = document.querySelector("#hourly-container");
const perceptionUnit = document.querySelector(".precipitation-unit");
const windUnit = document.querySelector(".wind-unit");
const humadityUnit = document.querySelector(".humadity-unit");
const weatherDashboard = document.querySelector("main");

// Fetch weatherInfo from API
async function weatherInfo({
  unitSystem = "metric",
  userEnteredPlace = "New Delhi",
} = {}) {
  try {
    const latlogFetch = await getGeoCoordinates(userEnteredPlace);

    const params = new URLSearchParams({
      latitude: latlogFetch.latitude,
      longitude: latlogFetch.longitude,
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      hourly: "temperature_2m,weather_code",
      current:
        "temperature_2m,relative_humidity_2m,precipitation,weather_code,apparent_temperature,wind_speed_10m",
      temperature_unit: unitSystem === "imperial" ? "fahrenheit" : "celsius",
      wind_speed_unit: unitSystem === "imperial" ? "mph" : "kmh",
      precipitation_unit: unitSystem === "imperial" ? "inch" : "mm",
      timezone: "auto",
    });

    const weatherInfoFetch = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    );

    const weatherData = await weatherInfoFetch.json();

    // Set Main Display
    countryName.textContent = latlogFetch.country;
    cityName.textContent = latlogFetch.name;
    mainDisplaytemp.textContent = weatherData.current.temperature_2m; // Set main display temp
    const convertcountrydate = new Date(weatherData.current.time); // Set date
    const formatter = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    countryCurrentTime.textContent = formatter.format(convertcountrydate); // Set date

    mainDispalyWeathericon.src = getWeatherCode(
      weatherData.current.weather_code,
    ).iconPath; // Set mainDisplay weather

    feelsLikeTemp.textContent = weatherData.current.apparent_temperature;
    humadity.textContent = weatherData.current.relative_humidity_2m;
    windSpeed.textContent = weatherData.current.wind_speed_10m;
    precipitation.textContent = weatherData.current.precipitation;
    humadityUnit.textContent = weatherData.current_units.relative_humidity_2m;
    windUnit.textContent = weatherData.current_units.wind_speed_10m;
    perceptionUnit.textContent = weatherData.current_units.precipitation;

    // Daily forecast
    const dailyForecastData = weatherData.daily;

    dailyForecastGrid.forEach((parent, index) => {
      const dayName = parent.querySelector(".day-name");
      const dayIcon = parent.querySelector(".day-icon");
      const maxTemp = parent.querySelector(".high");
      const lowTemp = parent.querySelector(".low");
      maxTemp.textContent = dailyForecastData.temperature_2m_max[index];
      lowTemp.textContent = dailyForecastData.temperature_2m_min[index];

      const dailyDate = new Date(dailyForecastData.time[index]);
      dayName.textContent = dailyDate.toLocaleDateString("en-US", {
        weekday: "short",
      });

      dayIcon.src = getWeatherCode(
        dailyForecastData.weather_code[index],
      ).iconPath;
      dayIcon.alt = getWeatherCode(dailyForecastData.weather_code[index]).label;
    });

    // Hourley Forecast

    const totalNumberOfDays = dailyForecastData.time;
    totalNumberOfDays.forEach((value, index) => {
      let setOptionDay = new Date(
        dailyForecastData.time[index],
      ).toLocaleDateString("en-US", { weekday: "long" });
      const selectOptions = document.createElement("option");
      selectOptions.textContent = setOptionDay;
      selectOptions.value = setOptionDay;
      hourleySelectDay.append(selectOptions);
    });

    const hourlyData = weatherData.hourly;

    const result = geHourlyForecastForDay(
      hourlyData,
      convertcountrydate.toLocaleDateString("en-US", { weekday: "long" }),
    );
    // 1. Map the array into an array of HTML strings, then join them into one block of text
    const htmlString = result
      .map(
        (value) => `
  <div class="hourly-list">
    <div class="hourly-item">
      <div class="hourly-time">
        <img src="${value.weatherImgPath}" alt="${value.weatherlablePath}" class="hourly-icon" />
        <span>${value.time}</span>
      </div>
      <div>
        <span class="hourly-temp">${value.temp}</span>
      </div>
    </div>
  </div>
`,
      )
      .join("");

    // 2. Wipe the old data and inject everything in one single shot
    hourlyContainer.innerHTML = htmlString;

    hourleySelectDay.addEventListener("change", (value) => {
      const selectedDay = hourleySelectDay.value;
      const result = geHourlyForecastForDay(hourlyData, selectedDay);
      const htmlString = result
        .map(
          (value) => `
  <div class="hourly-list">
    <div class="hourly-item">
      <div class="hourly-time">
        <img src="${value.weatherImgPath}" alt="${value.weatherlablePath}" class="hourly-icon" />
        <span>${value.time}</span>
      </div>
      <div>
        <span class="hourly-temp">${value.temp}</span>
      </div>
      </div>
  </div>
`,
        )
        .join("");
      hourlyContainer.innerHTML = htmlString;
    });
  } catch (error) {
    renderErrorUI(error.message);
    console.log("Error inside the weatherInfo fucnction\n", error.stack);
  }
}

const currentUnits = {
  temperature: "celsius",
  windSpeed: "kmh",
  precipitation: "mm",
};

// dropdown toggle functionality
function openDropDown() {
  unitMenu.classList.add("is-open");
  dropdown.classList.add("is-open");
  triggerbtn.setAttribute("aria-expanded", "true");
}

function closeDropdown() {
  dropdown.classList.remove("is-open");
  unitMenu.classList.remove("is-open");
  triggerbtn.setAttribute("aria-expanded", "false");
}

triggerbtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = dropdown.classList.contains("is-open");
  isOpen ? closeDropdown() : openDropDown();
});

// Close when clicking outside
document.addEventListener("click", (e) => {
  if (!unitMenu.contains(e.target)) {
    closeDropdown();
  }
});

// Close on Escape key press
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && dropdown.classList.contains("is-open")) {
    closeDropdown();
    triggerbtn.focus();
  }
});

systemToggleBtn.addEventListener("click", () => {
  const isImperialTarget =
    systemToggleBtn.textContent.trim() === "Switch to Imperial";
  const targetSystem = isImperialTarget ? "imperial" : "metric";

  unitgroups.forEach((group) => {
    const category = group.dataset.unitCategory;
    const options = group.querySelectorAll(".unit-option");

    options.forEach((btn) => {
      const isMatch = btn.dataset.unit === targetSystem;
      btn.classList.toggle("unit-option--selected", isMatch);

      if (isMatch) {
        currentUnits[category] = btn.dataset.unitValue;
      }
    });
  });

  systemToggleBtn.textContent = isImperialTarget
    ? "Switch to Metric"
    : "Switch to Imperial";
  weatherInfo({ unitSystem: targetSystem });
});

searchBtn.addEventListener("click", (e) => {
  weatherInfo({ userEnteredPlace: searchInput.value });
});

function renderErrorUI(message) {
  if (weatherDashboard) weatherDashboard.innerHTML = "";

  weatherDashboard.classList.add("main-weather-dashboard");
  weatherDashboard.innerHTML = `
    <div class="error-container">
      <img src="./assets/images/icon-error.svg" alt="Error" />
      <h1>Something went wrong</h1>
      <p>We couldn't connect to the server ${message}. Please try again in few moments</p>
      <button class="retry-btn">
        <img class="retry-icon" src="./assets/images/icon-retry.svg" alt="" />
        <span>Retry</span>
      </button>
    </div>
  `;

  const btn = document.querySelector(".retry-btn");
  if (btn !== null && btn !== undefined) {
    btn.addEventListener("click", () => {
      weatherInfo();
      location.reload();
    });
  }
}

weatherInfo(); // Initial call to fetch weather data for default location
