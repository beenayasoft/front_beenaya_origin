// Mock data pour les clients et projets

export interface ClientAddress {
  id: string;
  type: "billing" | "delivery" | "site";
  label: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  addresses: ClientAddress[];
  status: "active" | "completed" | "cancelled" | "on_hold";
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export interface Client {
  id: string;
  name: string;
  type: "individual" | "company";
  email: string;
  phone: string;
  siret?: string;
  addresses: ClientAddress[];
  projects: Project[];
  status: "active" | "inactive";
  createdAt: string;
}

// Données mockées pour les clients
export const mockClients: Client[] = [
  {
    id: "client-1",
    name: "Jean Dupont",
    type: "individual",
    email: "jean.dupont@email.com",
    phone: "06 12 34 56 78",
    status: "active",
    createdAt: "2024-01-15",
    addresses: [
      {
        id: "addr-1",
        type: "billing",
        label: "Domicile principal",
        address: "123 Rue de la Paix",
        city: "Paris",
        postalCode: "75001",
        country: "France",
        isDefault: true,
      },
      {
        id: "addr-2",
        type: "site",
        label: "Résidence secondaire",
        address: "456 Avenue des Champs",
        city: "Paris",
        postalCode: "75008",
        country: "France",
        isDefault: false,
      },
    ],
    projects: [
      {
        id: "project-1",
        name: "Rénovation appartement",
        description: "Rénovation complète de l'appartement principal",
        clientId: "client-1",
        status: "active",
        startDate: "2025-02-01",
        budget: 25000,
        addresses: [
          {
            id: "addr-2",
            type: "site",
            label: "Appartement à rénover",
            address: "456 Avenue des Champs",
            city: "Paris",
            postalCode: "75008",
            country: "France",
            isDefault: true,
          },
        ],
      },
    ],
  },
  {
    id: "client-2",
    name: "Marie Lambert",
    type: "individual",
    email: "marie.lambert@email.com",
    phone: "06 98 76 54 32",
    status: "active",
    createdAt: "2024-02-20",
    addresses: [
      {
        id: "addr-3",
        type: "billing",
        label: "Domicile",
        address: "789 Boulevard Saint-Germain",
        city: "Lyon",
        postalCode: "69002",
        country: "France",
        isDefault: true,
      },
    ],
    projects: [
      {
        id: "project-2",
        name: "Villa moderne",
        description: "Construction d'une villa contemporaine",
        clientId: "client-2",
        status: "active",
        startDate: "2025-03-15",
        budget: 150000,
        addresses: [
          {
            id: "addr-4",
            type: "site",
            label: "Terrain construction",
            address: "Lot 15 Résidence Les Pins",
            city: "Lyon",
            postalCode: "69009",
            country: "France",
            isDefault: true,
          },
        ],
      },
    ],
  },
  {
    id: "client-3",
    name: "Entreprise BTP Solutions",
    type: "company",
    email: "contact@btpsolutions.fr",
    phone: "04 78 90 12 34",
    siret: "12345678901234",
    status: "active",
    createdAt: "2024-01-10",
    addresses: [
      {
        id: "addr-5",
        type: "billing",
        label: "Siège social",
        address: "15 Rue de l'Industrie",
        city: "Marseille",
        postalCode: "13001",
        country: "France",
        isDefault: true,
      },
      {
        id: "addr-6",
        type: "delivery",
        label: "Entrepôt",
        address: "Zone Industrielle Nord",
        city: "Marseille",
        postalCode: "13015",
        country: "France",
        isDefault: false,
      },
    ],
    projects: [
      {
        id: "project-3",
        name: "Complexe commercial",
        description: "Construction d'un centre commercial",
        clientId: "client-3",
        status: "active",
        startDate: "2025-01-01",
        budget: 500000,
        addresses: [
          {
            id: "addr-7",
            type: "site",
            label: "Site de construction",
            address: "Avenue du Commerce",
            city: "Aix-en-Provence",
            postalCode: "13100",
            country: "France",
            isDefault: true,
          },
        ],
      },
    ],
  },
];

// Fonctions utilitaires
export function getClients(): Client[] {
  return mockClients;
}

export function getClientById(id: string): Client | null {
  return mockClients.find(client => client.id === id) || null;
}

export function getClientProjects(clientId: string): Project[] {
  const client = getClientById(clientId);
  return client ? client.projects : [];
}

export function getProjectById(projectId: string): Project | null {
  for (const client of mockClients) {
    const project = client.projects.find(p => p.id === projectId);
    if (project) return project;
  }
  return null;
}

export function getClientAddresses(clientId: string): ClientAddress[] {
  const client = getClientById(clientId);
  return client ? client.addresses : [];
}

export function getProjectAddresses(projectId: string): ClientAddress[] {
  const project = getProjectById(projectId);
  return project ? project.addresses : [];
}

export function formatAddress(address: ClientAddress): string {
  return `${address.address}, ${address.postalCode} ${address.city}`;
} 