import { useState, useEffect } from "react";
import {
  X,
  Search,
  Package,
  Hammer,
  Clock,
  Plus,
  Check,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { mockMaterials, mockLabor, mockWorks } from "@/lib/mock/workLibrary";
import { Work, Material, Labor } from "@/lib/types/workLibrary";
import { formatCurrency } from "@/lib/utils";

interface QuoteItemSelectorProps {
  onSelect: (items: (Work | Material | Labor)[]) => void;
  onClose: () => void;
}

type LibraryItem = (Work | Material | Labor) & { type: "work" | "material" | "labor" };

export function QuoteItemSelector({ onSelect, onClose }: QuoteItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");

  // Combiner tous les éléments avec leur type
  const allItems: LibraryItem[] = [
    ...mockWorks.map(item => ({ ...item, type: "work" as const })),
    ...mockMaterials.map(item => ({ ...item, type: "material" as const })),
    ...mockLabor.map(item => ({ ...item, type: "labor" as const })),
  ];

  // Filtrer les éléments
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === "all" || item.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleConfirm = () => {
    const itemsToAdd = allItems.filter(item => selectedItems.has(item.id));
    onSelect(itemsToAdd);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "work":
        return <Hammer className="w-4 h-4 text-benaya-primary" />;
      case "material":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "labor":
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "work":
        return <Badge className="benaya-badge-primary">Ouvrage</Badge>;
      case "material":
        return <Badge className="benaya-badge-info">Matériau</Badge>;
      case "labor":
        return <Badge className="benaya-badge-warning">Main d'œuvre</Badge>;
      default:
        return null;
    }
  };

  const getPrice = (item: LibraryItem) => {
    if (item.type === "work") {
      return (item as Work).recommendedPrice;
    } else {
      return (item as Material | Labor).unitPrice;
    }
  };

  const tabCounts = {
    all: allItems.length,
    work: mockWorks.length,
    material: mockMaterials.length,
    labor: mockLabor.length,
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter des éléments au devis
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Barre de recherche */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des éléments..."
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              {selectedItems.size === filteredItems.length ? "Tout désélectionner" : "Tout sélectionner"}
            </Button>
          </div>

          {/* Onglets */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="gap-2">
                Tous ({tabCounts.all})
              </TabsTrigger>
              <TabsTrigger value="work" className="gap-2">
                <Hammer className="w-4 h-4" />
                Ouvrages ({tabCounts.work})
              </TabsTrigger>
              <TabsTrigger value="material" className="gap-2">
                <Package className="w-4 h-4" />
                Matériaux ({tabCounts.material})
              </TabsTrigger>
              <TabsTrigger value="labor" className="gap-2">
                <Clock className="w-4 h-4" />
                Main d'œuvre ({tabCounts.labor})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 overflow-hidden">
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white dark:bg-neutral-900 z-10">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Désignation</TableHead>
                        <TableHead className="w-24">Type</TableHead>
                        <TableHead className="w-16">Unité</TableHead>
                        <TableHead className="w-24">Prix</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          onClick={() => handleItemToggle(item.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onCheckedChange={() => handleItemToggle(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            {getItemIcon(item.type)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-neutral-500 mt-1">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(item.type)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{item.unit}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatCurrency(getPrice(item))} MAD
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Résumé de la sélection */}
          {selectedItems.size > 0 && (
            <div className="bg-benaya-50 dark:bg-benaya-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium">
                {selectedItems.size} élément{selectedItems.size > 1 ? "s" : ""} sélectionné{selectedItems.size > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedItems.size === 0}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter {selectedItems.size > 0 && `(${selectedItems.size})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 