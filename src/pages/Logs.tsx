import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Logs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["schedule-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Histórico de Escalas</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-navy text-white">
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Posto</th>
              <th className="p-2 text-left">Funcionário</th>
              <th className="p-2 text-left">Horário Janta</th>
              <th className="p-2 text-left">Horário Intervalo</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-t border-gray-300 hover:bg-gray-50">
                <td className="p-2">
                  {format(new Date(log.created_at!), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </td>
                <td className="p-2">{log.station}</td>
                <td className="p-2">{log.employee_name}</td>
                <td className="p-2">{log.meal_time}</td>
                <td className="p-2">{log.interval_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;