import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  ChefHat, 
  Award, 
  Users, 
  Star, 
  Clock, 
  Heart, 
  Sparkles,
  TrendingUp,
  Calendar,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';
import type { Page } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageNewProps {
  setCurrentPage: (page: Page) => void;
}

// Counter animation component
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}

export default function HomePageNew({ setCurrentPage }: HomePageNewProps) {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const features = [
    {
      icon: Award,
      title: '25 ans d\'excellence',
      description: 'Un quart de siècle d\'expérience au service de vos événements',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Users,
      title: '5000+ événements',
      description: 'Des milliers de clients satisfaits nous font confiance',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      icon: Star,
      title: 'Note 4.9/5',
      description: 'Excellence reconnue par nos clients',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Heart,
      title: '100% fait maison',
      description: 'Des produits frais et locaux, cuisinés avec passion',
      color: 'from-red-400 to-rose-500'
    }
  ];

  const services = [
    {
      title: 'Mariages',
      description: 'Le plus beau jour de votre vie mérite un repas d\'exception',
      image: 'https://images.unsplash.com/photo-1758810742443-b82f48355828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2F0ZXJpbmclMjBlbGVnYW50JTIwdGFibGV8ZW58MXx8fHwxNzcwMDMxMDUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      stats: '500+ mariages'
    },
    {
      title: 'Événements d\'entreprise',
      description: 'Impressionnez vos clients et collaborateurs',
      image: 'https://images.unsplash.com/photo-1578366941741-9e517759c620?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXRlcmluZyUyMHNlcnZpY2UlMjBwcm9mZXNzaW9uYWwlMjB0ZWFtfGVufDF8fHx8MTc3MDEzNzQxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
      stats: '200+ entreprises'
    },
    {
      title: 'Anniversaires & fêtes',
      description: 'Célébrez en grand avec nos menus festifs',
      image: 'https://images.unsplash.com/photo-1630237399805-9c950e5685b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMHBhcnR5JTIwZm9vZCUyMHRhYmxlfGVufDF8fHx8MTc3MDEzNzQxNXww&ixlib=rb-4.1.0&q=80&w=1080',
      stats: '1000+ fêtes'
    },
    {
      title: 'Cocktails & réceptions',
      description: 'Des bouchées raffinées pour vos soirées networking',
      image: 'https://images.unsplash.com/photo-1683027922895-8022e129ae08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMHBhcnR5JTIwYXBwZXRpemVycyUyMGVsZWdhbnR8ZW58MXx8fHwxNzcwMTM3NDE1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      stats: '300+ cocktails'
    }
  ];

  const promises = [
    { icon: Clock, text: 'Livraison ponctuelle garantie' },
    { icon: CheckCircle, text: 'Ingrédients frais du jour' },
    { icon: Award, text: 'Chefs expérimentés' },
    { icon: Heart, text: 'Service personnalisé' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Parallax */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1725323720337-0d15df1e62b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBnYXN0cm9ub215JTIwZWxlZ2FudCUyMHBsYXRpbmd8ZW58MXx8fHwxNzcwMTM3NDExfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Gastronomie française"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-orange-600/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="text-orange-400" size={20} />
              <span className="text-orange-200 font-medium">25 ans d'excellence culinaire</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Vite & Gourmand
            </h1>
            <p className="text-xl md:text-3xl mb-4 text-gray-200 font-light">
              Traiteur d'exception à Bordeaux
            </p>
            <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-3xl mx-auto">
              Depuis 25 ans, Julie et José subliment vos événements avec une cuisine raffinée et authentique
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage('menu')}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-lg shadow-2xl flex items-center gap-2 group"
              >
                Découvrir nos menus
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage('contact')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/50 rounded-full font-bold text-lg flex items-center gap-2"
              >
                <Calendar size={20} />
                Nous contacter
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 25, suffix: '+', label: 'Années d\'expérience' },
              { value: 5000, suffix: '+', label: 'Événements réalisés' },
              { value: 50, suffix: '', label: 'Menus disponibles' },
              { value: 98, suffix: '%', label: 'Clients satisfaits' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-orange-100 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
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
              Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-gray-600">
              L'excellence au service de vos événements
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
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with Images */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos services
            </h2>
            <p className="text-xl text-gray-600">
              Un traiteur pour chaque occasion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="inline-block px-4 py-1 bg-orange-600 rounded-full text-sm font-semibold mb-3">
                    {service.stats}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-200">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promises */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Nos engagements
            </h2>
            <p className="text-xl text-blue-100">
              La qualité avant tout
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {promises.map((promise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <promise.icon size={36} />
                </motion.div>
                <p className="text-lg font-medium">{promise.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chef Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1596189181426-7f63a1737f0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBjaGVmJTIwY29va2luZyUyMGtpdGNoZW58ZW58MXx8fHwxNzcwMTM3NDE2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Chef"
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-8 -right-8 w-32 h-32 bg-orange-600 rounded-full flex items-center justify-center text-4xl font-bold"
              >
                25
                <span className="text-lg ml-1">ans</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-600/20 rounded-full px-4 py-2 mb-6">
                <ChefHat size={20} className="text-orange-400" />
                <span className="text-orange-400 font-medium">Nos fondateurs</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Julie & José
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                Depuis 1999, nous partageons notre passion pour la gastronomie bordelaise avec authenticité et créativité.
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Formés dans les plus grandes maisons, nous avons décidé de mettre notre savoir-faire au service de vos événements. Chaque prestation est unique, pensée et réalisée avec le même soin que si nous recevions dans notre propre maison.
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage('menu')}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-full font-bold"
                >
                  Découvrir nos créations
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage('contact')}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full font-bold"
                >
                  Nous rencontrer
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fresh Ingredients Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Des produits d'exception
            </h2>
            <p className="text-xl text-gray-600">
              Sélectionnés avec soin auprès de nos producteurs locaux
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'https://images.unsplash.com/photo-1760368104756-5dc09d63f471?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGluZ3JlZGllbnRzJTIwbWFya2V0JTIwcHJvZHVjZXxlbnwxfHx8fDE3NzAxMzc0MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
              'https://images.unsplash.com/photo-1663411760528-c2e0d2a35fed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFzb25hbCUyMGZvb2QlMjBhdXR1bW4lMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3MDEzNzQxNnww&ixlib=rb-4.1.0&q=80&w=1080',
              'https://images.unsplash.com/photo-1564093497595-593b96d80180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwZm9vZCUyMGNvbG9yZnVsJTIwcGxhdHRlcnxlbnwxfHx8fDE3NzAxMzc0MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
              'https://images.unsplash.com/photo-1769816042382-969141ce4b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFmb29kJTIwcGxhdHRlciUyMGdvdXJtZXR8ZW58MXx8fHwxNzcwMTM3NDEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
              'https://images.unsplash.com/photo-1627855974700-2be88ada572f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdhbiUyMGZvb2QlMjBiZWF1dGlmdWwlMjBwcmVzZW50YXRpb258ZW58MXx8fHwxNzcwMTM3NDEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
              'https://images.unsplash.com/photo-1769638913569-40fc740b44f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicnVuY2glMjBidWZmZXQlMjB0YWJsZSUyMHNwcmVhZHxlbnwxfHx8fDE3NzAxMzc0MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
            ].map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                <img
                  src={img}
                  alt={`Produit ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <Sparkles size={64} className="text-yellow-300" />
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Prêt à régaler vos invités ?
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              Découvrez nos 50 menus et trouvez celui qui sublimera votre événement
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage('menu')}
              className="px-12 py-5 bg-white text-orange-600 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transition-shadow flex items-center gap-3 mx-auto group"
            >
              Explorer nos menus
              <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
