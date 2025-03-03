
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

export function generateSchedule(employees: Employee[], previousSchedule?: StationShift[]): StationShift[] {
  const availableEmployees = [...employees].filter(emp => emp.active);
  const schedule: StationShift[] = [];

  // Primeiro, preencher todos os postos exceto COBERTURA
  STATIONS.forEach(station => {
    if (station !== "COBERTURA") {
      const stationTimes = SHIFT_TIMES[station];
      stationTimes.forEach(shiftTime => {
        if (availableEmployees.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableEmployees.length);
        const employee = availableEmployees[randomIndex];
        
        schedule.push({
          station,
          employee,
          shiftTime,
        });
        
        availableEmployees.splice(randomIndex, 1);
      });
    }
  });

  // Depois, distribuir os funcionários restantes na COBERTURA
  // Criando um sistema de rotação para os horários de intervalo e jantar
  const coverageShiftTimes = SHIFT_TIMES["COBERTURA"];
  let shiftIndex = 0;
  
  while (availableEmployees.length > 0) {
    // Obtém o próximo horário de intervalo/jantar na sequência, com rotação
    const shiftTime = coverageShiftTimes[shiftIndex % coverageShiftTimes.length];
    
    const randomEmployeeIndex = Math.floor(Math.random() * availableEmployees.length);
    const employee = availableEmployees[randomEmployeeIndex];
    
    schedule.push({
      station: "COBERTURA",
      employee,
      shiftTime,
    });
    
    availableEmployees.splice(randomEmployeeIndex, 1);
    shiftIndex++; // Avança para o próximo horário na rotação
  }

  return schedule;
}
