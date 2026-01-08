import React from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Hero */}
      <section className="bg-[#722F37] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Scale className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Mentions Légales
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">1. Éditeur du site</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Le site Vite & Gourmand est édité par :<br /><br />
                <strong>Vite & Gourmand</strong><br />
                Forme juridique : [À compléter]<br />
                Capital social : [À compléter]<br />
                Siège social : 33000 Bordeaux, France<br />
                SIRET : [À compléter]<br />
                RCS Bordeaux : [À compléter]<br />
                Numéro de TVA intracommunautaire : [À compléter]
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">2. Directeur de la publication</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Julie et José, Co-gérants<br />
                Email : contact@viteetgourmand.fr
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">3. Hébergeur</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Le site est hébergé par :<br />
                Base44<br />
                [Adresse de l'hébergeur]
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">4. Propriété intellectuelle</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                L'ensemble du contenu de ce site (textes, images, vidéos, logos, marques) est protégé 
                par le droit d'auteur et le droit des marques. Toute reproduction, représentation, 
                modification, publication, adaptation de tout ou partie des éléments du site, quel 
                que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite 
                préalable de Vite & Gourmand.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">5. Protection des données personnelles (RGPD)</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez 
                d'un droit d'accès, de rectification, de suppression et de portabilité de vos données 
                personnelles. Vous pouvez également vous opposer au traitement de vos données ou 
                demander la limitation de ce traitement.<br /><br />
                
                Pour exercer ces droits, vous pouvez nous contacter à l'adresse : contact@viteetgourmand.fr<br /><br />
                
                Les données collectées sont utilisées uniquement dans le cadre de la gestion des 
                commandes et de la relation client. Elles ne sont jamais transmises à des tiers 
                sans votre consentement explicite.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">6. Cookies</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Ce site utilise des cookies techniques nécessaires au bon fonctionnement du service. 
                En naviguant sur ce site, vous acceptez l'utilisation de ces cookies.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">7. Limitation de responsabilité</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Vite & Gourmand s'efforce d'assurer l'exactitude et la mise à jour des informations 
                diffusées sur ce site. Toutefois, elle ne peut garantir l'exactitude, la précision 
                ou l'exhaustivité des informations mises à disposition sur ce site.
              </p>
            </div>

            <div className="pt-4 border-t text-sm text-[#2C2C2C]/50">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}