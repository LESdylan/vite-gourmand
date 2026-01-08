import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from "@/components/ui/button";
import { ChevronRight, Award, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=80"
          alt="Cuisine gastronomique"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C2C2C]/90 via-[#2C2C2C]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              25 ans d'excellence culinaire
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            Vite & Gourmand
            <span className="block text-[#D4AF37]">Traiteur d'exception</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-300 mb-8 leading-relaxed"
          >
            Depuis 1999, Julie et José subliment vos événements avec une cuisine raffinée, 
            créative et généreuse. Du repas familial au grand événement, 
            nous mettons notre passion au service de vos moments de partage.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to={createPageUrl('Menus')}>
              <Button size="lg" className="w-full sm:w-auto bg-[#722F37] hover:bg-[#8B4049] text-white px-8 py-6 text-lg">
                Découvrir nos menus
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                Nous contacter
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">25+</p>
                <p className="text-sm text-gray-400">Années d'expérience</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">5000+</p>
                <p className="text-sm text-gray-400">Événements réalisés</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-sm text-gray-400">Produits frais</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}