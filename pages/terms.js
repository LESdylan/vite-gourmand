import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function Terms() {
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
              <FileText className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Conditions Générales de Vente
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 1 - Objet</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Les présentes conditions générales de vente (CGV) régissent les relations contractuelles 
                entre la société Vite & Gourmand et tout client souhaitant passer commande de 
                prestations traiteur via le site internet ou par tout autre moyen de communication.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 2 - Commandes</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                <strong>2.1 Passation de commande</strong><br />
                Toute commande implique l'acceptation sans réserve des présentes CGV. 
                Les commandes doivent être passées dans les délais indiqués sur chaque menu.<br /><br />
                
                <strong>2.2 Confirmation</strong><br />
                La commande n'est définitive qu'après confirmation par email de notre part et 
                validation du paiement le cas échéant.<br /><br />
                
                <strong>2.3 Modification</strong><br />
                Toute modification de commande doit être effectuée avant que celle-ci soit acceptée 
                par nos équipes. Passé ce délai, aucune modification ne sera possible sur le choix du menu.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 3 - Prix et paiement</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                <strong>3.1 Prix</strong><br />
                Les prix sont indiqués en euros TTC. Ils comprennent la prestation traiteur pour 
                le nombre de personnes minimum indiqué. Tout ajout de convives est facturé selon 
                le tarif par personne supplémentaire.<br /><br />
                
                <strong>3.2 Réduction</strong><br />
                Une réduction de 10% est automatiquement appliquée pour toute commande dépassant 
                de 5 personnes ou plus le nombre minimum prévu par le menu.<br /><br />
                
                <strong>3.3 Frais de livraison</strong><br />
                La livraison est gratuite pour Bordeaux. Pour les autres localités, des frais de 
                livraison de 5€ + 0,59€/km parcouru sont appliqués.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 4 - Livraison</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                <strong>4.1 Zone de livraison</strong><br />
                Nous livrons à Bordeaux et ses environs.<br /><br />
                
                <strong>4.2 Horaires</strong><br />
                Les livraisons sont effectuées aux horaires convenus lors de la commande. 
                Le client s'engage à être présent ou à désigner un représentant.<br /><br />
                
                <strong>4.3 Réception</strong><br />
                Le client doit vérifier l'état de la livraison lors de la réception et signaler 
                immédiatement tout problème.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 5 - Prêt de matériel</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                <strong className="text-orange-800">⚠️ Important</strong><br /><br />
                En cas de prêt de matériel (vaisselle, équipements), le client s'engage à le 
                restituer dans un délai de <strong>10 jours ouvrés</strong> suivant la prestation.<br /><br />
                
                <strong className="text-orange-800">En cas de non-restitution dans ce délai, des frais de 
                600 euros seront facturés au client</strong> pour couvrir le remplacement du matériel.<br /><br />
                
                Pour organiser la restitution du matériel, le client doit prendre contact avec 
                notre société par téléphone ou email.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 6 - Annulation</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                <strong>6.1 Par le client</strong><br />
                Le client peut annuler sa commande tant que celle-ci n'a pas été acceptée par nos équipes. 
                Après acceptation, toute annulation doit faire l'objet d'un contact avec notre service client.<br /><br />
                
                <strong>6.2 Par Vite & Gourmand</strong><br />
                En cas de force majeure ou d'impossibilité de fournir la prestation, nous nous 
                engageons à contacter le client par téléphone ou email et à lui proposer une 
                solution alternative ou un remboursement intégral.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 7 - Allergènes et régimes spéciaux</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Les allergènes présents dans nos plats sont indiqués sur chaque menu. 
                Il appartient au client de vérifier ces informations et de signaler toute 
                allergie ou intolérance alimentaire lors de la commande.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 8 - Réclamations</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Toute réclamation doit être adressée dans les 48 heures suivant la prestation 
                à l'adresse contact@viteetgourmand.fr ou par téléphone.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 9 - Données personnelles</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Les données personnelles collectées sont traitées conformément à notre politique 
                de confidentialité et au RGPD. Elles sont utilisées uniquement pour le traitement 
                des commandes et ne sont pas communiquées à des tiers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#722F37] mb-4">Article 10 - Droit applicable</h2>
              <p className="text-[#2C2C2C]/70 leading-relaxed">
                Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux 
                de Bordeaux seront seuls compétents.
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