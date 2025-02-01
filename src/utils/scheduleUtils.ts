import { Employee, ShiftTime, StationShift } from "@/types/schedule";

export const STATIONS = [
  "EMERGÊNCIA",
  "CENTRO CIRÚRGICO",
  "CORREDOR",
  "TOMOGRAFIA",
  "COBERTURA",
] as const;

export const SHIFT_TIMES: Record<string, ShiftTime[]> = {
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

export function generateSchedule(employees: Employee[], previousSchedule?: StationShift[]): StationShift[] {
  const availableEmployees = [...employees];
  const schedule: StationShift[] = [];

  STATIONS.forEach((station) => {
    const stationTimes = SHIFT_TIMES[station];
    stationTimes.forEach((shiftTime) => {
      if (availableEmployees.length === 0) return;

      const validEmployees = availableEmployees.filter((emp) => {
        if (!previousSchedule) return true;
        const prevShift = previousSchedule.find(
          (shift) =>
            shift.employee?.id === emp.id &&
            (shift.station === station || shift.shiftTime.meal === shiftTime.meal)
        );
        return !prevShift;
      });

      if (validEmployees.length === 0) return;

      const randomIndex = Math.floor(Math.random() * validEmployees.length);
      const employee = validEmployees[randomIndex];
      const employeeIndex = availableEmployees.findIndex(
        (emp) => emp.id === employee.id
      );
      availableEmployees.splice(employeeIndex, 1);

      schedule.push({
        station,
        employee,
        shiftTime,
      });
    });
  });

  return schedule;
}