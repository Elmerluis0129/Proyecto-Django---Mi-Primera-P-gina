from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from .models import Tutoria
from django.contrib.auth import logout
from django.conf import settings
from .models import Cita
from django.core.mail import send_mail
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.models import User
from .models import SolicitudTutoria
from django.views.decorators.csrf import csrf_exempt
import json

def contacto(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')
        
        # Aquí puedes agregar la lógica para enviar el correo o procesar el mensaje

        # Agregar un mensaje de éxito
        messages.success(request, '¡Tu mensaje ha sido enviado correctamente! Gracias por contactarnos.')
        
        return redirect('contacto')  # Redirige a la misma página para limpiar el formulario
    
    return render(request, 'contacto.html')


@csrf_exempt
def crear_solicitud_tutoria(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nombre_tutoria = data.get('nombre_tutoria')
            descripcion = data.get('descripcion')

            if not nombre_tutoria or not descripcion:
                return JsonResponse({'error': 'Todos los campos son requeridos.'}, status=400)

            # Crear la solicitud
            nueva_solicitud = SolicitudTutoria.objects.create(
                nombre_tutoria=nombre_tutoria,
                descripcion=descripcion,
                estado="Pendiente"  # Establecer estado inicial
            )
            return JsonResponse({'message': 'Solicitud creada exitosamente.'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido.'}, status=405)

# Vista para usuarios no autenticados
def landing_page(request):
    return render(request, 'landing_page.html')

def politicas(request):
    return render(request, 'politicas.html')

def contacto(request):
    if request.method == 'POST':
        # Lógica para manejar el formulario de contacto
        messages.success(request, '¡Tu mensaje ha sido enviado!')
    return render(request, 'contacto.html')

@login_required
def noticias(request):
    noticias = [
        {'titulo': 'Noticia 1', 'descripcion': 'Descripción 1', 'imagen': 'ruta/a/imagen1.jpg', 'enlace': '#'},
        {'titulo': 'Noticia 2', 'descripcion': 'Descripción 2', 'imagen': 'ruta/a/imagen2.jpg', 'enlace': '#'},
    ]
    return render(request, 'noticias.html', {'noticias': noticias})

@login_required
def citas_view(request):
    # Obtener todas las citas del usuario autenticado
    citas = Cita.objects.filter(usuario=request.user)  # Filtrar por el usuario autenticado
    context = {
        'citas': citas
    }
    return render(request, 'citas.html', context)

# Vista para login
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        
        # Verificar si el usuario existe
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Iniciar sesión si el usuario es válido
            login(request, user)
            
            # Guardar el nombre de usuario en un archivo de texto
            with open('usuario_logueado.txt', 'w') as file:
                file.write(f'Usuario logueado: {username}')
            
            return redirect('home')  # Redirige a la página de inicio después de iniciar sesión
        else:
            # Si el usuario no existe o la contraseña es incorrecta
            messages.error(request, 'Usuario o contraseña incorrecta.')
    
    return render(request, 'login.html')  # El archivo de tu formulario de login


# Elimina esta vista si no necesitas personalizar el logout
def logout_view(request):
    logout(request)  # Cierra la sesión del usuario
    return redirect('landing_page')


# Recuperar contraseña
def recover_password(request):
    if request.method == 'POST':
        correo = request.POST.get('correo')
        
        # Validación de que el correo sea válido
        if correo:
            # Verifica si el correo está asociado a un usuario
            try:
                user = User.objects.get(email=correo)
                
                # Generar el token de recuperación de contraseña
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(user.pk.encode())
                
                # Obtener la URL de la página para cambiar la contraseña
                reset_url = f"{request.scheme}://{get_current_site(request).domain}/reset/{uid}/{token}/"
                
                # Enviar el correo con el enlace de recuperación
                subject = "Recuperación de contraseña"
                message = f"Para restablecer tu contraseña, haz clic en el siguiente enlace: {reset_url}"
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [correo])
                
                messages.success(request, 'Si el correo existe, se ha enviado un enlace para restablecer la contraseña.')
            except User.DoesNotExist:
                messages.error(request, 'Por favor, ingresa un correo válido.')
        else:
            messages.error(request, 'Por favor, ingresa un correo válido.')
    
    return render(request, 'recuperar_contraseña.html')

# Vista de home protegida con login_required
@login_required
def home(request):
    # Obtén todas las tutorías
    tutorias = Tutoria.objects.all()  # Obtén todas las tutorías
    context = {
        'tutorias': tutorias  # Pasamos las tutorías al contexto
    }
    return render(request, 'home.html', context)


def home(request):
    tutorias = Tutoria.objects.all()  # Obtenemos todas las tutorías
    context = {
        'tutorias': tutorias,  # Pasamos las tutorías al contexto
    }
    return render(request, 'home.html', context)

def obtener_tutorias(request):
    tutorias = Tutoria.objects.all()  # Obtener todas las tutorías
    data = [
        {
            'id': tutoria.id,
            'titulo': tutoria.titulo,
            'descripcion': tutoria.descripcion,
            'duracion': tutoria.duracion,
            'precio': float(tutoria.precio) if tutoria.precio else None,  # Convertir a float si existe
        }
        for tutoria in tutorias
    ]
    return JsonResponse(data, safe=False)

