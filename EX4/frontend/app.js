/*============================================================================*/
/* Task Management System                                                     */
/*----------------------------------------------------------------------------*/
/* Author: Daniel Zaki Sommer                                                 */
/* Github: https://github.com/danisommer                                      */
/* Telephone: +55 (41) 99708-5707                                             */
/* Email: danielsommer@alunos.utfpr.edu.br                                    */
/* LinkedIn: www.linkedin.com/in/danisommer                                   */
/*============================================================================*/
/*  This program manages tasks, allowing filtering by status, date range, and */
/* search term.                                                               */
/*============================================================================*/


document.addEventListener("DOMContentLoaded", function () {
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const searchInput = document.getElementById("searchInput");
  const pageSelector = document.getElementById("pageSelector");

  const filterStatus = document.getElementById("statusFilter");
  const filterStartDate = document.getElementById("startDate");
  const filterEndDate = document.getElementById("endDate");
  const filterApply = document.getElementById("applyFilter");

  const apiUrl = "http://localhost:8080/api/tasks";
  const tasksPerPage = 5;
  const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };

  document.getElementById('filterButton').addEventListener('click', function() {
    var filterOptions = document.getElementById('filterOptions');
    if (filterOptions.style.display === 'none' || filterOptions.style.display === '') {
        filterOptions.style.display = 'block';
    } else {
        filterOptions.style.display = 'none';
    }
  });

  let currentPage = 1;
  let tasks = [];
  let editIndex = null;
  let searchTerm = "";
  let filterApplied = false;


  function renderTaskList(filteredTasks) {
    taskList.innerHTML = "";
    pageSelector.innerHTML = "";
    displayError();
    
    let startIndex = (currentPage - 1) * tasksPerPage;
    let tasksToDisplay = [];
  
    if (searchTerm.length === 0 && !filterApplied) {
      let endIndex = startIndex + tasksPerPage;
      tasksToDisplay = tasks.slice(startIndex, endIndex);
      renderPaginationControls();
    } else {
      tasksToDisplay = filteredTasks;
    }
  
    tasksToDisplay.forEach((task, localIndex) => {
      const globalIndex = searchTerm.length === 0 ? startIndex + localIndex : tasks.indexOf(task);
  
      const li = document.createElement("li");
      const formattedDate = new Date(task.createdAt).toLocaleDateString(undefined, dateOptions);;
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
          toggleStatus(globalIndex, task.id, "PENDING");
        });
        buttonContainer.appendChild(startButton);
  
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";
        editButton.addEventListener("click", (e) => {
          e.stopPropagation();
          startEditTask(globalIndex, task);
        });
        buttonContainer.appendChild(editButton);
  
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteTask(globalIndex, task.id);
        });
        buttonContainer.appendChild(deleteButton);
      }
  
      if (task.status === "IN_PROGRESS") {
        const completeCheckbox = document.createElement("input");
        completeCheckbox.type = "checkbox";
        completeCheckbox.className = "complete-checkbox";
        completeCheckbox.addEventListener("change", (e) => {
          e.stopPropagation();
          toggleStatus(globalIndex, task.id, "IN_PROGRESS");
        });
        buttonContainer.appendChild(completeCheckbox);
      }
  
      li.appendChild(buttonContainer);
      taskList.appendChild(li);
    });
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
    pageSelector.appendChild(paginationContainer);
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

  function filterByStatus(localTasks, status) {
    return localTasks.filter((task) => task.status === status);
  }

  function filterByPeriod(localTasks, startDate, endDate) {
    return localTasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return (!startDate || taskDate >= startDate) && (!endDate || taskDate <= endDate);
    });
  }

  function handleFilterOptions() {
    const status = filterStatus.value;
    const startDate = filterStartDate.value ? new Date(filterStartDate.value) : null;
    const endDate = filterEndDate.value ? new Date(filterEndDate.value) : null;
  
    let filteredTasks = tasks;
  
    if (status !== "ALL") {
      filteredTasks = filterByStatus(filteredTasks, status);
    }
  
    if (startDate && endDate) {
      filteredTasks = filterByPeriod(filteredTasks, startDate, endDate);
    } else {
      if (startDate) {
        filteredTasks = filterByPeriod(filteredTasks, startDate, null);
      }
  
      if (endDate) {
        filteredTasks = filterByPeriod(filteredTasks, null, endDate);
      }
    }
  
    renderTaskList(filteredTasks);
  }


  filterApply.addEventListener("click", function() {
    filterApplied = true;
    handleFilterOptions();
  });

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
  
    const globalIndex = index % tasksPerPage;
    const li = taskList.children[globalIndex];
  
    if (!li) {
      console.error("Element not found at the specified index");
      return;
    }
  
    const buttons = li.querySelectorAll("button");
    if (buttons.length === 0) {
      console.error("Buttons not found within the task element");
      return;
    }
  
    buttons.forEach((button) => {
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
        editIndex = null; 
        if (searchTerm.length === 0) {
          renderTaskList();
        } else {
          const filteredTasks = filterTasks(searchTerm);
          renderTaskList(filteredTasks);
        }
      })
      .catch((error) => displayError(error.message));
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
