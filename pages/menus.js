import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import MenuFilters from '../components/menus/MenuFilters';
import MenuCard from '../components/menus/MenuCard';
import { Loader2, UtensilsCrossed, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Menus() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    theme: 'all',
    regime: 'all',
    minPrice: 0,
    maxPrice: 1000,
    minPersons: 1,
  });

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await base44.entities.Menu.filter({ is_active: true });
        setMenus(data);
      } catch (e) {
        console.error('Erreur chargement menus:', e);
      } finally {
        setLoading(false);
      }
    };
    loadMenus();
  }, []);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      // Theme filter
      if (filters.theme !== 'all' && menu.theme !== filters.theme) return false;
      
      // Regime filter
      if (filters.regime !== 'all' && menu.regime !== filters.regime) return false;
      
      // Price filter
      if (menu.base_price < filters.minPrice || menu.base_price > filters.maxPrice) return false;
      
      // Min persons filter
      if (menu.min_persons > filters.minPersons) return false;
      
      return true;
    });
  }, [menus, filters]);

  const maxMenuPrice = useMemo(() => {
    return Math.max(...menus.map(m => m.base_price || 0), 500);
  }, [menus]);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Hero */}
      <section className="bg-[#722F37] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Nos Menus
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Découvrez notre sélection de menus pour tous vos événements. 
              Des saveurs authentiques préparées avec passion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <MenuFilters 
                filters={filters} 
                setFilters={setFilters}
                maxPrice={maxMenuPrice}
              />
            </div>

            {/* Menu Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
                </div>
              ) : filteredMenus.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <SearchX className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
                    Aucun menu trouvé
                  </h3>
                  <p className="text-[#2C2C2C]/60">
                    Essayez de modifier vos critères de recherche
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-[#2C2C2C]/60">
                      {filteredMenus.length} menu{filteredMenus.length > 1 ? 's' : ''} trouvé{filteredMenus.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMenus.map((menu, index) => (
                      <MenuCard key={menu.id} menu={menu} index={index} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}