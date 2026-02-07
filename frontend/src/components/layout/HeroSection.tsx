import { ArrowRight, Play } from 'lucide-react';
import { Button } from '../ui/button';

interface HeroSectionProps {
  onExploreMenus: () => void;
  onContact: () => void;
}

export default function HeroSection({ onExploreMenus, onContact }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555244162-803834f70033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXRlcmluZyUyMGVsZWdhbnQlMjBmb29kfGVufDF8fHx8MTc3MDExMzI3Nnww&ixlib=rb-4.1.0&q=80&w=1920')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-orange-900/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-md border border-orange-400/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
          <span className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-orange-100 text-xs sm:text-sm font-medium tracking-wide">Traiteur à Bordeaux depuis 25 ans</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
          Vite & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Gourmand</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-3 sm:mb-4 max-w-3xl mx-auto font-light">
          Votre traiteur de confiance pour des événements inoubliables
        </p>

        <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
          Julie et José mettent leur savoir-faire au service de vos événements pour créer des moments mémorables autour d'une cuisine raffinée et généreuse.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16">
          <Button
            onClick={onExploreMenus}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
          >
            Découvrir nos menus
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={onContact}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-full backdrop-blur-sm transition-all duration-300"
          >
            <Play className="mr-2 h-5 w-5" />
            Nous contacter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl sm:max-w-2xl mx-auto">
          <div className="text-center p-3 sm:p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">25+</div>
            <div className="text-gray-300 text-xs sm:text-sm mt-1">Années d'expérience</div>
          </div>
          <div className="text-center p-3 sm:p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">2000+</div>
            <div className="text-gray-300 text-xs sm:text-sm mt-1">Événements réalisés</div>
          </div>
          <div className="text-center p-3 sm:p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">98%</div>
            <div className="text-gray-300 text-xs sm:text-sm mt-1">Clients satisfaits</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
