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
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='solicitudes_tutorias')
    nombre_tutoria = models.CharField(max_length=100)
    descripcion = models.TextField()
    estado = models.CharField(
        max_length=50,
        choices=[('Pendiente', 'Pendiente'), ('Aprobado', 'Aprobado'), ('Rechazado', 'Rechazado')],
        default='Pendiente'
    )
    fecha_inicio = models.DateField(null=True, blank=True)  # Fecha inicial
    fecha_fin = models.DateField(null=True, blank=True)  # Fecha final
    lugar = models.CharField(max_length=200, null=True, blank=True)  # Lugar
    fecha_creacion = models.DateTimeField(auto_now_add=True)  # Fecha de creación automática

    def clean(self):
        # Si la solicitud está aprobada, verificar los campos obligatorios
        if self.estado == 'Aprobado':
            if not self.fecha_inicio or not self.fecha_fin or not self.lugar:
                raise ValidationError("Si el estado es 'Aprobado', debe especificar fecha y lugar.")

    def save(self, *args, **kwargs):
        self.clean()  # Llama a la validación personalizada antes de guardar
        super(SolicitudTutoria, self).save(*args, **kwargs)

    def __str__(self):
        return self.nombre_tutoria

class Tutoria(models.Model):
    UNIDADES_DURACION = [
        ('min', 'Minutos'),
        ('hr', 'Horas'),
        ('day', 'Días'),
        ('wk', 'Semanas'),
    ]

    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha = models.DateTimeField()
    duracion = models.PositiveIntegerField(help_text="Duración en número")
    unidad_duracion = models.CharField(max_length=3, choices=UNIDADES_DURACION, default='min')
    precio = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    es_gratis = models.BooleanField(default=False)
    estudiantes = models.ManyToManyField(
        User,
        related_name="tutorias",
        blank=True,
    )

    def duracion_con_unidad(self):
        # Retornar duración correctamente con unidad
        return f"{self.duracion} {self.get_unidad_duracion_display()}"

    def precio_display(self):
        # Manejar precios para tutorías gratuitas
        return "Gratis" if self.es_gratis or not self.precio else f"${self.precio:,.2f}"

    def __str__(self):
        return self.titulo




