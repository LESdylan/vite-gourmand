import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  ArrowLeft,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  Clock,
  CreditCard,
  Truck,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import type { Page } from './Home';

type LegalPageProps = {
  section: 'mentions' | 'cgv';
  setCurrentPage: (page: Page) => void;
};

/**
 * LegalPage - Mentions légales et CGV
 *
 * Color scheme from graphical chart:
 * - Deep Bordeaux (#722F37) - Primary brand color
 * - Champagne (#D4AF37) - Accent
 * - Crème (#FFF8F0) - Light backgrounds
 * - Vert olive (#556B2F) - Success
 * - Noir charbon (#1A1A1A) - Text
 */
export default function LegalPage({ section, setCurrentPage }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header Section */}
      <div className="bg-[#1A1A1A] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <Button
            onClick={() => setCurrentPage('home')}
            variant="ghost"
            className="mb-8 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#722F37] to-[#5a252c] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#722F37]/30 flex-shrink-0">
              {section === 'mentions' ? (
                <Scale className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              ) : (
                <FileText className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                {section === 'mentions' ? 'Mentions légales' : 'Conditions Générales de Vente'}
              </h1>
              <p className="text-white/60 mt-1">
                {section === 'mentions'
                  ? 'Informations légales et réglementaires'
                  : 'Conditions applicables à toute commande'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 -mt-8">
        {section === 'mentions' ? (
          <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#FFF8F0] to-white border-b border-[#722F37]/10 py-6 px-5 sm:px-8">
              <CardTitle className="text-xl text-[#1A1A1A] flex items-center gap-3">
                <Shield className="h-6 w-6 text-[#722F37]" />
                Informations légales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-8 lg:p-10 space-y-10">
              {/* Section 1 */}
              <section>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#D4AF37] flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    1
                  </span>
                  Éditeur du site
                </h2>
                <div className="bg-[#FFF8F0] rounded-2xl p-6 space-y-4 border border-[#722F37]/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-[#1A1A1A]">Raison sociale</span>
                      <p className="text-[#1A1A1A]/70">Vite & Gourmand</p>
                    </div>
                    <div>
                      <span className="font-semibold text-[#1A1A1A]">Forme juridique</span>
                      <p className="text-[#1A1A1A]/70">Entreprise individuelle</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#722F37]/10 space-y-3">
                    <div className="flex items-center gap-3 text-[#1A1A1A]/70">
                      <MapPin className="h-5 w-5 text-[#722F37]" />
                      15 Rue Sainte-Catherine, 33000 Bordeaux
                    </div>
                    <div className="flex items-center gap-3 text-[#1A1A1A]/70">
                      <Phone className="h-5 w-5 text-[#722F37]" />
                      +33 5 56 00 00 00
                    </div>
                    <div className="flex items-center gap-3 text-[#1A1A1A]/70">
                      <Mail className="h-5 w-5 text-[#722F37]" />
                      <a
                        href="mailto:contact@vite-gourmand.fr"
                        className="text-[#722F37] hover:underline"
                      >
                        contact@vite-gourmand.fr
                      </a>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#722F37]/10">
                    <span className="font-semibold text-[#1A1A1A]">
                      Directeurs de la publication
                    </span>
                    <p className="text-[#1A1A1A]/70">Julie et José Martinez</p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#D4AF37] flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    2
                  </span>
                  Hébergement
                </h2>
                <p className="text-[#1A1A1A]/70 bg-[#FFF8F0] rounded-2xl p-6 border border-[#722F37]/10">
                  Le site est hébergé par notre infrastructure cloud sécurisée. Serveur situé en
                  France, conformément aux réglementations européennes.
                </p>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#D4AF37] flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    3
                  </span>
                  Protection des données (RGPD)
                </h2>
                <div className="space-y-4">
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous
                    disposez d'un droit d'accès, de rectification, de suppression et de portabilité
                    de vos données personnelles.
                  </p>
                  <div className="bg-[#722F37]/5 rounded-2xl p-6 border border-[#722F37]/10">
                    <p className="font-semibold text-[#722F37] mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Données collectées
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#1A1A1A]/70">
                      {[
                        'Nom et prénom',
                        'Adresse email',
                        'Numéro de téléphone',
                        'Adresse postale',
                        'Informations de commande',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#722F37] rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#556B2F]/10 rounded-2xl p-6 border border-[#556B2F]/20">
                    <p className="text-[#556B2F]">
                      Pour exercer vos droits, contactez-nous à:
                      <a
                        href="mailto:rgpd@vite-gourmand.fr"
                        className="font-semibold ml-1 hover:underline"
                      >
                        rgpd@vite-gourmand.fr
                      </a>
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4-7 */}
              {[
                {
                  num: '4',
                  title: 'Cookies',
                  content:
                    "Ce site utilise des cookies techniques nécessaires au fonctionnement de l'application. Aucun cookie publicitaire n'est utilisé.",
                },
                {
                  num: '5',
                  title: 'Propriété intellectuelle',
                  content:
                    "L'ensemble des contenus présents sur ce site sont la propriété exclusive de Vite & Gourmand. Toute reproduction est strictement interdite sans autorisation.",
                },
                {
                  num: '6',
                  title: 'Responsabilité',
                  content:
                    "Vite & Gourmand s'efforce d'assurer l'exactitude des informations. Les photos sont présentées à titre indicatif.",
                },
                {
                  num: '7',
                  title: 'Liens hypertextes',
                  content:
                    'Le site peut contenir des liens externes. Vite & Gourmand décline toute responsabilité quant au contenu de ces sites.',
                },
              ].map((section) => (
                <section key={section.num}>
                  <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#D4AF37] flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {section.num}
                    </span>
                    {section.title}
                  </h2>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">{section.content}</p>
                </section>
              ))}

              {/* Footer */}
              <div className="bg-[#1A1A1A] text-white rounded-2xl p-6 mt-8">
                <p className="text-sm">
                  <span className="font-semibold text-[#D4AF37]">Dernière mise à jour:</span>{' '}
                  Février 2026
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#FFF8F0] to-white border-b border-[#722F37]/10 py-6 px-5 sm:px-8">
              <CardTitle className="text-xl text-[#1A1A1A] flex items-center gap-3">
                <FileText className="h-6 w-6 text-[#722F37]" />
                Conditions Générales de Vente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-8 lg:p-10 space-y-10">
              {/* CGV Sections */}
              <section>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#D4AF37] flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    1
                  </span>
                  Objet
                </h2>
                <p className="text-[#1A1A1A]/70 leading-relaxed">
                  Les présentes CGV régissent les relations contractuelles entre Vite & Gourmand et
                  ses clients dans le cadre de la vente de prestations traiteur.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#D4AF37] flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    2
                  </span>
                  Commandes
                </h2>
                <div className="space-y-4">
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    <strong className="text-[#1A1A1A]">2.1</strong> Les commandes sont effectuées
                    via notre site web ou par téléphone.
                  </p>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    <strong className="text-[#1A1A1A]">2.2</strong> La commande n'est définitive
                    qu'après confirmation et réception de l'acompte.
                  </p>
                  <div className="bg-[#D4AF37]/10 rounded-2xl p-6 border border-[#D4AF37]/20">
                    <p className="font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#D4AF37]" />
                      Délais de commande
                    </p>
                    <ul className="space-y-2 text-[#1A1A1A]/70">
                      <li>• Moins de 20 personnes: 72h minimum</li>
                      <li>• 20 à 50 personnes: 1 semaine minimum</li>
                      <li>• Plus de 50 personnes: 2 semaines minimum</li>
                      <li>• Mariages: 1 mois minimum</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#D4AF37] flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    3
                  </span>
                  Prix et paiement
                </h2>
                <div className="space-y-4">
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    Les prix sont indiqués en euros TTC. Un devis détaillé est fourni avant toute
                    commande.
                  </p>
                  <div className="bg-[#556B2F]/10 rounded-2xl p-6 border border-[#556B2F]/20">
                    <p className="font-semibold text-[#556B2F] mb-3 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Modalités de paiement
                    </p>
                    <ul className="space-y-2 text-[#1A1A1A]/70">
                      <li>• Acompte de 30% à la commande</li>
                      <li>• Solde 7 jours avant la prestation</li>
                      <li>• CB, virement, chèque acceptés</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#D4AF37] flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    4
                  </span>
                  Livraison
                </h2>
                <div className="bg-[#722F37]/5 rounded-2xl p-6 border border-[#722F37]/10">
                  <p className="font-semibold text-[#722F37] mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Zone de livraison
                  </p>
                  <ul className="space-y-2 text-[#1A1A1A]/70">
                    <li>• Gironde: livraison incluse jusqu'à 30km</li>
                    <li>• 30 à 50 km: 0.50€/km supplémentaire</li>
                    <li>• Au-delà: sur devis</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#D4AF37] flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    5
                  </span>
                  Annulation
                </h2>
                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                  <p className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Conditions d'annulation
                  </p>
                  <ul className="space-y-2 text-[#1A1A1A]/70">
                    <li>• +15 jours: remboursement intégral</li>
                    <li>• 8-15 jours: retenue de 30%</li>
                    <li>• 3-7 jours: retenue de 50%</li>
                    <li>• -3 jours: retenue de 80%</li>
                    <li>• Jour même: aucun remboursement</li>
                  </ul>
                </div>
              </section>

              {/* Footer */}
              <div className="bg-[#1A1A1A] text-white rounded-2xl p-6 mt-8">
                <p className="text-sm">
                  <span className="font-semibold text-[#D4AF37]">Dernière mise à jour:</span>{' '}
                  Février 2026
                  <br />
                  <span className="text-white/60">Version applicable au jour de la commande.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
