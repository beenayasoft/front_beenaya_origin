import { QuoteItem, VATRate } from "@/lib/types/quote";

export interface PriceCalculation {
  basePrice: number;
  discountAmount: number;
  priceAfterDiscount: number;
  vatAmount: number;
  totalHT: number;
  totalTTC: number;
  margin?: number;
  marginAmount?: number;
}

export class QuotePriceCalculator {
  /**
   * Calcule le prix d'un élément de devis
   */
  static calculateItemPrice(
    quantity: number,
    unitPrice: number,
    discount: number = 0,
    vatRate: VATRate = 20,
    margin?: number
  ): PriceCalculation {
    // Prix de base
    const basePrice = quantity * unitPrice;
    
    // Remise
    const discountAmount = basePrice * (discount / 100);
    const priceAfterDiscount = basePrice - discountAmount;
    
    // Marge (si applicable)
    let marginAmount = 0;
    let priceWithMargin = priceAfterDiscount;
    
    if (margin && margin > 0) {
      marginAmount = priceAfterDiscount * (margin / 100);
      priceWithMargin = priceAfterDiscount + marginAmount;
    }
    
    // TVA
    const vatAmount = priceWithMargin * (vatRate / 100);
    
    // Totaux
    const totalHT = priceWithMargin;
    const totalTTC = totalHT + vatAmount;
    
    return {
      basePrice,
      discountAmount,
      priceAfterDiscount,
      vatAmount,
      totalHT,
      totalTTC,
      margin,
      marginAmount,
    };
  }

  /**
   * Met à jour les prix d'un élément de devis
   */
  static updateItemPrices(item: QuoteItem): QuoteItem {
    const calculation = this.calculateItemPrice(
      item.quantity,
      item.unitPrice,
      item.discount,
      item.vatRate,
      item.margin
    );

    return {
      ...item,
      totalHT: calculation.totalHT,
      totalTTC: calculation.totalTTC,
    };
  }

  /**
   * Calcule les totaux d'une liste d'éléments
   */
  static calculateQuoteTotals(items: QuoteItem[]): {
    totalHT: number;
    totalVAT: number;
    totalTTC: number;
    itemsCount: number;
    vatBreakdown: Record<VATRate, { amount: number; vatAmount: number }>;
  } {
    let totalHT = 0;
    let totalVAT = 0;
    let totalTTC = 0;
    let itemsCount = 0;
    
    const vatBreakdown: Record<VATRate, { amount: number; vatAmount: number }> = {
      0: { amount: 0, vatAmount: 0 },
      7: { amount: 0, vatAmount: 0 },
      10: { amount: 0, vatAmount: 0 },
      14: { amount: 0, vatAmount: 0 },
      20: { amount: 0, vatAmount: 0 },
    };

    items.forEach(item => {
      if (item.type !== "section" && item.type !== "chapter") {
        totalHT += item.totalHT;
        totalTTC += item.totalTTC;
        itemsCount++;
        
        // Calculer la TVA pour cet élément
        const itemVAT = item.totalTTC - item.totalHT;
        totalVAT += itemVAT;
        
        // Ajouter au breakdown par taux de TVA
        if (vatBreakdown[item.vatRate]) {
          vatBreakdown[item.vatRate].amount += item.totalHT;
          vatBreakdown[item.vatRate].vatAmount += itemVAT;
        }
      }
    });

    return {
      totalHT,
      totalVAT,
      totalTTC,
      itemsCount,
      vatBreakdown,
    };
  }

  /**
   * Applique une remise globale sur tous les éléments
   */
  static applyGlobalDiscount(items: QuoteItem[], discountPercentage: number): QuoteItem[] {
    return items.map(item => {
      if (item.type !== "section" && item.type !== "chapter") {
        const updatedItem = {
          ...item,
          discount: (item.discount || 0) + discountPercentage,
        };
        return this.updateItemPrices(updatedItem);
      }
      return item;
    });
  }

  /**
   * Applique une marge globale sur tous les éléments
   */
  static applyGlobalMargin(items: QuoteItem[], marginPercentage: number): QuoteItem[] {
    return items.map(item => {
      if (item.type !== "section" && item.type !== "chapter") {
        const updatedItem = {
          ...item,
          margin: marginPercentage,
        };
        return this.updateItemPrices(updatedItem);
      }
      return item;
    });
  }

  /**
   * Convertit un prix HT en TTC
   */
  static htToTtc(priceHT: number, vatRate: VATRate): number {
    return priceHT * (1 + vatRate / 100);
  }

  /**
   * Convertit un prix TTC en HT
   */
  static ttcToHt(priceTTC: number, vatRate: VATRate): number {
    return priceTTC / (1 + vatRate / 100);
  }

  /**
   * Formate un prix pour l'affichage
   */
  static formatPrice(price: number, currency: string = "MAD"): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price) + ` ${currency}`;
  }

  /**
   * Calcule le pourcentage de marge réalisé
   */
  static calculateMarginPercentage(costPrice: number, sellingPrice: number): number {
    if (costPrice === 0) return 0;
    return ((sellingPrice - costPrice) / costPrice) * 100;
  }

  /**
   * Calcule le coefficient multiplicateur
   */
  static calculateCoefficient(costPrice: number, sellingPrice: number): number {
    if (costPrice === 0) return 1;
    return sellingPrice / costPrice;
  }
} 