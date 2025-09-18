# routes/serializers.py
from rest_framework import serializers
from .models import Route, RouteStep
from eld_logs.models import DailyLog, LogEntry

class RouteStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteStep
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    steps = RouteStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = Route
        fields = '__all__'

class RouteInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['current_location', 'pickup_location', 'dropoff_location', 'current_cycle_hours']

class LogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEntry
        fields = '__all__'

class DailyLogSerializer(serializers.ModelSerializer):
    entries = LogEntrySerializer(many=True, read_only=True)
    
    class Meta:
        model = DailyLog
        fields = '__all__'
