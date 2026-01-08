import React from 'react';
import HeroSection from '../components/home/HeroSection';
import TeamSection from '../components/home/TeamSection';
import ReviewsSection from '../components/home/ReviewsSection';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { ChevronRight, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TeamSection />
      <ReviewsSection />
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#FFF8F0] to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-[#722F37] flex items-center justify-center mb-6">
              <UtensilsCrossed className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-4">
              Prêt à régaler vos invités ?
            </h2>
            <p className="text-lg text-[#2C2C2C]/70 mb-8 max-w-2xl mx-auto">
              Découvrez nos menus variés et laissez-nous sublimer votre prochain événement 
              avec une cuisine généreuse et raffinée.
            </p>
            <Link to={createPageUrl('Menus')}>
              <Button size="lg" className="bg-[#722F37] hover:bg-[#8B4049] text-white px-8 py-6 text-lg">
                Explorer nos menus
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}