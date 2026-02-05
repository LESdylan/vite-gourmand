import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  Users,
  Utensils
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'commande' | 'livraison' | 'paiement';
}

const faqData: FAQItem[] = [
  {
    question: "Quel est le délai de commande minimum ?",
    answer: "Nous recommandons de commander au moins 72 heures à l'avance pour garantir la disponibilité. Pour les événements importants (mariages, entreprise), nous conseillons 2 à 4 semaines à l'avance.",
    category: 'commande'
  },
  {
    question: "Livrez-vous partout dans la région bordelaise ?",
    answer: "Oui ! Nous livrons dans toute la CUB (Bordeaux et ses communes). Les frais de livraison sont de 5€ pour Bordeaux + 0,59€/km au-delà. Nous pouvons également livrer dans toute l'Aquitaine sur demande.",
    category: 'livraison'
  },
  {
    question: "Puis-je personnaliser un menu existant ?",
    answer: "Absolument ! Tous nos menus sont personnalisables. Vous pouvez modifier les plats, ajouter des options, ou créer un menu sur mesure. Contactez-nous pour discuter de vos envies.",
    category: 'general'
  },
  {
    question: "Gérez-vous les allergies alimentaires ?",
    answer: "Oui, nous prenons très au sérieux les allergies et intolérances. Chaque menu indique les allergènes présents, et nous pouvons adapter nos recettes selon vos besoins. N'hésitez pas à nous signaler toute allergie.",
    category: 'commande'
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer: "Nous acceptons les paiements par carte bancaire, virement, chèque, et espèces. Pour les entreprises, nous proposons également la facturation avec paiement différé.",
    category: 'paiement'
  },
  {
    question: "Proposez-vous un service de dégustation ?",
    answer: "Oui ! Pour les événements importants (50+ personnes), nous proposons des dégustations sur rendez-vous dans notre atelier. C'est gratuit et sans engagement.",
    category: 'general'
  },
  {
    question: "Fournissez-vous la vaisselle et le service ?",
    answer: "Oui, nous proposons plusieurs formules : livraison simple, livraison avec vaisselle jetable élégante, ou service complet avec vaisselle, personnel et déco. Tout dépend de vos besoins !",
    category: 'livraison'
  },
  {
    question: "Avez-vous des menus végétariens et vegan ?",
    answer: "Bien sûr ! Nous avons une large sélection de menus végétariens et vegan (voir menus m013 à m018). Tous nos plats végétaux sont créatifs, savoureux et équilibrés.",
    category: 'general'
  },
  {
    question: "Comment annuler ou modifier ma commande ?",
    answer: "Vous pouvez modifier votre commande jusqu'à 48h avant l'événement sans frais. Pour les annulations, des frais peuvent s'appliquer selon le délai (voir nos CGV).",
    category: 'commande'
  },
  {
    question: "Proposez-vous des menus pour enfants ?",
    answer: "Oui ! Notre menu 'Celebration Kids' (m011) est spécialement conçu pour les enfants, avec des plats adaptés et sans allergènes sur demande.",
    category: 'general'
  }
];

export default function ContactPageNew() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message envoyé ! Nous vous répondrons dans les 24h.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const handleWhatsApp = () => {
    // Numéro WhatsApp Business de Vite & Gourmand
    const phoneNumber = '33556000000'; // À remplacer par le vrai numéro
    const message = encodeURIComponent('Bonjour, je souhaite obtenir des informations sur vos services de traiteur.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl md:text-2xl text-orange-100">
              Une question ? Un projet ? Parlons-en ensemble !
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Nos coordonnées
            </h2>

            <div className="space-y-6">
              {/* Téléphone */}
              <motion.a
                href="tel:+33556000000"
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Phone className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                  <p className="text-gray-600">05 56 00 00 00</p>
                  <p className="text-sm text-gray-500 mt-1">Lun-Ven: 9h-18h</p>
                </div>
              </motion.a>

              {/* Email */}
              <motion.a
                href="mailto:contact@viteetgourmand.fr"
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">contact@viteetgourmand.fr</p>
                  <p className="text-sm text-gray-500 mt-1">Réponse sous 24h</p>
                </div>
              </motion.a>

              {/* WhatsApp */}
              <motion.button
                onClick={handleWhatsApp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow w-full"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-green-100">Discutez avec nous en direct !</p>
                  <p className="text-sm text-green-200 mt-1">Réponse immédiate 9h-18h</p>
                </div>
              </motion.button>

              {/* Adresse */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                  <p className="text-gray-600">123 Avenue de la Gastronomie</p>
                  <p className="text-gray-600">33000 Bordeaux</p>
                  <a 
                    href="https://maps.google.com/?q=Bordeaux+France" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-700 mt-2 inline-block"
                  >
                    Voir sur Google Maps →
                  </a>
                </div>
              </motion.div>

              {/* Horaires */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Clock className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Horaires</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Lun-Ven:</strong> 9h00 - 18h00</p>
                    <p><strong>Samedi:</strong> 10h00 - 14h00</p>
                    <p><strong>Dimanche:</strong> Fermé</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Formulaire de contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Julie Dupont"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="julie@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="devis">Demande de devis</option>
                    <option value="info">Informations générales</option>
                    <option value="menu">Question sur un menu</option>
                    <option value="commande">Suivi de commande</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Décrivez votre projet, vos besoins, le nombre de personnes, la date de l'événement..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Envoyer le message
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Toutes les réponses à vos questions
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { key: 'all', label: 'Toutes', icon: Utensils },
              { key: 'general', label: 'Général', icon: MessageCircle },
              { key: 'commande', label: 'Commande', icon: Calendar },
              { key: 'livraison', label: 'Livraison', icon: MapPin },
              { key: 'paiement', label: 'Paiement', icon: CheckCircle2 }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === key
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredFAQ.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  {openFAQ === index ? (
                    <ChevronUp className="flex-shrink-0 text-orange-600" size={24} />
                  ) : (
                    <ChevronDown className="flex-shrink-0 text-gray-400" size={24} />
                  )}
                </button>

                {openFAQ === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à déguster ?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Demandez votre devis gratuit en 2 minutes
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWhatsApp}
            className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow inline-flex items-center gap-2"
          >
            <MessageCircle size={24} />
            Discuter sur WhatsApp
          </motion.button>
        </motion.section>
      </div>
    </div>
  );
}
