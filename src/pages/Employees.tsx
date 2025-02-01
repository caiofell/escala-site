import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Employee {
  id: string;
  name: string;
  active: boolean;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Erro ao carregar funcionários");
      return;
    }

    setEmployees(data || []);
  };

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;

    const { error } = await supabase
      .from("employees")
      .insert([{ name: newEmployeeName.toUpperCase() }]);

    if (error) {
      toast.error("Erro ao adicionar funcionário");
      return;
    }

    toast.success("Funcionário adicionado com sucesso!");
    setNewEmployeeName("");
    fetchEmployees();
  };

  const toggleEmployeeStatus = async (employee: Employee) => {
    const { error } = await supabase
      .from("employees")
      .update({ active: !employee.active })
      .eq("id", employee.id);

    if (error) {
      toast.error("Erro ao atualizar status do funcionário");
      return;
    }

    toast.success("Status atualizado com sucesso!");
    fetchEmployees();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Funcionários</h1>
        <Link to="/" className="text-navy hover:text-navy/80 underline">
          Voltar para Escala
        </Link>
      </div>

      <form onSubmit={addEmployee} className="mb-8 flex gap-4">
        <Input
          value={newEmployeeName}
          onChange={(e) => setNewEmployeeName(e.target.value)}
          placeholder="Nome do novo funcionário"
          className="flex-1"
        />
        <Button type="submit">Adicionar</Button>
      </form>

      <div className="space-y-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex justify-between items-center p-4 bg-white rounded-lg shadow"
          >
            <span className="font-medium">{employee.name}</span>
            <Button
              variant={employee.active ? "destructive" : "default"}
              onClick={() => toggleEmployeeStatus(employee)}
            >
              {employee.active ? "Desativar" : "Ativar"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employees;