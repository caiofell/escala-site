
import { Employee, StationShift } from "@/types/schedule";

export const STATIONS = [
  "EMERGÊNCIA",
  "CENTRO CIRÚRGICO",
  "CORREDOR",
  "TOMOGRAFIA",
  "COBERTURA",
] as const;

export const SHIFT_TIMES: Record<string, { meal: string; interval: string }[]> = {
  "EMERGÊNCIA": [
    { meal: "21:00", interval: "00:00 AS 02:00" },
    { meal: "21:30", interval: "02:00 AS 04:00" },
    { meal: "22:00", interval: "04:00 AS 06:00" },
  ],
  "CENTRO CIRÚRGICO": [
    { meal: "21:00", interval: "00:00 AS 02:00" },
    { meal: "21:30", interval: "02:00 AS 04:00" },
  ],
  "CORREDOR": [
    { meal: "21:00", interval: "01:00 AS 03:00" },
    { meal: "21:30", interval: "03:00 AS 05:00" },
  ],
  "TOMOGRAFIA": [
    { meal: "21:00", interval: "04:00 AS 06:00" },
  ],
  "COBERTURA": [
    { meal: "21:00", interval: "00:00 AS 02:00" },
    { meal: "21:30", interval: "02:00 AS 04:00" },
    { meal: "22:00", interval: "04:00 AS 06:00" },
  ],
};

// Local storage keys
const SCHEDULE_STORAGE_KEY = 'schedule_data';
const SCHEDULE_DATE_KEY = 'schedule_date';

// Function to save schedule to local storage
export function saveScheduleToStorage(schedule: StationShift[], date: Date): void {
  try {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
    localStorage.setItem(SCHEDULE_DATE_KEY, date.toISOString());
  } catch (error) {
    console.error('Error saving schedule to local storage:', error);
  }
}

// Function to load schedule from local storage
export function loadScheduleFromStorage(): { schedule: StationShift[] | null, date: Date | null } {
  try {
    const scheduleData = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    const dateData = localStorage.getItem(SCHEDULE_DATE_KEY);
    
    if (!scheduleData || !dateData) {
      return { schedule: null, date: null };
    }
    
    return { 
      schedule: JSON.parse(scheduleData),
      date: new Date(dateData)
    };
  } catch (error) {
    console.error('Error loading schedule from local storage:', error);
    return { schedule: null, date: null };
  }
}

// Get the next station in the rotation
function getNextStation(currentStation: string): string {
  const stationIndex = STATIONS.indexOf(currentStation as any);
  // If current station is the last one or not found, start from the beginning
  if (stationIndex === -1 || stationIndex === STATIONS.length - 1) {
    return STATIONS[0];
  }
  return STATIONS[stationIndex + 1];
}

// Find an available shift time that doesn't match the given one
function findDifferentShiftTime(station: string, currentMeal: string, currentInterval: string): { meal: string, interval: string } | null {
  const availableTimes = SHIFT_TIMES[station];
  
  // First try to find a time with a different meal and interval
  for (const time of availableTimes) {
    if (time.meal !== currentMeal && time.interval !== currentInterval) {
      return time;
    }
  }
  
  // If not found, at least find one with different meal
  for (const time of availableTimes) {
    if (time.meal !== currentMeal) {
      return time;
    }
  }
  
  // If still not found, get any available time
  return availableTimes[0] || null;
}

export function generateSchedule(employees: Employee[], previousSchedule?: StationShift[]): StationShift[] {
  const availableEmployees = [...employees].filter(emp => emp.active);
  const schedule: StationShift[] = [];
  
  // Determine employee positioning based on previous schedule
  const employeeAssignments: Map<string, { station: string, shiftTime: { meal: string, interval: string } }> = new Map();
  
  // Map previous employee positions to determine next station
  if (previousSchedule && previousSchedule.length > 0) {
    previousSchedule.forEach(shift => {
      if (shift.employee) {
        const nextStation = getNextStation(shift.station);
        employeeAssignments.set(shift.employee.id, {
          station: nextStation,
          shiftTime: shift.shiftTime
        });
      }
    });
  }
  
  // First, try to place employees according to the rotation logic
  const placedEmployeeIds: string[] = [];
  
  // Place employees based on rotation first
  for (const employee of availableEmployees) {
    const previousAssignment = employeeAssignments.get(employee.id);
    
    if (previousAssignment) {
      const { station, shiftTime } = previousAssignment;
      
      // Skip COBERTURA in the initial assignments - handle them later
      if (station === "COBERTURA") {
        continue;
      }
      
      // Check if station already has a shift with this time
      const stationTimes = SHIFT_TIMES[station];
      const stationShifts = schedule.filter(s => s.station === station);
      
      // Check if there's space in the station for this employee
      if (stationShifts.length < stationTimes.length) {
        // Check if the same shift time is already occupied
        const sameTimeOccupied = stationShifts.some(
          s => s.shiftTime.meal === shiftTime.meal && s.shiftTime.interval === shiftTime.interval
        );
        
        if (!sameTimeOccupied) {
          // Place employee in their rotation position with the same shift time
          schedule.push({
            station,
            employee,
            shiftTime,
          });
          placedEmployeeIds.push(employee.id);
          continue;
        }
        
        // Try to find a different time in the same station
        const differentTime = findDifferentShiftTime(station, shiftTime.meal, shiftTime.interval);
        
        if (differentTime) {
          // Check if this new time is also occupied
          const newTimeOccupied = stationShifts.some(
            s => s.shiftTime.meal === differentTime.meal && s.shiftTime.interval === differentTime.interval
          );
          
          if (!newTimeOccupied) {
            schedule.push({
              station,
              employee,
              shiftTime: differentTime,
            });
            placedEmployeeIds.push(employee.id);
            continue;
          }
        }
      }
    }
  }
  
  // Fill in regular stations in order, for remaining spots
  for (const station of STATIONS) {
    if (station === "COBERTURA") continue; // Skip COBERTURA for now
    
    const stationTimes = SHIFT_TIMES[station];
    const scheduledTimes = schedule
      .filter(s => s.station === station)
      .map(s => `${s.shiftTime.meal}-${s.shiftTime.interval}`);
    
    // Identify available times for this station
    const availableTimes = stationTimes.filter(
      time => !scheduledTimes.includes(`${time.meal}-${time.interval}`)
    );
    
    // Fill remaining spots in this station with available employees
    for (const time of availableTimes) {
      const availableEmployeeIndex = availableEmployees.findIndex(
        emp => !placedEmployeeIds.includes(emp.id)
      );
      
      if (availableEmployeeIndex >= 0) {
        const employee = availableEmployees[availableEmployeeIndex];
        schedule.push({
          station,
          employee,
          shiftTime: time,
        });
        placedEmployeeIds.push(employee.id);
      }
    }
  }
  
  // Now place remaining employees in COBERTURA
  const remainingEmployees = availableEmployees.filter(
    emp => !placedEmployeeIds.includes(emp.id)
  );
  
  // Create a rotation of shift times for COBERTURA
  const coverageShiftTimes = SHIFT_TIMES["COBERTURA"];
  let shiftIndex = 0;
  
  for (const employee of remainingEmployees) {
    // Get the next coverage shift time in rotation
    const shiftTime = coverageShiftTimes[shiftIndex % coverageShiftTimes.length];
    
    schedule.push({
      station: "COBERTURA",
      employee,
      shiftTime,
    });
    
    shiftIndex++;
  }
  
  return schedule;
}
