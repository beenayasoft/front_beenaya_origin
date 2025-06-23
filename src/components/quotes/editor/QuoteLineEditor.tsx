import { useState } from "react";
import {
  Edit,
  Save,
  X,
  Calculator,
  Percent,
  Euro,
  Package,
  Hammer,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QuoteItem, VATRate } from "@/lib/types/quote";
import { QuotePriceCalculator } from "./QuotePriceCalculator";
import { formatCurrency } from "@/lib/utils";

interface QuoteLineEditorProps {
  item: QuoteItem;
  onSave: (item: QuoteItem) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function QuoteLineEditor({
  item,
  onSave,
  onCancel,
  isOpen,
}: QuoteLineEditorProps) {
  const [editedItem, setEditedItem] = useState<QuoteItem>({ ...item });
  const [calculation, setCalculation] = useState(() =>
    QuotePriceCalculator.calculateItemPrice(
      item.quantity,
      item.unitPrice,
      item.discount || 0,
      item.vatRate,
      item.margin
    )
  );

  const handleFieldChange = (field: keyof QuoteItem, value: any) => {
    const updatedItem = { ...editedItem, [field]: value };
    setEditedItem(updatedItem);

    // Recalculer les prix si nécessaire
    if (field === "quantity" || field === "unitPrice" || field === "discount" || field === "vatRate" || field === "margin") {
      const newCalculation = QuotePriceCalculator.calculateItemPrice(
        updatedItem.quantity,
        updatedItem.unitPrice,
        updatedItem.discount || 0,
        updatedItem.vatRate,
        updatedItem.margin
      );
      setCalculation(newCalculation);
    }
  };

  const handleSave = () => {
    const finalItem = QuotePriceCalculator.updateItemPrices(editedItem);
    onSave(finalItem);
  };

  const getItemIcon = () => {
    switch (editedItem.type) {
      case "work":
        return <Hammer className="w-5 h-5 text-benaya-primary" />;
      case "product":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "service":
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Package className="w-5 h-5 text-neutral-500" />;
    }
  };

  const getTypeBadge = () => {
    switch (editedItem.type) {
      case "work":
        return <Badge className="benaya-badge-primary">Ouvrage</Badge>;
      case "product":
        return <Badge className="benaya-badge-info">Produit</Badge>;
      case "service":
        return <Badge className="benaya-badge-warning">Service</Badge>;
      case "section":
        return <Badge className="benaya-badge-neutral">Section</Badge>;
      default:
        return <Badge className="benaya-badge-neutral">Autre</Badge>;
    }
  };

  const vatRates: VATRate[] = [0, 7, 10, 14, 20];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getItemIcon()}
            Éditer la ligne
            {getTypeBadge()}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Désignation et description */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="designation">Désignation *</Label>
                <Input
                  id="designation"
                  value={editedItem.designation}
                  onChange={(e) => handleFieldChange("designation", e.target.value)}
                  placeholder="Nom de l'élément"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedItem.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Description détaillée (optionnel)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  value={editedItem.reference || ""}
                  onChange={(e) => handleFieldChange("reference", e.target.value)}
                  placeholder="Référence produit/service"
                />
              </div>
            </div>

            {/* Quantité et prix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantité *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={editedItem.quantity}
                  onChange={(e) => handleFieldChange("quantity", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unité</Label>
                <Input
                  id="unit"
                  value={editedItem.unit || ""}
                  onChange={(e) => handleFieldChange("unit", e.target.value)}
                  placeholder="m², h, forfait..."
                />
              </div>

              <div>
                <Label htmlFor="unitPrice">Prix unitaire (MAD) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={editedItem.unitPrice}
                  onChange={(e) => handleFieldChange("unitPrice", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Remise et marge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="discount">Remise (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={editedItem.discount || 0}
                  onChange={(e) => handleFieldChange("discount", parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="margin">Marge (%)</Label>
                <Input
                  id="margin"
                  type="number"
                  value={editedItem.margin || 0}
                  onChange={(e) => handleFieldChange("margin", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="vatRate">Taux TVA (%)</Label>
                <Select
                  value={editedItem.vatRate.toString()}
                  onValueChange={(value) => handleFieldChange("vatRate", parseInt(value) as VATRate)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vatRates.map((rate) => (
                      <SelectItem key={rate} value={rate.toString()}>
                        {rate}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Calculs en temps réel */}
          <div className="space-y-4">
            <div className="benaya-card">
              <div className="benaya-card-header">
                <h4 className="benaya-card-title flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Calculs
                </h4>
              </div>
              <div className="benaya-card-content space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Prix de base :</span>
                  <span className="font-medium">{formatCurrency(calculation.basePrice)} MAD</span>
                </div>

                {calculation.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Remise :</span>
                    <span>-{formatCurrency(calculation.discountAmount)} MAD</span>
                  </div>
                )}

                {calculation.marginAmount && calculation.marginAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Marge :</span>
                    <span>+{formatCurrency(calculation.marginAmount)} MAD</span>
                  </div>
                )}

                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Total HT :</span>
                  <span className="font-medium">{formatCurrency(calculation.totalHT)} MAD</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>TVA ({editedItem.vatRate}%) :</span>
                  <span className="font-medium">{formatCurrency(calculation.vatAmount)} MAD</span>
                </div>

                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total TTC :</span>
                  <span className="text-benaya-primary">{formatCurrency(calculation.totalTTC)} MAD</span>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="benaya-card">
              <div className="benaya-card-header">
                <h4 className="benaya-card-title">Informations</h4>
              </div>
              <div className="benaya-card-content space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Type :</span>
                  <span>{getTypeBadge()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Position :</span>
                  <span>{editedItem.position}</span>
                </div>
                {editedItem.workId && (
                  <div className="flex justify-between">
                    <span>ID Ouvrage :</span>
                    <span className="font-mono text-xs">{editedItem.workId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 