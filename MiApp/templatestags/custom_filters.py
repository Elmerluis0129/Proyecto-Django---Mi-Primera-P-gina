# MiApp/templatetags/custom_filters.py
from django import template

register = template.Library()

@register.filter
def add_class(value, arg):
    """Añade una clase al campo del formulario"""
    return value.as_widget(attrs={'class': arg})
