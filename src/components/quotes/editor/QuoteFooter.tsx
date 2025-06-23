import { Calculator, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Quote } from "@/lib/types/quote";
import { formatCurrency } from "@/lib/utils";

interface QuoteFooterProps {
  quote: Quote;
  onChange: (data: Partial<Quote>) => void;
}

export function QuoteFooter({ quote, onChange }: QuoteFooterProps) {
  const handleNotesChange = (notes: string) => {
    onChange({ notes });
  };

  const handleTermsChange = (termsAndConditions: string) => {
    onChange({ termsAndConditions });
  };

  const handleValidityPeriodChange = (validityPeriod: number) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validityPeriod);
    
    onChange({ 
      validityPeriod,
      expiryDate: expiryDate.toISOString().split('T')[0]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Totaux */}
      <Card className="benaya-card lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-benaya-primary" />
            Totaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 dark:text-neutral-400">Total HT</span>
              <span className="font-medium">{formatCurrency(quote.totalHT)} MAD</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 dark:text-neutral-400">TVA</span>
              <span className="font-medium">{formatCurrency(quote.totalVAT)} MAD</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total TTC</span>
                <span className="font-bold text-xl text-benaya-primary">
                  {formatCurrency(quote.totalTTC)} MAD
                </span>
              </div>
            </div>
          </div>

          {/* Période de validité */}
          <div className="pt-4 border-t">
            <Label htmlFor="validity-period" className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Validité (jours)
            </Label>
            <Input
              id="validity-period"
              type="number"
              value={quote.validityPeriod}
              onChange={(e) => handleValidityPeriodChange(parseInt(e.target.value) || 30)}
              min="1"
              max="365"
              className="w-full"
            />
            {quote.expiryDate && (
              <p className="text-sm text-neutral-500 mt-1">
                Expire le {new Date(quote.expiryDate).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes et conditions */}
      <div className="lg:col-span-2 space-y-6">
        {/* Notes */}
        <Card className="benaya-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-benaya-primary" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={quote.notes || ""}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Ajoutez des notes ou commentaires pour ce devis..."
              className="min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Conditions générales */}
        <Card className="benaya-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-benaya-primary" />
              Conditions générales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={quote.termsAndConditions || ""}
              onChange={(e) => handleTermsChange(e.target.value)}
              placeholder="Conditions générales de vente, modalités de paiement, garanties..."
              className="min-h-[120px] resize-none"
            />
            {!quote.termsAndConditions && (
              <div className="mt-2 text-sm text-neutral-500">
                <p className="font-medium mb-1">Suggestions :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Modalités de paiement : 30% à la commande, solde à la livraison</li>
                  <li>Délai de livraison : 15 jours ouvrés</li>
                  <li>Garantie : 2 ans pièces et main d'œuvre</li>
                  <li>Prix valables pour les quantités indiquées</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 