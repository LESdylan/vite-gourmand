import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Image as ImageIcon, 
  Type, 
  Save, 
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Section {
  id: string;
  type: 'hero' | 'features' | 'gallery' | 'testimonials' | 'cta';
  title: string;
  subtitle?: string;
  content?: string;
  images?: string[];
  visible: boolean;
}

export default function ContentManagementSystem() {
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'hero',
      type: 'hero',
      title: 'Vite & Gourmand',
      subtitle: 'Traiteur d\'Excellence à Bordeaux depuis 25 ans',
      content: 'Nous subliment vos événements avec des créations culinaires d\'exception',
      images: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=1200'],
      visible: true
    },
    {
      id: 'features',
      type: 'features',
      title: 'Nos Services',
      subtitle: 'Excellence et professionnalisme',
      visible: true
    },
    {
      id: 'gallery',
      type: 'gallery',
      title: 'Nos Créations',
      subtitle: 'Découvrez nos plus belles réalisations',
      images: [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=600',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600'
      ],
      visible: true
    },
    {
      id: 'testimonials',
      type: 'testimonials',
      title: 'Avis Clients',
      subtitle: 'Ce que nos clients disent de nous',
      visible: true
    },
    {
      id: 'cta',
      type: 'cta',
      title: 'Prêt à Commencer ?',
      subtitle: 'Contactez-nous pour un devis personnalisé',
      content: 'Réponse sous 24h garantie',
      visible: true
    }
  ]);

  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const handleSave = async (updatedSection: Section) => {
    setSections(sections.map(s => s.id === updatedSection.id ? updatedSection : s));
    setEditingSection(null);
    toast.success('Section mise à jour avec succès');

    // TODO: Sauvegarder dans Supabase
    // await supabase.from('homepage_sections').upsert(updatedSection);
  };

  const handleToggleVisibility = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    ));
    toast.success('Visibilité mise à jour');
  };

  const handleImageUpload = (sectionId: string, files: FileList) => {
    // En production: upload vers Supabase Storage
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, images: [...(s.images || []), ...newImages] }
        : s
    ));

    toast.success(`${files.length} image(s) ajoutée(s)`);
  };

  const handleRemoveImage = (sectionId: string, imageUrl: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, images: s.images?.filter(img => img !== imageUrl) }
        : s
    ));
  };

  if (editingSection) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Modifier: {editingSection.title}
            </h2>
            <button
              onClick={() => setEditingSection(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre principal
              </label>
              <input
                type="text"
                value={editingSection.title}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-titre
              </label>
              <input
                type="text"
                value={editingSection.subtitle || ''}
                onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Content */}
            {(editingSection.type === 'hero' || editingSection.type === 'cta') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu
                </label>
                <textarea
                  rows={4}
                  value={editingSection.content || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Images */}
            {(editingSection.type === 'hero' || editingSection.type === 'gallery') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {editingSection.images?.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(editingSection.id, img)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                    <Upload className="text-gray-400 mb-2" size={24} />
                    <span className="text-sm text-gray-600">Ajouter</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(editingSection.id, e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleSave(editingSection)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={20} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion du Contenu</h1>
        <p className="text-gray-600 mt-2">
          Modifiez le contenu et les images de votre site web
        </p>
      </div>

      {/* Preview Toggle */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="text-blue-600" size={24} />
          <div>
            <p className="font-semibold text-blue-900">Mode Aperçu</p>
            <p className="text-sm text-blue-700">Visualisez les modifications en temps réel</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
          Voir le site
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-md overflow-hidden ${
              !section.visible ? 'opacity-60' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium uppercase">
                      {section.type}
                    </span>
                  </div>
                  {section.subtitle && (
                    <p className="text-gray-600">{section.subtitle}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleVisibility(section.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      section.visible 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => setEditingSection(section)}
                    className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                </div>
              </div>

              {/* Content Preview */}
              {section.content && (
                <p className="text-gray-600 mb-4 line-clamp-2">{section.content}</p>
              )}

              {/* Images Preview */}
              {section.images && section.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {section.images.slice(0, 4).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                  {section.images.length > 4 && (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-semibold">+{section.images.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Section Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-orange-600 font-semibold"
      >
        <Plus size={20} />
        Ajouter une section
      </motion.button>
    </div>
  );
}
