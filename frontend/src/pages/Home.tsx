import { useState, useEffect, useRef } from 'react';
import { 
  Star, ArrowRight, ChefHat, Award, Heart, Clock, 
  Quote, Utensils, Users, Leaf, ChevronLeft, ChevronRight,
  Sparkles, MapPin, Check
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import HeroSection from '../components/layout/HeroSection';
import Footer from '../components/layout/Footer';

// Page types for internal navigation
export type Page = 'home' | 'menu' | 'contact' | 'legal-mentions' | 'legal-cgv' | 'user-profile';

type HomePageProps = {
  setCurrentPage: (page: Page) => void;
};

type Review = {
  id: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
  eventType?: string;
};

/**
 * HomePage - Premium landing page with smooth animations
 * 
 * Color scheme from graphical chart:
 * - Deep Bordeaux (#722F37) - Primary brand color
 * - Champagne (#D4AF37) - Accent/highlights
 * - Crème (#FFF8F0) - Light backgrounds
 * - Vert olive (#556B2F) - Success/natural
 * - Noir charbon (#1A1A1A) - Text
 */

// ========================================
// FEATURES SECTION
// ========================================
function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: ChefHat,
      title: 'Expertise culinaire',
      description: '25 années d\'expérience au service de votre palais. Une cuisine raffinée et authentique.',
      color: '#722F37'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Des produits frais et de saison, sélectionnés avec soin auprès de producteurs locaux.',
      color: '#D4AF37'
    },
    {
      icon: Heart,
      title: 'Sur mesure',
      description: 'Chaque menu est personnalisé selon vos envies, votre budget et le thème de votre événement.',
      color: '#722F37'
    },
    {
      icon: Clock,
      title: 'Réactivité',
      description: 'Une équipe disponible et à l\'écoute pour répondre à toutes vos demandes rapidement.',
      color: '#556B2F'
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-28 bg-[#FFF8F0]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section header */}
        <div 
          className={`text-center max-w-2xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-[#722F37]/10 rounded-full px-4 py-2 mb-4 sm:mb-6">
            <Utensils className="w-4 h-4 text-[#722F37]" />
            <span className="text-[#722F37] text-xs sm:text-sm font-medium">Nos engagements</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-4 sm:mb-5 leading-tight">
            Pourquoi choisir <span className="text-[#722F37]">Vite & Gourmand</span> ?
          </h2>
          <p className="text-sm sm:text-base text-[#1A1A1A]/60 leading-relaxed">
            Notre passion pour la gastronomie et notre engagement envers l'excellence 
            font de chaque événement un moment unique.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`group bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden rounded-2xl ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 sm:p-8">
                  <div 
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}12` }}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ========================================
// ABOUT SECTION
// ========================================
function AboutSection({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image column */}
          <div 
            className={`relative order-2 lg:order-1 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                alt="Julie et José - Notre équipe"
                className="rounded-2xl sm:rounded-3xl shadow-2xl w-full h-[280px] sm:h-[350px] lg:h-[450px] object-cover"
              />
              {/* Floating card */}
              <div className="absolute -bottom-4 -right-4 sm:bottom-6 sm:right-6 bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 max-w-[160px] sm:max-w-[180px]">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#D4AF37]/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold text-[#722F37]">25</span>
                </div>
                <p className="text-xs sm:text-sm text-[#1A1A1A]/60">Années d'expérience</p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-32 sm:w-48 h-32 sm:h-48 bg-[#722F37]/8 rounded-2xl sm:rounded-3xl -z-10 hidden lg:block" />
            <div className="absolute -top-6 -right-6 w-24 sm:w-32 h-24 sm:h-32 bg-[#D4AF37]/15 rounded-2xl sm:rounded-3xl -z-10 hidden lg:block" />
          </div>

          {/* Text column */}
          <div 
            className={`order-1 lg:order-2 space-y-5 sm:space-y-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-2">
              <Heart className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs sm:text-sm font-medium">Notre histoire</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] leading-tight">
              Une passion<br />
              <span className="text-[#722F37]">transmise</span> depuis<br />
              deux générations
            </h2>
            
            <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-[#722F37] to-[#D4AF37] rounded-full" />
            
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-[#1A1A1A]/70 leading-relaxed">
              <p>
                Fondée il y a 25 ans à Bordeaux par <strong className="text-[#1A1A1A]">Julie et José</strong>, 
                Vite & Gourmand est née d'une passion commune pour la gastronomie.
              </p>
              <p>
                Notre duo allie créativité culinaire et sens du détail pour offrir 
                des prestations sur mesure qui subliment vos événements.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
              <Button
                onClick={() => setCurrentPage('contact')}
                size="default"
                className="w-full sm:w-auto justify-center"
              >
                Nous rencontrer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentPage('menu')}
                variant="outline"
                size="default"
                className="w-full sm:w-auto justify-center"
              >
                Voir nos menus
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================================
// SERVICES SECTION
// ========================================
function ServicesSection({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      title: 'Mariages',
      description: 'De l\'apéritif au dessert, un menu sur mesure pour le plus beau jour.',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
      persons: '30 - 300 personnes'
    },
    {
      title: 'Événements d\'entreprise',
      description: 'Séminaires, cocktails, team building... Impressionnez vos collaborateurs.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
      persons: '10 - 200 personnes'
    },
    {
      title: 'Réceptions privées',
      description: 'Anniversaires, baptêmes, communions... Des moments de partage inoubliables.',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600',
      persons: '10 - 100 personnes'
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-28 bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section header */}
        <div 
          className={`text-center max-w-2xl mx-auto mb-10 sm:mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 rounded-full px-4 py-2 mb-4 sm:mb-6">
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs sm:text-sm font-medium">Nos prestations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-5">
            Un service adapté à <span className="text-[#D4AF37]">chaque occasion</span>
          </h2>
          <p className="text-sm sm:text-base text-white/50">
            Quel que soit votre événement, nous avons la solution pour vous régaler.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onClick={() => setCurrentPage('menu')}
            >
              <div className="aspect-[4/5] sm:aspect-[3/4] relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/50 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 mb-3">
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />
                    <span className="text-white/80 text-xs">{service.persons}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center text-[#D4AF37] text-sm font-medium group-hover:gap-3 gap-2 transition-all">
                    <span>Découvrir</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// TESTIMONIALS CAROUSEL
// ========================================
function TestimonialsSection({ reviews, loading }: { reviews: Review[], loading: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0 || !isVisible) return;
    
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
        setTimeout(() => setIsAnimating(false), 600);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length, isVisible, isAnimating]);

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 lg:py-40 bg-gradient-to-b from-[#FFF8F0] via-white to-[#FFF8F0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section header */}
        <div 
          className={`text-center max-w-3xl mx-auto mb-16 sm:mb-20 lg:mb-24 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-3 bg-[#722F37]/10 rounded-full px-6 py-3 mb-8 sm:mb-10">
            <Quote className="w-5 h-5 text-[#722F37]" />
            <span className="text-[#722F37] text-sm sm:text-base font-medium">Témoignages clients</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-6 sm:mb-8">
            Ce que nos <span className="text-[#722F37]">clients</span> disent de nous
          </h2>
          <p className="text-base sm:text-lg text-[#1A1A1A]/60 leading-relaxed max-w-2xl mx-auto">
            La satisfaction de nos clients est notre plus belle récompense. Découvrez leurs témoignages.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-14 h-14 border-4 border-[#722F37]/20 border-t-[#722F37] rounded-full animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          <div 
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            {/* Decorative quote */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-[250px] font-serif text-[#722F37]/[0.03] pointer-events-none select-none hidden lg:block leading-none">
              "
            </div>
            
            {/* Carousel container */}
            <div 
              className="relative"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className="overflow-hidden rounded-3xl">
                <div 
                  className="flex"
                  style={{ 
                    transform: `translateX(-${currentIndex * 100}%)`,
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {reviews.map((review, idx) => (
                    <div 
                      key={review.id} 
                      className="w-full flex-shrink-0 px-4 sm:px-8"
                    >
                      <div className="max-w-5xl mx-auto">
                        <Card className="bg-white border-0 shadow-2xl shadow-[#722F37]/10 rounded-3xl overflow-hidden">
                          <CardContent className="p-8 sm:p-12 lg:p-16 xl:p-20">
                            <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">
                              {/* Left side - Content */}
                              <div className="flex-1 space-y-8">
                                {/* Quote icon */}
                                <div className="relative inline-block">
                                  <Quote className="w-14 h-14 sm:w-16 sm:h-16 text-[#D4AF37]" />
                                  <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-full blur-2xl -z-10" />
                                </div>
                                
                                {/* Stars */}
                                <div className="flex items-center gap-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-6 h-6 sm:w-7 sm:h-7 ${
                                        i < review.rating 
                                          ? 'text-[#D4AF37] fill-[#D4AF37]' 
                                          : 'text-[#D4AF37]/20'
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-4 text-[#1A1A1A]/40 text-base font-medium">5.0</span>
                                </div>
                                
                                {/* Review text */}
                                <blockquote className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-[#1A1A1A] font-medium leading-relaxed">
                                  "{review.text}"
                                </blockquote>
                              </div>
                              
                              {/* Right side - Author card */}
                              <div className="lg:w-72 flex-shrink-0">
                                <div className="bg-gradient-to-br from-[#FFF8F0] to-[#f5ede3] rounded-2xl p-8 space-y-6 border border-[#722F37]/5">
                                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#722F37] to-[#D4AF37] flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-[#722F37]/30">
                                    {review.userName.charAt(0)}
                                  </div>
                                  <div className="space-y-2">
                                    <p className="font-bold text-[#1A1A1A] text-xl">{review.userName}</p>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-[#556B2F]" />
                                      <p className="text-[#722F37] font-medium">
                                        {review.eventType || 'Client vérifié'}
                                      </p>
                                    </div>
                                    <p className="text-[#1A1A1A]/50 text-sm pt-2">
                                      {new Date(review.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation arrows - positioned outside on desktop */}
              <button
                onClick={goToPrev}
                disabled={isAnimating}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-14 h-14 rounded-full bg-white shadow-xl shadow-[#722F37]/10 items-center justify-center text-[#722F37] hover:bg-[#722F37] hover:text-white hover:shadow-[#722F37]/30 transition-all duration-300 hover:scale-110 disabled:opacity-50 z-10"
                aria-label="Avis précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToNext}
                disabled={isAnimating}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-14 h-14 rounded-full bg-white shadow-xl shadow-[#722F37]/10 items-center justify-center text-[#722F37] hover:bg-[#722F37] hover:text-white hover:shadow-[#722F37]/30 transition-all duration-300 hover:scale-110 disabled:opacity-50 z-10"
                aria-label="Avis suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile/Tablet Navigation */}
            <div className="flex items-center justify-center gap-6 mt-10 sm:mt-12 lg:mt-14">
              <button
                onClick={goToPrev}
                disabled={isAnimating}
                className="lg:hidden w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#722F37] hover:bg-[#722F37] hover:text-white transition-all duration-300 disabled:opacity-50"
                aria-label="Avis précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Progress dots */}
              <div className="flex items-center gap-3 sm:gap-4">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    disabled={isAnimating}
                    className={`relative transition-all duration-500 rounded-full ${
                      index === currentIndex 
                        ? 'w-12 sm:w-14 h-3 sm:h-4 bg-[#722F37]' 
                        : 'w-3 sm:w-4 h-3 sm:h-4 bg-[#722F37]/20 hover:bg-[#722F37]/40'
                    }`}
                    aria-label={`Aller à l'avis ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={goToNext}
                disabled={isAnimating}
                className="lg:hidden w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#722F37] hover:bg-[#722F37] hover:text-white transition-all duration-300 disabled:opacity-50"
                aria-label="Avis suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Counter */}
            <div className="text-center mt-8">
              <span className="text-[#1A1A1A]/40 text-sm font-medium tracking-wide">
                {String(currentIndex + 1).padStart(2, '0')} / {String(reviews.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#1A1A1A]/60">Aucun avis pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ========================================
// VALUES SECTION
// ========================================
function ValuesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const values = [
    {
      icon: Leaf,
      title: 'Produits locaux',
      description: 'Nous privilégions les circuits courts et les producteurs de la région bordelaise.'
    },
    {
      icon: Heart,
      title: 'Fait maison',
      description: 'Toutes nos préparations sont réalisées dans notre cuisine, avec passion.'
    },
    {
      icon: Award,
      title: 'Qualité premium',
      description: 'Des ingrédients sélectionnés avec soin pour une qualité irréprochable.'
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Values list */}
          <div 
            className={`space-y-5 sm:space-y-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-[#556B2F]/10 rounded-full px-4 py-2">
              <Leaf className="w-4 h-4 text-[#556B2F]" />
              <span className="text-[#556B2F] text-xs sm:text-sm font-medium">Nos valeurs</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] leading-tight">
              L'engagement d'une<br />
              <span className="text-[#556B2F]">cuisine responsable</span>
            </h2>

            <div className="space-y-4 sm:space-y-5">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div 
                    key={index} 
                    className={`flex gap-4 transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                    }`}
                    style={{ transitionDelay: `${(index + 1) * 150}ms` }}
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#556B2F]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#556B2F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A1A] text-base sm:text-lg mb-1">{value.title}</h3>
                      <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image */}
          <div 
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <img
              src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600"
              alt="Produits frais et locaux"
              className="rounded-2xl sm:rounded-3xl shadow-xl w-full h-[280px] sm:h-[350px] lg:h-[400px] object-cover"
              loading="lazy"
            />
            <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-[#556B2F] text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="text-2xl sm:text-3xl font-bold mb-0.5">100%</div>
              <p className="text-white/80 text-xs sm:text-sm">Produits frais<br />et de saison</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================================
// CTA SECTION
// ========================================
function CTASection({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#722F37] via-[#722F37] to-[#5a252c]" />
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-[#D4AF37] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
      </div>
      
      <div 
        className={`relative z-10 max-w-4xl mx-auto px-8 sm:px-12 lg:px-16 text-center transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div 
          className={`inline-flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 mb-10 sm:mb-12 border border-white/20 transition-all duration-700 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          <span className="text-white text-sm sm:text-base font-medium">Prêt à vous régaler ?</span>
        </div>
        
        <h2 
          className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-8 sm:mb-10 leading-tight transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          Organisons ensemble votre<br />
          <span className="text-[#D4AF37] inline-block mt-3">prochain événement</span>
        </h2>
        
        <p 
          className={`text-base sm:text-lg lg:text-xl text-white/80 mb-12 sm:mb-14 max-w-2xl mx-auto leading-relaxed transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          Découvrez nos menus variés et laissez-nous créer une expérience 
          culinaire sur mesure pour votre occasion spéciale.
        </p>
        
        <div 
          className={`flex flex-col sm:flex-row gap-5 sm:gap-6 justify-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <Button
            onClick={() => setCurrentPage('menu')}
            variant="champagne"
            size="xl"
            className="group w-full sm:w-auto justify-center min-w-[220px] hover:scale-105 transition-transform duration-300"
          >
            Découvrir nos menus
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            onClick={() => setCurrentPage('contact')}
            variant="outlineLight"
            size="xl"
            className="w-full sm:w-auto justify-center min-w-[220px] hover:scale-105 transition-transform duration-300"
          >
            Demander un devis gratuit
          </Button>
        </div>
      </div>
    </section>
  );
}

// ========================================
// MAIN HOMEPAGE COMPONENT
// ========================================
export default function HomePage({ setCurrentPage }: HomePageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Mock reviews - replace with actual API call
      const mockReviews: Review[] = [
        {
          id: '1',
          userName: 'Marie Dupont',
          rating: 5,
          text: 'Un service exceptionnel du début à la fin ! Julie et José ont sublimé notre mariage avec des plats raffinés. Nos invités en parlent encore.',
          createdAt: '2025-12-15',
          eventType: 'Mariage'
        },
        {
          id: '2',
          userName: 'Pierre Martin',
          rating: 5,
          text: 'Traiteur de grande qualité pour notre séminaire. Ponctualité, présentation soignée et saveurs au rendez-vous. Une valeur sûre.',
          createdAt: '2025-11-20',
          eventType: 'Séminaire entreprise'
        },
        {
          id: '3',
          userName: 'Sophie Bernard',
          rating: 5,
          text: 'Les 60 ans de ma mère resteront gravés dans nos mémoires. Menu personnalisé, produits frais et une équipe aux petits soins.',
          createdAt: '2025-10-08',
          eventType: 'Anniversaire'
        },
        {
          id: '4',
          userName: 'Laurent Dubois',
          rating: 5,
          text: 'Deuxième fois que nous faisons appel à eux et toujours la même excellence. Le rapport qualité-prix est imbattable.',
          createdAt: '2025-09-22',
          eventType: 'Réception privée'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <HeroSection
        onExploreMenus={() => setCurrentPage('menu')}
        onContact={() => setCurrentPage('contact')}
      />
      <FeaturesSection />
      <AboutSection setCurrentPage={setCurrentPage} />
      <ServicesSection setCurrentPage={setCurrentPage} />
      <TestimonialsSection reviews={reviews} loading={loading} />
      <ValuesSection />
      <CTASection setCurrentPage={setCurrentPage} />
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
