// Global variables
const task_container = document.getElementById('task_container');
const form_container = document.getElementById('form_container');
const projectName = document.getElementById('project-name');
const projectDescription = document.getElementById('project-description');
const projectPriority = document.getElementById('project-priority');
const project_id = document.getElementById('main_container').dataset.projectid; 

document.addEventListener('DOMContentLoaded', function(){
    form_container.style.display = 'none';
    updateProgress(project_id);
});

/**
 * Function to enable editing of a project
 * @param {string} projectId - The ID of the project to edit
 */
function editProject(projectId){
    // Add save button
    if (document.querySelector('section').querySelector('.bi-floppy')) return;
    save_btn = document.createElement('i');
    save_btn.classList.add('bi', 'bi-floppy', 'btn');
    save_btn.onclick = () => saveProject_changes(projectId);

    // Add save button before the h2 element
    const divParent = document.querySelector('section');
    const before = divParent.querySelector('h2');
    divParent.insertBefore(save_btn, before);

    // Convert elements to inputs
    projectName.innerHTML = `<input type="text" id="input-PN-${projectId}" value="${projectName.innerText}" />`;

    const priorityText = projectPriority.innerText.trim().split('d ')[1];
    projectPriority.innerHTML = `<select name="priority" id="id_priority">
        <option value="Low" ${priorityText === 'Baja' ? 'selected' : ''}>Baja</option>
        <option value="Medium" ${priorityText === 'Media' ? 'selected' : ''}>Media</option>
        <option value="High" ${priorityText === 'Alta' ? 'selected' : ''}>Alta</option>
    </select>`;
    
    projectDescription.innerHTML = projectDescription.innerHTML.replace('<strong>Descripción: </strong>', '');
    const descriptionText = projectDescription.innerText.trim();
    projectDescription.innerHTML = `<textarea cols="50" rows="3" required="" id="input-PD-${projectId}">${descriptionText}</textarea>`;
}

/**
 * Function to save changes made to a project
 * @param {string} projectId - The ID of the project to save changes for
 */
async function saveProject_changes(projectId) {
    const newName = document.getElementById('input-PN-' + projectId).value;
    const newDescription = document.getElementById('input-PD-' + projectId).value;
    const newPriority = document.getElementById('id_priority').value;
    try {
        const response = await fetch('/edit-project/' + projectId + '/', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ name: newName, description: newDescription, priority: newPriority })
        });

        const result = await response.json();
        if (response.ok){
            // Update the DOM
            projectName.innerHTML = `<h1 id="project-name">${newName}</h1>`;
            projectDescription.innerHTML = `<p id="project-description"><strong>Descripción: </strong>${newDescription}</p>`;
            if (newPriority == 'Low') {
                projectPriority.innerHTML = `<p id="project-priority">🟢Prioridad Baja</p>`;
            } else if (newPriority == 'Medium') {
                projectPriority.innerHTML = `<p id="project-priority">🟡Prioridad Media</p>`;
            } else {
                projectPriority.innerHTML = `<p id="project-priority">🔴Prioridad Alta</p>`;
            }

            // Remove save button
            const save_btn = document.querySelector('section').querySelector('.bi-floppy');
            save_btn.disabled = true;
            if (save_btn) save_btn.remove();
        } else {
            // Show server errors
            if (result.error) {
                console.log(result.error);
                const errorMessages = Object.values(result.error).join('<br>');
                showAlert(errorMessages);
            } else {
                throw new Error('Unexpected error in server response');
            }
        }
    } catch (error) {
        console.error(error);
    }
}

/**
 * Function to delete a task
 * @param {string} taskId - The ID of the task to delete
 */
