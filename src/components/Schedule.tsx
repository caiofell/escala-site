import React, { useState } from "react";
import { StationShift } from "@/types/schedule";
import { STATIONS, SHIFT_TIMES } from "@/utils/scheduleUtils";
import { ScheduleControls } from "./schedule/ScheduleControls";
import { EmployeeForm } from "./schedule/EmployeeForm";
import { ScheduleTable } from "./schedule/ScheduleTable";
import { ScheduleHeader } from "./schedule/ScheduleHeader";
import { useScheduleManagement } from "@/hooks/useScheduleManagement";
import { useEmployeeManagement } from "@/hooks/useEmployeeManagement";
import { useEmployeeActions } from "@/hooks/useEmployeeActions";

export const Schedule: React.FC = () => {
  const [date] = useState(new Date());
  const {
    schedule,
    setSchedule,
    logSchedule,
    handleGenerateSchedule
  } = useScheduleManagement();

  const {
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
    resetForm
  } = useEmployeeManagement();

  const {
    removeEmployee,
    getAvailableEmployees,
    getAvailableShiftTimes,
    addEmployee
  } = useEmployeeActions(schedule, setSchedule, logSchedule);

  return (
    <div className="container mx-auto p-4">
      <ScheduleHeader />

      <div className="flex flex-col gap-4 mb-6">
        <ScheduleControls
          onGenerateSchedule={() => handleGenerateSchedule(employees)}
          date={date}
        />

        <EmployeeForm
          selectedStation={selectedStation}
          selectedEmployee={selectedEmployee}
          selectedShiftTime={selectedShiftTime}
          showNewEmployeeInput={showNewEmployeeInput}
          newEmployeeName={newEmployeeName}
          availableEmployees={getAvailableEmployees(employees)}
          onStationChange={setSelectedStation}
          onEmployeeChange={setSelectedEmployee}
          onShiftTimeChange={setSelectedShiftTime}
          onNewEmployeeNameChange={setNewEmployeeName}
          onCancelNewEmployee={() => {
            setShowNewEmployeeInput(false);
            setNewEmployeeName("");
          }}
          onAddEmployee={() => addEmployee(
            selectedStation,
            selectedEmployee,
            selectedShiftTime,
            showNewEmployeeInput,
            newEmployeeName,
            employees,
            resetForm
          )}
          getAvailableShiftTimes={(station: string) => getAvailableShiftTimes(station, SHIFT_TIMES)}
        />
      </div>

      <div className="overflow-x-auto">
        <ScheduleTable
          date={date}
          schedule={schedule}
          onRemoveEmployee={removeEmployee}
        />
      </div>
    </div>
  );
};