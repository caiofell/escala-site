import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StationShift, Employee } from "@/types/schedule";
import { generateSchedule, STATIONS, SHIFT_TIMES, EMPLOYEES } from "@/utils/scheduleUtils";
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
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedShiftTime, setSelectedShiftTime] = useState<string>("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [showNewEmployeeInput, setShowNewEmployeeInput] = useState(false);

  const handleGenerateSchedule = () => {
    const newSchedule = generateSchedule(schedule);
    setSchedule(newSchedule);
    toast.success("Nova escala gerada com sucesso!");
  };

  const handleExportPDF = () => {
    const element = document.getElementById("schedule-table");
    if (!element) return;

    const opt = {
      margin: 0.3,
      filename: `escala-${date.toLocaleDateString()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 1,
        letterRendering: true,
        useCORS: true
      },
      jsPDF: { 
        unit: "in", 
        format: "a4", 
        orientation: "landscape",
        compress: true,
        hotfixes: ["px_scaling"]
      }
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

  const getAvailableEmployees = () => {
    const scheduledEmployeeIds = schedule.map(s => s.employee?.id).filter(Boolean);
    return EMPLOYEES.filter(emp => !scheduledEmployeeIds.includes(emp.id));
  };

  const getAvailableShiftTimes = (station: string) => {
    if (!station) return [];
    const usedTimes = schedule
      .filter(s => s.station === station)
      .map(s => `${s.shiftTime.meal}-${s.shiftTime.interval}`);
    
    return SHIFT_TIMES[station].filter(time => 
      !usedTimes.includes(`${time.meal}-${time.interval}`)
    );
  };

  const addEmployee = () => {
    if (!selectedStation || (!selectedEmployee && !newEmployeeName) || !selectedShiftTime) {
      toast.error("Por favor, preencha todos os campos necessários");
      return;
    }

    const [meal, interval] = selectedShiftTime.split('-');
    const shiftTime = {
      meal,
      interval
    };

    let employee: Employee;
    if (showNewEmployeeInput) {
      if (!newEmployeeName.trim()) {
        toast.error("Digite o nome do novo funcionário");
        return;
      }
      employee = {
        id: Date.now().toString(),
        name: newEmployeeName.trim().toUpperCase(),
      };
    } else {
      const selectedEmp = EMPLOYEES.find(emp => emp.id === selectedEmployee);
      if (!selectedEmp) {
        toast.error("Funcionário não encontrado");
        return;
      }
      employee = selectedEmp;
    }

    const newShift: StationShift = {
      station: selectedStation,
      employee,
      shiftTime,
    };

    setSchedule([...schedule, newShift]);
    setSelectedStation("");
    setSelectedEmployee("");
    setSelectedShiftTime("");
    setNewEmployeeName("");
    setShowNewEmployeeInput(false);
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
            <Select value={selectedStation} onValueChange={(value) => {
              setSelectedStation(value);
              setSelectedShiftTime("");
            }}>
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

          {selectedStation && (
            <div className="flex-1">
              <Select value={selectedShiftTime} onValueChange={setSelectedShiftTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableShiftTimes(selectedStation).map((time) => (
                    <SelectItem 
                      key={`${time.meal}-${time.interval}`} 
                      value={`${time.meal}-${time.interval}`}
                    >
                      {`Janta ${time.meal} - Intervalo ${time.interval}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex-1">
            {!showNewEmployeeInput ? (
              <Select 
                value={selectedEmployee} 
                onValueChange={(value) => {
                  if (value === "new") {
                    setShowNewEmployeeInput(true);
                    setSelectedEmployee("");
                  } else {
                    setSelectedEmployee(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableEmployees().map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Adicionar novo funcionário</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Nome do novo funcionário"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewEmployeeInput(false);
                    setNewEmployeeName("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
          <Button onClick={addEmployee}>Adicionar Funcionário</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
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
              <td colSpan={4} className="p-1 border border-gray-300 text-center text-[10px]">
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