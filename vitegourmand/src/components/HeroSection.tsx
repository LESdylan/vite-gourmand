import React from 'react';
import { Button } from './ui/button';
import { ChefHat, Star, Users, Award } from 'lucide-react';
import { unsplash_tool } from '../tools';

type HeroSectionProps = {
  onExploreMenus: () => void;
  onContact: () => void;
};

export default function HeroSection({ onExploreMenus, onContact }: HeroSectionProps) {
  return (
    <div className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Hero Section with Video Background */}
      <div className="relative overflow-hidden">
        {/* Background Video Area */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full bg-gradient-to-r from-black/70 to-black/50">
            {/* Video placeholder - In production, replace with actual video */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555244162-803834f70033?w=1920')] bg-cover bg-center opacity-40"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 bg-orange-600 rounded-full mb-6 animate-pulse">
              <ChefHat className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Vite & Gourmand
            </h1>
            
            <p className="text-xl md:text-2xl text-orange-100 mb-4 max-w-3xl mx-auto">
              Traiteur bordelais depuis 25 ans
            </p>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              L'excellence culinaire au service de vos événements. 
              Julie et José transforment chaque moment en une expérience gastronomique inoubliable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={onExploreMenus}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg shadow-2xl hover:shadow-orange-500/50 transition-all"
              >
                Découvrir nos menus
              </Button>
              <Button
                onClick={onContact}
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg"
              >
                Nous contacter
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">25+</div>
                <div className="text-sm text-orange-100">Années d'expérience</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">5000+</div>
                <div className="text-sm text-orange-100">Événements réussis</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-8 w-8 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
                <div className="text-sm text-orange-100">Satisfaction client</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <ChefHat className="h-8 w-8 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">15+</div>
                <div className="text-sm text-orange-100">Menus signature</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir Vite & Gourmand ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une équipe passionnée au service de votre événement
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <ChefHat className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Cuisine d'Excellence
            </h3>
            <p className="text-gray-600 text-center">
              Des plats raffinés préparés avec des produits frais et locaux, 
              dans le respect des traditions culinaires bordelaises.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Service Personnalisé
            </h3>
            <p className="text-gray-600 text-center">
              Une équipe dévouée à votre écoute pour créer un événement 
              sur-mesure qui dépasse vos attentes.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Award className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Expérience Prouvée
            </h3>
            <p className="text-gray-600 text-center">
              25 ans d'expertise au service des particuliers et des entreprises 
              à Bordeaux et ses environs.
            </p>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Découvrez notre savoir-faire
            </h2>
            <p className="text-lg text-gray-300">
              Un aperçu de notre cuisine et de notre équipe
            </p>
          </div>
          
          <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            {/* Video Placeholder - Replace with actual video in production */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900 to-orange-700 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 mb-4 inline-block">
                  <svg className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-white text-lg">Vidéo de présentation</p>
                <p className="text-orange-200 text-sm mt-2">Cliquez pour lire</p>
              </div>
            </div>
            {/* In production, use: <video src="..." controls /> */}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à organiser votre événement ?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Contactez-nous dès aujourd'hui pour discuter de vos besoins 
            et recevoir un devis personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onExploreMenus}
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg"
            >
              Voir les menus
            </Button>
            <Button
              onClick={onContact}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              Demander un devis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
