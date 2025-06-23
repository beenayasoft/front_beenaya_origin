import { useState } from "react";
import {
  ChevronRight,
  FileText,
  Package,
  Clock,
  Calculator,
  PieChart,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  Hammer,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Work, Material, Labor, WorkComponent } from "@/lib/types/workLibrary";
import { formatCurrency } from "@/lib/utils";

interface LibraryItemDetailProps {
  item: Work | Material | Labor;
  availableMaterials: Material[];
  availableLabor: Labor[];
  availableWorks: Work[];
  onEdit: () => void;
  onDelete: () => void;
}

export function LibraryItemDetail({
  item,
  availableMaterials,
  availableLabor,
  availableWorks,
  onEdit,
  onDelete,
}: LibraryItemDetailProps) {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());

  const isWork = "components" in item;
  const isMaterial = "vatRate" in item;
  const isLabor = !isWork && !isMaterial;

  const toggleComponentExpansion = (id: string) => {
    setExpandedComponents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Fonction récursive pour obtenir tous les composants d'un ouvrage (et sous-ouvrages)
  const getAllComponents = (work: Work, depth = 0): { component: WorkComponent; depth: number; type: string; name: string; price: number; unit: string }[] => {
    if (!work.components) return [];

    return work.components.flatMap((component) => {
      const subWork = availableWorks.find((w) => w.id === component.id);
      const material = availableMaterials.find((m) => m.id === component.id);
      const labor = availableLabor.find((l) => l.id === component.id);

      let type = "unknown";
      let name = "Inconnu";
      let price = 0;
      let unit = "";

      if (subWork) {
        type = "work";
        name = subWork.name;
        price = subWork.recommendedPrice;
        unit = subWork.unit;
      } else if (material) {
        type = "material";
        name = material.name;
        price = material.unitPrice;
        unit = material.unit;
      } else if (labor) {
        type = "labor";
        name = labor.name;
        price = labor.unitPrice;
        unit = labor.unit;
      }

      const result = [{ component, depth, type, name, price, unit }];

      // Si c'est un sous-ouvrage et qu'il est développé, ajouter ses composants
      if (subWork && expandedComponents.has(component.id)) {
        return [...result, ...getAllComponents(subWork, depth + 1)];
      }

      return result;
    });
  };

  // Calcul des coûts pour les ouvrages
  const calculateCosts = (work: Work) => {
    let materialCost = 0;
    let laborCost = 0;
    let subWorksCost = 0;

    work.components.forEach((comp) => {
      const material = availableMaterials.find((m) => m.id === comp.id);
      const labor = availableLabor.find((l) => l.id === comp.id);
      const subWork = availableWorks.find((w) => w.id === comp.id);

      if (material) {
        materialCost += material.unitPrice * comp.quantity;
      } else if (labor) {
        laborCost += labor.unitPrice * comp.quantity;
      } else if (subWork) {
        subWorksCost += subWork.recommendedPrice * comp.quantity;
      }
    });

    const totalCost = materialCost + laborCost + subWorksCost;
    const margin = work.margin || 20;
    const marginAmount = (totalCost * margin) / 100;
    const recommendedPrice = totalCost + marginAmount;

    return {
      materialCost,
      laborCost,
      subWorksCost,
      totalCost,
      margin,
      marginAmount,
      recommendedPrice,
      materialPercentage: totalCost > 0 ? (materialCost / totalCost) * 100 : 0,
      laborPercentage: totalCost > 0 ? (laborCost / totalCost) * 100 : 0,
      subWorksPercentage: totalCost > 0 ? (subWorksCost / totalCost) * 100 : 0,
    };
  };

  const renderMaterialDetails = (material: Material) => (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="benaya-card">
        <div className="benaya-card-header">
          <h3 className="benaya-card-title flex items-center gap-2">
            <Package className="w-4 h-4 text-benaya-primary" />
            Informations générales
          </h3>
        </div>
        <div className="benaya-card-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-benaya-600 dark:text-benaya-400">Référence</span>
                <span className="font-mono text-sm font-medium">{material.reference || "—"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-benaya-600 dark:text-benaya-400">Unité</span>
                <span className="text-sm font-medium">{material.unit}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-benaya-600 dark:text-benaya-400">Prix unitaire</span>
                <span className="text-sm font-semibold text-benaya-900 dark:text-benaya-100">
                  {formatCurrency(material.unitPrice)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-benaya-600 dark:text-benaya-400">TVA</span>
                <span className="text-sm font-medium">{material.vatRate}%</span>
              </div>
            </div>
          </div>
          
          {material.description && (
            <div className="mt-4 pt-4 border-t border-benaya-200 dark:border-benaya-700">
              <h4 className="text-sm font-medium text-benaya-700 dark:text-benaya-300 mb-2">Description</h4>
              <p className="text-sm text-benaya-600 dark:text-benaya-400 leading-relaxed">
                {material.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Informations fournisseur */}
      <div className="benaya-card">
        <div className="benaya-card-header">
          <h3 className="benaya-card-title flex items-center gap-2">
            <FileText className="w-4 h-4 text-benaya-primary" />
            Informations fournisseur
          </h3>
        </div>
        <div className="benaya-card-content">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-sm text-benaya-600 dark:text-benaya-400">Fournisseur</span>
              <span className="text-sm font-medium">{material.supplier || "—"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-sm text-benaya-600 dark:text-benaya-400">Catégorie</span>
              <span className="text-sm font-medium">{material.category || "—"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-sm text-benaya-600 dark:text-benaya-400">ID Stock</span>
              <span className="text-sm font-mono font-medium">{material.stockId || "—"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-sm text-benaya-600 dark:text-benaya-400">Quantité en stock</span>
              <span className="text-sm font-medium">
                {material.stockQuantity !== undefined
                  ? `${material.stockQuantity} ${material.unit}`
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLaborDetails = (labor: Labor) => (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="benaya-card">
        <div className="benaya-card-header">
          <h3 className="benaya-card-title flex items-center gap-2">
            <Clock className="w-4 h-4 text-benaya-warning" />
            Informations générales
          </h3>
        </div>
        <div className="benaya-card-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-benaya-600 dark:text-benaya-400">Unité</span>
                <span className="text-sm font-medium">{labor.unit}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-benaya-600 dark:text-benaya-400">Prix unitaire</span>
                <span className="text-sm font-semibold text-benaya-900 dark:text-benaya-100">
                  {formatCurrency(labor.unitPrice)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-benaya-600 dark:text-benaya-400">Catégorie</span>
                <span className="text-sm font-medium">{labor.category || "—"}</span>
              </div>
            </div>
          </div>
          
          {labor.description && (
            <div className="mt-4 pt-4 border-t border-benaya-200 dark:border-benaya-700">
              <h4 className="text-sm font-medium text-benaya-700 dark:text-benaya-300 mb-2">Description</h4>
              <p className="text-sm text-benaya-600 dark:text-benaya-400 leading-relaxed">
                {labor.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWorkDetails = (work: Work) => {
    const costs = calculateCosts(work);
    const allComponents = getAllComponents(work);

    return (
      <div className="space-y-6">
        <Tabs defaultValue="composition" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="composition" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Composition
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Analyse des coûts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="composition" className="pt-4">
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="benaya-card">
                <div className="benaya-card-header">
                  <h3 className="benaya-card-title flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-benaya-success" />
                    Informations générales
                  </h3>
                </div>
                <div className="benaya-card-content">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-sm text-benaya-600 dark:text-benaya-400">Référence</span>
                        <span className="text-sm font-mono font-medium">{work.reference || "—"}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-sm text-benaya-600 dark:text-benaya-400">Unité</span>
                        <span className="text-sm font-medium">{work.unit}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-sm text-benaya-600 dark:text-benaya-400">Prix recommandé</span>
                        <span className="text-sm font-semibold text-benaya-900 dark:text-benaya-100">
                          {formatCurrency(work.recommendedPrice)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-sm text-benaya-600 dark:text-benaya-400">Marge</span>
                        <span className="text-sm font-medium">{work.margin}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {work.description && (
                    <div className="mt-4 pt-4 border-t border-benaya-200 dark:border-benaya-700">
                      <h4 className="text-sm font-medium text-benaya-700 dark:text-benaya-300 mb-2">Description</h4>
                      <p className="text-sm text-benaya-600 dark:text-benaya-400 leading-relaxed">
                        {work.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Composition détaillée */}
              <div className="benaya-card">
                <div className="benaya-card-header">
                  <h3 className="benaya-card-title flex items-center gap-2">
                    <FileText className="w-4 h-4 text-benaya-success" />
                    Composition détaillée
                  </h3>
                </div>
                <div className="benaya-card-content p-0">
                  <Table className="benaya-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Élément</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>P.U.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allComponents.map((item, index) => {
                        const { component, depth, type, name, price, unit } = item;
                        const subWork = type === "work" ? availableWorks.find(w => w.id === component.id) : null;
                        const hasChildren = subWork && subWork.components && subWork.components.length > 0;
                        const isExpanded = expandedComponents.has(component.id);
                        const total = price * component.quantity;

                        return (
                          <TableRow key={`${component.id}-${index}`} className={depth > 0 ? "bg-neutral-50" : ""}>
                            <TableCell>
                              <div 
                                className="flex items-center" 
                                style={{ paddingLeft: `${depth * 20}px` }}
                              >
                                {hasChildren && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-6 w-6 mr-2"
                                    onClick={() => toggleComponentExpansion(component.id)}
                                  >
                                    <ChevronDown
                                      className={`w-4 h-4 transition-transform ${
                                        isExpanded ? "transform rotate-180" : ""
                                      }`}
                                    />
                                  </Button>
                                )}
                                {!hasChildren && depth > 0 && <span className="w-6 mr-2"></span>}
                                <span className="font-medium">{name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  type === "material"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : type === "labor"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }
                              >
                                {type === "material"
                                  ? "Matériau"
                                  : type === "labor"
                                  ? "Main d'œuvre"
                                  : "Ouvrage"}
                              </Badge>
                            </TableCell>
                            <TableCell>{component.quantity}</TableCell>
                            <TableCell>{unit}</TableCell>
                            <TableCell>{formatCurrency(price)}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(total)}</TableCell>
                            <TableCell>
                              {type === "work" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-7"
                                  onClick={() => toggleComponentExpansion(component.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="costs" className="pt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="benaya-card">
                  <div className="benaya-card-header">
                    <h3 className="benaya-card-title flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-benaya-success" />
                      Analyse des coûts
                    </h3>
                  </div>
                  <div className="benaya-card-content">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Coût des matériaux:</span>
                        <span className="font-medium">{formatCurrency(costs.materialCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Coût de la main d'œuvre:</span>
                        <span className="font-medium">{formatCurrency(costs.laborCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Coût des sous-ouvrages:</span>
                        <span className="font-medium">{formatCurrency(costs.subWorksCost)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t border-neutral-200">
                        <span>Coût total:</span>
                        <span>{formatCurrency(costs.totalCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2">
                        <span>Marge ({costs.margin}%):</span>
                        <span className="font-medium">{formatCurrency(costs.marginAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-benaya-700 pt-2 border-t border-neutral-200">
                        <span>Prix de vente recommandé:</span>
                        <span>{formatCurrency(costs.recommendedPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="benaya-card">
                  <div className="benaya-card-header">
                    <h3 className="benaya-card-title flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-benaya-success" />
                      Répartition des coûts
                    </h3>
                  </div>
                  <div className="benaya-card-content">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Matériaux</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{costs.materialPercentage.toFixed(1)}%</span>
                            <span className="text-sm text-neutral-500">{formatCurrency(costs.materialCost)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${costs.materialPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <span>Main d'œuvre</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{costs.laborPercentage.toFixed(1)}%</span>
                            <span className="text-sm text-neutral-500">{formatCurrency(costs.laborCost)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: `${costs.laborPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Sous-ouvrages</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{costs.subWorksPercentage.toFixed(1)}%</span>
                            <span className="text-sm text-neutral-500">{formatCurrency(costs.subWorksCost)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${costs.subWorksPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isWork ? (
              <div className="w-10 h-10 bg-benaya-success/10 text-benaya-success rounded-lg flex items-center justify-center">
                <Hammer className="w-5 h-5" />
              </div>
            ) : isMaterial ? (
              <div className="w-10 h-10 bg-benaya-primary/10 text-benaya-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-benaya-warning/10 text-benaya-warning rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            )}
            <div>
              <DialogTitle className="text-xl font-semibold text-benaya-900 dark:text-benaya-100">
                {item.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {isWork ? (
                  <Badge className="benaya-badge-success gap-1">
                    <Hammer className="w-3 h-3" />
                    Ouvrage composé
                  </Badge>
                ) : isMaterial ? (
                  <Badge className="benaya-badge-primary gap-1">
                    <Package className="w-3 h-3" />
                    Matériau
                  </Badge>
                ) : (
                  <Badge className="benaya-badge-warning gap-1">
                    <Clock className="w-3 h-3" />
                    Main d'œuvre
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="benaya-button-outline gap-2"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDelete}
              className="benaya-button-outline text-red-600 hover:text-red-700 hover:border-red-300 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Supprimer</span>
            </Button>
          </div>
        </div>
      </DialogHeader>

      {/* Content */}
      <div className="space-y-6">
        {isWork && renderWorkDetails(item as Work)}
        {isMaterial && renderMaterialDetails(item as Material)}
        {isLabor && renderLaborDetails(item as Labor)}
      </div>
    </div>
  );
}