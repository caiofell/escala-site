import React, { useState } from "react";
import { StationShift, Employee } from "@/types/schedule";
import { generateSchedule, STATIONS, SHIFT_TIMES, EMPLOYEES } from "@/utils/scheduleUtils";
import { toast } from "sonner";
import { ScheduleControls } from "./schedule/ScheduleControls";
import { EmployeeForm } from "./schedule/EmployeeForm";
import { ScheduleTable } from "./schedule/ScheduleTable";

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
        <ScheduleControls
          onGenerateSchedule={handleGenerateSchedule}
          date={date}
        />

        <EmployeeForm
          selectedStation={selectedStation}
          selectedEmployee={selectedEmployee}
          selectedShiftTime={selectedShiftTime}
          showNewEmployeeInput={showNewEmployeeInput}
          newEmployeeName={newEmployeeName}
          availableEmployees={getAvailableEmployees()}
          onStationChange={setSelectedStation}
          onEmployeeChange={setSelectedEmployee}
          onShiftTimeChange={setSelectedShiftTime}
          onNewEmployeeNameChange={setNewEmployeeName}
          onCancelNewEmployee={() => {
            setShowNewEmployeeInput(false);
            setNewEmployeeName("");
          }}
          onAddEmployee={addEmployee}
          getAvailableShiftTimes={getAvailableShiftTimes}
        />
      </div>

      <div className="overflow-x-auto">
        <ScheduleTable
          date={date}
          schedule={schedule}
          onRemoveEmployee={removeEmployee}
        />
      </div>
    </div>
  );
};