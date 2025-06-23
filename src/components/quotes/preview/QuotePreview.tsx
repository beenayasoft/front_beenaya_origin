import { forwardRef } from "react";
import { Quote } from "@/lib/types/quote";
import { formatCurrency } from "@/lib/utils";
import { getClientById, formatAddress } from "@/lib/mock/clients";

interface QuotePreviewProps {
  quote: Quote;
}

export const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(
  ({ quote }, ref) => {
    const client = getClientById(quote.clientId);
    const defaultAddress = client?.addresses.find(addr => addr.isDefault);

    // Grouper les éléments par sections
    const sections = quote.items.filter(item => item.type === "section");
    const otherItems = quote.items.filter(item => item.type !== "section");

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          lineHeight: "1.4",
        }}
      >
        {/* En-tête de l'entreprise */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-gray-300">
          <div>
            <h1 className="text-2xl font-bold text-blue-600 mb-2">
              BENAYA CONSTRUCTION
            </h1>
            <div className="text-sm text-gray-600">
              <p>123 Avenue de la Construction</p>
              <p>75001 Paris, France</p>
              <p>Tél: 01 23 45 67 89</p>
              <p>Email: contact@benaya-construction.fr</p>
              <p>SIRET: 123 456 789 00012</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold mb-2">DEVIS</h2>
            <div className="text-sm">
              <p><strong>N°:</strong> {quote.number}</p>
              <p><strong>Date:</strong> {quote.issueDate ? new Date(quote.issueDate).toLocaleDateString('fr-FR') : '—'}</p>
              <p><strong>Validité:</strong> {quote.validityPeriod} jours</p>
              {quote.expiryDate && (
                <p><strong>Expire le:</strong> {new Date(quote.expiryDate).toLocaleDateString('fr-FR')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-2 text-blue-600">CLIENT</h3>
            <div className="text-sm">
              <p className="font-semibold">{quote.clientName}</p>
              {client?.email && <p>{client.email}</p>}
              {client?.phone && <p>{client.phone}</p>}
              {client?.siret && <p>SIRET: {client.siret}</p>}
              {defaultAddress && (
                <div className="mt-2">
                  <p>{defaultAddress.address}</p>
                  <p>{defaultAddress.postalCode} {defaultAddress.city}</p>
                </div>
              )}
            </div>
          </div>
          
          {quote.projectName && (
            <div>
              <h3 className="font-bold mb-2 text-blue-600">PROJET</h3>
              <div className="text-sm">
                <p className="font-semibold">{quote.projectName}</p>
                {quote.projectAddress && (
                  <div className="mt-2">
                    <p>{quote.projectAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tableau des éléments */}
        <div className="mb-8">
          <h3 className="font-bold mb-4 text-blue-600">DÉTAIL DES PRESTATIONS</h3>
          
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Désignation</th>
                <th className="border border-gray-300 p-2 text-center w-16">Unité</th>
                <th className="border border-gray-300 p-2 text-center w-16">Qté</th>
                <th className="border border-gray-300 p-2 text-right w-20">P.U. HT</th>
                <th className="border border-gray-300 p-2 text-right w-20">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, index) => (
                <tr key={item.id} className={item.type === "section" ? "bg-blue-50" : ""}>
                  <td className="border border-gray-300 p-2">
                    <div className={item.type === "section" ? "font-semibold text-blue-700" : ""}>
                      {item.designation}
                    </div>
                    {item.description && (
                      <div className="text-gray-600 text-xs mt-1">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.type !== "section" ? item.unit || "—" : ""}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.type !== "section" ? item.quantity : ""}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {item.type !== "section" ? formatCurrency(item.unitPrice) : ""}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-medium">
                    {item.type !== "section" ? formatCurrency(item.totalHT) : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 font-medium">Total HT</td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(quote.totalHT)} MAD
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-medium">TVA</td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(quote.totalVAT)} MAD
                  </td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-2 font-bold text-blue-700">
                    Total TTC
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-bold text-blue-700">
                    {formatCurrency(quote.totalTTC)} MAD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="mb-6">
            <h3 className="font-bold mb-2 text-blue-600">NOTES</h3>
            <div className="text-sm bg-gray-50 p-3 rounded border">
              {quote.notes.split('\n').map((line, index) => (
                <p key={index} className="mb-1">{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Conditions générales */}
        <div className="mb-8">
          <h3 className="font-bold mb-2 text-blue-600">CONDITIONS GÉNÉRALES</h3>
          <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded border">
            {quote.termsAndConditions ? (
              quote.termsAndConditions.split('\n').map((line, index) => (
                <p key={index} className="mb-1">{line}</p>
              ))
            ) : (
              <div>
                <p className="mb-1">• Devis valable {quote.validityPeriod} jours à compter de la date d'émission</p>
                <p className="mb-1">• Modalités de paiement : 30% à la commande, solde à la livraison</p>
                <p className="mb-1">• Prix exprimés en MAD, TVA comprise</p>
                <p className="mb-1">• Garantie : 2 ans pièces et main d'œuvre</p>
              </div>
            )}
          </div>
        </div>

        {/* Signature */}
        <div className="flex justify-between items-end">
          <div className="text-center">
            <div className="border-t border-gray-400 w-48 mb-2"></div>
            <p className="text-xs text-gray-600">Signature du client</p>
            <p className="text-xs text-gray-600">Bon pour accord</p>
          </div>
          
          <div className="text-center">
            <div className="border-t border-gray-400 w-48 mb-2"></div>
            <p className="text-xs text-gray-600">BENAYA CONSTRUCTION</p>
            <p className="text-xs text-gray-600">Signature et cachet</p>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>BENAYA CONSTRUCTION - SARL au capital de 50 000 € - RCS Paris 123 456 789</p>
          <p>TVA intracommunautaire : FR12345678901</p>
        </div>
      </div>
    );
  }
);

QuotePreview.displayName = "QuotePreview"; 