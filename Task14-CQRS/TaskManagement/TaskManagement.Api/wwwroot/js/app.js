
const API_URL = "/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const filterSelect = document.getElementById("filter");
const messageBox = document.getElementById("message");
const createButton = document.getElementById("createButton");

let allTasks = [];

function showError(message) {
    messageBox.textContent = message;
    messageBox.hidden = false;
}

function clearError() {
    messageBox.textContent = "";
    messageBox.hidden = true;
}

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        let message = `Request failed (${response.status})`;

        try {
            const data = await response.json();
            message = data.message || data.title || message;
        } catch {
            // Response may not contain JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function loadTasks() {
    clearError();

    try {
        // Get all tasks so statistics remain global.
        allTasks = await request(API_URL);
        renderTasks();
    } catch (error) {
        showError(error.message);
    }
}

function renderTasks() {
    const filter = filterSelect.value;

    const visibleTasks = allTasks.filter(task => {
        if (filter === "all") return true;
        return task.isCompleted === (filter === "true");
    });

    const completed = allTasks.filter(t => t.isCompleted).length;

    document.getElementById("totalTasks").textContent =
        allTasks.length;

    document.getElementById("pendingTasks").textContent =
        allTasks.length - completed;

    document.getElementById("completedTasks").textContent =
        completed;

    taskList.replaceChildren();

    if (visibleTasks.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "No tasks found.";
        taskList.appendChild(empty);
        return;
    }

    visibleTasks.forEach(task => {
        const row = document.createElement("div");
        row.className = `task ${task.isCompleted ? "task-done" : ""}`;

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("h4");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent = task.description || "";

        const date = document.createElement("small");
        date.textContent = new Date(task.createdAt).toLocaleString();

        info.append(title, description, date);

        if (task.isCompleted) {
            const badge = document.createElement("span");
            badge.className = "done-badge";
            badge.textContent = "Completed";
            row.append(info, badge);
        } else {
            const button = document.createElement("button");
            button.className = "complete-btn";
            button.textContent = "Complete";

            button.addEventListener("click", async () => {
                button.disabled = true;
                clearError();

                try {
                    await request(`${API_URL}/${task.id}/complete`, {
                        method: "PUT"
                    });

                    await loadTasks();
                } catch (error) {
                    showError(error.message);
                    button.disabled = false;
                }
            });

            row.append(info, button);
        }

        taskList.appendChild(row);
    });
}

taskForm.addEventListener("submit", async event => {
    event.preventDefault();
    clearError();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    createButton.disabled = true;

    try {
        await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, description })
        });

        taskForm.reset();
        await loadTasks();
    } catch (error) {
        showError(error.message);
    } finally {
        createButton.disabled = false;
    }
});

filterSelect.addEventListener("change", renderTasks);

document.getElementById("refreshButton")
    .addEventListener("click", loadTasks);

loadTasks();
