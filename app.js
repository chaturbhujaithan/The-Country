const API = "https://countries.dev/countries?fields=name,alpha2Code,alpha3Code,capital,region,subregion,population,flag,flags,currencies,languages,borders";

const container = document.getElementById("countryContainer");
const search = document.getElementById("searchInput");
const region = document.getElementById("regionFilter");
const status = document.getElementById("status");
const homePage = document.getElementById("homePage");
const detailPage = document.getElementById("detailPage");
const details = document.getElementById("countryDetails");

let countries = [];
function setStatus(message) {
  status.textContent = String(message || "").trim();
}
async function getCountries() {
  try {
    setStatus("Loading countries...");
    const res = await fetch(API);
    if (!res.ok) throw new Error("API request failed");
    countries = await res.json();
    countries.sort((a, b) => a.name.localeCompare(b.name));
    showCountries(countries.slice(0, 20));
    setStatus(`Showing first 20 of ${countries.length} countries`);

  } catch (error) {
    console.error(error);
    setStatus("API Error! Check your internet or try again.");
  }
}

function showCountries(data) {
  container.innerHTML = "";
  data.forEach(country => {
    const card = document.createElement("div");
    card.className =
      "bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden cursor-pointer hover:scale-105 transition";
    card.innerHTML = `
      <img src="${country.flags?.svg || country.flags?.png || ""}"
        class="w-full h-44 object-cover"
        alt="${country.name} flag">
      <div class="p-5 bg-teal-200">
        <h2 class="text-xl font-bold mb-4">${country.name}</h2>
        <p><b>Population:</b> ${Number(country.population || 0).toLocaleString()}</p>
        <p><b>Region:</b> ${country.region || "N/A"}</p>
        <p><b>Capital:</b> ${country.capital || "N/A"}</p>
      </div>
    `;
    card.addEventListener("click", () => showDetails(country));
    container.appendChild(card);
  });
}

const favoriteBtn = document.getElementById("favoriteBtn");
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let selectedCountry = null;

function filterCountries() {

  const text = search.value.toLowerCase().trim();
  const selectedRegion = region.value;

  const filtered = countries.filter(country =>
    country.name.toLowerCase().includes(text) &&
    (!selectedRegion || country.region === selectedRegion)
  );

  if (text || selectedRegion) {
    showCountries(filtered);
    setStatus(`${filtered.length} countries found`);
  } else {

    showCountries(countries.slice(0, 20));
    setStatus(`Showing first 20 of ${countries.length} countries`);
  }
}
search.addEventListener("input", filterCountries);
region.addEventListener("change", filterCountries);
function showDetails(country) {
  selectedCountry = country;
  homePage.classList.add("hidden");
  detailPage.classList.remove("hidden");
  const isFavorite = favorites.some(
    item => item.name === country.name
  );

  favoriteBtn.textContent = isFavorite
    ? " Remove Favorite"
    : " Add Favorite";

  homePage.classList.add("hidden");
  detailPage.classList.remove("hidden");

  const currency = (country.currencies || [])
    .map(c => c.name).join(", ") || "N/A";

  const languages = (country.languages || [])
    .map(l => l.name).join(", ") || "N/A";

  const borders = (country.borders || []).join(", ") || "None";

  details.innerHTML = `
    <img
      src="${country.flags?.svg || country.flags?.png || ""}"
      class="w-full rounded-lg shadow"
      alt="${country.name} flag">

    <div>
      <h2 class="text-3xl font-bold mb-6">${country.name}</h2>
      <p><b>Population:</b> ${Number(country.population || 0).toLocaleString()}</p>
      <p><b>Region:</b> ${country.region || "N/A"}</p>
      <p><b>Sub Region:</b> ${country.subregion || "N/A"}</p>
      <p><b>Capital:</b> ${country.capital || "N/A"}</p>
      <p><b>Currency:</b> ${currency}</p>
      <p><b>Languages:</b> ${languages}</p>
      <p><b>Border Countries:</b> ${borders}</p>
    </div>
  `;
}

favoriteBtn.addEventListener("click", () => {
  if (!selectedCountry) return;
  const isFavorite = favorites.some(
    item => item.name === selectedCountry.name
  );
  if (isFavorite) {
    favorites = favorites.filter(
      item => item.name !== selectedCountry.name
    );
    favoriteBtn.textContent = " Add Favorite";
  } else {
    favorites.push(selectedCountry);
    favoriteBtn.textContent = " Remove Favorite";
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
});

document.getElementById("backBtn").addEventListener("click", () => {
  detailPage.classList.add("hidden");
  homePage.classList.remove("hidden");
});

document.getElementById("themeBtn").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  const dark = document.documentElement.classList.contains("dark");
  document.getElementById("themeBtn").textContent =
    dark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

getCountries();