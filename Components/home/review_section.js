import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await base44.entities.Review.filter({ status: 'approuve' }, '-created_date', 6);
        setReviews(data);
      } catch (e) {
        console.error('Erreur chargement avis:', e);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#722F37]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#722F37] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] font-medium tracking-wider uppercase text-sm">Témoignages</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            Ce que disent nos clients
          </h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mt-4" />
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-[#722F37]/10" />
              
              <div className="flex gap-1 mb-4">
                {renderStars(review.rating)}
              </div>
              
              <p className="text-[#2C2C2C]/80 leading-relaxed mb-4 line-clamp-4">
                "{review.comment}"
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#722F37] flex items-center justify-center">
                  <span className="text-white font-medium">
                    {review.user_name?.[0]?.toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[#2C2C2C]">{review.user_name || 'Client'}</p>
                  <p className="text-xs text-gray-500">Client vérifié</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}