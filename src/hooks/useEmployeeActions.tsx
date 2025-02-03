import { Employee, StationShift } from "@/types/schedule";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEmployeeActions = (
  schedule: StationShift[],
  setSchedule: (schedule: StationShift[]) => void,
  logSchedule: (scheduleData: StationShift[]) => Promise<void>
) => {
  const removeEmployee = (stationIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[stationIndex].employee = null;
    setSchedule(newSchedule);
    toast.success("Funcionário removido da escala!");
  };

  const getAvailableEmployees = (employees: Employee[]) => {
    const scheduledEmployeeIds = schedule.map(s => s.employee?.id).filter(Boolean);
    return employees.filter(emp => !scheduledEmployeeIds.includes(emp.id) && emp.active);
  };

  const getAvailableShiftTimes = (station: string, SHIFT_TIMES: any) => {
    if (!station) return [];
    const usedTimes = schedule
      .filter(s => s.station === station)
      .map(s => `${s.shiftTime.meal}-${s.shiftTime.interval}`);
    
    return SHIFT_TIMES[station].filter((time: any) => 
      !usedTimes.includes(`${time.meal}-${time.interval}`)
    );
  };

  const addEmployee = async (
    selectedStation: string,
    selectedEmployee: string,
    selectedShiftTime: string,
    showNewEmployeeInput: boolean,
    newEmployeeName: string,
    employees: Employee[],
    resetForm: () => void
  ) => {
    if (!selectedStation || (!selectedEmployee && !newEmployeeName) || !selectedShiftTime) {
      toast.error("Por favor, preencha todos os campos necessários");
      return;
    }

    const [meal, interval] = selectedShiftTime.split('-');
    const shiftTime = { meal, interval };

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

  return {
    removeEmployee,
    getAvailableEmployees,
    getAvailableShiftTimes,
    addEmployee
  };
};