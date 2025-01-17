import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StationShift, Employee } from "@/types/schedule";
import { generateSchedule, STATIONS, SHIFT_TIMES } from "@/utils/scheduleUtils";
import { toast } from "sonner";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

export const Schedule: React.FC = () => {
  const [schedule, setSchedule] = useState<StationShift[]>([]);
  const [date] = useState(new Date());
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [newEmployeeName, setNewEmployeeName] = useState("");

  const handleGenerateSchedule = () => {
    const newSchedule = generateSchedule(schedule);
    setSchedule(newSchedule);
    toast.success("Nova escala gerada com sucesso!");
  };

  const handleExportPDF = () => {
    const element = document.getElementById("schedule-table");
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `escala-${date.toLocaleDateString()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
    };

    html2pdf().set(opt).from(element).save();
    toast.success("PDF exportado com sucesso!");
  };

  const removeEmployee = (stationIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[stationIndex].employee = null;
    setSchedule(newSchedule);
    toast.success("Funcionário removido da escala!");
  };

  const addEmployee = () => {
    if (!selectedStation || !newEmployeeName.trim()) {
      toast.error("Por favor, selecione um posto e digite o nome do funcionário");
      return;
    }

    const stationTimes = SHIFT_TIMES[selectedStation];
    if (!stationTimes || stationTimes.length === 0) {
      toast.error("Posto inválido");
      return;
    }

    // Find first available shift time for the selected station
    const availableShiftTime = stationTimes[0];
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: newEmployeeName.trim().toUpperCase(),
    };

    const newShift: StationShift = {
      station: selectedStation,
      employee: newEmployee,
      shiftTime: availableShiftTime,
    };

    setSchedule([...schedule, newShift]);
    setNewEmployeeName("");
    setSelectedStation("");
    toast.success("Funcionário adicionado com sucesso!");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <Button onClick={handleGenerateSchedule}>Gerar Nova Escala</Button>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Select
              value={selectedStation}
              onValueChange={setSelectedStation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o posto" />
              </SelectTrigger>
              <SelectContent>
                {STATIONS.map((station) => (
                  <SelectItem key={station} value={station}>
                    {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Nome do funcionário"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
            />
          </div>
          <Button onClick={addEmployee}>Adicionar Funcionário</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table id="schedule-table" className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th colSpan={4} className="bg-navy text-white p-2 text-center border border-gray-300">
                {date.toLocaleDateString()}
              </th>
            </tr>
          </thead>
          <tbody>
            {STATIONS.map((station, stationIndex) => (
              <tr key={station}>
                <td className="bg-navy text-white p-2 border border-gray-300 w-1/5">
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
                      className="p-2 border border-gray-300 text-center"
                    >
                      {shift?.employee && (
                        <div className="flex flex-col items-center">
                          <span className="font-bold">{shift.employee.name}</span>
                          <span className={getMealTimeColor(shift.shiftTime.meal)}>
                            JANTA {shift.shiftTime.meal}
                          </span>
                          <span>INTERVALO {shift.shiftTime.interval}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1"
                            onClick={() => removeEmployee(schedule.indexOf(shift))}
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
              <td colSpan={4} className="p-2 border border-gray-300 text-center text-sm">
                TODOS MAQUEIROS SÃO COBERTURA E ATENDEM CONFORME NECESSIDADE DO SETOR, PORTANDO DEVE-SE
                UTILIZAR EM TODOS OS LOCAIS O RÁDIO COMUNICADOR.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};