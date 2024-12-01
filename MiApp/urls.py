from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.landing_page, name='landing_page'),  # Página de bienvenida
    path('home/', views.home, name='home'),  # Página de inicio
    path('login/', auth_views.LoginView.as_view(), name='login'),  # Página de login
    path('logout/', auth_views.LogoutView.as_view(next_page='landing_page'), name='logout'),  # Logout con redirección
    path('recuperar_contraseña/', views.recover_password, name='recuperar_contraseña'),
    path('politicas/', views.politicas, name='politicas'),
    path('contacto/', views.contacto, name='contacto'),
    path('noticias/', views.noticias, name='noticias'),
    path('obtener_tutorias/', views.obtener_tutorias, name='obtener_tutorias'),
    path('mis-citas/', views.citas_view, name='mis_citas'),  # Aquí está la URL que debería usarse
    path('crear-solicitud-tutoria/', views.crear_solicitud_tutoria, name='crear_solicitud_tutoria'),
]

