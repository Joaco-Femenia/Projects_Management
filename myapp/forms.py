from django import forms
from .models import Project
import re

# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass


class ProjectForm(forms.ModelForm):
    """
    ProjectForm is a Django ModelForm for the Project model.
    Fields:
        - name: A CharField representing the name of the project.
        - description: A CharField with a Textarea widget for the project's description. This field is optional.  # noqa E501
        - priority: A field representing the priority of the project.
    Meta:
        - model: The model associated with this form is Project.
        - fields: Specifies the fields to be included in the form.
        - labels: Provides human-readable labels for the form fields.
        - widgets: Customizes the widgets for the form fields.
    """
    TITLE_PATTERN = r"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ,.!?()'\" -]{1,100}$"
    DESCRIPTION_PATTERN = r"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ,.!?():'\" \-\n]{0,1000}$"

    class Meta:
        model = Project
        fields = ['name', 'description', 'priority']
        labels = {
            'name': 'Nombre',
            'description': 'Descripción',
            'priority': 'Prioridad',
        }

    def clean_name(self):
        name = self.cleaned_data['name']
        if not re.fullmatch(self.TITLE_PATTERN, name):
            raise forms.ValidationError("El título solo puede contener letras, números y algunos caracteresespeciales (, . ! ? () -).") # noqa E501

        return name

    def clean_description(self):
        description = self.cleaned_data['description']
        if not re.fullmatch(self.DESCRIPTION_PATTERN, description):
            raise forms.ValidationError("La descripción contiene caracteres inválidos.") # noqa E501
        return description
