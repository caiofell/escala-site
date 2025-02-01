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

  useEffect(() => {
    fetchEmployees();
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
    setShowNewEmployeeInput,
    setNewEmployeeName,
    setSelectedStation,
    setSelectedEmployee,
    setSelectedShiftTime,
    fetchEmployees,
    resetForm
  };
};