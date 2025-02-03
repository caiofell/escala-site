import { useState, useEffect } from "react";
import { StationShift, Employee } from "@/types/schedule";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSchedule } from "@/utils/scheduleUtils";

export const useScheduleManagement = () => {
  const [schedule, setSchedule] = useState<StationShift[]>([]);
  const [canGenerateSchedule, setCanGenerateSchedule] = useState(true);

  useEffect(() => {
    checkDailySchedule();
    fetchTodaySchedule();
  }, []);

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

  const handleGenerateSchedule = async (employees: Employee[]) => {
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

  return {
    schedule,
    setSchedule,
    canGenerateSchedule,
    logSchedule,
    handleGenerateSchedule
  };
};