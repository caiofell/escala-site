import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

interface ScheduleControlsProps {
  onGenerateSchedule: () => void;
  date: Date;
}

export const ScheduleControls: React.FC<ScheduleControlsProps> = ({
  onGenerateSchedule,
  date,
}) => {
  const handleExportPDF = () => {
    const element = document.getElementById("schedule-table");
    if (!element) return;

    const opt = {
      margin: 0.3,
      filename: `escala-${date.toLocaleDateString()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 1,
        letterRendering: true,
        useCORS: true
      },
      jsPDF: { 
        unit: "in", 
        format: "a4", 
        orientation: "landscape",
        compress: true,
        hotfixes: ["px_scaling"]
      }
    };

    html2pdf().set(opt).from(element).save();
    toast.success("PDF exportado com sucesso!");
  };

  return (
    <div className="flex justify-between items-center">
      <Button onClick={onGenerateSchedule}>
        Gerar Nova Escala
      </Button>
      <Button onClick={handleExportPDF} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  );
};