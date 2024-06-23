document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const apiUrl = 'http://localhost:8080/api/tasks'; 

    let tasks = []; 

    function renderTasks() {
        taskList.innerHTML = '';

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = `${task.title} - ${task.description}`;
            li.className = task.status.toLowerCase(); 

            // Toggle status on click
            li.addEventListener('click', function() {
                toggleStatus(index, task.id, task.status);
            });

            // Delete task on right-click
            li.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                deleteTask(index, task.id);
            });

            taskList.appendChild(li);
        });
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
