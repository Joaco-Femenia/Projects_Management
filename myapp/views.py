from django.shortcuts import render, redirect  # noqa: F401
from django.http import HttpResponse, JsonResponse  # noqa: F401
from django.contrib import messages
from .models import Project, Task
import re
import math
from .forms import ProjectForm
import json


ALLOWED_PRIORITIES = {"Low", "Medium", "High"}
TITLE_PATTERN = r"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ,.!?()'\" -]{1,100}$"
DESCRIPTION_PATTERN = r"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ,.!?():'\" \-\n]{1,1000}$"


def validate_data(title, description=None, priority=None):
    """
    Valida y limpia el título, descripción y prioridad de un proyecto.
    :param title: Título del proyecto/tarea (string).
    :param description: Descripción del proyecto/tarea (string, opcional).
    :param priority: Prioridad del proyecto/tarea (string, opcional).
    :return: Diccionario con los campos validados o errores.
    """
    result = {"valid": True, "data": {"description": description, "priority": priority}, "errors": {}}  # noqa: E501

    # Validate title
    if not title:
        result["valid"] = False
        result["errors"]["title"] = "El título es obligatorio."
    elif not re.fullmatch(TITLE_PATTERN, title):
        result["valid"] = False
        result["errors"]["title"] = (
            "El título solo puede contener letras, números, espacios y algunos "  # noqa: E501
            "signos de puntuación básicos, con un máximo de 100 caracteres."
        )
    else:
        result["data"]["title"] = title

    # Validate description
    if description:
        if not re.fullmatch(DESCRIPTION_PATTERN, description):
            result["valid"] = False
            result["errors"]["description"] = (
                "La descripción no debe contener etiquetas HTML u otros "
                "caracteres maliciosos, y debe tener un máximo de 1000 caracteres."  # noqa: E501
            )

    # Validate priority
    if priority:
        if priority not in ALLOWED_PRIORITIES:
            result["valid"] = False
            result["errors"]["priority"] = (
                f"La prioridad debe ser una de las siguientes: {', '.join(ALLOWED_PRIORITIES)}."  # noqa: E501
            )

    return result


def home(request):
    """
    Renders the home page.
    """
    return render(request, 'home.html')


def all_projects(request):
    """
    Displays all projects sorted by priority (high > medium > low).
    """
    prioritys = {'Low': 1, 'Medium': 2, 'High': 3}
    projects = Project.objects.all()
    projects = sorted(projects,
                      key=lambda project: prioritys[project.priority],
                      reverse=True)
    return render(request, 'all_projects.html', {'projects': projects})


def newProject(request):
    """
    Renders the new project page.
    """
    return render(request, 'new_project.html')


def projectDetails(request, project_id):
    """
    Displays details of a specific project, including its tasks.

    :param project_id: ID of the project to display.
    """
    project = Project.objects.get(id=project_id)
    tasks = Task.objects.filter(project=project)
    return render(request, 'project_details.html', {
        'project': project,
        'tasks': tasks,
    })


