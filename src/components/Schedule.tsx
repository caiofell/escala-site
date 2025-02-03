import React, { useState } from "react";
import { StationShift, Employee } from "@/types/schedule";
import { generateSchedule, STATIONS, SHIFT_TIMES } from "@/utils/scheduleUtils";
import { toast } from "sonner";
import { ScheduleControls } from "./schedule/ScheduleControls";
import { EmployeeForm } from "./schedule/EmployeeForm";
import { ScheduleTable } from "./schedule/ScheduleTable";
import { Link } from "react-router-dom";
import { useScheduleManagement } from "@/hooks/useScheduleManagement";
import { useEmployeeManagement } from "@/hooks/useEmployeeManagement";
import { supabase } from "@/integrations/supabase/client";

export const Schedule: React.FC = () => {
  const [date] = useState(new Date());
  const {
    schedule,
    setSchedule,
    canGenerateSchedule,
    logSchedule,
    handleGenerateSchedule
  } = useScheduleManagement();

  const {
    employees,
    showNewEmployeeInput,
    newEmployeeName,
    selectedStation,
    selectedEmployee,
    selectedShiftTime,
    setShowNewEmployeeInput,
    setNewEmployeeName,
    setSelectedStation,
    setSelectedEmployee,
    setSelectedShiftTime,
    resetForm
  } = useEmployeeManagement();

  const removeEmployee = (stationIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[stationIndex].employee = null;
    setSchedule(newSchedule);
    toast.success("Funcionário removido da escala!");
  };

  const getAvailableEmployees = () => {
    const scheduledEmployeeIds = schedule.map(s => s.employee?.id).filter(Boolean);
    return employees.filter(emp => !scheduledEmployeeIds.includes(emp.id) && emp.active);
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

  const addEmployee = async () => {
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
      const { data, error } = await supabase
        .from("employees")
        .insert([{ name: newEmployeeName.trim().toUpperCase() }])
        .select()
        .single();

      if (error) {
        toast.error("Erro ao adicionar novo funcionário");
        return;
      }
      employee = data;
    } else {
      const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
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

    const newSchedule = [...schedule, newShift];
    setSchedule(newSchedule);
    await logSchedule([newShift]);
    
    resetForm();
    toast.success("Funcionário adicionado com sucesso!");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Escala de Maqueiros</h1>
        <div className="flex gap-4">
          <Link 
            to="/employees" 
            className="text-navy hover:text-navy/80 underline"
          >
            Gerenciar Funcionários
          </Link>
          <Link 
            to="/logs" 
            className="text-navy hover:text-navy/80 underline"
          >
            Ver Histórico
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <ScheduleControls
          onGenerateSchedule={() => handleGenerateSchedule(employees)}
          date={date}
          canGenerateSchedule={canGenerateSchedule}
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