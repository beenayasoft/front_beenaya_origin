import { useRef } from "react";
import { Printer, Download, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Quote } from "@/lib/types/quote";
import { QuotePreview } from "./QuotePreview";

interface QuotePreviewModalProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
}

export function QuotePreviewModal({
  quote,
  isOpen,
  onClose,
}: QuotePreviewModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (previewRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Devis ${quote.number}</title>
              <style>
                body { margin: 0; padding: 0; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none !important; }
                }
                @page {
                  size: A4;
                  margin: 0;
                }
              </style>
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
              ${previewRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Attendre que le contenu soit chargé avant d'imprimer
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const handleDownloadPDF = () => {
    // Simulation du téléchargement PDF
    // En production, vous utiliseriez une bibliothèque comme jsPDF ou html2pdf
    const link = document.createElement("a");
    link.href = "#";
    link.download = `devis-${quote.number}.pdf`;
    
    // Simuler le téléchargement
    alert(`Téléchargement du PDF simulé: devis-${quote.number}.pdf`);
    
    // En production, vous pourriez utiliser:
    // import html2pdf from 'html2pdf.js';
    // html2pdf().from(previewRef.current).save(`devis-${quote.number}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Aperçu du devis {quote.number}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="max-w-[210mm] mx-auto">
            <QuotePreview ref={previewRef} quote={quote} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Format A4 - Prêt pour impression
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 