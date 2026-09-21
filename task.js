let timer;
let timeLeft;
const savedUsers = localStorage.getItem("users");
let users = [];
const form = document.getElementById("MyForm");
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const Gender = document.getElementById("selectedGender");
const saveBtn = document.getElementById("saveBtn");
const userTable = document.getElementById("userTable");
const timerElement = document.getElementById("timer");
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
  users.push({
    id: crypto.randomUUID(),
    firstName: firstName.value,
    lastName: lastName.value,
    gender: Gender.value,
  });
  saveUsers();
  startTimer();
  displayUsers();
  // to clear form for reusable the form
  form.reset();
  // disable save-btn  again
  saveBtn.disabled = true;
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

  users.forEach(function (user, index) {
    console.log(user);
    userTable.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.gender}</td>
                <td>
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
