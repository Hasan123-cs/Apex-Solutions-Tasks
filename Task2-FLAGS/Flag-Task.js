import { API_KEY, API_URL } from "./config.js";
let loading = false;

let apiError = false;
let countries = [];
let minPopulation = null;

let maxPopulation = null;
let currentPage = 1;
let showFavoritesOnly = false;
let rowsPerPage = 5;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
// events listener
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("countryModal").style.display = "none";
});
document.getElementById("countryModal").addEventListener("click", (e) => {
  if (e.target.id === "countryModal") {
    e.target.style.display = "none";
  }
});
document.getElementById("showFavorites").addEventListener("change", () => {
  showFavoritesOnly = document.getElementById("showFavorites").checked;

  currentPage = 1;

  displayCountries();
});
document
  .getElementById("applyPopulationFilter")
  .addEventListener("click", () => {
    const minValue = document.getElementById("minPopulation").value;

    const maxValue = document.getElementById("maxPopulation").value;

    const newMin = minValue !== "" ? Number(minValue) : null;

    const newMax = maxValue !== "" ? Number(maxValue) : null;

    const error = document.getElementById("populationError");

    error.innerHTML = "";

    if ((newMin !== null && newMin < 0) || (newMax !== null && newMax < 0)) {
      error.innerHTML = "Population cannot be negative";

      return;
    }

    if (newMin !== null && newMax !== null && newMin > newMax) {
      error.innerHTML =
        "Minimum population cannot be greater than maximum population.";

      return;
    }

    minPopulation = newMin;

    maxPopulation = newMax;

    currentPage = 1;

    displayCountries();
  });
document
  .getElementById("resetPopulationFilter")
  .addEventListener("click", () => {
    // clear inputs
    document.getElementById("minPopulation").value = "";

    document.getElementById("maxPopulation").value = "";

    // remove population filter
    minPopulation = null;

    maxPopulation = null;

    // remove error
    document.getElementById("populationError").innerHTML = "";

    // go back page 1
    currentPage = 1;

    displayCountries();
  });

