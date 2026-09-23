const API_KEY = "rc_live_a3ba6ce1de0b46ff880de34c9b01092a";

const API_URL = "https://api.restcountries.com/countries/v5";

let countries = [];

let currentPage = 1;

const rowsPerPage = 5;

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

  const startIndex = (currentPage - 1) * rowsPerPage;

  const endIndex = startIndex + rowsPerPage;

  const pageCountries = countries.slice(startIndex, endIndex);
  const totalPages = Math.ceil(countries.length / rowsPerPage);
  pageCountries.forEach((country) => {
    const row = document.createElement("tr");

    if (country.population < 5000000) {
      row.style.backgroundColor = "red";
    } else {
      row.style.backgroundColor = "limegreen";
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
</td>

`;

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

getCountries();
