import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type LegalPageProps = {
  section: 'mentions' | 'cgv';
};

export default function LegalPage({ section }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {section === 'mentions' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Mentions légales</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Éditeur du site</h2>
                <p className="text-gray-700">
                  <strong>Raison sociale:</strong> Vite & Gourmand<br />
                  <strong>Forme juridique:</strong> Entreprise individuelle<br />
                  <strong>Adresse:</strong> Bordeaux, France 33000<br />
                  <strong>Téléphone:</strong> +33 5 56 XX XX XX<br />
                  <strong>Email:</strong> contact@vite-gourmand.fr
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hébergement</h2>
                <p className="text-gray-700">
                  Le site est hébergé par Supabase Inc.<br />
                  Adresse: 970 Toa Payoh North, #07-04, Singapore 318992
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Protection des données personnelles (RGPD)</h2>
                <p className="text-gray-700 mb-3">
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                  vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Données collectées:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse postale</li>
                  <li>Informations de commande</li>
                </ul>
                <p className="text-gray-700 mb-3">
                  <strong>Finalité du traitement:</strong> Les données sont collectées pour la gestion de vos commandes, 
                  la communication relative à nos services, et l'amélioration de notre offre.
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Conservation des données:</strong> Vos données sont conservées pendant la durée nécessaire 
                  à la réalisation des finalités mentionnées ci-dessus et conformément aux obligations légales.
                </p>
                <p className="text-gray-700">
                  Pour exercer vos droits, contactez-nous à: contact@vite-gourmand.fr
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies</h2>
                <p className="text-gray-700">
                  Ce site utilise des cookies techniques nécessaires au fonctionnement de l'application, 
                  notamment pour la gestion de la session utilisateur et l'authentification.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Propriété intellectuelle</h2>
                <p className="text-gray-700">
                  L'ensemble des contenus présents sur ce site (textes, images, logos) sont la propriété exclusive de Vite & Gourmand 
                  ou font l'objet d'une autorisation d'utilisation. Toute reproduction, même partielle, est strictement interdite 
                  sans autorisation préalable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Responsabilité</h2>
                <p className="text-gray-700">
                  Vite & Gourmand s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. 
                  Toutefois, nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
                </p>
              </section>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Conditions Générales de Vente</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Objet</h2>
                <p className="text-gray-700">
                  Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre Vite & Gourmand 
                  et ses clients dans le cadre de la vente de prestations traiteur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Commandes</h2>
                <p className="text-gray-700 mb-3">
                  <strong>2.1 Processus de commande:</strong> Les commandes sont effectuées via notre site web. 
                  Toute commande implique l'acceptation pleine et entière des présentes CGV.
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>2.2 Confirmation:</strong> Chaque commande fait l'objet d'un accusé de réception par email. 
                  La commande n'est définitive qu'après confirmation de notre part.
                </p>
                <p className="text-gray-700">
                  <strong>2.3 Délais:</strong> Les commandes doivent être passées dans les délais indiqués pour chaque menu. 
                  Vite & Gourmand se réserve le droit de refuser une commande ne respectant pas ces délais.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Prix et paiement</h2>
                <p className="text-gray-700 mb-3">
                  <strong>3.1 Prix:</strong> Les prix sont indiqués en euros TTC. Ils sont valables au jour de la commande 
                  et peuvent être sujets à modification.
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>3.2 Modalités de paiement:</strong> Un acompte de 30% peut être demandé à la commande. 
                  Le solde est à régler avant ou le jour de la prestation selon les modalités convenues.
                </p>
                <p className="text-gray-700">
                  <strong>3.3 Retard de paiement:</strong> Tout retard de paiement entraînera l'application de pénalités 
                  conformément à la législation en vigueur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Livraison et exécution</h2>
                <p className="text-gray-700 mb-3">
                  <strong>4.1 Zone de livraison:</strong> Nos prestations sont assurées principalement dans la région bordelaise. 
                  Des frais de déplacement peuvent s'appliquer pour les livraisons en dehors de cette zone.
                </p>
                <p className="text-gray-700">
                  <strong>4.2 Horaires:</strong> Les horaires de livraison sont convenus lors de la confirmation de commande. 
                  Nous nous engageons à respecter ces horaires dans la mesure du possible.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Annulation et modification</h2>
                <p className="text-gray-700 mb-3">
                  <strong>5.1 Par le client:</strong> Toute annulation doit être notifiée par écrit. 
                  Les conditions d'annulation varient selon le délai:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                  <li>Plus de 15 jours avant: remboursement intégral</li>
                  <li>Entre 8 et 15 jours: retenue de 30%</li>
                  <li>Entre 3 et 7 jours: retenue de 50%</li>
                  <li>Moins de 3 jours: retenue de 80%</li>
                </ul>
                <p className="text-gray-700">
                  <strong>5.2 Par Vite & Gourmand:</strong> En cas de force majeure, nous nous réservons le droit d'annuler 
                  une commande avec remboursement intégral des sommes versées.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Responsabilité</h2>
                <p className="text-gray-700 mb-3">
                  <strong>6.1 Allergies:</strong> Le client doit impérativement nous informer de toute allergie ou 
                  régime alimentaire spécifique lors de la commande.
                </p>
                <p className="text-gray-700">
                  <strong>6.2 Conservation:</strong> Le client est responsable de la bonne conservation des produits 
                  après livraison selon nos recommandations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Réclamations</h2>
                <p className="text-gray-700">
                  Toute réclamation doit être formulée dans les 48 heures suivant la prestation par email à 
                  contact@vite-gourmand.fr. Nous nous engageons à traiter toute réclamation dans les meilleurs délais.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Droit applicable</h2>
                <p className="text-gray-700">
                  Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Médiation</h2>
                <p className="text-gray-700">
                  Conformément à l'article L.612-1 du Code de la consommation, nous proposons un dispositif de médiation de la consommation. 
                  Le médiateur peut être saisi par le consommateur dans un délai d'un an à compter de la réclamation écrite auprès de Vite & Gourmand.
                </p>
              </section>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
