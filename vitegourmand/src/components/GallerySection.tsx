import { motion } from 'motion/react';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    title: 'Buffet Mariage',
    category: 'mariage'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
    title: 'Table Gastronomique',
    category: 'gastronomie'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    title: 'Entrées Raffinées',
    category: 'entrees'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
    title: 'Desserts Gourmands',
    category: 'desserts'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
    title: 'Cocktail Reception',
    category: 'cocktail'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    title: 'Plats Signatures',
    category: 'plats'
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800',
    title: 'Finger Food',
    category: 'cocktail'
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1563897539633-7e20b13ee0c9?w=800',
    title: 'Buffet Corporatif',
    category: 'entreprise'
  },
  {
    id: '9',
    url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800',
    title: 'Pâtisseries Fines',
    category: 'desserts'
  }
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');

  const categories = ['all', 'mariage', 'gastronomie', 'cocktail', 'desserts', 'entreprise'];
  const categoryLabels: { [key: string]: string } = {
    all: 'Tout',
    mariage: 'Mariages',
    gastronomie: 'Gastronomie',
    cocktail: 'Cocktails',
    desserts: 'Desserts',
    entreprise: 'Entreprise'
  };

  const filteredImages = filter === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filter);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Notre <span className="text-orange-600">Galerie</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez nos plus belles réalisations culinaires
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                filter === category
                  ? 'bg-orange-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid - Masonry Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              style={{ height: index % 3 === 0 ? '400px' : '320px' }}
              onClick={() => openLightbox(index)}
            >
              {/* Image */}
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">{image.title}</h3>
                  <div className="flex items-center gap-2">
                    <ZoomIn className="text-white" size={20} />
                    <span className="text-white text-sm">Cliquez pour agrandir</span>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                {categoryLabels[image.category]}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <ChevronRight size={32} />
            </button>

            {/* Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredImages[selectedImage].url}
                alt={filteredImages[selectedImage].title}
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="text-center mt-4">
                <h3 className="text-white text-2xl font-bold mb-2">
                  {filteredImages[selectedImage].title}
                </h3>
                <p className="text-gray-300">
                  {selectedImage + 1} / {filteredImages.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
