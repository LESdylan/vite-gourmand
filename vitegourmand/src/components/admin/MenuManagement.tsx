import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Menu } from '../../data/menus';
import { menus as initialMenus } from '../../data/menus';
import { toast } from 'sonner@2.0.3';

interface MenuManagementProps {
  userRole: 'admin' | 'employee';
}

export default function MenuManagement({ userRole }: MenuManagementProps) {
  const [menus, setMenus] = useState<Menu[]>(initialMenus);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<Partial<Menu>>({});
  const [imageGallery, setImageGallery] = useState<string[]>([]);

  const handleCreate = () => {
    setIsEditing(true);
    setSelectedMenu(null);
    setFormData({
      id: `m${String(menus.length + 1).padStart(3, '0')}`,
      name: '',
      theme: '',
      description: '',
      composition: {
        entreeDishes: [],
        mainDishes: [],
        dessertDishes: []
      },
      dietary: [],
      minPersons: 1,
      maxPersons: 10,
      pricePerPerson: 0,
      image: '',
      allergens: [],
      stockQuantity: 0
    });
    setImageGallery([]);
  };

  const handleEdit = (menu: Menu) => {
    setIsEditing(true);
    setSelectedMenu(menu);
    setFormData(menu);
    setImageGallery([menu.image]);
  };

  const handleDelete = (menuId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
      setMenus(menus.filter(m => m.id !== menuId));
      toast.success('Menu supprimé avec succès');
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.theme || !formData.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const menuToSave: Menu = {
      ...formData,
      image: imageGallery[0] || formData.image || '',
    } as Menu;

    if (selectedMenu) {
      // Update existing
      setMenus(menus.map(m => m.id === selectedMenu.id ? menuToSave : m));
      toast.success('Menu mis à jour avec succès');
    } else {
      // Create new
      setMenus([...menus, menuToSave]);
      toast.success('Menu créé avec succès');
    }

    setIsEditing(false);
    setSelectedMenu(null);
    setFormData({});
    setImageGallery([]);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedMenu(null);
    setFormData({});
    setImageGallery([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // En production, on uploadera vers Supabase Storage
      // Pour l'instant, on simule avec des URLs
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImageGallery([...imageGallery, ...newImages]);
      toast.success(`${files.length} image(s) ajoutée(s)`);
    }
  };

  const removeImage = (index: number) => {
    setImageGallery(imageGallery.filter((_, i) => i !== index));
  };

  if (isEditing) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedMenu ? 'Modifier le menu' : 'Créer un nouveau menu'}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du menu *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Menu Gastronomique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thème *
                </label>
                <select
                  value={formData.theme || ''}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un thème</option>
                  <option value="Gastronomie">Gastronomie</option>
                  <option value="Mariage">Mariage</option>
                  <option value="Entreprise">Entreprise</option>
                  <option value="Anniversaire">Anniversaire</option>
                  <option value="Végétarien">Végétarien</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Terroir">Terroir</option>
                  <option value="Mer">Mer</option>
                  <option value="Saisons">Saisons</option>
                  <option value="Cocktail">Cocktail</option>
                  <option value="Brunch">Brunch</option>
                  <option value="Buffet">Buffet</option>
                  <option value="Noël">Noël</option>
                  <option value="Pâques">Pâques</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Décrivez ce menu..."
              />
            </div>

            {/* Image Gallery */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Galerie d'images
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {imageGallery.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                
                <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-600">Ajouter une image</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre min. de personnes *
                </label>
                <input
                  type="number"
                  value={formData.minPersons || 1}
                  onChange={(e) => setFormData({ ...formData, minPersons: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre max. de personnes *
                </label>
                <input
                  type="number"
                  value={formData.maxPersons || 10}
                  onChange={(e) => setFormData({ ...formData, maxPersons: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par personne (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePerPerson || 0}
                  onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock disponible
              </label>
              <input
                type="number"
                value={formData.stockQuantity || 0}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
              />
            </div>

            {/* Allergens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergènes (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.allergens?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  allergens: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="gluten, lait, œuf, poisson..."
              />
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conditions et notes de livraison
              </label>
              <textarea
                rows={3}
                value={formData.deliveryNotes || ''}
                onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Commander 7 jours à l'avance, Stockage au frais..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={20} />
                Enregistrer
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Menus</h1>
          <p className="text-gray-600 mt-2">
            {menus.length} menu{menus.length > 1 ? 's' : ''} disponible{menus.length > 1 ? 's' : ''}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Créer un menu
        </motion.button>
      </div>

      {/* Menu List */}
      <div className="grid grid-cols-1 gap-4">
        {menus.map((menu) => (
          <motion.div
            key={menu.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex gap-6">
              {/* Image */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                {menu.image ? (
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-gray-400" size={32} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {menu.name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                      {menu.theme}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {menu.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Prix:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {menu.pricePerPerson.toFixed(2)}€/pers.
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Personnes:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {menu.minPersons} - {menu.maxPersons}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stock:</span>
                    <span className={`ml-2 font-semibold ${menu.stockQuantity <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                      {menu.stockQuantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Allergènes:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {menu.allergens.length}
                    </span>
                  </div>
                </div>

                {menu.deliveryNotes && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
                    <span>{menu.deliveryNotes}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
