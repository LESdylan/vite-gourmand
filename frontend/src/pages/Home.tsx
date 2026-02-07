import { useState, useEffect } from 'react';
import { Star, ArrowRight, ChefHat, Award, Heart, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import HeroSection from '../components/layout/HeroSection';

// Page types for internal navigation
export type Page = 'home' | 'menu' | 'contact' | 'legal-mentions' | 'legal-cgv';

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
      description: 'Julie et José vous proposent une cuisine raffinée et authentique, fruit de 25 années d\'expérience.'
    },
    {
      icon: Award,
      title: 'Professionnalisme',
      description: 'Une équipe dédiée et passionnée qui met tout en œuvre pour la réussite de vos événements.'
    },
    {
      icon: Heart,
      title: 'Sur mesure',
      description: 'Des menus personnalisables pour tous vos événements : mariages, anniversaires, réceptions professionnelles.'
    },
    {
      icon: Clock,
      title: 'Service réactif',
      description: 'Une écoute attentive et une disponibilité pour répondre à toutes vos demandes.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi nous choisir ?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une équipe professionnelle au service de vos événements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-orange-500 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1767785990437-dfe1fe516fe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwdGVhbXxlbnwxfHx8fDE3NzAxMjY5NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Notre équipe professionnelle"
              className="rounded-lg shadow-xl w-full h-[400px] object-cover"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre histoire</h2>
            <p className="text-lg text-gray-700 mb-4">
              Fondée il y a 25 ans à Bordeaux par Julie et José, Vite & Gourmand est née d'une passion commune pour la gastronomie et le service.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Notre duo complémentaire allie créativité culinaire et sens du détail pour offrir des prestations sur mesure qui subliment vos événements, qu'il s'agisse d'un simple repas familial ou d'une grande réception.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Chaque menu est conçu avec soin, en utilisant des produits frais et de saison, pour garantir une expérience gustative mémorable à vos convives.
            </p>
            <Button
              onClick={() => setCurrentPage('contact')}
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              Contactez-nous
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function reviewsSection(reviews: Review[], loading: boolean) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Avis de nos clients</h2>
          <p className="text-xl text-gray-600">
            Ce qu'ils disent de nous
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.slice(0, 6).map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{review.userName}</p>
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
    <section className="py-20 bg-orange-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-6">Prêt à organiser votre événement ?</h2>
        <p className="text-xl mb-8">
          Découvrez nos menus variés et passez commande en quelques clics
        </p>
        <Button
          onClick={() => setCurrentPage('menu')}
          size="lg"
          className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg"
        >
          Voir nos menus
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
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
    </div>
  );
}
