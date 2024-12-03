# Generated by Django 5.1.3 on 2024-12-03 01:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MiApp', '0012_solicitudtutoria_fecha_solicitudtutoria_lugar_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='solicitudtutoria',
            name='fecha',
        ),
        migrations.AddField(
            model_name='solicitudtutoria',
            name='fecha_fin',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='solicitudtutoria',
            name='fecha_inicio',
            field=models.DateField(blank=True, null=True),
        ),
    ]