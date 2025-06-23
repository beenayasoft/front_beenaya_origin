import { Quote, QuoteStatus, QuoteStats, QuoteFilters } from "@/lib/types/quote";

// Données mockées pour les devis
const mockQuotes: Quote[] = [
  {
    id: "1",
    number: "DEV-2025-001",
    status: "sent",
    clientId: "client-1",
    clientName: "Jean Dupont",
    clientAddress: "123 Rue de la Paix, 75001 Paris",
    projectName: "Rénovation appartement",
    projectAddress: "456 Avenue des Champs, 75008 Paris",
    issueDate: "2025-01-15",
    expiryDate: "2025-02-15",
    validityPeriod: 30,
    items: [
      {
        id: "item-1",
        type: "work",
        position: 1,
        designation: "Pose de carrelage",
        description: "Pose de carrelage 60x60 cm avec joints",
        unit: "m²",
        quantity: 25,
        unitPrice: 45,
        vatRate: 20,
        totalHT: 1125,
        totalTTC: 1350,
      },
      {
        id: "item-2",
        type: "product",
        position: 2,
        designation: "Carrelage grès cérame",
        description: "Carrelage grès cérame 60x60 cm, coloris beige",
        unit: "m²",
        quantity: 27,
        unitPrice: 35,
        vatRate: 20,
        totalHT: 945,
        totalTTC: 1134,
      },
    ],
    notes: "Travaux à réaliser en février 2025",
    termsAndConditions: "Modalités de paiement : 30% à la commande, solde à la livraison",
    totalHT: 2070,
    totalVAT: 414,
    totalTTC: 2484,
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z",
  },
  {
    id: "2",
    number: "DEV-2025-002",
    status: "draft",
    clientId: "client-2",
    clientName: "Marie Lambert",
    projectName: "Villa moderne",
    issueDate: "2025-01-20",
    expiryDate: "2025-02-20",
    validityPeriod: 30,
    items: [],
    totalHT: 0,
    totalVAT: 0,
    totalTTC: 0,
    createdAt: "2025-01-20T09:00:00Z",
    updatedAt: "2025-01-20T09:00:00Z",
  },
];

// Fonction pour obtenir tous les devis avec filtres
export function getQuotes(filters?: QuoteFilters): Quote[] {
  let filteredQuotes = [...mockQuotes];

  if (filters) {
    // Filtrer par statut
    if (filters.status && filters.status.length > 0) {
      filteredQuotes = filteredQuotes.filter(quote => 
        filters.status!.includes(quote.status)
      );
    }

    // Filtrer par recherche textuelle
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredQuotes = filteredQuotes.filter(quote =>
        quote.number.toLowerCase().includes(query) ||
        quote.clientName.toLowerCase().includes(query) ||
        (quote.projectName && quote.projectName.toLowerCase().includes(query))
      );
    }

    // Filtrer par client
    if (filters.clientId) {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.clientId === filters.clientId
      );
    }

    // Filtrer par montant
    if (filters.minAmount !== undefined) {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.totalTTC >= filters.minAmount!
      );
    }

    if (filters.maxAmount !== undefined) {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.totalTTC <= filters.maxAmount!
      );
    }

    // Filtrer par date
    if (filters.dateFrom) {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.issueDate && quote.issueDate >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.issueDate && quote.issueDate <= filters.dateTo!
      );
    }

    // Trier
    if (filters.sortBy) {
      filteredQuotes.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case "issueDate":
            aValue = a.issueDate || "";
            bValue = b.issueDate || "";
            break;
          case "expiryDate":
            aValue = a.expiryDate || "";
            bValue = b.expiryDate || "";
            break;
          case "totalTTC":
            aValue = a.totalTTC;
            bValue = b.totalTTC;
            break;
          case "clientName":
            aValue = a.clientName;
            bValue = b.clientName;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === "desc") {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }
  }

  return filteredQuotes;
}

// Fonction pour obtenir un devis par ID
export function getMockQuote(id: string): Quote | null {
  return mockQuotes.find(quote => quote.id === id) || null;
}

// Fonction pour sauvegarder un devis
export function saveMockQuote(quote: Quote): Promise<Quote> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingIndex = mockQuotes.findIndex(q => q.id === quote.id);
      
      if (existingIndex >= 0) {
        mockQuotes[existingIndex] = quote;
      } else {
        mockQuotes.push(quote);
      }
      
      resolve(quote);
    }, 500); // Simuler un délai réseau
  });
}

// Fonction pour supprimer un devis
export function deleteMockQuote(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockQuotes.findIndex(quote => quote.id === id);
      if (index >= 0) {
        mockQuotes.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
}

// Fonction pour obtenir les statistiques des devis
export function getQuotesStats(): QuoteStats {
  const total = mockQuotes.length;
  const draft = mockQuotes.filter(q => q.status === "draft").length;
  const sent = mockQuotes.filter(q => q.status === "sent").length;
  const accepted = mockQuotes.filter(q => q.status === "accepted").length;
  const rejected = mockQuotes.filter(q => q.status === "rejected").length;
  const expired = mockQuotes.filter(q => q.status === "expired").length;
  const cancelled = mockQuotes.filter(q => q.status === "cancelled").length;
  
  const totalAmount = mockQuotes.reduce((sum, quote) => sum + quote.totalTTC, 0);
  const acceptanceRate = sent > 0 ? (accepted / sent) * 100 : 0;

  return {
    total,
    draft,
    sent,
    accepted,
    rejected,
    expired,
    cancelled,
    totalAmount,
    acceptanceRate,
  };
}

// Fonction pour changer le statut d'un devis
export function updateQuoteStatus(id: string, status: QuoteStatus): Promise<Quote | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const quote = mockQuotes.find(q => q.id === id);
      if (quote) {
        quote.status = status;
        quote.updatedAt = new Date().toISOString();
        resolve(quote);
      } else {
        resolve(null);
      }
    }, 300);
  });
}

// Fonction pour dupliquer un devis
export function duplicateQuote(id: string): Promise<Quote | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const originalQuote = mockQuotes.find(q => q.id === id);
      if (originalQuote) {
        const newQuote: Quote = {
          ...originalQuote,
          id: `quote-${Date.now()}`,
          number: `DEV-${new Date().getFullYear()}-${String(mockQuotes.length + 1).padStart(3, '0')}`,
          status: "draft",
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: originalQuote.items.map(item => ({
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          })),
        };
        
        mockQuotes.push(newQuote);
        resolve(newQuote);
      } else {
        resolve(null);
      }
    }, 500);
  });
} 