document.getElementById("countriesPerPage").addEventListener("change", () => {
  rowsPerPage = Number(document.getElementById("countriesPerPage").value);

  currentPage = 1;

  displayCountries();
});
document.getElementById("randomCountryBtn").addEventListener("click", () => {
  if (countries.length === 0) {
    return;
  }
  const randomIndex = Math.floor(Math.random() * countries.length);
  const randomCountry = countries[randomIndex];
  openCountryModal(randomCountry);
});
// ===events listener===
// handlers
async function getCountries() {
  const table = document.getElementById("countryTable");
  // loading state
  table.innerHTML = `
    <tr>
    <td colspan="4">
    <h3>
    Loading countries...
    </h3>
    </td>
    </tr>
    `;

  countries = [];

  try {
    let requests = [];

    for (let offset = 0; offset < 300; offset += 25) {
      requests.push(
        fetch(`${API_URL}?offset=${offset}`, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }),
      );
    }

    const responses = await Promise.all(requests);
    // check API response

    for (const response of responses) {
      if (!response.ok) {
        throw new Error("API request failed");
      }
    }

    const results = await Promise.all(
      responses.map((response) => response.json()),
    );

    countries = results.flatMap((result) => result.data.objects);

    console.log("Total:", countries.length);

    displayCountries();
  } catch (error) {
    console.log(error);
    table.innerHTML = `

        <tr>
        <td colspan="4">
        <h2 style="color:red">
        Unable to load countries.
        </h2>
        <p>
        Please check your internet connection and try again.
        </p>
        <button id="retryBtn">
        Try Again
        </button>
        </td>
        </tr>
        `;

    document.getElementById("retryBtn").addEventListener("click", () => {
      getCountries();
    });
  }
}
function displayCountries() {
  const table = document.getElementById("countryTable");

  table.innerHTML = "";
  let filteredCountries = countries;
  if (showFavoritesOnly) {
    filteredCountries = countries.filter((country) => {
      return isFavorite(country);
    });
  }
  // Population filter

  if (minPopulation !== null) {
    filteredCountries = filteredCountries.filter((country) => {
      return country.population >= minPopulation;
    });
  }

  if (maxPopulation !== null) {
    filteredCountries = filteredCountries.filter((country) => {
      return country.population <= maxPopulation;
    });
  }

  const totalPages = Math.ceil(filteredCountries.length / rowsPerPage);
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageCountries = filteredCountries.slice(startIndex, endIndex);
  if (pageCountries.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4">
          No  countries found
        </td>
      </tr>
    `;

    document.getElementById("pageNumber").innerText = "0 of 0";

    return;
  }

  pageCountries.forEach((country) => {
    const row = document.createElement("tr");

    row.addEventListener("click", () => {
      openCountryModal(country);
    });

    if (country.population < 5000000) {
      row.style.backgroundColor = "red";
    } else {
      row.style.backgroundColor = "#adff2f";
    }

    row.innerHTML = `

    <td>
      <img src="${country.flag.url_png}" width="50">
    </td>


    <td>
      ${country.names.common}
    </td>


    <td>
      ${country.population.toLocaleString()}
    </td>


    <td>

      <button class="favorite-btn"
      style="
      ${
        isFavorite(country)
          ? "background-color: gold; color:white;"
          : "background-color:lightgray; color:black;"
      }
      ">

      ${isFavorite(country) ? "★ Favorited" : "☆ Favorite"}

      </button>

    </td>

    `;

    const favoriteBtn = row.querySelector(".favorite-btn");

    favoriteBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      addFavorite(country, favoriteBtn);
    });

    table.appendChild(row);
  });

  document.getElementById("pageNumber").innerText =
    `${currentPage} of ${totalPages}`;
  document.getElementById("prev").disabled = currentPage === 1;

  document.getElementById("next").disabled = currentPage === totalPages;
}
document.getElementById("next").addEventListener("click", () => {
  let filteredCountries = countries;
  if (showFavoritesOnly) {
    filteredCountries = filteredCountries.filter((country) => {
      return isFavorite(country);
    });
  }
  if (minPopulation !== null) {
    filteredCountries = filteredCountries.filter((country) => {
      return country.population >= minPopulation;
    });
  }

  if (maxPopulation !== null) {
    filteredCountries = filteredCountries.filter((country) => {
      return country.population <= maxPopulation;
    });
  }

  const totalPages = Math.ceil(filteredCountries.length / rowsPerPage);

  if (currentPage < totalPages) {
    currentPage++;

    displayCountries();
  }
});

document.getElementById("prev").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;

    displayCountries();
  }
});
function openCountryModal(country) {
  // show modal
  document.getElementById("countryModal").style.display = "flex";

  // Flag
  document.getElementById("modalFlag").src = country.flag.url_png || "";

  // Name
  document.getElementById("modalName").innerText =
    country.names?.common || "N/A";

  // Capital
  document.getElementById("modalCapital").innerText =
    country.capitals?.[0]?.name || "N/A";

  // Population
  document.getElementById("modalPopulation").innerText = country.population
    ? country.population.toLocaleString()
    : "N/A";

  // Region
  document.getElementById("modalRegion").innerText = country.region || "N/A";

  // Subregion
  document.getElementById("modalSubregion").innerText =
    country.subregion || "N/A";

  // Languages
  document.getElementById("modalLanguages").innerText = country.languages
    ? country.languages.map((lang) => lang.name).join(", ")
    : "N/A";
}
// add favorite
function addFavorite(country, button) {
  const index = favorites.findIndex(
    (fav) => fav.names.common === country.names.common,
  );

  if (index === -1) {
    favorites.push(country);

    button.innerHTML = "★ Favorited";

    button.style.backgroundColor = "gold";
    button.style.color = "white";
  } else {
    favorites.splice(index, 1);
    button.innerHTML = "☆ Favorite";
    button.style.backgroundColor = "lightgray";
    button.style.color = "black";
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
}
function isFavorite(country) {
  return favorites.some((fav) => fav.names.common === country.names.common);
}
// ==handlers===
getCountries();
