# routes/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Route
from .serializers import RouteInputSerializer, RouteSerializer
from .services import RouteCalculationService, HOSComplianceCalculator
from eld_logs.services import ELDLogGeneratorService
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_route(request):
    """
    Main API endpoint to calculate route and generate HOS-compliant schedule
    """
    serializer = RouteInputSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Save basic route info
        route = serializer.save()
        
        # Calculate route using mapping service
        logger.info(f"Calculating route for: {route.current_location} -> {route.pickup_location} -> {route.dropoff_location}")
        
        route_service = RouteCalculationService()
        route_data = route_service.calculate_route(
            route.current_location,
            route.pickup_location,
            route.dropoff_location
        )
        
        if not route_data:
            return Response(
                {'error': 'Could not calculate route. Please check locations.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate HOS compliance
        hos_calculator = HOSComplianceCalculator()
        compliance_data = hos_calculator.calculate_compliance(
            route_data, 
            route.current_cycle_hours
        )
        
        # Update route with calculated data
        route.total_distance = compliance_data['distance_miles']
        route.estimated_driving_time = compliance_data['driving_time_hours']
        route.total_duty_time = compliance_data['total_on_duty_time']
        route.is_compliant = compliance_data['is_compliant']
        route.requires_multi_day = compliance_data['requires_multi_day']
        route.save()
        
        # Generate ELD logs
        try:
            log_generator = ELDLogGeneratorService()
            daily_logs = log_generator.create_daily_logs(route, compliance_data)
        except Exception as e:
            logger.error(f"ELD log generation failed: {e}")
            daily_logs = []
        
        # Return comprehensive response
        response_data = {
            'route_id': route.id,
            'route_summary': {
                'total_distance_miles': round(compliance_data['distance_miles'], 1),
                'estimated_driving_time': round(compliance_data['driving_time_hours'], 1),
                'total_duty_time': round(compliance_data['total_on_duty_time'], 1),
                'fuel_stops_needed': compliance_data['fuel_stops_needed']
            },
            'hos_compliance': {
                'is_compliant': compliance_data['is_compliant'],
                'compliance_issues': compliance_data['compliance_issues'],
                'requires_multi_day': compliance_data['requires_multi_day'],
                'projected_cycle_hours': round(compliance_data['projected_cycle_hours'], 1)
            },
            'route_data': {
                'instructions': route_data.get('instructions', [])[:5],  # First 5 instructions
                'waypoints': route_data.get('waypoints', [])
            },
            'daily_logs': [
                {
                    'id': log.id,
                    'date': log.log_date.strftime('%Y-%m-%d'),
                    'total_miles': log.total_miles,
                    'driving_hours': log.driving_hours,
                    'total_duty_hours': log.on_duty_hours + log.driving_hours,
                    'entries': [
                        {
                            'duty_status': entry.duty_status,
                            'start_time': entry.start_time.strftime('%H:%M'),
                            'end_time': entry.end_time.strftime('%H:%M'),
                            'location': entry.location,
                            'remarks': entry.remarks,
                            'total_hours': entry.total_hours
                        } for entry in log.entries.all()
                    ]
                } for log in daily_logs
            ]
        }
        
        logger.info(f"Route calculated successfully. Distance: {compliance_data['distance_miles']:.1f} miles, Time: {compliance_data['driving_time_hours']:.1f} hours")
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Route calculation failed: {str(e)}")
        return Response(
            {'error': f'Route calculation failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint"""
    return Response({'status': 'healthy', 'message': 'ELD Route Planner API is running!'})
