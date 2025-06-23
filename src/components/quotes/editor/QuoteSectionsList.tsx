import { useState } from "react";
import {
  Plus,
  GripVertical,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  Hammer,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QuoteItem } from "@/lib/types/quote";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { QuotePriceCalculator } from "./QuotePriceCalculator";
import { QuoteLineEditor } from "./QuoteLineEditor";

interface QuoteSectionsListProps {
  items: QuoteItem[];
  onChange: (items: QuoteItem[]) => void;
  onAddItems: () => void;
}

export function QuoteSectionsList({
  items,
  onChange,
  onAddItems,
}: QuoteSectionsListProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [lineEditorItem, setLineEditorItem] = useState<QuoteItem | null>(null);

  const handleItemChange = (itemId: string, field: keyof QuoteItem, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculer les totaux si nécessaire
        if (field === "quantity" || field === "unitPrice" || field === "discount" || field === "vatRate" || field === "margin") {
          return QuotePriceCalculator.updateItemPrices(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    onChange(updatedItems);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    onChange(updatedItems);
  };

  const handleAddSection = () => {
    const newSection: QuoteItem = {
      id: `section-${Date.now()}`,
      type: "section",
      position: items.length + 1,
      designation: "Nouvelle section",
      description: "",
      quantity: 1,
      unitPrice: 0,
      vatRate: 20,
      totalHT: 0,
      totalTTC: 0,
    };
    
    onChange([...items, newSection]);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getItemIcon = (type: QuoteItem["type"]) => {
    switch (type) {
      case "work":
        return <Hammer className="w-4 h-4 text-benaya-primary" />;
      case "product":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "service":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "section":
        return <ChevronRight className="w-4 h-4 text-neutral-500" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: QuoteItem["type"]) => {
    switch (type) {
      case "work":
        return <Badge className="benaya-badge-primary">Ouvrage</Badge>;
      case "product":
        return <Badge className="benaya-badge-info">Produit</Badge>;
      case "service":
        return <Badge className="benaya-badge-warning">Service</Badge>;
      case "section":
        return <Badge className="benaya-badge-neutral">Section</Badge>;
      default:
        return null;
    }
  };

  // Grouper les éléments par sections
  const sections = items.filter((item) => item.type === "section");
  const sectionItems = items.filter((item) => item.type !== "section");

  const handleOpenLineEditor = (item: QuoteItem) => {
    setLineEditorItem(item);
    setEditingItem(null); // Fermer l'édition inline
  };

  const handleSaveLineEditor = (updatedItem: QuoteItem) => {
    const updatedItems = items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    onChange(updatedItems);
    setLineEditorItem(null);
  };

  const handleCloseLineEditor = () => {
    setLineEditorItem(null);
  };

  return (
    <div className="benaya-card">
      <div className="benaya-card-header">
        <div className="flex items-center justify-between">
          <h3 className="benaya-card-title">Lignes du devis</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSection}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Section
            </Button>
            <Button
              onClick={onAddItems}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter des éléments
            </Button>
          </div>
        </div>
      </div>

      <div className="benaya-card-content">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <Package className="w-12 h-12 mx-auto mb-2" />
              <p>Aucun élément dans ce devis</p>
            </div>
            <Button onClick={onAddItems} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter des éléments
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead className="w-20">Type</TableHead>
                <TableHead className="w-16">Unité</TableHead>
                <TableHead className="w-20">Qté</TableHead>
                <TableHead className="w-24">Prix unit.</TableHead>
                <TableHead className="w-20">Remise</TableHead>
                <TableHead className="w-24">Total HT</TableHead>
                <TableHead className="w-24">Total TTC</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} className="group">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <GripVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                  
                  <TableCell>
                    {item.type === "section" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSection(item.id)}
                      >
                        {expandedSections.has(item.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    ) : (
                      getItemIcon(item.type)
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingItem === item.id ? (
                      <Input
                        value={item.designation}
                        onChange={(e) =>
                          handleItemChange(item.id, "designation", e.target.value)
                        }
                        onBlur={() => setEditingItem(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingItem(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        className={cn(
                          "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-1 rounded",
                          item.type === "section" && "font-semibold"
                        )}
                        onClick={() => setEditingItem(item.id)}
                      >
                        {item.designation}
                        {item.description && (
                          <div className="text-sm text-neutral-500 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  
                  <TableCell>
                    {item.type !== "section" && (
                      <Input
                        value={item.unit || ""}
                        onChange={(e) =>
                          handleItemChange(item.id, "unit", e.target.value)
                        }
                        className="w-16"
                      />
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {item.type !== "section" && (
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)
                        }
                        className="w-20"
                        min="0"
                        step="0.01"
                      />
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {item.type !== "section" && (
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-24"
                        min="0"
                        step="0.01"
                      />
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {item.type !== "section" && (
                      <Input
                        type="number"
                        value={item.discount || 0}
                        onChange={(e) =>
                          handleItemChange(item.id, "discount", parseFloat(e.target.value) || 0)
                        }
                        className="w-20"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    )}
                  </TableCell>
                  
                  <TableCell className="font-medium">
                    {item.type !== "section" && formatCurrency(item.totalHT)}
                  </TableCell>
                  
                  <TableCell className="font-bold">
                    {item.type !== "section" && formatCurrency(item.totalTTC)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenLineEditor(item)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {lineEditorItem && (
        <QuoteLineEditor
          item={lineEditorItem}
          onSave={handleSaveLineEditor}
          onCancel={handleCloseLineEditor}
          isOpen={!!lineEditorItem}
        />
      )}
    </div>
  );
} 