import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Quote, QuoteItem } from "@/lib/types/quote";
import { QuoteEditorHeader } from "@/components/quotes/editor/QuoteEditorHeader";
import { QuoteClientInfo } from "@/components/quotes/editor/QuoteClientInfo";
import { QuoteSectionsList } from "@/components/quotes/editor/QuoteSectionsList";
import { QuoteFooter } from "@/components/quotes/editor/QuoteFooter";
import { QuoteItemSelector } from "@/components/quotes/editor/QuoteItemSelector";
import { QuotePriceCalculator } from "@/components/quotes/editor/QuotePriceCalculator";
import { QuotePreviewModal } from "@/components/quotes/preview/QuotePreviewModal";
import { getMockQuote, saveMockQuote } from "@/lib/mock/quotes";

export default function QuoteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Charger le devis
  useEffect(() => {
    if (id) {
      const loadedQuote = getMockQuote(id);
      if (loadedQuote) {
        setQuote(loadedQuote);
      } else {
        // Créer un nouveau devis si l'ID n'existe pas
        const newQuote: Quote = {
          id: id,
          number: id === "new" ? "Brouillon" : `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
          status: "draft",
          clientId: "",
          clientName: "",
          projectName: "",
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          validityPeriod: 30,
          items: [],
          totalHT: 0,
          totalVAT: 0,
          totalTTC: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setQuote(newQuote);
        setIsDirty(true);
      }
    }
  }, [id]);

  const handleSave = async () => {
    if (!quote) return;
    
    setIsSaving(true);
    try {
      const updatedQuote = {
        ...quote,
        updatedAt: new Date().toISOString(),
      };
      
      await saveMockQuote(updatedQuote);
      setQuote(updatedQuote);
      setIsDirty(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?"
      );
      if (!confirmLeave) return;
    }
    navigate("/devis");
  };

  const handleSend = () => {
    if (!quote) return;
    
    // Logique d'envoi du devis
    console.log("Envoi du devis:", quote.id);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleClientChange = (clientData: Partial<Quote>) => {
    if (!quote) return;
    
    setQuote({
      ...quote,
      ...clientData,
    });
    setIsDirty(true);
  };

  const handleItemsChange = (items: QuoteItem[]) => {
    if (!quote) return;
    
    // Recalculer les totaux avec le calculateur
    const totals = QuotePriceCalculator.calculateQuoteTotals(items);
    
    setQuote({
      ...quote,
      items,
      totalHT: totals.totalHT,
      totalVAT: totals.totalVAT,
      totalTTC: totals.totalTTC,
    });
    setIsDirty(true);
  };

  const handleAddItems = (selectedItems: any[]) => {
    if (!quote) return;
    
    const newItems: QuoteItem[] = selectedItems.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      type: item.type === "work" ? "work" : item.type === "material" ? "product" : "service",
      position: quote.items.length + index + 1,
      designation: item.name,
      description: item.description,
      unit: item.unit,
      quantity: 1,
      unitPrice: item.unitPrice || item.recommendedPrice || 0,
      vatRate: 20,
      totalHT: item.unitPrice || item.recommendedPrice || 0,
      totalTTC: (item.unitPrice || item.recommendedPrice || 0) * 1.2,
      workId: item.type === "work" ? item.id : undefined,
    }));
    
    handleItemsChange([...quote.items, ...newItems]);
    setShowItemSelector(false);
  };

  if (!quote) {
    return (
      <div className="p-6">
        <div className="benaya-card text-center py-12">
          <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Chargement...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <QuoteEditorHeader
        quote={quote}
        onSave={handleSave}
        onSend={handleSend}
        onBack={handleBack}
        onPreview={handlePreview}
        isDirty={isDirty}
        isSaving={isSaving}
      />

      {/* Informations client */}
      <QuoteClientInfo
        quote={quote}
        onUpdate={handleClientChange}
      />

      {/* Sections et lignes */}
      <QuoteSectionsList
        items={quote.items}
        onChange={handleItemsChange}
        onAddItems={() => setShowItemSelector(true)}
      />

      {/* Pied de page avec totaux */}
      <QuoteFooter
        quote={quote}
        onChange={(data) => {
          setQuote({ ...quote, ...data });
          setIsDirty(true);
        }}
      />

      {/* Sélecteur d'éléments */}
      {showItemSelector && (
        <QuoteItemSelector
          onSelect={handleAddItems}
          onClose={() => setShowItemSelector(false)}
        />
      )}

      {/* Modal de prévisualisation */}
      {showPreview && (
        <QuotePreviewModal
          quote={quote}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
} 