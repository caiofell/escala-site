import { useState } from "react";
import { StationShift, Employee } from "@/types/schedule";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSchedule } from "@/utils/scheduleUtils";

export const useScheduleManagement = () => {
  const [schedule, setSchedule] = useState<StationShift[]>([]);

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

  const handleGenerateSchedule = async (employees: Employee[]) => {
    const newSchedule = generateSchedule(employees, schedule);
    setSchedule(newSchedule);
    await logSchedule(newSchedule);
    toast.success("Nova escala gerada com sucesso!");
  };

  return {
    schedule,
    setSchedule,
    logSchedule,
    handleGenerateSchedule
  };
};