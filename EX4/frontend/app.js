document.addEventListener("DOMContentLoaded", function () {
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const searchInput = document.getElementById("searchInput");
  const apiUrl = "http://localhost:8080/api/tasks";
  const tasksPerPage = 5;

  let currentPage = 1;
  let tasks = [];
  let editIndex = null;
  let searchTerm = "";

  function renderTaskList(filteredTasks) {
    taskList.innerHTML = "";

    let startIndex;
    let endIndex;
    let tasksToDisplay;

    if (searchTerm.length === 0) {
      startIndex = (currentPage - 1) * tasksPerPage;
      endIndex = startIndex + tasksPerPage;
      tasksToDisplay = (filteredTasks || tasks).slice(startIndex, endIndex);
    } else {
      tasksToDisplay = filteredTasks;
    }

    tasksToDisplay.forEach((task, index) => {
      const li = document.createElement("li");
      const formattedDate = new Date(task.createdAt).toLocaleDateString();
      li.innerHTML = `
                      <div>
                          <strong>${task.title}</strong> - ${task.description}
                          <div>
                              <small>Created on: ${formattedDate}</small>
                          </div>
                          <div>
                              <small>Status: ${task.status}</small>
                          </div>
                      </div>
                  `;
      li.className = task.status.toLowerCase();

      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      if (task.status === "PENDING") {
        const startButton = document.createElement("button");
        startButton.textContent = "Start Task";
        startButton.className = "start-button";
        startButton.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleStatus(index, task.id, "PENDING");
        });
        buttonContainer.appendChild(startButton);

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";
        editButton.addEventListener("click", (e) => {
          e.stopPropagation();
          startEditTask(index, task);
        });
        buttonContainer.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteTask(index, task.id);
        });
        buttonContainer.appendChild(deleteButton);
      }

      if (task.status === "IN_PROGRESS") {
        const completeCheckbox = document.createElement("input");
        completeCheckbox.type = "checkbox";
        completeCheckbox.className = "complete-checkbox";
        completeCheckbox.addEventListener("change", (e) => {
          e.stopPropagation();
          toggleStatus(index, task.id, "IN_PROGRESS");
        });
        buttonContainer.appendChild(completeCheckbox);
      }

      li.appendChild(buttonContainer);
      taskList.appendChild(li);
    });

    if (searchTerm.length === 0) {
      renderPaginationControls();
    }
  }

  function renderPaginationControls() {
    const totalPages = Math.ceil(tasks.length / tasksPerPage);

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "pagination";

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.className = (i === currentPage ? "pageButtonActive" : "pageButton");
      button.addEventListener("click", () => {
        currentPage = i;
        renderTaskList();
      });
      paginationContainer.appendChild(button);
    }

    taskList.appendChild(paginationContainer);
  }

  function filterTasks(searchTerm) {
    return tasks.filter((task) => {
      const titleMatches = task.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const descriptionMatches = task.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return titleMatches || descriptionMatches;
    });
  }

  function filterByStatus(status) {
    return tasks.filter((task) => task.status === status);
  }

  function filterByPeriod(startDate, endDate) {
    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }

  function handleSearchInput() {
    searchTerm = searchInput.value.trim();

    if (searchTerm.length === 0) {
      renderTaskList();
    } else {
      const filteredTasks = filterTasks(searchTerm);
      renderTaskList(filteredTasks);
    }
  }

  searchInput.addEventListener("input", handleSearchInput);

  function startEditTask(index, task) {
    editIndex = index;

    const li = taskList.children[index];

    li.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });

    li.innerHTML = `
            <input type="text" id="editTitle" value="${task.title}">
            <input type="text" id="editDescription" value="${task.description}">
            <div class="button-container">
                <button id="cancelEdit" class="cancel-edit-button">Cancel</button>
                <button id="confirmEdit" class="confirm-edit-button">Confirm</button>
            </div>
        `;

    document.getElementById("confirmEdit").addEventListener("click", () => {
      confirmEditTask(index, task.id);
    });

    document.getElementById("cancelEdit").addEventListener("click", () => {
      cancelEditTask();
    });
  }


  function cancelEditTask() {
    editIndex = null;
    if (searchTerm.length === 0) {
      renderTaskList();
    } else {
      const filteredTasks = filterTasks(searchTerm);
      renderTaskList(filteredTasks);
    }
  }

  function confirmEditTask(index, taskId) {
    const title = document.getElementById("editTitle").value;
    const description = document.getElementById("editDescription").value;

    const updatedTask = {
      title: title,
      description: description,
      status: tasks[index].status,
    };

    fetch(`${apiUrl}/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Tasks can only be updated if they're in a pending status."
          );
        }
        return response.json();
      })
      .then((data) => {
        tasks[index] = { ...tasks[index], title, description }; 
        if (searchTerm.length === 0) {
          renderTaskList();
        } else {
          const filteredTasks = filterTasks(searchTerm);
          renderTaskList(filteredTasks);
        }
      })
      .catch((error) => displayError(error.message));
  }

  function toggleStatus(index, taskId, currentStatus) {
    if (editIndex !== null) return;

    let newStatus;
    if (currentStatus === "PENDING") {
      newStatus = "IN_PROGRESS";
    } else if (currentStatus === "IN_PROGRESS") {
      newStatus = "COMPLETED";
    } else {
      newStatus = "PENDING";
    }

    const updatedTask = {
      title: tasks[index].title,
      description: tasks[index].description,
      status: newStatus,
    };

    fetch(`${apiUrl}/${taskId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Task status failed to be updated.");
        }
        return response.json();
      })
      .then((data) => {
        tasks[index].status = newStatus; 
        if (searchTerm.length === 0) {
          renderTaskList();
        } else {
          const filteredTasks = filterTasks(searchTerm);
          renderTaskList(filteredTasks);
        }
      })
      .catch((error) => displayError(error.message));
  }

  function updateTasks() {
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return response.json();
      })
      .then((data) => {
        tasks = data;
        if (editIndex !== null) {
          startEditTask(editIndex, tasks[editIndex]);
        } else {
          if (searchTerm.length === 0) {
            renderTaskList();
          } else {
            const filteredTasks = filterTasks(searchTerm);
            renderTaskList(filteredTasks);
          }
        }
      })
      .catch((error) => displayError("Error fetching tasks: " + error.message));
  }

  function fetchTasks() {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        tasks = data;
        renderTaskList();
      })
      .catch((error) => displayError("Error fetching tasks: " + error.message));
  }

  function deleteTask(index, taskId) {
    fetch(`${apiUrl}/${taskId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Tasks can't be deleted unless they're pending and older than 5 days."
          );
        }
        tasks.splice(index, 1);
        if (searchTerm.length === 0) {
          renderTaskList();
        } else {
          const filteredTasks = filterTasks(searchTerm);
          renderTaskList(filteredTasks);
        }
      })
      .catch((error) => displayError(error.message));
  }

  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    const newTask = {
      title: title,
      description: description,
      status: "PENDING",
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Tasks can only be created during weekdays.");
        }
        return response.json();
      })
      .then((data) => {
        tasks.unshift(data);
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        if (searchTerm.length === 0) {
          renderTaskList();
        } else {
          const filteredTasks = filterTasks(searchTerm);
          renderTaskList(filteredTasks);
        }
      })
      .catch((error) => displayError(error.message));
  });

  function displayError(message) {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
  }

  fetchTasks();
});
