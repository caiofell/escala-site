
import { useState, useEffect } from "react";
import { Employee } from "@/types/schedule";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showNewEmployeeInput, setShowNewEmployeeInput] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedShiftTime, setSelectedShiftTime] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) {
        console.error("Erro ao buscar funcionários:", error);
        toast.error("Erro ao carregar funcionários");
        return;
      }

      setEmployees(data || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedStation("");
    setSelectedEmployee("");
    setSelectedShiftTime("");
    setNewEmployeeName("");
    setShowNewEmployeeInput(false);
  };

  return {
    employees,
    showNewEmployeeInput,
    newEmployeeName,
    selectedStation,
    selectedEmployee,
    selectedShiftTime,
    loading,
    setShowNewEmployeeInput,
    setNewEmployeeName,
    setSelectedStation,
    setSelectedEmployee,
    setSelectedShiftTime,
    fetchEmployees,
    resetForm
  };
};