async function deleteTask(taskId){
    try{ 
        const response = await fetch('/delete-task/'+taskId+'/',{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        const result = await response.json();
        if(response.ok){
            // Update the DOM
            updateProgress(project_id);
            const task = document.getElementById('task_'+taskId);
            task.remove();
        } else {
            if(result.error){
                console.log(result.error);
                const errorMessages = Object.values(result.error).join('<br>');
                showAlert(errorMessages);
            } else {
                throw new Error('Unexpected error in server response');
            }
        }
    } catch(error){
        console.error(error);
    }
}

/**
 * Function to update the status of a task
 * @param {string} taskId - The ID of the task to update
 * @param {boolean} isCompleted - The new completion status of the task
 */
async function updateTaskStatus(taskId, isCompleted){
    try{
        const response = await fetch('/change-task-status/'+taskId+'/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ completed: isCompleted }),
        });

        const result = await response.json();
        console.log('Task updated:', result);
        if (response.ok){
            // Update the DOM 
            updateProgress(project_id);
            const checkbox_container = document.getElementById(`task_checkbox_${taskId}`);
            if (checkbox_container) {
                const icon = checkbox_container.querySelector('i'); // Find the <i> element inside the container
                if (icon) {
                    if (result.completed) {
                        icon.classList.remove('bi-circle');
                        icon.classList.add('bi-check-circle');
                    } else {
                        icon.classList.remove('bi-check-circle');
                        icon.classList.add('bi-circle');
                    }
                }
            }
        } else {
            if (result.error) {
                console.log(result.error);
                const errorMessages = Object.values(result.error).join('<br>');
                showAlert(errorMessages);
            } else {
                throw new Error('Unexpected error in server response');
            }
        }

    } catch(error){
        console.error(error);
    }
}

/**
 * Helper function to get the parent element of a task
 * @param {string} taskId - The ID of the task
 * @returns {HTMLElement} - The parent element of the task
 */
function getTaskParent(taskId){
    return document.getElementById('task_'+taskId);
}

/**
 * Helper function to get the save button of a task
 * @param {string} taskId - The ID of the task
 * @returns {HTMLElement} - The save button element of the task
 */
function getSaveButton(taskId){
    return getTaskParent(taskId).querySelector('.bi-floppy');
}

/**
 * Function to enable editing of a task
 * @param {string} taskId - The ID of the task to edit
 */
function editTask(taskId){
    const task_parent = getTaskParent(taskId);
    let save_btn = getSaveButton(taskId);

    if (!save_btn) {
        // Add save button
        save_btn = document.createElement('i');
        save_btn.classList.add('bi', 'bi-floppy', 'btn');
        save_btn.onclick = () => saveTask_changes(taskId);

        // Add save button before the dropdown
        const dropdown = task_parent.querySelector('.dropdown');
        task_parent.insertBefore(save_btn, dropdown);
    }

    // Convert the title to an input   
    const task_title = document.getElementById("task_title_" + taskId);
    task_title.innerHTML = `<input type="text" id="edit-task-input-${taskId}" value="${task_title.innerText}" />`;
}

/**
 * Function to save changes made to a task
 * @param {string} taskId - The ID of the task to save changes for
 */
async function saveTask_changes(taskId){
    const inputElement = document.getElementById('edit-task-input-'+taskId);
    const newTitle = inputElement.value;

    try{
        const response = await fetch('/edit-task/'+taskId+'/', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ title: newTitle }),
        });

        const result = await response.json();
        if(response.ok){
            // Update the DOM
            const task_title = document.getElementById("task_title_" + taskId);
            task_title.innerHTML = `<p id="task_title_${taskId}"><strong>${newTitle}</strong></p>`;

            const save_btn = getSaveButton(taskId);
            save_btn.disabled = true;
            if (save_btn) save_btn.remove();
        } else {
            if(result.error){
                console.log(result.error);
                const errorMessages = Object.values(result.error).join('<br>');
                showAlert(errorMessages);
            } else {
                throw new Error('Unexpected error in server response');
            }
        }
    } catch(error){
        console.error(error);
    }
}

/**
 * Function to show or hide the new task form
 */
function showHideForm(){
    if (form_container.style.display === 'none'){
        document.getElementById('btn-show-hide').innerText = 'Cancelar';
        form_container.style.display = 'block';
    } else {
        form_container.style.display = 'none';
        document.getElementById('btn-show-hide').innerText = 'Agregar tarea';
    }
}

// Add task
document.getElementById('add-task-form').addEventListener('submit', async (event) =>  {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    try{
        const response = await fetch(form.action,{
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        const result = await response.json();
        document.getElementById('response-message').textContent = result.message; // Show the message

        if(response.ok){
            // Add the task to the DOM
            const newTask = document.createElement('div');
            newTask.classList.add('task');
            newTask.id = `task_${result.task.id}`;
            newTask.innerHTML = `
                <p><strong>${result.task.title}</strong></p>
                <div class="task_checkbox" id="task_checkbox_${result.task.id}" onclick="updateTaskStatus('${result.task.id}', '${result.task.completed}')">
                    <i class="bi bi-circle"></i>
                </div>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li onclick="deleteTask('${result.task.id}')">
                            <a title="Eliminar tarea" class="dropdown-item w-auto" href="javascript:void(0);">
                                <i class="bi bi-trash"></i>
                            </a>
                        </li>
                        <li onclick="editTask('${result.task.id}')">
                            <a title="Editar tarea" class="dropdown-item w-auto" href="javascript:void(0);">
                                <i class="bi bi-pencil"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            `;
            task_container.appendChild(newTask);
            form.reset();
            updateProgress(project_id);
        } else {
            if(result.error){
                console.log(result.error);
                const errorMessages = Object.values(result.error).join('<br>');
                showAlert(errorMessages);
            } else {
                throw new Error('Unexpected error in server response');
            }
        }
    } catch(error){
        console.error(error);
        document.getElementById('response-message').textContent = 'There was an error adding the task.';
    }
});