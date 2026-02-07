import { useState, useMemo } from 'react';
import { Filter, Search, Users, Euro, X, ChefHat, Clock, Info, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { menus, getAllThemes } from '../data/menus';
import type { Menu, DietaryType } from '../data/menus';
import type { Page } from './Home';

type MenusPageProps = {
  setCurrentPage: (page: Page) => void;
};

// Menu Detail Modal Component
function MenuDetailModal({ 
  menu, 
  onClose, 
  onOrder 
}: { 
  menu: Menu; 
  onClose: () => void; 
  onOrder: (menu: Menu) => void;
}) {
  const getDietaryBadgeColor = (diet: string) => {
    const colors: Record<string, string> = {
      vegan: 'bg-green-100 text-green-800 border-green-200',
      végétarien: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'sans-gluten': 'bg-amber-100 text-amber-800 border-amber-200',
      'sans-lactose': 'bg-purple-100 text-purple-800 border-purple-200',
      halal: 'bg-[#FFF8F0] text-[#722F37] border-[#722F37]/20',
      casher: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      bio: 'bg-lime-100 text-lime-800 border-lime-200',
      classique: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[diet] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header Image */}
        <div className="relative h-48 sm:h-64 md:h-80">
          <img
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2.5 transition-all duration-200 shadow-lg hover:scale-105"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
          </button>
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">{menu.name}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-500 text-white border-0 px-3 py-1">{menu.theme}</Badge>
              {menu.dietary.map(diet => (
                <Badge key={diet} className={`${getDietaryBadgeColor(diet)} border px-3 py-1`}>
                  {diet}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-320px)]">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{menu.description}</p>
          </div>

          {/* Menu Composition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: 'Entrées', count: menu.composition.entreeDishes.length, gradient: 'from-green-500 to-emerald-500' },
              { title: 'Plats', count: menu.composition.mainDishes.length, gradient: 'from-orange-500 to-red-500' },
              { title: 'Desserts', count: menu.composition.dessertDishes.length, gradient: 'from-purple-500 to-pink-500' }
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-lg font-bold text-gray-900">{item.count} au choix</p>
              </div>
            ))}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
              <Users className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Convives</p>
              <p className="font-bold text-gray-900">{menu.minPersons} - {menu.maxPersons}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <Euro className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Prix/pers.</p>
              <p className="font-bold text-gray-900">{menu.pricePerPerson.toFixed(2)}€</p>
            </div>
            <div className="bg-[#FFF8F0] rounded-xl p-4 text-center border border-[#D4AF37]/20">
              <Clock className="h-6 w-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-xs text-gray-500">Stock</p>
              <p className="font-bold text-gray-900">{menu.stockQuantity} dispo.</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
              <ChefHat className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-bold text-gray-900 text-sm truncate">{menu.theme}</p>
            </div>
          </div>

          {/* Allergens */}
          {menu.allergens.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Allergènes
              </h3>
              <div className="flex flex-wrap gap-2">
                {menu.allergens.map(allergen => (
                  <Badge key={allergen} variant="outline" className="text-amber-700 border-amber-300 bg-white">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Notes */}
          {menu.deliveryNotes && (
            <div className="bg-[#FFF8F0] rounded-xl p-4 border border-[#722F37]/10">
              <p className="text-sm text-[#722F37]">
                <strong>Note de livraison:</strong> {menu.deliveryNotes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button
              onClick={() => onOrder(menu)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-12 rounded-xl text-base font-semibold shadow-lg"
              disabled={menu.stockQuantity === 0}
            >
              {menu.stockQuantity === 0 ? 'Menu épuisé' : 'Commander ce menu'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-xl text-base border-gray-300"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Menu Card Component
function MenuCard({ 
  menu, 
  onDetailClick 
}: { 
  menu: Menu; 
  onDetailClick: (menu: Menu) => void;
}) {
  const getDietaryBadgeColor = (diet: string) => {
    const colors: Record<string, string> = {
      vegan: 'bg-green-100 text-green-700',
      végétarien: 'bg-emerald-100 text-emerald-700',
      'sans-gluten': 'bg-amber-100 text-amber-700',
      classique: 'bg-gray-100 text-gray-700'
    };
    return colors[diet] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden bg-white rounded-2xl">
      {/* Menu Image */}
      <div className="h-44 sm:h-52 overflow-hidden relative">
        <img
          src={menu.image}
          alt={menu.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {menu.stockQuantity <= 5 && menu.stockQuantity > 0 && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0 shadow-lg">
            {menu.stockQuantity} restants
          </Badge>
        )}
        {menu.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Badge className="bg-gray-800 text-white text-lg px-4 py-2">Épuisé</Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">{menu.name}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">{menu.theme}</Badge>
          {menu.dietary.slice(0, 2).map(diet => (
            <Badge key={diet} className={`${getDietaryBadgeColor(diet)} border-0 text-xs`}>
              {diet}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <p className="text-gray-500 mb-4 line-clamp-2 text-sm leading-relaxed">{menu.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2 text-orange-500" />
            <span className="text-sm">{menu.minPersons} - {menu.maxPersons} personnes</span>
          </div>
          <div className="flex items-center">
            <Euro className="h-4 w-4 mr-2 text-green-500" />
            <span className="text-lg font-bold text-gray-900">{menu.pricePerPerson.toFixed(2)}€</span>
            <span className="text-sm text-gray-500 ml-1">/ personne</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={() => onDetailClick(menu)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30"
          disabled={menu.stockQuantity === 0}
        >
          {menu.stockQuantity === 0 ? 'Menu épuisé' : 'Voir le détail'}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Main MenusPage Component
export default function MenusPage({ setCurrentPage }: MenusPageProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('');
  const [minPeople, setMinPeople] = useState('');

  const themes = getAllThemes();
  const dietaryOptions: DietaryType[] = ['classique', 'végétarien', 'vegan', 'sans-gluten', 'sans-lactose', 'halal', 'casher', 'bio'];

  // Filter menus
  const filteredMenus = useMemo(() => {
    let filtered = [...menus];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(menu => 
        menu.name.toLowerCase().includes(query) ||
        menu.description.toLowerCase().includes(query) ||
        menu.theme.toLowerCase().includes(query)
      );
    }

    // Price filters
    if (priceMax) {
      filtered = filtered.filter(menu => menu.pricePerPerson <= parseFloat(priceMax));
    }
    if (priceMin) {
      filtered = filtered.filter(menu => menu.pricePerPerson >= parseFloat(priceMin));
    }

    // Theme filter
    if (selectedTheme && selectedTheme !== 'all') {
      filtered = filtered.filter(menu => menu.theme === selectedTheme);
    }

    // Dietary filter
    if (selectedDietary && selectedDietary !== 'all') {
      filtered = filtered.filter(menu => 
        menu.dietary.includes(selectedDietary as DietaryType)
      );
    }

    // Min people filter
    if (minPeople) {
      filtered = filtered.filter(menu => menu.minPersons <= parseInt(minPeople));
    }

    return filtered;
  }, [searchQuery, priceMax, priceMin, selectedTheme, selectedDietary, minPeople]);

  const clearFilters = () => {
    setSearchQuery('');
    setPriceMax('');
    setPriceMin('');
    setSelectedTheme('');
    setSelectedDietary('');
    setMinPeople('');
  };

  const hasActiveFilters = searchQuery || priceMax || priceMin || selectedTheme || selectedDietary || minPeople;

  const handleOrder = (_menu: Menu) => {
    // For now, navigate to contact for ordering
    // In production, this would open an order flow
    setSelectedMenu(null);
    setCurrentPage('contact');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-orange-600 to-orange-500 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Notre carte
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Nos Menus</h1>
          <p className="text-lg sm:text-xl text-orange-100 max-w-2xl mx-auto">
            Découvrez notre sélection de menus pour tous vos événements. 
            Des créations raffinées par Julie et José, nos chefs passionnés.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base sm:text-lg rounded-2xl border-gray-200 shadow-lg focus:shadow-xl transition-shadow bg-white"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`flex items-center rounded-full px-5 py-2 h-auto border-2 transition-all ${
                showFilters ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {hasActiveFilters && (
                <Badge className="ml-2 bg-orange-500 text-white border-0">
                  {[searchQuery, priceMax, priceMin, selectedTheme, selectedDietary, minPeople].filter(Boolean).length}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Price Min */}
                <div>
                  <Label htmlFor="priceMin" className="text-gray-600 text-sm">Prix minimum (€)</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="Ex: 30"
                    min="0"
                    className="mt-2 rounded-xl h-11"
                  />
                </div>

                {/* Price Max */}
                <div>
                  <Label htmlFor="priceMax" className="text-gray-600 text-sm">Prix maximum (€)</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Ex: 100"
                    min="0"
                    className="mt-2 rounded-xl h-11"
                  />
                </div>

                {/* Theme */}
                <div>
                  <Label htmlFor="theme" className="text-gray-600 text-sm">Thème</Label>
                  <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                    <SelectTrigger id="theme" className="mt-2 rounded-xl h-11">
                      <SelectValue placeholder="Tous les thèmes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les thèmes</SelectItem>
                      {themes.map(theme => (
                        <SelectItem key={theme} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dietary */}
                <div>
                  <Label htmlFor="dietary" className="text-gray-600 text-sm">Régime alimentaire</Label>
                  <Select value={selectedDietary} onValueChange={setSelectedDietary}>
                    <SelectTrigger id="dietary" className="mt-2 rounded-xl h-11">
                      <SelectValue placeholder="Tous les régimes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les régimes</SelectItem>
                      {dietaryOptions.map(diet => (
                        <SelectItem key={diet} value={diet}>
                          {diet}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min People */}
                <div>
                  <Label htmlFor="minPeople" className="text-gray-600 text-sm">Nombre de personnes</Label>
                  <Input
                    id="minPeople"
                    type="number"
                    value={minPeople}
                    onChange={(e) => setMinPeople(e.target.value)}
                    placeholder="Ex: 10"
                    min="1"
                    className="mt-2 rounded-xl h-11"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredMenus.length}</span> menu{filteredMenus.length !== 1 ? 's' : ''} trouvé{filteredMenus.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Menus Grid */}
        {filteredMenus.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onDetailClick={setSelectedMenu}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Aucun menu trouvé
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Essayez de modifier vos critères de recherche pour trouver le menu idéal
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 sm:mt-24 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgMi00cy0yLTItNC0yYzAgMCAyLTIgMi00IDAgMiAyIDQgMiA0czIgMiA0IDJjMCAwLTIgMi0yIDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Besoin d'un menu personnalisé ?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto text-base sm:text-lg">
              Notre équipe peut créer un menu sur mesure adapté à vos besoins spécifiques et à votre budget.
            </p>
            <Button
              onClick={() => setCurrentPage('contact')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 h-auto text-lg rounded-full shadow-xl shadow-orange-500/25"
            >
              Nous contacter
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Detail Modal */}
      {selectedMenu && (
        <MenuDetailModal
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
          onOrder={handleOrder}
        />
      )}
    </div>
  );
}
