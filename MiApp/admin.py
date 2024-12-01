from django.contrib import admin
from django.db import OperationalError
from .models import Cita, Tutoria
from django.utils.html import format_html

from .models import SolicitudTutoria

class SolicitudTutoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre_tutoria', 'descripcion', 'estado', 'fecha_creacion')  # Ajusta los campos según el modelo
    list_filter = ('estado',)  # Si necesitas un filtro por estado

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
    list_display = ('titulo', 'descripcion', 'fecha', 'duracion', 'precio', 'es_gratis')
    search_fields = ('titulo', 'descripcion')
    list_filter = ('es_gratis', 'fecha')

    def save_model(self, request, obj, form, change):
        # Guarda el objeto de la tutoría
        obj.save()

        # Personaliza el mensaje que se muestra después de guardar el objeto
        self.message_user(
            request,
            format_html(f'La tutoria "{obj.titulo}" fue agregada correctamente.'),
            level='success'
        )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if queryset.count() == 0:
            self.message_user(request, format_html('<b>No hay tutorías disponibles. Primero debe crear una tutoría.</b>'), level='warning')
        return queryset

# Registra el modelo y el admin personalizado
admin.site.register(Tutoria, TutoriaAdmin)

