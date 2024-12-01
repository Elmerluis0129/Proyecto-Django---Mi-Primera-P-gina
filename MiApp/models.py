from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

# Opciones para el estado de la cita
ESTADOS_CITA = [
    ('completada', 'Completada'),
    ('pendiente', 'Pendiente'),
    ('cancelada', 'Cancelada'),
]


class Cita(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_staff': False}, verbose_name='Usuario')  
    nombre_cita = models.CharField(max_length=200, verbose_name='Nombre de la cita')
    estado = models.CharField(max_length=10, choices=ESTADOS_CITA, default='pendiente', verbose_name='Estado')
    fecha = models.DateTimeField(verbose_name='Fecha y Hora')  # El campo correcto es 'fecha'

    def __str__(self):
        return f'{self.nombre_cita} - {self.usuario.username}'

    class Meta:
        verbose_name = 'Cita'
        verbose_name_plural = 'Citas'
        
class SolicitudTutoria(models.Model):
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='solicitudes')
    nombre_tutoria = models.CharField(max_length=255)
    descripcion = models.TextField()
    estado = models.CharField(max_length=50, choices=[('Pendiente', 'Pendiente'), ('Aceptada', 'Aceptada'), ('Rechazada', 'Rechazada')], default='Pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre_tutoria

class Tutoria(models.Model):
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha = models.DateTimeField()  # Este campo debe existir
    duracion = models.PositiveIntegerField(help_text="Duración en minutos")
    precio = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    es_gratis = models.BooleanField(default=False)

    def clean(self):
        # Validar que si no es gratis, el precio debe ser mayor a 0
        if self.es_gratis and self.precio:
            raise ValidationError("No se puede marcar 'Es gratis' y establecer un precio al mismo tiempo.")
        if not self.es_gratis and (self.precio is None or self.precio <= 0):
            raise ValidationError("Debe ingresar un precio mayor a 0 si la tutoría no es gratis.")

    def get_duration_display(self):
        # Convertir la duración a horas y minutos o días
        if self.duracion < 60:
            return f"{self.duracion} minutos"
        elif self.duracion < 1440:
            horas = self.duracion // 60
            minutos = self.duracion % 60
            return f"{horas} horas {minutos} minutos" if minutos else f"{horas} horas"
        else:
            dias = self.duracion // 1440
            horas = (self.duracion % 1440) // 60
            return f"{dias} días {horas} horas" if horas else f"{dias} días"

    def __str__(self):
        return self.titulo








