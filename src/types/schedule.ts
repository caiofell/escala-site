export interface Employee {
  id: string;
  name: string;
}

export interface ShiftTime {
  meal: string;
  interval: string;
}

export interface StationShift {
  station: string;
  employee: Employee | null;
  shiftTime: ShiftTime;
}

export interface DailySchedule {
  date: Date;
  shifts: StationShift[];
}