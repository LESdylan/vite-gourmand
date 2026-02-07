import { useState, useEffect } from 'react';
import { Star, ArrowRight, ChefHat, Award, Heart, Clock, Quote } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import HeroSection from '../components/layout/HeroSection';
import Footer from '../components/layout/Footer';

// Page types for internal navigation
export type Page = 'home' | 'menu' | 'contact' | 'legal-mentions' | 'legal-cgv' | 'user-profile';

// User type for authentication
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'user' | 'employee' | 'admin';
};

type HomePageProps = {
  setCurrentPage: (page: Page) => void;
};

type Review = {
  id: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
};

function featuresSection() {
  const features = [
    {
      icon: ChefHat,
      title: 'Expertise depuis 25 ans',
      description: 'Julie et José vous proposent une cuisine raffinée et authentique, fruit de 25 années d\'expérience.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Award,
      title: 'Professionnalisme',
      description: 'Une équipe dédiée et passionnée qui met tout en œuvre pour la réussite de vos événements.',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Heart,
      title: 'Sur mesure',
      description: 'Des menus personnalisables pour tous vos événements : mariages, anniversaires, réceptions professionnelles.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Clock,
      title: 'Service réactif',
      description: 'Une écoute attentive et une disponibilité pour répondre à toutes vos demandes.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">Nos atouts</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Pourquoi nous choisir ?</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Une équipe professionnelle au service de vos événements
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function teamSection(setCurrentPage: (page: Page) => void) {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1767785990437-dfe1fe516fe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwdGVhbXxlbnwxfHx8fDE3NzAxMjY5NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Notre équipe professionnelle"
                className="rounded-2xl shadow-2xl w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 bg-orange-500 rounded-2xl -z-10 hidden sm:block" />
            <div className="absolute -top-4 -left-4 w-16 h-16 sm:w-24 sm:h-24 bg-orange-200 rounded-2xl -z-10 hidden sm:block" />
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">Notre histoire</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">Une passion<br />transmise depuis<br /><span className="text-orange-600">25 ans</span></h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
              Fondée il y a 25 ans à Bordeaux par Julie et José, Vite & Gourmand est née d'une passion commune pour la gastronomie et le service.
            </p>
            <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
              Notre duo complémentaire allie créativité culinaire et sens du détail pour offrir des prestations sur mesure qui subliment vos événements.
            </p>
            <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed">
              Chaque menu est conçu avec soin, en utilisant des produits frais et de saison, pour garantir une expérience gustative mémorable.
            </p>
            <Button
              onClick={() => setCurrentPage('contact')}
              variant="outline"
              className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-6 sm:px-8 py-3 rounded-full transition-all duration-300"
            >
              Contactez-nous
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function reviewsSection(reviews: Review[], loading: boolean) {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">Témoignages</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Avis de nos clients</h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Ce qu'ils disent de nous
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviews.slice(0, 6).map((review) => (
              <Card key={review.id} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50/30">
                <CardContent className="p-6 sm:p-8">
                  <Quote className="h-8 w-8 text-orange-200 mb-4" />
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">"{review.text}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                        {review.userName.charAt(0)}
                      </div>
                      <p className="font-semibold text-gray-900">{review.userName}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucun avis pour le moment. Soyez le premier à nous évaluer !</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ctaSection(setCurrentPage: (page: Page) => void) {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-red-500" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwIDItMiAyLTQgMCAyIDIgNCAyIDRzMiAyIDQgMmMwIDAtMiAyLTIgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Prêt à organiser votre événement ?</h2>
        <p className="text-lg sm:text-xl text-orange-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Découvrez nos menus variés et passez commande en quelques clics pour créer un moment inoubliable
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setCurrentPage('menu')}
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Voir nos menus
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={() => setCurrentPage('contact')}
            variant="outline"
            size="lg"
            className="border-2 border-white/30 text-white hover:bg-white/10 px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-full transition-all duration-300"
          >
            Demander un devis
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function HomePage({ setCurrentPage }: HomePageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // TODO: Replace with actual backend API call when reviews endpoint is ready
      // const response = await apiRequest<{ reviews: Review[] }>('/api/reviews');
      // setReviews(response.reviews || []);
      
      // Mock reviews for now
      const mockReviews: Review[] = [
        {
          id: '1',
          userName: 'Marie Dupont',
          rating: 5,
          text: 'Un service exceptionnel ! Julie et José ont sublimé notre mariage avec des plats raffinés.',
          createdAt: '2025-12-15'
        },
        {
          id: '2',
          userName: 'Pierre Martin',
          rating: 5,
          text: 'Traiteur de qualité pour notre séminaire d\'entreprise. Tout le monde a adoré !',
          createdAt: '2025-11-20'
        },
        {
          id: '3',
          userName: 'Sophie Bernard',
          rating: 4,
          text: 'Excellent rapport qualité-prix. Les menus sont variés et s\'adaptent à tous les goûts.',
          createdAt: '2025-10-08'
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <HeroSection
        onExploreMenus={() => setCurrentPage('menu')}
        onContact={() => setCurrentPage('contact')}
      />
      {featuresSection()}
      {teamSection(setCurrentPage)}
      {reviewsSection(reviews, loading)}
      {ctaSection(setCurrentPage)}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
