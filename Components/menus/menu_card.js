import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Euro, Eye, ShoppingCart, Leaf, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const themeLabels = {
  noel: { label: 'Noël', color: 'bg-red-100 text-red-800' },
  paques: { label: 'Pâques', color: 'bg-yellow-100 text-yellow-800' },
  classique: { label: 'Classique', color: 'bg-blue-100 text-blue-800' },
  evenement: { label: 'Événement', color: 'bg-purple-100 text-purple-800' },
};

const regimeLabels = {
  classique: { label: 'Classique', icon: null },
  vegetarien: { label: 'Végétarien', icon: Leaf },
  vegan: { label: 'Vegan', icon: Leaf },
  sans_gluten: { label: 'Sans gluten', icon: null },
  halal: { label: 'Halal', icon: null },
};

export default function MenuCard({ menu, index = 0 }) {
  const theme = themeLabels[menu.theme] || themeLabels.classique;
  const regime = regimeLabels[menu.regime] || regimeLabels.classique;
  const isLowStock = menu.stock !== undefined && menu.stock <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={menu.images?.[0] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop'}
          alt={menu.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className={theme.color}>{theme.label}</Badge>
          {regime.icon && (
            <Badge className="bg-green-100 text-green-800">
              <regime.icon className="w-3 h-3 mr-1" />
              {regime.label}
            </Badge>
          )}
        </div>

        {/* Stock Warning */}
        {isLowStock && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-orange-500 text-white flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Plus que {menu.stock}
            </Badge>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
            <span className="text-xl font-bold text-[#722F37]">{menu.base_price}€</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-[#2C2C2C] mb-2 line-clamp-1 group-hover:text-[#722F37] transition-colors">
          {menu.title}
        </h3>
        
        <p className="text-[#2C2C2C]/70 text-sm mb-4 line-clamp-2 leading-relaxed">
          {menu.description}
        </p>

        {/* Info */}
        <div className="flex items-center gap-4 text-sm text-[#2C2C2C]/60 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Min. {menu.min_persons} pers.</span>
          </div>
          <div className="flex items-center gap-1">
            <Euro className="w-4 h-4" />
            <span>À partir de {menu.base_price}€</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to={createPageUrl(`MenuDetail?id=${menu.id}`)} className="flex-1">
            <Button variant="outline" className="w-full border-[#722F37] text-[#722F37] hover:bg-[#722F37] hover:text-white">
              <Eye className="w-4 h-4 mr-2" />
              Voir détail
            </Button>
          </Link>
          <Link to={createPageUrl(`Order?menuId=${menu.id}`)}>
            <Button className="bg-[#722F37] hover:bg-[#8B4049] text-white">
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}