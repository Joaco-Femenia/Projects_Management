/**
 * Elimina un proyecto dado su ID.
 *
 * @async
 * @function deleteProject
 * @param {number} projectId - El ID del proyecto a eliminar.
 * @throws {Error} Lanza un error si hay un problema al eliminar el proyecto.
 * @returns {Promise<void>} No retorna ningún valor.
 */
async function deleteProject(projectId){
    try{
        const response = await fetch('/projects/delete-project/'+projectId+'/', {
            method: 'POST',
            headers:{
                'content-type': 'application/json',
                'X-CSRFToken': csrftoken
            },
        });
        
        const result = await response.json();
        if(response.ok){
            const project = document.querySelector(`[data-projectid="${projectId}"]`);
            project.remove();
            location.reload();
        }else{
            throw new Error(result.error);
        }
    }catch(error){
        console.log(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateAllProgresses();
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        updateAllProgresses();
    }
});