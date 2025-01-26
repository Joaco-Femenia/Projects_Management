// Functions for the progress bar of one or multiple projects

/**
 * Updates the progress of a specific project.
 * @param {number} projectId - The ID of the project to update.
 */
async function updateProgress(projectId){
    try{
        const response = await fetch('/project/'+projectId+'/progress/');

        const result = await response.json();
        if(response.ok){
            const progress = result.hasNoTasks ? 'noTasks' : result.progress;
            updateProgressBar(progress, projectId, false);
        }else{
            throw new Error(result.error);
        }
    }
    catch(error){
        console.log(error);
        alert('There was an error obtaining the project progress.')
    }
}

/**
 * Updates the progress of all projects.
 */
async function updateAllProgresses(){
    try{
        const response = await fetch('/projects/progresses/');

        const result = await response.json();
        if(response.ok){
            for(const project of result.progresses){
                const progress = project.hasNoTasks ? 'noTasks' : project.progress;
                updateProgressBar(progress, project.id, true);
            }
        }else{
            throw new Error(result.error);
        }
    }
    catch(error){
        console.log(error);
        alert('There was an error obtaining the projects progress.')
    }
}

/**
 * Updates the progress bar in the DOM.
 * @param {string|number} progress - The progress value or 'noTasks' if there are no tasks.
 * @param {number} project_id - The ID of the project.
 * @param {boolean} compact - Indicates if the progress bar is compact (for the all projects page) or not (for the individual project page).
 */
function updateProgressBar(progress, project_id, compact){
    // compact is a boolean indicating if the progress bar is compact or not, i.e., if it is for the all projects page or the individual project page
    const parentElement = document.querySelector(`[data-projectid="${project_id}"]`);
    const progressBar = parentElement.querySelector('.progress-bar');
    let progressNumber = parentElement.querySelector('.progress-number');
    
    if (!compact) {
        // In non-compact mode, make progressNumber point to progressBar,
        // since in this case both show the same information.
        progressNumber = progressBar;
    }    
    // Remove any color classes the progress bar might have
    progressBar.classList.remove('bg-danger', 'bg-success', 'bg-info');

    // When it was or will be at 0% or No tasks, we don't want the animation to be visible
    if(progressBar.textContent === '0%' || progressBar.textContent === 'No tasks' || progress === 'noTasks' || progress === 0){
        progressBar.style.transition = 'none';
    }

    if(progress === 'noTasks'){
        progressBar.style.width = '100%';
        progressNumber.textContent = 'Sin tareas';
        progressBar.classList.add('bg-danger');
    }
    else if(progress === 0){
        progressBar.style.width = '100%'
        progressBar.style.backgroundColor = '#C7CACC';
        progressNumber.textContent = '0%';
    }
    else if(progress === 100){
        progressBar.style.width = '100%'
        progressNumber.textContent = '100%';
        progressBar.classList.add('bg-success');
        progressBar.style.transition = 'width 1s ease';
    }
    else{
        progressBar.style.width = progress + '%';
        progressNumber.textContent = progress + '%';
        progressBar.classList.add('bg-info');
        progressBar.style.transition = 'width 1s ease';
    }
}