from django.shortcuts import render
from .models import Producto

def home(request):
    productos = Producto.objects.all()  # Consultar todos los productos
    return render(request, 'home.html', {'productos': productos})
