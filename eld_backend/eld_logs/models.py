# eld_logs/models.py
from django.db import models
from routes.models import Route  # Changed from route_planner to routes

class DailyLog(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='daily_logs')
    log_date = models.DateField()
    driver_name = models.CharField(max_length=100, default="Driver")
    co_driver_name = models.CharField(max_length=100, blank=True)
    vehicle_number = models.CharField(max_length=50, default="001")
    carrier_name = models.CharField(max_length=255, default="Carrier")
    total_miles = models.IntegerField(default=0)
    shipping_document = models.CharField(max_length=100, blank=True)
    
    # Duty time totals
    off_duty_hours = models.FloatField(default=0)
    sleeper_berth_hours = models.FloatField(default=0) 
    driving_hours = models.FloatField(default=0)
    on_duty_hours = models.FloatField(default=0)

    def __str__(self):
        return f"Log for {self.log_date} - {self.driver_name}"

class LogEntry(models.Model):
    DUTY_CHOICES = [
        ('off_duty', 'Off Duty'),
        ('sleeper_berth', 'Sleeper Berth'), 
        ('driving', 'Driving'),
        ('on_duty_not_driving', 'On Duty (Not Driving)')
    ]
    
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name='entries')
    duty_status = models.CharField(max_length=25, choices=DUTY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=255)
    remarks = models.TextField(blank=True)
    total_hours = models.FloatField()

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"{self.duty_status}: {self.start_time}-{self.end_time}"
