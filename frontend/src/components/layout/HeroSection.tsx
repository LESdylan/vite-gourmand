import { ArrowRight, Play } from 'lucide-react';
import { Button } from '../ui/button';

interface HeroSectionProps {
  onExploreMenus: () => void;
  onContact: () => void;
}

export default function HeroSection({ onExploreMenus, onContact }: HeroSectionProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555244162-803834f70033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXRlcmluZyUyMGVsZWdhbnQlMjBmb29kfGVufDF8fHx8MTc3MDExMzI3Nnww&ixlib=rb-4.1.0&q=80&w=1920')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full px-4 py-2 mb-6">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-orange-200 text-sm font-medium">Traiteur à Bordeaux depuis 25 ans</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Vite & <span className="text-orange-500">Gourmand</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-200 mb-4 max-w-3xl mx-auto">
          Votre traiteur de confiance pour des événements inoubliables
        </p>

        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
          Julie et José mettent leur savoir-faire au service de vos événements pour créer des moments mémorables autour d'une cuisine raffinée et généreuse.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={onExploreMenus}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-full"
          >
            Découvrir nos menus
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={onContact}
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full backdrop-blur-sm"
          >
            <Play className="mr-2 h-5 w-5" />
            Nous contacter
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">25+</div>
            <div className="text-gray-300 text-sm mt-1">Années d'expérience</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">2000+</div>
            <div className="text-gray-300 text-sm mt-1">Événements réalisés</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">98%</div>
            <div className="text-gray-300 text-sm mt-1">Clients satisfaits</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
