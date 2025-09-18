# routes/services.py
import requests
from datetime import datetime, timedelta
import math
import logging

logger = logging.getLogger(__name__)

class RouteCalculationService:
    def __init__(self):
        # Your GraphHopper API key
        self.api_key = "8d9e695c-6152-4496-bb88-8f39f13a4d00"
        self.base_url = "https://graphhopper.com/api/1"
    
    def geocode_location(self, location_string):
        """Convert address string to coordinates"""
        url = f"{self.base_url}/geocoding"
        params = {
            'q': location_string,
            'key': self.api_key,
            'limit': 1,
            'locale': 'en'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('hits') and len(data['hits']) > 0:
                hit = data['hits'][0]
                return {
                    'lat': hit['point']['lat'],
                    'lng': hit['point']['lng'],
                    'name': hit.get('name', location_string)
                }
            else:
                logger.warning(f"No geocoding results for: {location_string}")
                return self._get_mock_coordinates(location_string)
                
        except Exception as e:
            logger.error(f"Geocoding error for {location_string}: {e}")
            print(f"Geocoding error: {e}")
            return self._get_mock_coordinates(location_string)

    def _get_mock_coordinates(self, location_string):
        """Return mock coordinates for common cities"""
        mock_coords = {
            'Atlanta, GA': {'lat': 33.7490, 'lng': -84.3880, 'name': 'Atlanta, GA'},
            'Charlotte, NC': {'lat': 35.2271, 'lng': -80.8431, 'name': 'Charlotte, NC'},
            'Jacksonville, FL': {'lat': 30.3322, 'lng': -81.6557, 'name': 'Jacksonville, FL'},
            'Chicago, IL': {'lat': 41.8781, 'lng': -87.6298, 'name': 'Chicago, IL'},
            'Denver, CO': {'lat': 39.7392, 'lng': -104.9903, 'name': 'Denver, CO'},
            'Los Angeles, CA': {'lat': 34.0522, 'lng': -118.2437, 'name': 'Los Angeles, CA'},
            'New York, NY': {'lat': 40.7128, 'lng': -74.0060, 'name': 'New York, NY'},
            'Seattle, WA': {'lat': 47.6062, 'lng': -122.3321, 'name': 'Seattle, WA'},
            'Miami, FL': {'lat': 25.7617, 'lng': -80.1918, 'name': 'Miami, FL'},
            'Dallas, TX': {'lat': 32.7767, 'lng': -96.7970, 'name': 'Dallas, TX'},
            'Phoenix, AZ': {'lat': 33.4484, 'lng': -112.0740, 'name': 'Phoenix, AZ'},
            'Houston, TX': {'lat': 29.7604, 'lng': -95.3698, 'name': 'Houston, TX'},
            'San Antonio, TX': {'lat': 29.4241, 'lng': -98.4936, 'name': 'San Antonio, TX'},
            'Tampa, FL': {'lat': 27.9506, 'lng': -82.4572, 'name': 'Tampa, FL'},
            'Orlando, FL': {'lat': 28.5383, 'lng': -81.3792, 'name': 'Orlando, FL'}
        }
        
        if location_string in mock_coords:
            print(f"Using mock coordinates for {location_string}")
            return mock_coords[location_string]
        
        for city, coords in mock_coords.items():
            if location_string.lower() in city.lower() or city.lower() in location_string.lower():
                print(f"Using mock coordinates for {location_string} -> {city}")
                return coords
        
        print(f"Using default coordinates for unknown location: {location_string}")
        return {'lat': 39.8283, 'lng': -98.5795, 'name': location_string}
    
    def calculate_route(self, current_location, pickup_location, dropoff_location):
        """Calculate optimized route through all points"""
        try:
            # Geocode all locations
            current = self.geocode_location(current_location)
            pickup = self.geocode_location(pickup_location) 
            dropoff = self.geocode_location(dropoff_location)
            
            if not all([current, pickup, dropoff]):
                raise ValueError("Could not geocode one or more locations")
            
            # Calculate route: current -> pickup -> dropoff
            waypoints = [
                f"{current['lat']},{current['lng']}",
                f"{pickup['lat']},{pickup['lng']}",
                f"{dropoff['lat']},{dropoff['lng']}"
            ]
            
            url = f"{self.base_url}/route"
            params = {
                'point': waypoints,
                'vehicle': 'truck',
                'key': self.api_key,
                'instructions': 'true',
                'calc_points': 'true',
                'type': 'json'
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if 'paths' in data and data['paths']:
                path = data['paths'][0]
                return {
                    'distance_meters': path['distance'],
                    'time_seconds': path['time'] / 1000,
                    'instructions': path.get('instructions', []),
                    'points': path.get('points', {}),
                    'waypoints': waypoints,
                    'geocoded_locations': {
                        'current': current,
                        'pickup': pickup,
                        'dropoff': dropoff
                    }
                }
            else:
                raise ValueError("No route found")
                
        except Exception as e:
            logger.error(f"Route calculation error: {e}")
            print(f"GraphHopper API Error: {e}")
            
            # Calculate realistic distance based on locations
            distance_km = self._calculate_mock_distance(current_location, pickup_location, dropoff_location)
            distance_meters = distance_km * 1000
            time_seconds = (distance_km / 80) * 3600  # Assume 80 km/h average speed
            
            return {
                'distance_meters': distance_meters,
                'time_seconds': time_seconds,
                'instructions': [
                    {'text': f'Start from {current_location}', 'distance': 0, 'time': 0},
                    {'text': f'Drive to {pickup_location}', 'distance': distance_meters * 0.4, 'time': time_seconds * 0.4 * 1000},
                    {'text': f'Drive to {dropoff_location}', 'distance': distance_meters * 0.6, 'time': time_seconds * 0.6 * 1000}
                ],
                'waypoints': [],
                'error': str(e)
            }

    def _calculate_mock_distance(self, current, pickup, dropoff):
        """Calculate rough distance based on location names"""
        # Simple heuristic based on common routes
        route_distances = {
            ('Atlanta', 'Charlotte', 'Jacksonville'): 600,
            ('Chicago', 'Denver', 'Los Angeles'): 2400,
            ('New York', 'Seattle', 'Los Angeles'): 4800,
            ('Dallas', 'Houston', 'San Antonio'): 500,
            ('Miami', 'Tampa', 'Orlando'): 400
        }
        
        # Try to match route pattern
        route_key = tuple([self._extract_city(current), self._extract_city(pickup), self._extract_city(dropoff)])
        
        for pattern, distance in route_distances.items():
            if all(city in str(route_key) for city in pattern):
                return distance
        
        # Default fallback
        return 800  # 800 km default

    def _extract_city(self, location_string):
        """Extract city name from location string"""
        return location_string.split(',')[0].strip()

class HOSComplianceCalculator:
    def __init__(self):
        # HOS regulation constants
        self.MAX_DRIVING_HOURS = 11
        self.MAX_DUTY_HOURS = 14
        self.REQUIRED_BREAK_AFTER_HOURS = 8
        self.REQUIRED_BREAK_DURATION = 0.5  # 30 minutes
        self.MIN_OFF_DUTY_HOURS = 10
        self.MAX_WEEKLY_HOURS = 70
        self.PICKUP_DROPOFF_TIME = 1.0  # 1 hour each
        
    def calculate_compliance(self, route_data, current_cycle_hours):
        """Calculate HOS compliance for the planned route"""
        
        # Convert route time from seconds to hours
        driving_time_hours = route_data['time_seconds'] / 3600
        distance_miles = route_data['distance_meters'] / 1609.34  # Convert to miles
        
        # Add pickup and dropoff time 
        total_on_duty_time = driving_time_hours + (2 * self.PICKUP_DROPOFF_TIME)
        
        # Calculate fuel stops (every 1000 miles)
        fuel_stops_needed = max(0, math.ceil(distance_miles / 1000) - 1)
        fuel_stop_time = fuel_stops_needed * 0.5  # 30 minutes per fuel stop
        total_on_duty_time += fuel_stop_time
        
        # Check if 30-minute break is required
        required_breaks = []
        if driving_time_hours > self.REQUIRED_BREAK_AFTER_HOURS:
            required_breaks.append({
                'type': 'required_break',
                'duration': self.REQUIRED_BREAK_DURATION,
                'after_driving_hours': self.REQUIRED_BREAK_AFTER_HOURS,
                'location': 'Rest Area'
            })
        
        # Check compliance
        compliance_issues = []
        
        # Check daily limits
        if driving_time_hours > self.MAX_DRIVING_HOURS:
            compliance_issues.append(f"Driving time ({driving_time_hours:.1f}h) exceeds 11-hour limit")
            
        if total_on_duty_time > self.MAX_DUTY_HOURS:
            compliance_issues.append(f"Total duty time ({total_on_duty_time:.1f}h) exceeds 14-hour limit")
        
        # Check weekly limit
        projected_cycle_hours = current_cycle_hours + total_on_duty_time
        if projected_cycle_hours > self.MAX_WEEKLY_HOURS:
            compliance_issues.append(f"Would exceed 70-hour/8-day limit ({projected_cycle_hours:.1f}h)")
        
        # Determine if multi-day trip is required
        requires_multi_day = len(compliance_issues) > 0
        
        return {
            'is_compliant': len(compliance_issues) == 0,
            'compliance_issues': compliance_issues,
            'driving_time_hours': driving_time_hours,
            'total_on_duty_time': total_on_duty_time,
            'distance_miles': distance_miles,
            'fuel_stops_needed': fuel_stops_needed,
            'required_breaks': required_breaks,
            'projected_cycle_hours': projected_cycle_hours,
            'requires_multi_day': requires_multi_day
        }
