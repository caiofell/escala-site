import React from "react";
import { Link } from "react-router-dom";

export const ScheduleHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Escala de Maqueiros</h1>
      <div className="flex gap-4">
        <Link 
          to="/employees" 
          className="text-navy hover:text-navy/80 underline"
        >
          Gerenciar Funcionários
        </Link>
        <Link 
          to="/logs" 
          className="text-navy hover:text-navy/80 underline"
        >
          Ver Histórico
        </Link>
      </div>
    </div>
  );
};