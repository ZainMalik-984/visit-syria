# Generated by Django 5.2.4 on 2025-07-09 16:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='passwordresetotp',
            name='type',
            field=models.CharField(choices=[('reset_password', 'registration'), ('reset_password', 'registration')], default='registration', max_length=15),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='is_active',
            field=models.BooleanField(default=False),
        ),
    ]
