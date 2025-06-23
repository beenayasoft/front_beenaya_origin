import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Package,
  Clock,
  Calculator,
  PieChart,
  Pencil,
  Trash2,
  ChevronDown,
  Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Work, Material, Labor, WorkComponent } from "@/lib/types/workLibrary";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { mockMaterials, mockLabor, mockWorks } from "@/lib/mock/workLibrary";

export default function WorkLibraryItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<Work | Material | Labor | null>(null);
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Données mockées (en production, ces données viendraient d'une API)
  const materials = mockMaterials;
  const labor = mockLabor;
  const works = mockWorks;

  useEffect(() => {
    if (!id) return;
    
    // Chercher l'élément dans toutes les collections
    const foundMaterial = materials.find(m => m.id === id);
    const foundLabor = labor.find(l => l.id === id);
    const foundWork = works.find(w => w.id === id);
    
    const foundItem = foundMaterial || foundLabor || foundWork;
    setItem(foundItem || null);
  }, [id]);

  if (!item) {
    return (
      <div className="p-6">
        <div className="benaya-card text-center py-12">
          <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Élément non trouvé
          </h2>
          <p className="text-neutral-500 mb-4">
            L'élément demandé n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate("/work-library")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la bibliothèque
          </Button>
        </div>
      </div>
    );
  }

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

  // Fonction récursive pour obtenir tous les composants d'un ouvrage
  const getAllComponents = (work: Work, depth = 0): { component: WorkComponent; depth: number; type: string; name: string; price: number; unit: string }[] => {
    if (!work.components) return [];

    return work.components.flatMap((component) => {
      const subWork = works.find((w) => w.id === component.id);
      const material = materials.find((m) => m.id === component.id);
      const laborItem = labor.find((l) => l.id === component.id);

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
      } else if (laborItem) {
        type = "labor";
        name = laborItem.name;
        price = laborItem.unitPrice;
        unit = laborItem.unit;
      }

      const result = [{ component, depth, type, name, price, unit }];

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
      const material = materials.find((m) => m.id === comp.id);
      const laborItem = labor.find((l) => l.id === comp.id);
      const subWork = works.find((w) => w.id === comp.id);

      if (material) {
        materialCost += material.unitPrice * comp.quantity;
      } else if (laborItem) {
        laborCost += laborItem.unitPrice * comp.quantity;
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

  const handleEdit = () => {
    // Navigation vers la page d'édition (à implémenter)
    navigate(`/work-library/edit/${item.id}`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    // Logique de suppression (à implémenter)
    console.log("Suppression de l'élément:", item?.name);
    setShowDeleteDialog(false);
    // Retourner à la liste après suppression
    navigate("/work-library");
  };

  const renderMaterialDetails = (material: Material) => (
    <div className="space-y-6">
      <div className="benaya-card">
        <div className="benaya-card-header">
          <h3 className="benaya-card-title flex items-center gap-2">
            <Package className="w-5 h-5 text-benaya-primary" />
            Informations générales
          </h3>
        </div>
        <div className="benaya-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Référence</span>
                <span className="font-mono text-sm font-medium">{material.reference || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Unité</span>
                <span className="text-sm font-medium">{material.unit}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Prix unitaire</span>
                <span className="text-xl font-bold text-benaya-600">
                  {formatCurrency(material.unitPrice)}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">TVA</span>
                <span className="text-sm font-medium">{material.vatRate}%</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Fournisseur</span>
                <span className="text-sm font-medium">{material.supplier || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Stock disponible</span>
                <span className="text-sm font-medium">
                  {material.stockQuantity !== undefined
                    ? `${material.stockQuantity} ${material.unit}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
          
          {material.description && (
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Description</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {material.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLaborDetails = (labor: Labor) => (
    <div className="space-y-6">
      <div className="benaya-card">
        <div className="benaya-card-header">
          <h3 className="benaya-card-title flex items-center gap-2">
            <Clock className="w-5 h-5 text-benaya-warning" />
            Informations générales
          </h3>
        </div>
        <div className="benaya-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Unité</span>
                <span className="text-sm font-medium">{labor.unit}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Prix unitaire</span>
                <span className="text-xl font-bold text-benaya-600">
                  {formatCurrency(labor.unitPrice)}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Catégorie</span>
                <span className="text-sm font-medium">{labor.category || "—"}</span>
              </div>
            </div>
          </div>
          
          {labor.description && (
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Description</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
          
          <TabsContent value="composition" className="pt-6">
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="benaya-card">
                <div className="benaya-card-header">
                  <h3 className="benaya-card-title flex items-center gap-2">
                    <Hammer className="w-5 h-5 text-benaya-success" />
                    Informations générales
                  </h3>
                </div>
                <div className="benaya-card-content">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Référence</span>
                        <span className="font-mono text-sm font-medium">{work.reference || "—"}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Unité</span>
                        <span className="text-sm font-medium">{work.unit}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Prix recommandé</span>
                        <span className="text-xl font-bold text-benaya-600">
                          {formatCurrency(work.recommendedPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Marge</span>
                        <span className="text-sm font-medium">{work.margin}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {work.description && (
                    <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Description</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
                    <FileText className="w-5 h-5 text-benaya-success" />
                    Composition détaillée
                  </h3>
                </div>
                <div className="benaya-card-content p-0">
                  <Table className="benaya-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Élément</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Qté</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>P.U.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allComponents.map((item, index) => {
                        const { component, depth, type, name, price, unit } = item;
                        const subWork = type === "work" ? works.find(w => w.id === component.id) : null;
                        const hasChildren = subWork && subWork.components && subWork.components.length > 0;
                        const isExpanded = expandedComponents.has(component.id);
                        const total = price * component.quantity;

                        return (
                          <TableRow key={`${component.id}-${index}`} className={cn(
                            "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                            depth > 0 && "bg-neutral-25 dark:bg-neutral-850"
                          )}>
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
                                      className={cn(
                                        "w-4 h-4 transition-transform",
                                        isExpanded && "transform rotate-180"
                                      )}
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
                                className={cn(
                                  "gap-1",
                                  type === "material" && "benaya-badge-primary",
                                  type === "labor" && "benaya-badge-warning",
                                  type === "work" && "benaya-badge-success"
                                )}
                              >
                                {type === "material" && <Package className="w-3 h-3" />}
                                {type === "labor" && <Clock className="w-3 h-3" />}
                                {type === "work" && <Hammer className="w-3 h-3" />}
                                {type === "material" ? "Matériau" : type === "labor" ? "Main d'œuvre" : "Ouvrage"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{component.quantity}</TableCell>
                            <TableCell>{unit}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(price)}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(total)}</TableCell>
                            <TableCell>
                              {type === "work" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-7"
                                  onClick={() => navigate(`/work-library/item/${component.id}`)}
                                >
                                  <ArrowLeft className="w-4 h-4 rotate-180" />
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
          
          <TabsContent value="costs" className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analyse des coûts */}
              <div className="benaya-card">
                <div className="benaya-card-header">
                  <h3 className="benaya-card-title flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-benaya-success" />
                    Analyse des coûts
                  </h3>
                </div>
                <div className="benaya-card-content">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Coût des matériaux</span>
                      <span className="font-medium">{formatCurrency(costs.materialCost)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Coût de la main d'œuvre</span>
                      <span className="font-medium">{formatCurrency(costs.laborCost)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Coût des sous-ouvrages</span>
                      <span className="font-medium">{formatCurrency(costs.subWorksCost)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b-2 border-neutral-200 dark:border-neutral-600">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">Coût total</span>
                      <span className="font-bold text-lg">{formatCurrency(costs.totalCost)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Marge ({costs.margin}%)</span>
                      <span className="font-medium text-green-600">{formatCurrency(costs.marginAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 bg-benaya-50 dark:bg-benaya-900/20 rounded-lg px-4">
                      <span className="font-bold text-benaya-700 dark:text-benaya-300">Prix de vente recommandé</span>
                      <span className="font-bold text-xl text-benaya-600">{formatCurrency(costs.recommendedPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Répartition des coûts */}
              <div className="benaya-card">
                <div className="benaya-card-header">
                  <h3 className="benaya-card-title flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-benaya-success" />
                    Répartition des coûts
                  </h3>
                </div>
                <div className="benaya-card-content">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">Matériaux</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{costs.materialPercentage.toFixed(1)}%</div>
                          <div className="text-sm text-neutral-500">{formatCurrency(costs.materialCost)}</div>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${costs.materialPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                          <span className="font-medium">Main d'œuvre</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{costs.laborPercentage.toFixed(1)}%</div>
                          <div className="text-sm text-neutral-500">{formatCurrency(costs.laborCost)}</div>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                        <div
                          className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${costs.laborPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Sous-ouvrages</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{costs.subWorksPercentage.toFixed(1)}%</div>
                          <div className="text-sm text-neutral-500">{formatCurrency(costs.subWorksCost)}</div>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${costs.subWorksPercentage}%` }}
                        ></div>
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
    <div className="p-6 space-y-6">
      {/* En-tête avec navigation intégrée */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/work-library")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {isWork ? (
              <div className="w-16 h-16 bg-white/10 text-white rounded-xl flex items-center justify-center">
                <Hammer className="w-8 h-8" />
              </div>
            ) : isMaterial ? (
              <div className="w-16 h-16 bg-white/10 text-white rounded-xl flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-white/10 text-white rounded-xl flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{item.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {isWork ? (
                  <Badge className="bg-white/20 text-white border-white/30 gap-1">
                    <Hammer className="w-3 h-3" />
                    Ouvrage composé
                  </Badge>
                ) : isMaterial ? (
                  <Badge className="bg-white/20 text-white border-white/30 gap-1">
                    <Package className="w-3 h-3" />
                    Matériau
                  </Badge>
                ) : (
                  <Badge className="bg-white/20 text-white border-white/30 gap-1">
                    <Clock className="w-3 h-3" />
                    Main d'œuvre
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Pencil className="w-4 h-4" />
              Modifier
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="gap-2 bg-red-500/10 border-red-300/20 text-red-100 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {isWork && renderWorkDetails(item as Work)}
      {isMaterial && renderMaterialDetails(item as Material)}
      {isLabor && renderLaborDetails(item as Labor)}

      {/* Modale de confirmation de suppression */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Supprimer cet élément"
        description={`Êtes-vous sûr de vouloir supprimer "${item?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
} 