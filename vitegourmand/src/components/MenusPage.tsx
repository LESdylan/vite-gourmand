import React, { useState, useEffect } from 'react';
import { Filter, Search, Users, Euro, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Page, User } from '../App';

type MenusPageProps = {
  setCurrentPage: (page: Page) => void;
  user: User;
  accessToken: string | null;
};

export type Menu = {
  id: string;
  title: string;
  description: string;
  images: string[];
  theme: string;
  dishes: Dish[];
  minPeople: number;
  price: number;
  allergens: string[];
  conditions: string;
  regime: string;
  stock?: number;
  createdAt: string;
};

export type Dish = {
  id: string;
  name: string;
  type: 'entrée' | 'plat' | 'dessert';
  allergens: string[];
};

export default function MenusPage({ setCurrentPage, user, accessToken }: MenusPageProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [priceMax, setPriceMax] = useState<string>('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedRegime, setSelectedRegime] = useState<string>('');
  const [minPeople, setMinPeople] = useState<string>('');

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [menus, priceMax, priceMin, selectedTheme, selectedRegime, minPeople]);

  const fetchMenus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/menus`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMenus(data.menus || []);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...menus];

    // Filter by price max
    if (priceMax) {
      const maxPrice = parseFloat(priceMax);
      filtered = filtered.filter(menu => menu.price <= maxPrice);
    }

    // Filter by price range
    if (priceMin) {
      const minPrice = parseFloat(priceMin);
      filtered = filtered.filter(menu => menu.price >= minPrice);
    }

    // Filter by theme
    if (selectedTheme && selectedTheme !== 'all') {
      filtered = filtered.filter(menu => menu.theme === selectedTheme);
    }

    // Filter by regime
    if (selectedRegime && selectedRegime !== 'all') {
      filtered = filtered.filter(menu => menu.regime === selectedRegime);
    }

    // Filter by minimum people
    if (minPeople) {
      const minPeopleNum = parseInt(minPeople);
      filtered = filtered.filter(menu => menu.minPeople <= minPeopleNum);
    }

    setFilteredMenus(filtered);
  };

  const clearFilters = () => {
    setPriceMax('');
    setPriceMin('');
    setSelectedTheme('');
    setSelectedRegime('');
    setMinPeople('');
  };

  const themes = Array.from(new Set(menus.map(m => m.theme))).filter(Boolean);
  const regimes = Array.from(new Set(menus.map(m => m.regime))).filter(Boolean);

  const hasActiveFilters = priceMax || priceMin || selectedTheme || selectedRegime || minPeople;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Menus</h1>
          <p className="text-xl text-gray-600">
            Découvrez notre sélection de menus pour tous vos événements
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-2">
                  {[priceMax, priceMin, selectedTheme, selectedRegime, minPeople].filter(Boolean).length}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>

          {showFilters && (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Price Min */}
                <div>
                  <Label htmlFor="priceMin">Prix minimum (€)</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="Ex: 50"
                    min="0"
                  />
                </div>

                {/* Price Max */}
                <div>
                  <Label htmlFor="priceMax">Prix maximum (€)</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Ex: 200"
                    min="0"
                  />
                </div>

                {/* Theme */}
                <div>
                  <Label htmlFor="theme">Thème</Label>
                  <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                    <SelectTrigger id="theme">
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

                {/* Regime */}
                <div>
                  <Label htmlFor="regime">Régime</Label>
                  <Select value={selectedRegime} onValueChange={setSelectedRegime}>
                    <SelectTrigger id="regime">
                      <SelectValue placeholder="Tous les régimes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les régimes</SelectItem>
                      {regimes.map(regime => (
                        <SelectItem key={regime} value={regime}>
                          {regime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min People */}
                <div>
                  <Label htmlFor="minPeople">Nombre de personnes</Label>
                  <Input
                    id="minPeople"
                    type="number"
                    value={minPeople}
                    onChange={(e) => setMinPeople(e.target.value)}
                    placeholder="Ex: 10"
                    min="1"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredMenus.length} menu{filteredMenus.length !== 1 ? 's' : ''} trouvé{filteredMenus.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Menus Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des menus...</p>
          </div>
        ) : filteredMenus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMenus.map((menu) => (
              <Card key={menu.id} className="hover:shadow-xl transition-shadow overflow-hidden">
                {/* Menu Image */}
                {menu.images && menu.images.length > 0 && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={menu.images[0]}
                      alt={menu.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{menu.title}</CardTitle>
                    {menu.stock !== undefined && menu.stock <= 5 && menu.stock > 0 && (
                      <Badge variant="destructive">
                        {menu.stock} restant{menu.stock !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {menu.stock === 0 && (
                      <Badge variant="secondary">Épuisé</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{menu.theme}</Badge>
                    <Badge variant="outline">{menu.regime}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{menu.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <Users className="h-4 w-4 mr-2 text-orange-600" />
                      <span className="text-sm">Minimum {menu.minPeople} personne{menu.minPeople !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center text-gray-900 font-bold">
                      <Euro className="h-4 w-4 mr-2 text-orange-600" />
                      <span>{menu.price}€ pour {menu.minPeople} personne{menu.minPeople !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => setCurrentPage({ type: 'menu-detail', menuId: menu.id })}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={menu.stock === 0}
                  >
                    {menu.stock === 0 ? 'Menu épuisé' : 'Voir le détail'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun menu trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
