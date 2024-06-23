document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const searchInput = document.getElementById('searchInput');
    const apiUrl = 'http://localhost:8080/api/tasks'; 

    let tasks = []; 
    let editIndex = null;

    const renderTasks = () => {
        taskList.innerHTML = '';

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = `${task.title} - ${task.description}`;
            li.className = task.status.toLowerCase();

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(index, task.id);
            });

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-button';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                startEditTask(index, task);
            });

            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            li.appendChild(buttonContainer);

            taskList.appendChild(li);
        });
    };

    function filterTasks(searchTerm) {
        const filteredTasks = tasks.filter(task => {
            const titleMatches = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            const descriptionMatches = task.description.toLowerCase().includes(searchTerm.toLowerCase());
            return titleMatches || descriptionMatches;
        });
        return filteredTasks;
    }

    function updateTaskList(filteredTasks) {
        taskList.innerHTML = '';

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = `${task.title} - ${task.description}`;
            li.className = task.status.toLowerCase();

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(tasks.findIndex(t => t.id === task.id), task.id);
            });

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-button';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                startEditTask(tasks.findIndex(t => t.id === task.id), task);
            });

            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            li.appendChild(buttonContainer);

            taskList.appendChild(li);
        });
    }

    function handleSearchInput() {
        const searchTerm = searchInput.value.trim();

        if (searchTerm.length === 0) {
            renderTasks();
        } else {
            const filteredTasks = filterTasks(searchTerm);
            updateTaskList(filteredTasks);
        }
    }

    searchInput.addEventListener('input', handleSearchInput);

    
    function startEditTask(index, task) {
        editIndex = index;
    
        const li = taskList.children[index];
        li.innerHTML = `
            <input type="text" id="editTitle" value="${task.title}">
            <input type="text" id="editDescription" value="${task.description}">
            <div class="button-container">
                <button id="cancelEdit" class="cancel-edit-button">Cancel</button>
                <button id="confirmEdit" class="confirm-edit-button">Confirm</button>
            </div>
        `;
    
        document.getElementById('confirmEdit').addEventListener('click', () => {
            confirmEditTask(index, task.id);
        });
    
        document.getElementById('cancelEdit').addEventListener('click', () => {
            cancelEditTask();
        });
    }
    

    function confirmEditTask(index, taskId) {
        const title = document.getElementById('editTitle').value;
        const description = document.getElementById('editDescription').value;

        const updatedTask = {
            title: title,
            description: description,
            status: tasks[index].status
        };

        fetch(`${apiUrl}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            return response.json();
        })
        .then(data => {
            tasks[index] = data;
            editIndex = null;
            renderTasks();
        })
        .catch(error => console.error('Error updating task:', error));
    }

    function cancelEditTask() {
        editIndex = null;
        renderTasks();
    }

    function fetchTasks() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                tasks = data;
                renderTasks();
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function toggleStatus(index, taskId, currentStatus) {
        if (editIndex !== null) return;

        let newStatus;
        if (currentStatus === 'PENDING') {
            newStatus = 'IN_PROGRESS';
        } else if (currentStatus === 'IN_PROGRESS') {
            newStatus = 'COMPLETED';
        } else {
            newStatus = 'PENDING';
        }

        const updatedTask = {
            title: tasks[index].title,
            description: tasks[index].description,
            status: newStatus
        };

        fetch(`${apiUrl}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            return response.json();
        })
        .then(data => {
            tasks[index] = data;
            renderTasks();
        })
        .catch(error => console.error('Error updating task:', error));
    }

    function deleteTask(index, taskId) {
        fetch(`${apiUrl}/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            tasks.splice(index, 1);
            renderTasks();
        })
        .catch(error => console.error('Error deleting task:', error));
    }

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

        const newTask = {
            title: title,
            description: description,
            status: 'PENDING'
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create task');
            }
            return response.json();
        })
        .then(data => {
            tasks.push(data); 
            document.getElementById('title').value = '';
            document.getElementById('description').value = '';
            renderTasks();
        })
        .catch(error => console.error('Error creating task:', error));
    });

    fetchTasks();
});
