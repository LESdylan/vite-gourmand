import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UtensilsCrossed, Plus, Edit, Trash2, Search, ChefHat, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { dishes as initialDishes } from '../../data/dishes';

interface Dish {
  id: string;
  name: string;
  category: 'entrée' | 'plat' | 'dessert' | 'accompagnement';
  description: string;
  dietary: string[];
  allergens: string[];
  stockQuantity: number;
  preparationTime: number;
  portionSize: string;
}

interface DishesManagementProps {
  userRole: 'admin' | 'employee';
}

export default function DishesManagement({ userRole }: DishesManagementProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'entrée' | 'plat' | 'dessert' | 'accompagnement'>('all');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'plat' as 'entrée' | 'plat' | 'dessert' | 'accompagnement',
    description: '',
    dietary: [] as string[],
    allergens: [] as string[],
    stockQuantity: 100,
    preparationTime: 30,
    portionSize: '1 portion'
  });

  useEffect(() => {
    // Initialize with dishes from data/dishes.ts
    setDishes(initialDishes as Dish[]);
    setLoading(false);
  }, []);

  const handleCreateDish = async () => {
    try {
      if (!formData.name || !formData.description) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const newDish: Dish = {
        id: `d-${Date.now()}`,
        ...formData
      };

      setDishes([...dishes, newDish]);
      toast.success('Plat créé avec succès');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating dish:', error);
      toast.error('Erreur lors de la création');
    }
  };

  const handleUpdateDish = async () => {
    if (!editingDish) return;

    try {
      const updatedDishes = dishes.map(d => 
        d.id === editingDish.id ? { ...d, ...formData } : d
      );
      setDishes(updatedDishes);
      toast.success('Plat modifié avec succès');
      setIsDialogOpen(false);
      setEditingDish(null);
      resetForm();
    } catch (error) {
      console.error('Error updating dish:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteDish = async (dishId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) return;

    try {
      setDishes(dishes.filter(d => d.id !== dishId));
      toast.success('Plat supprimé avec succès');
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const openCreateDialog = () => {
    setEditingDish(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      category: dish.category,
      description: dish.description,
      dietary: dish.dietary,
      allergens: dish.allergens,
      stockQuantity: dish.stockQuantity,
      preparationTime: dish.preparationTime,
      portionSize: dish.portionSize
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'plat',
      description: '',
      dietary: [],
      allergens: [],
      stockQuantity: 100,
      preparationTime: 30,
      portionSize: '1 portion'
    });
  };

  const getCategoryBadge = (category: string) => {
    const config: Record<string, { label: string; color: string }> = {
      'entrée': { label: 'Entrée', color: 'bg-blue-100 text-blue-800' },
      'plat': { label: 'Plat', color: 'bg-green-100 text-green-800' },
      'dessert': { label: 'Dessert', color: 'bg-pink-100 text-pink-800' },
      'accompagnement': { label: 'Accompagnement', color: 'bg-yellow-100 text-yellow-800' }
    };

    const conf = config[category] || { label: category, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={conf.color}>{conf.label}</Badge>;
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || dish.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Generate Cheatsheet content
  const generateCheatsheet = () => {
    const cheatsheet = `# CHEATSHEET - PLATS DISPONIBLES
## Vite & Gourmand - Guide de composition des menus

---

## 🥗 ENTRÉES (${dishes.filter(d => d.category === 'entrée').length} plats)

${dishes.filter(d => d.category === 'entrée').map(d => `
### ${d.name}
- **ID:** ${d.id}
- **Stock:** ${d.stockQuantity} portions
- **Temps de préparation:** ${d.preparationTime} min
- **Portion:** ${d.portionSize}
- **Régimes:** ${d.dietary.join(', ')}
- **Allergènes:** ${d.allergens.length > 0 ? d.allergens.join(', ') : 'Aucun'}
`).join('\n')}

---

## 🍖 PLATS PRINCIPAUX (${dishes.filter(d => d.category === 'plat').length} plats)

${dishes.filter(d => d.category === 'plat').map(d => `
### ${d.name}
- **ID:** ${d.id}
- **Stock:** ${d.stockQuantity} portions
- **Temps de préparation:** ${d.preparationTime} min
- **Portion:** ${d.portionSize}
- **Régimes:** ${d.dietary.join(', ')}
- **Allergènes:** ${d.allergens.length > 0 ? d.allergens.join(', ') : 'Aucun'}
`).join('\n')}

---

## 🍰 DESSERTS (${dishes.filter(d => d.category === 'dessert').length} plats)

${dishes.filter(d => d.category === 'dessert').map(d => `
### ${d.name}
- **ID:** ${d.id}
- **Stock:** ${d.stockQuantity} portions
- **Temps de préparation:** ${d.preparationTime} min
- **Portion:** ${d.portionSize}
- **Régimes:** ${d.dietary.join(', ')}
- **Allergènes:** ${d.allergens.length > 0 ? d.allergens.join(', ') : 'Aucun'}
`).join('\n')}

---

## 📝 COMMENT UTILISER CE CHEATSHEET

Pour composer un menu:
1. Choisissez 1-3 entrées (utiliser leurs IDs)
2. Choisissez 1-3 plats principaux
3. Choisissez 1-3 desserts
4. Vérifiez les stocks disponibles
5. Notez les allergènes pour informer les clients

**Exemple de composition de menu:**
- Entrées: e001, e003
- Plats: p001, p002
- Desserts: d001, d005

---

Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
`;

    return cheatsheet;
  };

  const downloadCheatsheet = () => {
    const content = generateCheatsheet();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cheatsheet-plats-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Cheatsheet téléchargé !');
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ChefHat className="h-8 w-8 text-orange-600" />
                Gestion des Plats
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez les plats individuels qui composent vos menus
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={downloadCheatsheet}
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Télécharger le Cheatsheet
              </Button>
              <Button
                onClick={openCreateDialog}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un plat
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{dishes.length}</div>
              <div className="text-sm text-gray-600">Total plats</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {dishes.filter(d => d.category === 'entrée').length}
              </div>
              <div className="text-sm text-gray-600">Entrées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {dishes.filter(d => d.category === 'plat').length}
              </div>
              <div className="text-sm text-gray-600">Plats principaux</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-pink-600">
                {dishes.filter(d => d.category === 'dessert').length}
              </div>
              <div className="text-sm text-gray-600">Desserts</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un plat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="entrée">Entrées</SelectItem>
                    <SelectItem value="plat">Plats</SelectItem>
                    <SelectItem value="dessert">Desserts</SelectItem>
                    <SelectItem value="accompagnement">Accompagnements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dishes Grid */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </CardContent>
          </Card>
        ) : filteredDishes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun plat trouvé</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.map((dish) => (
              <Card key={dish.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{dish.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {getCategoryBadge(dish.category)}
                        <Badge variant="outline" className="text-xs">
                          ID: {dish.id}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{dish.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium">{dish.stockQuantity} portions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Préparation:</span>
                      <span className="font-medium">{dish.preparationTime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Portion:</span>
                      <span className="font-medium">{dish.portionSize}</span>
                    </div>
                  </div>

                  {dish.dietary.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {dish.dietary.map(diet => (
                        <Badge key={diet} variant="secondary" className="text-xs">
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {dish.allergens.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      Allergènes: {dish.allergens.join(', ')}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => openEditDialog(dish)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDeleteDish(dish.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDish ? 'Modifier le plat' : 'Créer un nouveau plat'}
              </DialogTitle>
              <DialogDescription>
                {editingDish 
                  ? 'Modifiez les informations du plat ci-dessous' 
                  : 'Remplissez les informations pour créer un nouveau plat'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du plat *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrée">Entrée</SelectItem>
                    <SelectItem value="plat">Plat principal</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="accompagnement">Accompagnement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockQuantity">Stock (portions)</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="preparationTime">Temps de préparation (min)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="portionSize">Taille de portion</Label>
                <Input
                  id="portionSize"
                  value={formData.portionSize}
                  onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                  placeholder="Ex: 250g, 1 pièce..."
                />
              </div>

              <div>
                <Label>Régimes alimentaires (séparés par des virgules)</Label>
                <Input
                  value={formData.dietary.join(', ')}
                  onChange={(e) => setFormData({ ...formData, dietary: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Ex: végétarien, vegan, sans-gluten..."
                />
              </div>

              <div>
                <Label>Allergènes (séparés par des virgules)</Label>
                <Input
                  value={formData.allergens.join(', ')}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Ex: gluten, lait, œufs..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingDish(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={editingDish ? handleUpdateDish : handleCreateDish}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {editingDish ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
