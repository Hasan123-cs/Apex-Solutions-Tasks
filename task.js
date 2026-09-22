let timer;
let timeLeft;
// what mean ? when click edit the editingUserId contain the id 1234-asncds...
let editingUserId = null;
// remember last for reverse and know what the direction of sorting
let sortColumn = null;
let sortDirection = "asc";
const savedUsers = localStorage.getItem("users");
let users = [];
const form = document.getElementById("MyForm");
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const Gender = document.getElementById("selectedGender");
const saveBtn = document.getElementById("saveBtn");
const userTable = document.getElementById("userTable");
const timerElement = document.getElementById("timer");
const firstNameError = document.getElementById("firstNameError");
const lastNameError = document.getElementById("lastNameError");
const searchInput = document.getElementById("searchInput");
if (savedUsers) {
  users = JSON.parse(savedUsers);
  displayUsers();
}

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}
form.addEventListener("submit", function (event) {
  // for no refresh un page
  event.preventDefault();
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();
  let isValid = true;

  if (firstNameValue.length < 3) {
    firstNameError.textContent = "First name must be at least 3 characters";
    isValid = false;
  } else {
    firstNameError.textContent = "";
  }

  if (lastNameValue.length < 3) {
    lastNameError.textContent = "Last name must be at least 3 characters";
    isValid = false;
  } else {
    lastNameError.textContent = "";
  }
  // stop the page if its invalid
  if (!isValid) {
    return;
  }
  // now push dosent work like the old since we have 2 state update and create so based on the id
  // remembeerd we can deduce where we are
  if (editingUserId === null) {
    // here no update its create state so do the old
    users.push({
      id: crypto.randomUUID(),
      firstName: firstNameValue,
      lastName: lastNameValue,
      gender: Gender.value,
    });
  } else {
    // here its an update and we know the id so lets find user and update
    const user = users.find(function (user) {
      return user.id === editingUserId;
    });

    user.firstName = firstNameValue;
    user.lastName = lastNameValue;
    user.gender = Gender.value;
  }

  saveUsers();
  startTimer();
  displayUsers();
  // reset the resources
  editingUserId = null;
  saveBtn.textContent = "Save";
  form.reset();
  saveBtn.disabled = true;
});
searchInput.addEventListener("input", function () {
  displayUsers();
});
function checkifFormisValidToSubmit() {
  if (firstName.value !== "" && lastName.value !== "" && Gender.value !== "") {
    saveBtn.disabled = false;
  } else {
    saveBtn.disabled = true;
  }
}
firstName.addEventListener("input", checkifFormisValidToSubmit);
lastName.addEventListener("input", checkifFormisValidToSubmit);
Gender.addEventListener("change", checkifFormisValidToSubmit);

// first action delte useer
function deleteUser(id) {
  users = users.filter(function (user) {
    return user.id !== id;
  });

  saveUsers();
  startTimer();
  displayUsers();
}
// now to display the users
function displayUsers() {
  userTable.innerHTML = "";
  // lets explain how work this part
  // 1- if we enter nothing so "" include in all so display the all
  // 2- if emter any keyword in the first/last name its appear directly
  const searchValue = searchInput.value.toLowerCase().trim();
  const filteredUsers = users.filter(function (user) {
    return (
      user.firstName.toLowerCase().includes(searchValue) ||
      user.lastName.toLowerCase().includes(searchValue)
    );
  });

  filteredUsers.forEach(function (user) {
    userTable.innerHTML += `
      <tr>
        <td>${user.id}</td>
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.gender}</td>
        <td>
          <button onclick="editUser('${user.id}')">
            Edit
          </button>

          <button onclick="deleteUser('${user.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

function startTimer() {
  clearInterval(timer);

  timeLeft = 60;
  timerElement.textContent = timeLeft;

  timer = setInterval(function () {
    timeLeft--;

    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);

      users = [];

      localStorage.removeItem("users");

      displayUsers();

      timerElement.textContent = 0;
    }
  }, 1000);
}

startTimer();
function editUser(id) {
  const user = users.find(function (user) {
    return user.id === id;
  });
  if (!user) {
    return;
  }
  firstName.value = user.firstName;
  lastName.value = user.lastName;
  Gender.value = user.gender;
  // remember who edit
  editingUserId = id;
  saveBtn.textContent = "Update";
  saveBtn.disabled = false;
}
function sortUsers(column) {
  if (sortColumn === column) {
    // same field ? just reverse
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortColumn = column;
    sortDirection = "asc";
  }
  //  compare 2 object in the array (base on column choose )
  // if -1 mean x before y if 1 the reverse if 0 so no change
  // and change based on the number
  users.sort(function (a, b) {
    let valueA = a[column];
    let valueB = b[column];

    valueA = String(valueA).toLowerCase();
    valueB = String(valueB).toLowerCase();

    if (valueA < valueB) {
      return sortDirection === "asc" ? -1 : 1;
    }

    if (valueA > valueB) {
      return sortDirection === "asc" ? 1 : -1;
    }

    return 0;
  });

  updateSortArrows();
  displayUsers();
}
function updateSortArrows() {
  document.getElementById("idArrow").textContent = "↕";
  document.getElementById("firstNameArrow").textContent = "↕";
  document.getElementById("lastNameArrow").textContent = "↕";

  if (sortColumn === "id") {
    document.getElementById("idArrow").textContent =
      sortDirection === "asc" ? "↑" : "↓";
  }

  if (sortColumn === "firstName") {
    document.getElementById("firstNameArrow").textContent =
      sortDirection === "asc" ? "↑" : "↓";
  }

  if (sortColumn === "lastName") {
    document.getElementById("lastNameArrow").textContent =
      sortDirection === "asc" ? "↑" : "↓";
  }
}
function ClearAll() {
  // 1- clear the array
  users = [];
  // 2- update local storage

  saveUsers();

  // 1- update the ui and timer
  clearInterval(timer);
  startTimer();
  form.reset();
  displayUsers();
}
