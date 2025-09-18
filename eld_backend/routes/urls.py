# routes/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('calculate-route/', views.calculate_route, name='calculate-route'),
    path('health/', views.health_check, name='health-check'),
]
