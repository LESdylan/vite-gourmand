import { motion } from 'motion/react';
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  Star,
  Award,
  Users,
  ChefHat,
  Heart,
  Calendar,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function OutstandingPage() {
  const handleGoogleMaps = () => {
    // Coordonnées de Bordeaux (à remplacer par l'adresse exacte)
    window.open('https://www.google.com/maps/place/Bordeaux,+France/@44.841225,-0.5800364,13z', '_blank');
  };

  const features = [
    {
      icon: Award,
      title: '25 ans d\'expérience',
      description: 'Un quart de siècle au service de vos événements',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: ChefHat,
      title: 'Chefs passionnés',
      description: 'Julie & José, formés dans les meilleures maisons',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Users,
      title: '5000+ clients satisfaits',
      description: 'Une réputation bâtie sur l\'excellence',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Heart,
      title: '100% fait maison',
      description: 'Produits frais et locaux cuisinés avec amour',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const highlights = [
    {
      title: 'Atelier de production moderne',
      description: 'Un espace de 300m² équipé des dernières technologies pour garantir qualité et sécurité alimentaire.',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800'
    },
    {
      title: 'Showroom gourmand',
      description: 'Venez découvrir nos créations, déguster et échanger sur votre projet dans un cadre chaleureux.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    },
    {
      title: 'Cuisine de démonstration',
      description: 'Assistez à des ateliers culinaires et découvrez les secrets de nos chefs.',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'
    }
  ];

  const visitReasons = [
    'Découvrir notre showroom et nos créations',
    'Déguster nos spécialités sur place',
    'Rencontrer Julie & José en personne',
    'Discuter de votre projet événementiel',
    'Voir notre atelier de production',
    'Participer à un atelier culinaire'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1578366941741-9e517759c620?w=1200"
            alt="Notre boutique"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-orange-600/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-6 py-3 mb-6"
            >
              <MapPin className="text-orange-400" size={20} />
              <span className="text-orange-200 font-medium">Vite & Gourmand - Bordeaux</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Venez Nous Rencontrer
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Découvrez notre univers gourmand au cœur de Bordeaux
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleMaps}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-lg shadow-2xl flex items-center justify-center gap-2 group"
              >
                <Navigation size={20} />
                Itinéraire Google Maps
                <ExternalLink className="group-hover:translate-x-1 transition-transform" size={18} />
              </motion.button>

              <motion.a
                href="tel:+33556000000"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/50 rounded-full font-bold text-lg flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                05 56 00 00 00
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi nous rendre visite ?
            </h2>
            <p className="text-xl text-gray-600">
              Une expérience unique qui va au-delà de la dégustation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Nous Trouver
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600">123 Avenue de la Gastronomie</p>
                    <p className="text-gray-600">33000 Bordeaux, France</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Horaires</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Lun-Ven:</strong> 9h00 - 18h00</p>
                      <p><strong>Samedi:</strong> 10h00 - 14h00 (sur RDV)</p>
                      <p><strong>Dimanche:</strong> Fermé</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Réservez votre visite</h3>
                    <p className="text-gray-600 mb-2">Pour une visite personnalisée, prenez rendez-vous</p>
                    <a
                      href="tel:+33556000000"
                      className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                    >
                      <Phone size={16} />
                      05 56 00 00 00
                    </a>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleGoogleMaps}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 w-full md:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold flex items-center justify-center gap-2"
              >
                <Navigation size={20} />
                Y aller maintenant
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d90830.45063832716!2d-0.6571729!3d44.841225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd5527e8f751ca81%3A0x796386037b397a89!2sBordeaux%2C%20France!5e0!3m2!1sfr!2sfr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ce Qui Vous Attend
            </h2>
            <p className="text-xl text-gray-600">
              Un lieu pensé pour vous accueillir dans les meilleures conditions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={highlight.image}
                    alt={highlight.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-600">
                    {highlight.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Reasons */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              6 Bonnes Raisons de Venir
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visitReasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-800 font-medium">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Star size={64} className="mx-auto mb-6 text-yellow-300" />
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              On Vous Attend !
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              Venez partager un moment gourmand avec Julie & José
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleMaps}
                className="px-10 py-5 bg-white text-orange-600 rounded-full font-bold text-xl shadow-2xl flex items-center justify-center gap-3"
              >
                <Navigation size={24} />
                Y aller
              </motion.button>

              <motion.a
                href="tel:+33556000000"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/50 rounded-full font-bold text-xl flex items-center justify-center gap-3"
              >
                <Phone size={24} />
                Appeler
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
