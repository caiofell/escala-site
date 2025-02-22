
import { useState } from "react";
import { StationShift, Employee } from "@/types/schedule";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSchedule } from "@/utils/scheduleUtils";

export const useScheduleManagement = () => {
  const [schedule, setSchedule] = useState<StationShift[]>([]);
  const [loading, setLoading] = useState(false);

  const logSchedule = async (scheduleData: StationShift[]) => {
    try {
      const logs = scheduleData.map((shift) => ({
        station: shift.station,
        employee_name: shift.employee?.name || "",
        meal_time: shift.shiftTime.meal,
        interval_time: shift.shiftTime.interval,
      }));

      const { error: logsError } = await supabase
        .from("schedule_logs")
        .insert(logs);
      
      if (logsError) {
        console.error("Erro ao salvar logs:", logsError);
        throw new Error("Erro ao salvar o log da escala");
      }

      const { error: scheduleError } = await supabase
        .from("daily_schedule")
        .insert([{ created_by: (await supabase.auth.getUser()).data.user?.email }]);

      if (scheduleError) {
        console.error("Erro ao criar escala:", scheduleError);
        throw new Error("Erro ao criar escala diária");
      }
    } catch (error) {
      console.error("Erro ao salvar escala:", error);
      throw error;
    }
  };

  const handleGenerateSchedule = async (employees: Employee[]) => {
    try {
      setLoading(true);
      const newSchedule = generateSchedule(employees, schedule);
      setSchedule(newSchedule);
      await logSchedule(newSchedule);
      toast.success("Nova escala gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar escala:", error);
      toast.error("Erro ao gerar nova escala");
    } finally {
      setLoading(false);
    }
  };

  return {
    schedule,
    loading,
    setSchedule,
    logSchedule,
    handleGenerateSchedule
  };
};