def add_task(request, project_id):
    """
    Adds a task to a project.

    :param project_id: ID of the project to which the task will be added.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        task_title = data.get('task_title', None)
        result = validate_data(task_title)
        if result["valid"]:
            try:
                project = Project.objects.get(id=project_id)
                task = Task.objects.create(title=result["data"]["title"],
                                           project=project)
                return JsonResponse({
                    'success': True,
                    'message': 'Tarea agregada con éxito',
                    'task': {
                        'title': result["data"]["title"],
                        'id': task.id,
                        'completed': task.completed
                    }
                })
            except Project.DoesNotExist:
                return JsonResponse({'success': False,
                                     'error': 'Proyecto no encontrado'},
                                    status=404)
        else:
            return JsonResponse({'success': False,
                                 'error': result["errors"]}, status=400)  # noqa: E501
    else:
        return JsonResponse({'success': False,
                             'error': 'Metodo no permitido'},
                            status=405)


def create_project(request):
    """
    Creates a new project using a form.
    """
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Proyecto creado con éxito.')
            form = ProjectForm()
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{error}")
    else:
        form = ProjectForm()

    return render(request, 'new_project.html', {'form': form})


def ChangeTaskStatus(request, taskId):
    """
    Toggles the completion status of a task.

    :param taskId: ID of the task to toggle.
    """
    task = Task.objects.get(id=taskId)
    task.completed = not task.completed
    task.save()
    return JsonResponse({'success': True, 'completed': task.completed})


def deleteTask(request, taskId):
    """
    Deletes a task.

    :param taskId: ID of the task to delete.
    """
    if request.method == 'DELETE':
        try:
            task = Task.objects.get(id=taskId)
            task.delete()
            return JsonResponse({'success': True,
                                 'message': 'Tarea eliminada con exito.'})
        except task.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Tarea no encontrada'}, status=404)  # noqa: E501
    return JsonResponse({'success': False,
                         'error': 'Metodo no permitido'}, status=405)


def editTask(request, taskId):
    """
    Edits the title of a task.

    :param taskId: ID of the task to edit.
    """
    if request.method == 'POST':
        try:
            task = Task.objects.get(id=taskId)
            data = json.loads(request.body)
            newTitle = data.get('title', None)
            result = validate_data(newTitle)
            if result["valid"]:
                task.title = result["data"]["title"]
                task.save()
                return JsonResponse({'success': True,
                                     'message': 'Tarea editada con exito.'})
            else:
                return JsonResponse({'success': False,
                                    'error': result["errors"]}, status=400)

        except task.DoesNotExist:
            return JsonResponse({'success': False,
                                 'error': 'Tarea no encontrada'}, status=404)
    else:
        return JsonResponse({'success': False,
                             'error': 'Metodo no permitido'}, status=405)


def editProject(request, project_id):
    """
    Edits the details of a project.

    :param project_id: ID of the project to edit.
    """
    if request.method == 'POST':
        try:
            project = Project.objects.get(id=project_id)
            data = json.loads(request.body)
            newName = data.get('name', None)
            newDescription = data.get('description', None)
            newPriority = data.get('priority', None)
            result = validate_data(newName, newDescription, newPriority)
            if result["valid"]:
                project.name = result["data"]["title"]
                project.description = result["data"]["description"]
                project.priority = result["data"]["priority"]
                project.save()
                return JsonResponse({'success': True,
                                     'message': 'Proyecto editado con exito.'})
            else:
                return JsonResponse({'success': False,
                                    'error': result["errors"]}, status=400)
        except project.DoesNotExist:
            return JsonResponse({'success': False,
                                 'error': 'Proyecto no encontrado'},
                                status=404)
    else:
        return JsonResponse({'success': False,
                             'error': 'Metodo no permitido'}, status=405)


def round_well(n):
    """
    Rounds a number to the nearest integer. If exactly halfway, rounds up.

    :param n: Number to round.
    """
    if n - math.floor(n) < 0.5:
        return math.floor(n)
    return math.ceil(n)


def calculateProgress(doneTasks, totalTasks):
    """
    Calculates the progress percentage of a project.

    :param doneTasks: Number of completed tasks.
    :param totalTasks: Total number of tasks.
    """
    if totalTasks > 0:
        progress = doneTasks/totalTasks * 100
        progress = round_well(progress)
    else:
        progress = 'hasNoTasks'
    return progress


def getAllProgresses(request):
    """
    Returns the progress of all projects
    """
    try:
        projects = Project.objects.all()
        results = []
        for project in projects:
            doneTasks, totalTasks = getDoneAndTotalTasks(project.id)
            progress = calculateProgress(doneTasks, totalTasks)
            eachProject = {
                'id': project.id,
                'progress': progress,
                'hasNoTasks': totalTasks == 0  # this parameter its for the front to know if the progress is 0 because there are no tasks # noqa: E501
            }
            results.append(eachProject)
        return JsonResponse({'success': True, 'progresses': results})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def getDoneAndTotalTasks(project_id):
    """
    Returns the number of completed tasks
    and the total number of tasks in a project.
    """
    totalTasks = Task.objects.filter(project=project_id).count()
    doneTasks = Task.objects.filter(project=project_id, completed=True).count()
    return doneTasks, totalTasks


def getProgress(request, project_id):
    """
    Returns the progress of a specific project.
    """
    try:
        doneTasks, totalTasks = getDoneAndTotalTasks(project_id)
        progress = calculateProgress(doneTasks, totalTasks)
        return JsonResponse({'success': True, 'progress': progress,
                             'hasNoTasks': totalTasks == 0})  # this parameter its for the front to know if the progress is 0 because there are no tasks # noqa: E501
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def deleteProject(request, project_id):
    """
    Deletes a project.
    """
    if request.method == 'POST':
        try:
            project = Project.objects.get(id=project_id)
            project.delete()
            return JsonResponse({'success': True,
                                 'message': 'Proyecto eliminado con exito.'})
        except project.DoesNotExist:
            return JsonResponse({'success': False,
                                'error': 'Proyecto no encontrado'},
                                status=404)
    else:
        return JsonResponse({'success': False,
                            'error': 'Metodo no permitido'}, status=405)
