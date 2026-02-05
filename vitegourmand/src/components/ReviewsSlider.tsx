import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  event: string;
  image?: string;
}

const validatedReviews: Review[] = [
  {
    id: 'r1',
    author: 'Marie D.',
    rating: 5,
    comment: 'Un service exceptionnel pour notre mariage ! Les plats étaient délicieux et la présentation soignée. Tous nos invités ont été ravis. Julie et José sont de vrais professionnels.',
    date: '2026-01-15',
    event: 'Mariage',
    image: 'french wedding elegant couple'
  },
  {
    id: 'r2',
    author: 'Thomas L.',
    rating: 5,
    comment: 'Nous avons fait appel à Vite & Gourmand pour un événement d\'entreprise. Le menu gastronomique était parfait, le timing impeccable. Je recommande vivement !',
    date: '2026-01-08',
    event: 'Événement Entreprise'
  },
  {
    id: 'r3',
    author: 'Sophie M.',
    rating: 5,
    comment: 'Menu végétarien excellent ! Enfin un traiteur qui sait sublimer les légumes. La qualité des produits est remarquable. Un grand merci pour ce moment gourmand.',
    date: '2025-12-20',
    event: 'Anniversaire'
  },
  {
    id: 'r4',
    author: 'Pierre & Claire',
    rating: 5,
    comment: 'Pour nos 50 ans de mariage, nous voulions quelque chose de spécial. Vite & Gourmand a dépassé nos attentes ! Le foie gras était sublime et le service irréprochable.',
    date: '2025-12-10',
    event: 'Anniversaire de Mariage'
  },
  {
    id: 'r5',
    author: 'Julien R.',
    rating: 4,
    comment: 'Très bon rapport qualité-prix. Les plats étaient savoureux et copieux. Seul petit bémol : la livraison avec 10min de retard, mais le repas valait l\'attente !',
    date: '2025-11-28',
    event: 'Fête de Famille'
  },
  {
    id: 'r6',
    author: 'Camille B.',
    rating: 5,
    comment: 'Je suis végane et j\'ai rarement mangé d\'aussi bons plats lors d\'événements. Le menu Plant-Based Délice est une véritable révélation. Merci pour cette attention !',
    date: '2025-11-15',
    event: 'Brunch'
  },
  {
    id: 'r7',
    author: 'François D.',
    rating: 5,
    comment: 'Un traiteur bordelais de qualité ! Les produits du terroir sont mis à l\'honneur. Le magret de canard était parfaitement cuit. Une belle découverte.',
    date: '2025-11-05',
    event: 'Déjeuner d\'Affaires'
  },
  {
    id: 'r8',
    author: 'Isabelle P.',
    rating: 5,
    comment: 'Organisation parfaite pour notre cocktail d\'entreprise. 80 personnes servies avec le sourire. Les verrines étaient magnifiques et délicieuses. Bravo !',
    date: '2025-10-22',
    event: 'Cocktail d\'Entreprise'
  },
  {
    id: 'r9',
    author: 'Alexandre T.',
    rating: 5,
    comment: 'Menu sans gluten au top ! En tant que coeliaque, je suis souvent déçu... mais pas cette fois ! Tout était parfait et sans risque de contamination.',
    date: '2025-10-10',
    event: 'Repas de Famille'
  },
  {
    id: 'r10',
    author: 'Nathalie & Marc',
    rating: 5,
    comment: '25 ans que Julie et José font ce métier, ça se voit ! Leur expérience apporte une sérénité totale. Le réveillon était parfait de A à Z.',
    date: '2025-01-01',
    event: 'Réveillon'
  }
];

export default function ReviewsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % validatedReviews.length);
    }, 5000); // Change toutes les 5 secondes

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % validatedReviews.length);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + validatedReviews.length) % validatedReviews.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentReview = validatedReviews[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Titre */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-gray-600">
            Plus de 25 ans d'expérience et des milliers de clients satisfaits
          </p>
        </div>

        {/* Slider */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-12 overflow-hidden">
          {/* Quote Icon */}
          <div className="absolute top-8 left-8 text-blue-100 opacity-50">
            <Quote size={80} />
          </div>

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="relative z-10"
            >
              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={28}
                    className={`${
                      i < currentReview.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <blockquote className="text-xl md:text-2xl text-gray-800 text-center mb-8 font-light leading-relaxed italic">
                "{currentReview.comment}"
              </blockquote>

              {/* Author Info */}
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  {currentReview.author}
                </p>
                <p className="text-sm text-blue-600 font-medium mb-1">
                  {currentReview.event}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(currentReview.date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-200 z-20"
            aria-label="Avis précédent"
          >
            <ChevronLeft size={24} className="text-blue-600" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-200 z-20"
            aria-label="Avis suivant"
          >
            <ChevronRight size={24} className="text-blue-600" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {validatedReviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-12 h-3 bg-blue-600'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Aller à l'avis ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-12 text-center">
          <div>
            <p className="text-4xl font-bold text-blue-600 mb-2">25+</p>
            <p className="text-sm text-gray-600">Années d'expérience</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-600 mb-2">5000+</p>
            <p className="text-sm text-gray-600">Événements réalisés</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-600 mb-2">4.9/5</p>
            <p className="text-sm text-gray-600">Note moyenne</p>
          </div>
        </div>
      </div>
    </div>
  );
}
