const API_KEY = "rc_live_a3ba6ce1de0b46ff880de34c9b01092a";

const API_URL = "https://api.restcountries.com/countries/v5";

let countries = [];

let currentPage = 1;
let showFavoritesOnly = false;
const rowsPerPage = 5;
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

// ===events listener===
// handlers
function getCountries() {
  let requests = [];

  for (let offset = 0; offset < 300; offset += 25) {
    requests.push(
      fetch(`${API_URL}?offset=${offset}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }).then((response) => response.json()),
    );
  }

  Promise.all(requests)

    .then((results) => {
      countries = results.flatMap((result) => result.data.objects);

      console.log("Total:", countries.length);

      displayCountries();
    })

    .catch((error) => {
      console.log(error);
    });
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
          No favorite countries found
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
}
document.getElementById("next").addEventListener("click", () => {
  const totalPages = Math.ceil(countries.length / rowsPerPage);

  if (currentPage < totalPages) {
    currentPage++;

    displayCountries();
    document.getElementById("prev").disabled = false;
  } else {
    document.getElementById("next").disabled = true;
  }
});

document.getElementById("prev").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    document.getElementById("next").disabled = false;

    displayCountries();
  } else {
    document.getElementById("prev").disabled = true;
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
