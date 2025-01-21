import React from "react";
import { Button } from "@/components/ui/button";
import { StationShift } from "@/types/schedule";
import { STATIONS, SHIFT_TIMES } from "@/utils/scheduleUtils";

interface ScheduleTableProps {
  date: Date;
  schedule: StationShift[];
  onRemoveEmployee: (index: number) => void;
}

const getMealTimeColor = (time: string) => {
  switch (time) {
    case "21:00":
      return "text-schedule-green";
    case "21:30":
      return "text-schedule-purple";
    case "22:00":
      return "text-schedule-red";
    default:
      return "text-black";
  }
};

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  date,
  schedule,
  onRemoveEmployee,
}) => {
  return (
    <table id="schedule-table" className="w-full border-collapse border border-gray-300 text-sm">
      <thead>
        <tr>
          <th colSpan={4} className="bg-navy text-white p-1 text-center border border-gray-300 text-xs">
            {date.toLocaleDateString()}
          </th>
        </tr>
      </thead>
      <tbody>
        {STATIONS.map((station) => (
          <tr key={station}>
            <td className="bg-navy text-white p-1 border border-gray-300 w-1/5 text-xs">
              {station}
            </td>
            {SHIFT_TIMES[station].map((time, timeIndex) => {
              const shift = schedule.find(
                (s) =>
                  s.station === station &&
                  s.shiftTime.meal === time.meal &&
                  s.shiftTime.interval === time.interval
              );

              return (
                <td
                  key={`${station}-${timeIndex}`}
                  className="p-1 border border-gray-300 text-center"
                >
                  {shift?.employee && (
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-xs">{shift.employee.name}</span>
                      <span className={`${getMealTimeColor(shift.shiftTime.meal)} text-xs`}>
                        JANTA {shift.shiftTime.meal}
                      </span>
                      <span className="text-xs">INTERVALO {shift.shiftTime.interval}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-xs"
                        onClick={() => onRemoveEmployee(schedule.indexOf(shift))}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4} className="p-1 border border-gray-300 text-center text-[10px]">
            TODOS MAQUEIROS SÃO COBERTURA E ATENDEM CONFORME NECESSIDADE DO SETOR, PORTANDO DEVE-SE
            UTILIZAR EM TODOS OS LOCAIS O RÁDIO COMUNICADOR.
          </td>
        </tr>
      </tfoot>
    </table>
  );
};