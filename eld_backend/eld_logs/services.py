# eld_logs/services.py
from datetime import datetime, timedelta, time
from .models import DailyLog, LogEntry
import math

class ELDLogGeneratorService:
    def __init__(self):
        self.PICKUP_DROPOFF_TIME = 1.0  # 1 hour each
        
    def create_daily_logs(self, route, compliance_data):
        """Generate ELD logs for the route"""
        daily_logs = []
        
        if not compliance_data.get('requires_multi_day'):
            # Single day trip
            log = self._create_single_day_log(route, compliance_data)
            daily_logs.append(log)
        else:
            # Multi-day trip
            logs = self._create_multi_day_logs(route, compliance_data)
            daily_logs.extend(logs)
            
        return daily_logs
    
    def _create_single_day_log(self, route, compliance_data):
        """Create log for single-day compliant trip"""
        log_date = datetime.now().date()
        
        # Create daily log
        daily_log = DailyLog.objects.create(
            route=route,
            log_date=log_date,
            total_miles=int(compliance_data['distance_miles']),
            driving_hours=compliance_data['driving_time_hours'],
            on_duty_hours=compliance_data['total_on_duty_time'] - compliance_data['driving_time_hours']
        )
        
        # Create log entries
        current_time = datetime.combine(log_date, time(6, 0))  # Start at 6 AM
        
        # 1. Pickup (On Duty - Not Driving)
        pickup_end = current_time + timedelta(hours=self.PICKUP_DROPOFF_TIME)
        LogEntry.objects.create(
            daily_log=daily_log,
            duty_status='on_duty_not_driving',
            start_time=current_time.time(),
            end_time=pickup_end.time(),
            location=route.pickup_location,
            remarks='Loading and pickup',
            total_hours=self.PICKUP_DROPOFF_TIME
        )
        current_time = pickup_end
        
        # 2. Check if break needed during driving
        driving_time = compliance_data['driving_time_hours']
        if driving_time > 8:
            # Drive for 8 hours first
            drive_first_end = current_time + timedelta(hours=8)
            LogEntry.objects.create(
                daily_log=daily_log,
                duty_status='driving',
                start_time=current_time.time(),
                end_time=drive_first_end.time(),
                location='En Route',
                remarks='Driving to required break',
                total_hours=8
            )
            current_time = drive_first_end
            
            # Required 30-minute break
            break_end = current_time + timedelta(minutes=30)
            LogEntry.objects.create(
                daily_log=daily_log,
                duty_status='off_duty',
                start_time=current_time.time(),
                end_time=break_end.time(),
                location='Rest Area',
                remarks='Required 30-minute break',
                total_hours=0.5
            )
            current_time = break_end
            
            # Remaining driving time
            remaining_drive = driving_time - 8
            if remaining_drive > 0:
                drive_final_end = current_time + timedelta(hours=remaining_drive)
                LogEntry.objects.create(
                    daily_log=daily_log,
                    duty_status='driving',
                    start_time=current_time.time(),
                    end_time=drive_final_end.time(),
                    location='En Route',
                    remarks='Driving to destination',
                    total_hours=remaining_drive
                )
                current_time = drive_final_end
        else:
            # No break needed - straight driving
            drive_end = current_time + timedelta(hours=driving_time)
            LogEntry.objects.create(
                daily_log=daily_log,
                duty_status='driving',
                start_time=current_time.time(),
                end_time=drive_end.time(),
                location='En Route',
                remarks='Driving to destination',
                total_hours=driving_time
            )
            current_time = drive_end
        
        # 3. Dropoff (On Duty - Not Driving)
        dropoff_end = current_time + timedelta(hours=self.PICKUP_DROPOFF_TIME)
        LogEntry.objects.create(
            daily_log=daily_log,
            duty_status='on_duty_not_driving',
            start_time=current_time.time(),
            end_time=dropoff_end.time(),
            location=route.dropoff_location,
            remarks='Unloading and delivery',
            total_hours=self.PICKUP_DROPOFF_TIME
        )
        current_time = dropoff_end
        
        # 4. Off duty for remainder of day
        end_of_day = datetime.combine(log_date, time(23, 59))
        if current_time < end_of_day:
            LogEntry.objects.create(
                daily_log=daily_log,
                duty_status='off_duty',
                start_time=current_time.time(),
                end_time=end_of_day.time(),
                location=route.dropoff_location,
                remarks='End of duty',
                total_hours=(end_of_day - current_time).total_seconds() / 3600
            )
        
        return daily_log
    
    def _create_multi_day_logs(self, route, compliance_data):
        """Create logs for multi-day trip"""
        total_driving = compliance_data['driving_time_hours']
        daily_logs = []
        
        # Calculate how many days needed
        max_daily_driving = 11
        days_needed = math.ceil(total_driving / max_daily_driving)
        
        for day in range(days_needed):
            log_date = datetime.now().date() + timedelta(days=day)
            
            # Calculate driving time for this day
            remaining_driving = total_driving - (day * max_daily_driving)
            daily_driving = min(max_daily_driving, remaining_driving)
            
            if daily_driving <= 0:
                break
                
            # Create daily log
            daily_log = DailyLog.objects.create(
                route=route,
                log_date=log_date,
                total_miles=int(compliance_data['distance_miles'] / days_needed),
                driving_hours=daily_driving,
                on_duty_hours=daily_driving + 2  # Add pickup/dropoff time
            )
            
            # Create entries for this day
            current_time = datetime.combine(log_date, time(6, 0))
            
            if day == 0:
                # First day - include pickup
                pickup_end = current_time + timedelta(hours=self.PICKUP_DROPOFF_TIME)
                LogEntry.objects.create(
                    daily_log=daily_log,
                    duty_status='on_duty_not_driving',
                    start_time=current_time.time(),
                    end_time=pickup_end.time(),
                    location=route.pickup_location,
                    remarks='Loading and pickup',
                    total_hours=self.PICKUP_DROPOFF_TIME
                )
                current_time = pickup_end
            
            # Driving time (with break if needed)
            if daily_driving > 8:
                # Drive 8 hours, break, drive remainder
                drive_first_end = current_time + timedelta(hours=8)
                LogEntry.objects.create(
                    daily_log=daily_log,
                    duty_status='driving',
                    start_time=current_time.time(),
                    end_time=drive_first_end.time(),
                    location='En Route',
                    remarks=f'Driving - Day {day + 1}',
                    total_hours=8
                )
                current_time = drive_first_end
                
                # Break
                break_end = current_time + timedelta(minutes=30)
                LogEntry.objects.create(
                    daily_log=daily_log,
                    duty_status='off_duty',
                    start_time=current_time.time(),
                    end_time=break_end.time(),
                    location='Rest Area',
                    remarks='Required 30-minute break',
                    total_hours=0.5
                )
                current_time = break_end
                
                # Remaining driving
                remaining = daily_driving - 8
                drive_final_end = current_time + timedelta(hours=remaining)
                LogEntry.objects.create(
                    daily_log=daily_log,
                    duty_status='driving',
                    start_time=current_time.time(),
                    end_time=drive_final_end.time(),
                    location='En Route',
                    remarks=f'Driving - Day {day + 1} continued',
                    total_hours=remaining
                )
                current_time = drive_final_end
            else:
                # Straight driving
                drive_end = current_time + timedelta(hours=daily_driving)
                LogEntry.objects.create(
                    daily_log=daily_log,
                    duty_status='driving',
                    start_time=current_time.time(),
                    end_time=drive_end.time(),
                    location='En Route',
                    remarks=f'Driving - Day {day + 1}',
                    total_hours=daily_driving
                )
                current_time = drive_end
            
            if day == days_needed - 1:
                # Last day - include dropoff
                dropoff_end = current_time + timedelta(hours=self.PICKUP_DROPOFF_TIME)
                LogEntry.objects.create(
                    daily_log=daily_log,
                    duty_status='on_duty_not_driving',
                    start_time=current_time.time(),
                    end_time=dropoff_end.time(),
                    location=route.dropoff_location,
                    remarks='Unloading and delivery',
                    total_hours=self.PICKUP_DROPOFF_TIME
                )
                current_time = dropoff_end
            
            # Off duty for remainder of day
            end_of_day = datetime.combine(log_date, time(23, 59))
            if current_time < end_of_day:
                LogEntry.objects.create(
                    daily_log=daily_log,
                    duty_status='off_duty',
                    start_time=current_time.time(),
                    end_time=end_of_day.time(),
                    location='Rest Stop' if day < days_needed - 1 else route.dropoff_location,
                    remarks='10-hour off duty rest' if day < days_needed - 1 else 'End of duty',
                    total_hours=(end_of_day - current_time).total_seconds() / 3600
                )
            
            daily_logs.append(daily_log)
        
        return daily_logs
