from django.contrib import admin
from django.db import OperationalError
from .models import Cita, Tutoria
from django.utils.html import format_html
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

from .models import SolicitudTutoria

class SolicitudTutoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre_tutoria', 'estudiante', 'estado', 'fecha_inicio', 'fecha_fin', 'lugar')
    list_filter = ('estado', 'fecha_inicio', 'fecha_fin')
    search_fields = ('nombre_tutoria', 'estudiante__username')
    readonly_fields = ('fecha_creacion',)

    def save_model(self, request, obj, form, change):
        if obj.estado == 'Aprobado' and (not obj.fecha_inicio or not obj.fecha_fin or not obj.lugar):
            raise ValidationError("Debe especificar fecha y lugar para las solicitudes aprobadas.")
        super().save_model(request, obj, form, change)

admin.site.register(SolicitudTutoria, SolicitudTutoriaAdmin)

class CitaAdmin(admin.ModelAdmin):
    # Usamos el campo 'fecha' del modelo, que parece ser correcto
    list_display = ('nombre_cita', 'usuario', 'estado', 'fecha')  # Usamos 'fecha' directamente como en el modelo
    list_filter = ('estado', 'fecha', 'usuario')  # 'fecha' también debe ser usado aquí
    search_fields = ('nombre_cita', 'usuario__username')

    def get_queryset(self, request):
        try:
            queryset = super().get_queryset(request)
            if queryset.count() == 0:
                self.message_user(request, format_html('<b>No hay citas disponibles. Primero debe crear una cita.</b>'), level='warning')
            return queryset
        except OperationalError as e:
            self.message_user(request, format_html('<b>Error al acceder a la base de datos. Asegúrese de que las migraciones se hayan aplicado correctamente.</b>'), level='error')
            return []

admin.site.register(Cita, CitaAdmin)

class TutoriaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'descripcion', 'fecha', 'duracion_con_unidad', 'precio', 'es_gratis', 'get_estudiantes')
    search_fields = ('titulo', 'descripcion')
    list_filter = ('es_gratis', 'fecha', 'unidad_duracion')

    # Para que solo los usuarios no staff aparezcan en el campo estudiantes
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == 'estudiantes':
            kwargs['queryset'] = User.objects.filter(is_staff=False)
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    filter_horizontal = ('estudiantes',)  # Mejor selector en admin

    def duracion_con_unidad(self, obj):
        return f"{obj.duracion} {obj.get_unidad_duracion_display()}"
    duracion_con_unidad.short_description = 'Duración'

    def get_estudiantes(self, obj):
        estudiantes = obj.estudiantes.all()
        if estudiantes.exists():
            return ", ".join([user.username for user in estudiantes])
        return "No-Estudiantes"
    get_estudiantes.short_description = "Estudiantes"

# Registra el modelo y el administrador personalizado
admin.site.register(Tutoria, TutoriaAdmin)

