# routes/models.py
from django.db import models
from datetime import datetime

class Route(models.Model):
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255) 
    dropoff_location = models.CharField(max_length=255)
    current_cycle_hours = models.FloatField()
    total_distance = models.FloatField(null=True, blank=True)
    estimated_driving_time = models.FloatField(null=True, blank=True)
    total_duty_time = models.FloatField(null=True, blank=True)
    is_compliant = models.BooleanField(default=True)
    requires_multi_day = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Route: {self.pickup_location} → {self.dropoff_location}"

class RouteStep(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='steps')
    step_order = models.IntegerField()
    instruction = models.TextField()
    distance_meters = models.FloatField()
    duration_seconds = models.FloatField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    class Meta:
        ordering = ['step_order']
