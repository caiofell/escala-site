import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/types/schedule";
import { STATIONS, SHIFT_TIMES } from "@/utils/scheduleUtils";

interface EmployeeFormProps {
  selectedStation: string;
  selectedEmployee: string;
  selectedShiftTime: string;
  showNewEmployeeInput: boolean;
  newEmployeeName: string;
  availableEmployees: Employee[];
  onStationChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onShiftTimeChange: (value: string) => void;
  onNewEmployeeNameChange: (value: string) => void;
  onCancelNewEmployee: () => void;
  onAddEmployee: () => void;
  getAvailableShiftTimes: (station: string) => typeof SHIFT_TIMES[keyof typeof SHIFT_TIMES][number][];
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  selectedStation,
  selectedEmployee,
  selectedShiftTime,
  showNewEmployeeInput,
  newEmployeeName,
  availableEmployees,
  onStationChange,
  onEmployeeChange,
  onShiftTimeChange,
  onNewEmployeeNameChange,
  onCancelNewEmployee,
  onAddEmployee,
  getAvailableShiftTimes,
}) => {
  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Select value={selectedStation} onValueChange={onStationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o posto" />
          </SelectTrigger>
          <SelectContent>
            {STATIONS.map((station) => (
              <SelectItem key={station} value={station}>
                {station}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStation && (
        <div className="flex-1">
          <Select value={selectedShiftTime} onValueChange={onShiftTimeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o horário" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableShiftTimes(selectedStation).map((time) => (
                <SelectItem 
                  key={`${time.meal}-${time.interval}`} 
                  value={`${time.meal}-${time.interval}`}
                >
                  {`Janta ${time.meal} - Intervalo ${time.interval}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex-1">
        {!showNewEmployeeInput ? (
          <Select 
            value={selectedEmployee} 
            onValueChange={(value) => {
              if (value === "new") {
                onEmployeeChange("");
                onCancelNewEmployee();
              } else {
                onEmployeeChange(value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o funcionário" />
            </SelectTrigger>
            <SelectContent>
              {availableEmployees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
              <SelectItem value="new">+ Adicionar novo funcionário</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border rounded-md"
              placeholder="Nome do novo funcionário"
              value={newEmployeeName}
              onChange={(e) => onNewEmployeeNameChange(e.target.value)}
            />
            <Button 
              variant="outline" 
              onClick={onCancelNewEmployee}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
      <Button onClick={onAddEmployee}>Adicionar Funcionário</Button>
    </div>
  );
};