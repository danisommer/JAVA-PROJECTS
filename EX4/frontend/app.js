document.getElementById('taskForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, creationDate: new Date().toISOString().split('T')[0] })
    })
    .then(response => response.json())
    .then(task => {
        addTaskToList(task);
    });
});

function addTaskToList(task) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.textContent = `${task.title}: ${task.description}`;
    taskList.appendChild(li);
}
