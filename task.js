// variabls
let timer;
let timeLeft;
// what mean ? when click edit the editingUserId contain the id 1234-asncds...
let editingUserId = null;
// remember last for reverse and know what the direction of sorting
let sortColumn = null;
let sortDirection = "asc";
const savedUsers = localStorage.getItem("users");
let users = [];
let selectedGenderFilter = "all"; // by default search using all genders
// get byy id
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
const countUser = document.getElementById("countUser");
const duplicateError = document.getElementById("duplicateError");
const genderStatus = document.getElementById("genderStatus");
const genderError = document.getElementById("genderError");
const formError = document.getElementById("formError");
// we do this because after error we change so must delete the old error
firstName.addEventListener("input", function () {
  duplicateError.textContent = "";
});
lastName.addEventListener("input", function () {
  duplicateError.textContent = "";
});
function isDuplicateUser(firstName, lastName) {
  return users.some(function (user) {
    return (
      user.firstName.toLowerCase() === firstName.toLowerCase() &&
      user.lastName.toLowerCase() === lastName.toLowerCase()
    );
  });
}
function updateUserCount() {
  countUser.textContent = `Total Users: ${users.length}`;
}
if (savedUsers) {
  users = JSON.parse(savedUsers);
  updateUserCount();
  displayUsers();
} else {
  updateUserCount();
}
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

// form validation
function validateForm() {
  let isValid = true;

  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();

  // First name

  if (firstNameValue === "") {
    firstNameError.textContent = "First name is required";

    isValid = false;
  } else if (firstNameValue.length < 2) {
    firstNameError.textContent = "Minimum 2 characters are required";

    isValid = false;
  } else if (/\d/.test(firstNameValue)) {
    firstNameError.textContent = "Name cannot contain numbers";

    isValid = false;
  } else {
    firstNameError.textContent = "";
  }

  // Last name

  if (lastNameValue === "") {
    lastNameError.textContent = "Last name is required";

    isValid = false;
  } else if (lastNameValue.length < 2) {
    lastNameError.textContent = "Minimum 2 characters are required";

    isValid = false;
  } else if (/\d/.test(lastNameValue)) {
    lastNameError.textContent = "Name cannot contain numbers";

    isValid = false;
  } else {
    lastNameError.textContent = "";
  }

  // Gender

  if (Gender.value === "") {
    genderError.textContent = "Please select a gender";

    isValid = false;
  } else {
    genderError.textContent = "";
  }

  if (isValid) {
    saveBtn.disabled = false;
    formError.textContent = "";
  } else {
    saveBtn.disabled = true;
    formError.textContent =
      "The user cannot be saved until all fields are valid.";
  }

  return isValid;
}
// === form validation ===

form.addEventListener("submit", function (event) {
  // for no refresh un page
  event.preventDefault();
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();
  if (!validateForm()) {
    return;
  }
  console.log("hi");
  // now push dosent work like the old since we have 2 state update and create so based on the id
  // remembeerd we can deduce where we are
  if (editingUserId === null) {
    // check duplicate
    if (isDuplicateUser(firstNameValue, lastNameValue)) {
      duplicateError.textContent = "This user already exists";
      return;
    }

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
  // 3- make the logic of gender by match genders
  const searchValue = searchInput.value.toLowerCase().trim();
  const filteredUsers = users.filter(function (user) {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchValue) ||
      user.lastName.toLowerCase().includes(searchValue);
    const matchesGender =
      selectedGenderFilter === "all" ||
      user.gender.toLowerCase() === selectedGenderFilter;

    return matchesSearch && matchesGender;
  });
  // 2- Apply sorting only on displayed users
  if (sortColumn !== null) {
    filteredUsers.sort(function (a, b) {
      let valueA = a[sortColumn].toLowerCase();
      let valueB = b[sortColumn].toLowerCase();

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });
  }

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
  updateUserCount();
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
function filterByGender(gender) {
  document.getElementById("allBtn").classList.remove("active");
  document.getElementById("maleBtn").classList.remove("active");
  document.getElementById("femaleBtn").classList.remove("active");

  if (gender === "all") {
    document.getElementById("allBtn").classList.add("active");
  }

  if (gender === "male") {
    document.getElementById("maleBtn").classList.add("active");
  }

  if (gender === "female") {
    document.getElementById("femaleBtn").classList.add("active");
  }
  selectedGenderFilter = gender.toLowerCase();
  genderStatus.textContent = `Showing : ${gender}`;
  displayUsers();
}
