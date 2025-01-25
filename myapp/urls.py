from django.urls import path, include  # noqa: F401
"""
URL configuration for the Django application.
This module defines the URL patterns for the application, mapping URL paths to
the corresponding view functions. The urlpatterns list routes URLs to views.
Routes:
     - '' : Redirects to 'projects/' with a permanent redirect.
     - 'projects/' : Displays all projects.
     - 'new_project/' : Displays the form to create a new project.
     - 'crear/' : Handles the creation of a new project.
     - 'projects/<int:project_id>/' : Displays the details of a specific project. # noqa E501
     - 'add-task/<int:project_id>/' : Adds a new task to a specific project.
     - 'change-task-status/<int:taskId>/' : Changes the status of a specific task.
     - 'delete-task/<int:taskId>/' : Deletes a specific task.
     - 'edit-task/<int:taskId>/' : Edits a specific task.
     - 'projects/delete-project/<int:project_id>/' : Deletes a specific project.
     - 'edit-project/<int:project_id>/' : Edits a specific project.
     - 'project/<int:project_id>/progress/' : Retrieves the progress of a specific project.
     - 'projects/progresses/' : Retrieves the progress of all projects.
"""
from django.shortcuts import redirect
from . import views

urlpatterns = [
    path('', lambda request: redirect('projects/', permantent=True)),
    path('projects/', views.all_projects, name='projects'),
    path('new_project/', views.newProject, name='new_project'),
    path('crear/', views.create_project, name='create_project'),
    path('projects/<int:project_id>/', views.projectDetails,
         name='project_details'),
    path('add-task/<int:project_id>/', views.add_task, name='add_task'),
    path('change-task-status/<int:taskId>/', views.ChangeTaskStatus,
         name='task_status'),
    path('delete-task/<int:taskId>/', views.deleteTask, name='delete_task'),
    path('edit-task/<int:taskId>/', views.editTask, name='edit_task'),
    path('projects/delete-project/<int:project_id>/', views.deleteProject,
         name='delete_project'),
    path('edit-project/<int:project_id>/', views.editProject,
         name='edit_project'),
    path('project/<int:project_id>/progress/', views.getProgress,
         name='get_progress'),
    path('projects/progresses/', views.getAllProgresses,
         name='get_all_progresses'),
]
