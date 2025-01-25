from django.db import models

# Create your models here.


class Project(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Baja'),
        ('Medium', 'Media'),
        ('High', 'Alta'),
    ]
    name = models.CharField(max_length=200)
    description = models.TextField(default='', blank=True, null=True)
    priority = models.CharField(max_length=6,
                                choices=PRIORITY_CHOICES, default='Low')

    def __str__(self):
        return self.name


class Task(models.Model):
    title = models.CharField(max_length=200)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title
