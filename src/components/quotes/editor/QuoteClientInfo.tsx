import { useState, useEffect } from "react";
import { Edit2, User, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Quote } from "@/lib/types/quote";
import {
  getClients,
  getClientById,
  getClientProjects,
  getClientAddresses,
  getProjectAddresses,
  formatAddress,
  type Client,
  type Project,
  type ClientAddress,
} from "@/lib/mock/clients";

interface QuoteClientInfoProps {
  quote: Quote;
  onUpdate: (updates: Partial<Quote>) => void;
  isEditable?: boolean;
}

export function QuoteClientInfo({
  quote,
  onUpdate,
  isEditable = true,
}: QuoteClientInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [clients] = useState<Client[]>(getClients());
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [clientAddresses, setClientAddresses] = useState<ClientAddress[]>([]);
  const [projectAddresses, setProjectAddresses] = useState<ClientAddress[]>([]);

  // État local pour les modifications
  const [clientInfo, setClientInfo] = useState({
    clientId: quote.clientId,
    clientName: quote.clientName,
    clientAddress: quote.clientAddress || "",
    clientAddressId: "",
    projectId: quote.projectId || "",
    projectName: quote.projectName || "",
    projectAddress: quote.projectAddress || "",
    projectAddressId: "",
    issueDate: quote.issueDate || "",
    expiryDate: quote.expiryDate || "",
    validityPeriod: quote.validityPeriod,
  });

  // Effet pour charger les projets et adresses quand le client change
  useEffect(() => {
    if (clientInfo.clientId) {
      const projects = getClientProjects(clientInfo.clientId);
      setAvailableProjects(projects);
      
      const addresses = getClientAddresses(clientInfo.clientId);
      setClientAddresses(addresses);
      
      // Réinitialiser le projet si le client change
      if (clientInfo.projectId && !projects.find(p => p.id === clientInfo.projectId)) {
        setClientInfo(prev => ({
          ...prev,
          projectId: "",
          projectName: "",
          projectAddress: "",
          projectAddressId: "",
        }));
        setProjectAddresses([]);
      }
    } else {
      setAvailableProjects([]);
      setClientAddresses([]);
      setProjectAddresses([]);
    }
  }, [clientInfo.clientId]);

  // Effet pour charger les adresses du projet quand le projet change
  useEffect(() => {
    if (clientInfo.projectId) {
      const addresses = getProjectAddresses(clientInfo.projectId);
      setProjectAddresses(addresses);
    } else {
      setProjectAddresses([]);
    }
  }, [clientInfo.projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      setClientInfo(prev => ({
        ...prev,
        clientId,
        clientName: selectedClient.name,
        clientAddress: "",
        clientAddressId: "",
        projectId: "",
        projectName: "",
        projectAddress: "",
        projectAddressId: "",
      }));
    }
  };

  const handleClientAddressChange = (addressId: string) => {
    const selectedAddress = clientAddresses.find(a => a.id === addressId);
    if (selectedAddress) {
      setClientInfo(prev => ({
        ...prev,
        clientAddressId: addressId,
        clientAddress: formatAddress(selectedAddress),
      }));
    }
  };

  const handleProjectChange = (projectId: string) => {
    const selectedProject = availableProjects.find(p => p.id === projectId);
    if (selectedProject) {
      setClientInfo(prev => ({
        ...prev,
        projectId,
        projectName: selectedProject.name,
        projectAddress: "",
        projectAddressId: "",
      }));
    }
  };

  const handleProjectAddressChange = (addressId: string) => {
    const selectedAddress = projectAddresses.find(a => a.id === addressId);
    if (selectedAddress) {
      setClientInfo(prev => ({
        ...prev,
        projectAddressId: addressId,
        projectAddress: formatAddress(selectedAddress),
      }));
    }
  };

  const handleSave = () => {
    onUpdate(clientInfo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Réinitialiser les valeurs
    setClientInfo({
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientAddress: quote.clientAddress || "",
      clientAddressId: "",
      projectId: quote.projectId || "",
      projectName: quote.projectName || "",
      projectAddress: quote.projectAddress || "",
      projectAddressId: "",
      issueDate: quote.issueDate || "",
      expiryDate: quote.expiryDate || "",
      validityPeriod: quote.validityPeriod,
    });
    setIsEditing(false);
  };

  return (
    <div className="benaya-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Informations du devis</h3>
        {isEditable && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="text-benaya-600 hover:text-benaya-700"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Client
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="client">Sélectionner un client</Label>
                <Select value={clientInfo.clientId} onValueChange={handleClientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          <span className="text-xs text-gray-500">
                            {client.type === "company" ? "Entreprise" : "Particulier"}
                            {client.email && ` • ${client.email}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {clientAddresses.length > 0 && (
                <div>
                  <Label htmlFor="clientAddress">Adresse du client</Label>
                  <Select value={clientInfo.clientAddressId} onValueChange={handleClientAddressChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une adresse..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientAddresses.map((address) => (
                        <SelectItem key={address.id} value={address.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{address.label}</span>
                            <span className="text-xs text-gray-500">
                              {formatAddress(address)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Projet
            </h4>
            <div className="space-y-3">
              {availableProjects.length > 0 ? (
                <>
                  <div>
                    <Label htmlFor="project">Sélectionner un projet</Label>
                    <Select value={clientInfo.projectId} onValueChange={handleProjectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un projet..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{project.name}</span>
                              <span className="text-xs text-gray-500">
                                {project.description}
                                {project.budget && ` • Budget: ${project.budget.toLocaleString()} MAD`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {projectAddresses.length > 0 && (
                    <div>
                      <Label htmlFor="projectAddress">Adresse du projet</Label>
                      <Select value={clientInfo.projectAddressId} onValueChange={handleProjectAddressChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une adresse..." />
                        </SelectTrigger>
                        <SelectContent>
                          {projectAddresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{address.label}</span>
                                <span className="text-xs text-gray-500">
                                  {formatAddress(address)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  {clientInfo.clientId 
                    ? "Aucun projet disponible pour ce client" 
                    : "Sélectionnez d'abord un client"}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="issueDate">Date d'émission</Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={clientInfo.issueDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="validityPeriod">Validité (jours)</Label>
                <Input
                  id="validityPeriod"
                  name="validityPeriod"
                  type="number"
                  value={clientInfo.validityPeriod}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 md:col-span-2">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Client
            </h4>
            <div className="space-y-1">
              <div className="font-medium">{quote.clientName}</div>
              {quote.clientAddress && (
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {quote.clientAddress}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Projet
            </h4>
            <div className="space-y-1">
              <div className="font-medium">
                {quote.projectName || "—"}
              </div>
              {quote.projectAddress && (
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {quote.projectAddress}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 col-span-1 md:col-span-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Date d'émission
                </div>
                <div className="font-medium">{quote.issueDate || "—"}</div>
              </div>
              <div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Date d'expiration
                </div>
                <div className="font-medium">{quote.expiryDate || "—"}</div>
              </div>
              <div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Durée de validité
                </div>
                <div className="font-medium">{quote.validityPeriod} jours</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 