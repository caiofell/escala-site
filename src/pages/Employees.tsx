
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { UserCheck, UserX } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  active: boolean;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching employees:", error);
        toast.error("Erro ao carregar funcionários");
        return;
      }

      setEmployees(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("employees")
        .insert([{ 
          name: newEmployeeName.trim().toUpperCase(),
          active: true
        }]);

      if (error) {
        console.error("Error adding employee:", error);
        toast.error("Erro ao adicionar funcionário");
        return;
      }

      toast.success("Funcionário adicionado com sucesso!");
      setNewEmployeeName("");
      await fetchEmployees();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro ao adicionar funcionário");
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeStatus = async (employee: Employee) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("employees")
        .update({ active: !employee.active })
        .eq("id", employee.id);

      if (error) {
        console.error("Error updating employee status:", error);
        toast.error("Erro ao atualizar status do funcionário");
        return;
      }

      toast.success(`Funcionário ${!employee.active ? 'ativado' : 'desativado'} com sucesso!`);
      await fetchEmployees();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro ao atualizar status do funcionário");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Adicionando..." : "Adicionar"}
        </Button>
      </form>

      <div className="space-y-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex justify-between items-center p-4 bg-white rounded-lg shadow"
          >
            <span className={`font-medium ${!employee.active ? 'text-gray-400' : ''}`}>
              {employee.name}
            </span>
            <Button
              variant={employee.active ? "destructive" : "default"}
              onClick={() => toggleEmployeeStatus(employee)}
              disabled={loading}
            >
              {employee.active ? (
                <>
                  <UserX className="mr-2" />
                  Desativar
                </>
              ) : (
                <>
                  <UserCheck className="mr-2" />
                  Ativar
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employees;
