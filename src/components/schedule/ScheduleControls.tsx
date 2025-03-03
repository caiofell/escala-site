
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ScheduleControlsProps {
  onGenerateSchedule: () => void;
  date: Date;
  loading: boolean;
}

export const ScheduleControls: React.FC<ScheduleControlsProps> = ({
  onGenerateSchedule,
  date,
  loading
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

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
    <>
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowConfirmDialog(true)} disabled={loading}>
          {loading ? "Gerando..." : "Gerar Nova Escala"}
        </Button>
        <Button onClick={handleExportPDF} variant="outline" disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar nova escala</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja gerar uma nova escala? 
              A escala atual será substituída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onGenerateSchedule();
                setShowConfirmDialog(false);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
