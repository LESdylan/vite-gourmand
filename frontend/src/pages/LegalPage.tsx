import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Scale, FileText, Shield, AlertTriangle, Clock, CreditCard, Truck, Phone, Mail, MapPin } from 'lucide-react';
import type { Page } from './Home';

type LegalPageProps = {
  section: 'mentions' | 'cgv';
  setCurrentPage: (page: Page) => void;
};

export default function LegalPage({ section, setCurrentPage }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            onClick={() => setCurrentPage('home')}
            variant="ghost"
            className="mb-6 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              {section === 'mentions' ? (
                <Scale className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              ) : (
                <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                {section === 'mentions' ? 'Mentions légales' : 'Conditions Générales de Vente'}
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                {section === 'mentions' ? 'Informations légales et réglementaires' : 'Conditions applicables à toute commande'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 -mt-6">
        {section === 'mentions' ? (
          <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-orange-50/50 border-b border-gray-100 py-6">
              <CardTitle className="text-xl sm:text-2xl text-gray-900 flex items-center gap-3">
                <Shield className="h-6 w-6 text-orange-500" />
                Informations légales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
              {/* Section 1: Éditeur du site */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">1</span>
                  Éditeur du site
                </h2>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 sm:p-6 space-y-3 border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900 min-w-[120px]">Raison sociale:</span>
                      <span className="text-gray-700">Vite & Gourmand</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900 min-w-[120px]">Forme juridique:</span>
                      <span className="text-gray-700">Entreprise individuelle</span>
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <p className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      15 Rue Sainte-Catherine, 33000 Bordeaux
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      +33 5 56 00 00 00
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <a href="mailto:contact@vite-gourmand.fr" className="text-orange-600 hover:underline">contact@vite-gourmand.fr</a>
                    </p>
                  </div>
                  <p className="pt-3 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Directeurs de la publication:</span>
                    <span className="text-gray-700 ml-2">Julie et José Martinez</span>
                  </p>
                </div>
              </section>

              {/* Section 2: Hébergement */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">2</span>
                  Hébergement
                </h2>
                <p className="text-gray-700 leading-relaxed bg-blue-50 rounded-xl p-4 border border-blue-100">
                  Le site est hébergé par notre infrastructure cloud sécurisée.
                  Serveur situé en France, conformément aux réglementations européennes.
                </p>
              </section>

              {/* Section 3: RGPD */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">3</span>
                  Protection des données personnelles (RGPD)
                </h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                  vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.
                </p>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 sm:p-6 mb-4 border border-orange-200">
                  <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    Données collectées:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 text-sm sm:text-base">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                      Nom et prénom
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                      Adresse email
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                      Numéro de téléphone
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                      Adresse postale
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                      Informations de commande
                    </li>
                  </ul>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">
                    <span className="font-semibold text-gray-900">Finalité du traitement:</span> Les données sont collectées pour la gestion de vos commandes, 
                    la communication relative à nos services, et l'amélioration de notre offre.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-semibold text-gray-900">Conservation des données:</span> Vos données sont conservées pendant la durée nécessaire 
                    à la réalisation des finalités mentionnées ci-dessus et conformément aux obligations légales (5 ans pour les données comptables).
                  </p>
                  <p className="bg-green-50 rounded-xl p-4 border border-green-100">
                    Pour exercer vos droits, contactez-nous à: 
                    <a href="mailto:rgpd@vite-gourmand.fr" className="text-orange-600 hover:underline font-medium ml-1">rgpd@vite-gourmand.fr</a>
                  </p>
                </div>
              </section>

              {/* Section 4: Cookies */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">4</span>
                  Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Ce site utilise des cookies techniques nécessaires au fonctionnement de l'application, 
                  notamment pour la gestion de la session utilisateur et l'authentification.
                  <span className="font-semibold text-green-700 ml-1">Aucun cookie publicitaire n'est utilisé.</span>
                </p>
              </section>

              {/* Section 5: Propriété intellectuelle */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">5</span>
                  Propriété intellectuelle
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  L'ensemble des contenus présents sur ce site (textes, images, logos, photos culinaires) sont la propriété exclusive de Vite & Gourmand 
                  ou font l'objet d'une autorisation d'utilisation. Toute reproduction, même partielle, est strictement interdite 
                  sans autorisation préalable écrite.
                </p>
              </section>

              {/* Section 6: Responsabilité */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">6</span>
                  Responsabilité
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Vite & Gourmand s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. 
                  Toutefois, nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
                  Les photos des plats sont présentées à titre indicatif et peuvent différer légèrement du produit final.
                </p>
              </section>

              {/* Section 7: Liens hypertextes */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">7</span>
                  Liens hypertextes
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Le site peut contenir des liens vers d'autres sites web. Vite & Gourmand ne peut être tenue responsable 
                  du contenu de ces sites externes.
                </p>
              </section>

              {/* Footer info */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-4 sm:p-6 mt-8 border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Date de dernière mise à jour:</span> Février 2026<br />
                  <span className="text-gray-500">Ces informations sont susceptibles d'être modifiées sans préavis.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-orange-50/50 border-b border-gray-100 py-6">
              <CardTitle className="text-xl sm:text-2xl text-gray-900 flex items-center gap-3">
                <FileText className="h-6 w-6 text-orange-500" />
                CGV - Conditions Générales de Vente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
              {/* Section 1: Objet */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">1</span>
                  Objet
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre Vite & Gourmand 
                  et ses clients dans le cadre de la vente de prestations traiteur.
                </p>
              </section>

              {/* Section 2: Commandes */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">2</span>
                  Commandes
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">
                    <span className="font-semibold text-gray-900">2.1 Processus de commande:</span> Les commandes sont effectuées via notre site web ou par téléphone. 
                    Toute commande implique l'acceptation pleine et entière des présentes CGV.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-semibold text-gray-900">2.2 Confirmation:</span> Chaque commande fait l'objet d'un accusé de réception par email. 
                    La commande n'est définitive qu'après confirmation de notre part et réception de l'acompte.
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      2.3 Délais de commande:
                    </p>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                      <ul className="space-y-2 text-sm sm:text-base">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Moins de 20 personnes:</strong> 72h à l'avance minimum</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>20 à 50 personnes:</strong> 1 semaine à l'avance minimum</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Plus de 50 personnes:</strong> 2 semaines à l'avance minimum</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Mariages et grands événements:</strong> 1 mois à l'avance minimum</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Prix et paiement */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">3</span>
                  Prix et paiement
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">
                    <span className="font-semibold text-gray-900">3.1 Prix:</span> Les prix sont indiqués en euros TTC. Ils sont valables au jour de la commande 
                    et peuvent être sujets à modification. Un devis détaillé est fourni avant toute commande.
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-500" />
                      3.2 Modalités de paiement:
                    </p>
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                      <ul className="space-y-2 text-sm sm:text-base">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                          <span><strong>Acompte:</strong> 30% à la commande</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                          <span><strong>Solde:</strong> à régler 7 jours avant la prestation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                          <span><strong>Moyens acceptés:</strong> carte bancaire, virement, chèque</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="leading-relaxed bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <span className="font-semibold text-gray-900">3.3 Retard de paiement:</span> Tout retard de paiement entraînera l'application de pénalités 
                    de retard au taux légal en vigueur, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€.
                  </p>
                </div>
              </section>

              {/* Section 4: Livraison */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">4</span>
                  Livraison et exécution
                </h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-orange-500" />
                      4.1 Zone de livraison et frais:
                    </p>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200">
                      <ul className="space-y-2 text-sm sm:text-base">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Gironde:</strong> livraison incluse jusqu'à 30km de Bordeaux</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>De 30 à 50 km:</strong> 0.50€/km supplémentaire</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Au-delà de 50 km:</strong> sur devis</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="leading-relaxed">
                    <span className="font-semibold text-gray-900">4.2 Horaires:</span> Les horaires de livraison sont convenus lors de la confirmation de commande. 
                    Nous nous engageons à respecter ces horaires avec une tolérance de 30 minutes.
                  </p>
                </div>
              </section>

              {/* Section 5: Annulation */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">5</span>
                  Annulation et modification
                </h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      5.1 Conditions d'annulation par le client:
                    </p>
                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200">
                      <ul className="space-y-2 text-sm sm:text-base">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Plus de 15 jours avant:</strong> remboursement intégral de l'acompte</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Entre 8 et 15 jours:</strong> retenue de 30% du montant total</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Entre 3 et 7 jours:</strong> retenue de 50% du montant total</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Moins de 3 jours:</strong> retenue de 80% du montant total</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Le jour même:</strong> aucun remboursement</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="leading-relaxed">
                    <span className="font-semibold text-gray-900">5.2 Modifications:</span> Toute modification du nombre de convives (à la hausse ou à la baisse) 
                    doit être communiquée au minimum 48h à l'avance. Une variation de ±10% est tolérée sans frais supplémentaires.
                  </p>
                  <p className="leading-relaxed bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <span className="font-semibold text-gray-900">5.3 Par Vite & Gourmand:</span> En cas de force majeure (intempéries, pandémie, etc.), 
                    nous nous réservons le droit d'annuler ou reporter une commande avec remboursement intégral des sommes versées.
                  </p>
                </div>
              </section>

              {/* Section 6: Responsabilité et allergènes */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">6</span>
                  Responsabilité et allergènes
                </h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <p className="leading-relaxed">
                      <span className="font-semibold text-red-700">6.1 Allergies - IMPORTANT:</span> Le client doit <strong>IMPÉRATIVEMENT</strong> nous informer de toute allergie ou 
                      régime alimentaire spécifique lors de la commande. Vite & Gourmand décline toute responsabilité 
                      en cas de non-déclaration d'allergies.
                    </p>
                  </div>
                  <p className="leading-relaxed">
                    <span className="font-semibold text-gray-900">6.2 Conservation:</span> Le client est responsable de la bonne conservation des produits 
                    après livraison. Nos recommandations:
                  </p>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Plats chauds:</strong> à consommer dans les 2h ou maintenir au chaud (min. 63°C)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Plats froids:</strong> à conserver au réfrigérateur (0-4°C)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Pâtisseries:</strong> à conserver au frais jusqu'au service</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 7: Équipement et matériel */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">7</span>
                  Équipement et matériel
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Le matériel de service (vaisselle, chafing-dishes, etc.) reste la propriété de Vite & Gourmand. 
                  Il doit être retourné dans les 48h suivant l'événement. Tout matériel non restitué ou endommagé 
                  sera facturé au prix de remplacement.
                </p>
              </section>

              {/* Section 8: Réclamations */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">8</span>
                  Réclamations
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Toute réclamation doit être formulée dans les 48 heures suivant la prestation par email à 
                  <a href="mailto:contact@vite-gourmand.fr" className="text-orange-600 hover:underline font-medium ml-1">contact@vite-gourmand.fr</a>. 
                  Nous nous engageons à traiter toute réclamation dans les 5 jours ouvrés.
                </p>
              </section>

              {/* Section 9: Droit applicable et litiges */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">9</span>
                  Droit applicable et litiges
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée 
                  avant toute action judiciaire. À défaut d'accord, les tribunaux de Bordeaux seront seuls compétents.
                </p>
              </section>

              {/* Section 10: Médiation */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">10</span>
                  Médiation
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Conformément à l'article L.612-1 du Code de la consommation, nous proposons un dispositif de médiation de la consommation. 
                  Le médiateur peut être saisi par le consommateur dans un délai d'un an à compter de la réclamation écrite auprès de Vite & Gourmand.
                </p>
              </section>

              {/* Footer info */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-4 sm:p-6 mt-8 border border-orange-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Date de dernière mise à jour:</span> Février 2026<br />
                  <span className="text-gray-500">Ces CGV sont susceptibles d'être modifiées. La version applicable est celle en vigueur au jour de la commande.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
