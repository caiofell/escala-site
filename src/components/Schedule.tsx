import React, { useState, useEffect } from "react";
import { StationShift, Employee } from "@/types/schedule";
import { generateSchedule, STATIONS, SHIFT_TIMES } from "@/utils/scheduleUtils";
import { toast } from "sonner";
import { ScheduleControls } from "./schedule/ScheduleControls";
import { EmployeeForm } from "./schedule/EmployeeForm";
import { ScheduleTable } from "./schedule/ScheduleTable";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export const Schedule: React.FC = () => {
  const [schedule, setSchedule] = useState<StationShift[]>([]);
  const [date] = useState(new Date());
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedShiftTime, setSelectedShiftTime] = useState<string>("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [showNewEmployeeInput, setShowNewEmployeeInput] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [canGenerateSchedule, setCanGenerateSchedule] = useState(true);

  useEffect(() => {
    fetchEmployees();
    checkDailySchedule();
    fetchTodaySchedule();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) {
      toast.error("Erro ao carregar funcionários");
      return;
    }

    setEmployees(data || []);
  };

  const checkDailySchedule = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("daily_schedule")
      .select("*")
      .gte("created_at", today.toISOString())
      .lt("created_at", new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      toast.error("Erro ao verificar escala do dia");
      return;
    }

    setCanGenerateSchedule(!data || data.length === 0);
  };

  const fetchTodaySchedule = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: scheduleData } = await supabase
      .from("schedule_logs")
      .select("*")
      .gte("created_at", today.toISOString())
      .lt("created_at", new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (scheduleData && scheduleData.length > 0) {
      const formattedSchedule = scheduleData.map(log => ({
        station: log.station,
        employee: { id: "", name: log.employee_name },
        shiftTime: { meal: log.meal_time, interval: log.interval_time },
      }));
      setSchedule(formattedSchedule);
    }
  };

  const logSchedule = async (scheduleData: StationShift[]) => {
    const logs = scheduleData.map((shift) => ({
      station: shift.station,
      employee_name: shift.employee?.name || "",
      meal_time: shift.shiftTime.meal,
      interval_time: shift.shiftTime.interval,
    }));

    const { error: logsError } = await supabase.from("schedule_logs").insert(logs);
    
    if (logsError) {
      console.error("Error logging schedule:", logsError);
      toast.error("Erro ao salvar o log da escala");
      return;
    }

    const { error: scheduleError } = await supabase.from("daily_schedule").insert([
      { created_by: (await supabase.auth.getUser()).data.user?.email }
    ]);

    if (scheduleError) {
      console.error("Error creating daily schedule:", scheduleError);
      toast.error("Erro ao criar escala diária");
      return;
    }
  };

  const handleGenerateSchedule = async () => {
    if (!canGenerateSchedule) {
      toast.error("Já existe uma escala gerada para hoje");
      return;
    }

    const newSchedule = generateSchedule(employees, schedule);
    setSchedule(newSchedule);
    await logSchedule(newSchedule);
    setCanGenerateSchedule(false);
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
    return employees.filter(emp => !scheduledEmployeeIds.includes(emp.id));
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
    
    setSelectedStation("");
    setSelectedEmployee("");
    setSelectedShiftTime("");
    setNewEmployeeName("");
    setShowNewEmployeeInput(false);
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
          onGenerateSchedule={handleGenerateSchedule}
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