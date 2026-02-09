import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Users, Euro, X, ChefHat, Clock, AlertTriangle, 
  SlidersHorizontal, UtensilsCrossed, ShoppingCart, 
  ArrowRight, Filter, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useMenus } from '../services/useMenus';
import type { Menu } from '../services/menus';
import { getAllThemes, getAllDietaryTypes, type DietaryType } from '../data/menus';
import type { Page } from './Home';

type MenusPageProps = {
  setCurrentPage: (page: Page) => void;
};

/* ── Dietary badge colors ── */
const DIETARY_COLORS: Record<string, string> = {
  vegan: 'bg-green-700 text-white',
  végétarien: 'bg-emerald-600 text-white',
  'sans-gluten': 'bg-amber-600 text-white',
  'sans-lactose': 'bg-purple-600 text-white',
  halal: 'bg-[#722F37] text-white',
  casher: 'bg-indigo-600 text-white',
  bio: 'bg-lime-600 text-white',
  classique: 'bg-[#1A1A1A] text-white',
};

const THEME_ICONS: Record<string, string> = {
  Gastronomie: '🍷',
  Mariage: '💒',
  Entreprise: '🏢',
  Anniversaire: '🎂',
  Végétarien: '🥬',
  Vegan: '🌱',
  Fêtes: '🎄',
};

/* ══════════════════════════════════════════════════════════
   Menu Detail Modal
   ══════════════════════════════════════════════════════════ */
function MenuDetailModal({ 
  menu, onClose, onOrder 
}: { 
  menu: Menu; onClose: () => void; onOrder: (menu: Menu) => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { 
      document.removeEventListener('keydown', handler); 
      document.body.style.overflow = ''; 
    };
  }, [onClose]);

  const totalMinPrice = (menu.pricePerPerson * menu.minPersons).toFixed(0);
  
  // Get dish counts from dishes object
  const entreesCount = menu.dishes?.entrees?.length || 0;
  const mainsCount = menu.dishes?.mains?.length || 0;
  const dessertsCount = menu.dishes?.desserts?.length || 0;

  return (
    <div 
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Détails du menu ${menu.name}`}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header image */}
        <div className="relative h-48 sm:h-60">
          <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5 text-[#1A1A1A]" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-[#D4AF37] text-[#1A1A1A] border-0 text-xs font-bold">
                {THEME_ICONS[menu.theme] || '🍽️'} {menu.theme}
              </Badge>
              {menu.dietary.map(d => (
                <Badge key={d} className={`${DIETARY_COLORS[d] || 'bg-gray-700 text-white'} border-0 text-xs`}>{d}</Badge>
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{menu.name}</h2>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-15rem)] p-5 sm:p-6 space-y-5">
          <p className="text-[#1A1A1A]/80 leading-relaxed">{menu.description}</p>

          {/* Key info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FFF8F0] rounded-xl p-3 text-center">
              <Users className="h-5 w-5 text-[#722F37] mx-auto mb-1" />
              <p className="text-[10px] text-[#1A1A1A]/50 uppercase tracking-wide">Convives</p>
              <p className="font-bold text-[#1A1A1A]">{menu.minPersons} – {menu.maxPersons}</p>
            </div>
            <div className="bg-[#FFF8F0] rounded-xl p-3 text-center">
              <Euro className="h-5 w-5 text-[#556B2F] mx-auto mb-1" />
              <p className="text-[10px] text-[#1A1A1A]/50 uppercase tracking-wide">Prix / pers.</p>
              <p className="font-bold text-[#1A1A1A]">{menu.pricePerPerson.toFixed(2)} €</p>
            </div>
            <div className="bg-[#FFF8F0] rounded-xl p-3 text-center">
              <ShoppingCart className="h-5 w-5 text-[#D4AF37] mx-auto mb-1" />
              <p className="text-[10px] text-[#1A1A1A]/50 uppercase tracking-wide">Min. total</p>
              <p className="font-bold text-[#1A1A1A]">{totalMinPrice} €</p>
            </div>
            <div className="bg-[#FFF8F0] rounded-xl p-3 text-center">
              <Clock className="h-5 w-5 text-[#722F37] mx-auto mb-1" />
              <p className="text-[10px] text-[#1A1A1A]/50 uppercase tracking-wide">Stock</p>
              <p className={`font-bold ${menu.stockQuantity <= 5 ? 'text-red-600' : 'text-[#1A1A1A]'}`}>
                {menu.stockQuantity} dispo.
              </p>
            </div>
          </div>

          {/* Composition */}
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide mb-3 flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-[#722F37]" /> Composition du menu
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: 'Entrées', count: entreesCount, color: 'border-[#556B2F]', bg: 'bg-[#556B2F]/5' },
                { label: 'Plats', count: mainsCount, color: 'border-[#722F37]', bg: 'bg-[#722F37]/5' },
                { label: 'Desserts', count: dessertsCount, color: 'border-[#D4AF37]', bg: 'bg-[#D4AF37]/5' },
              ].map((cat) => (
                <div key={cat.label} className={`border-l-4 ${cat.color} ${cat.bg} rounded-r-lg p-3`}>
                  <p className="font-semibold text-sm text-[#1A1A1A]">{cat.label}</p>
                  <p className="text-[#1A1A1A]/50 text-sm">{cat.count} choix</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dishes details if available */}
          {menu.dishes && (menu.dishes.entrees.length > 0 || menu.dishes.mains.length > 0 || menu.dishes.desserts.length > 0) && (
            <div className="space-y-3">
              {menu.dishes.entrees.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#556B2F] uppercase mb-2">Entrées</h4>
                  <ul className="space-y-1">
                    {menu.dishes.entrees.map(d => (
                      <li key={d.id} className="text-sm text-[#1A1A1A]/70 flex items-start gap-2">
                        <span className="text-[#556B2F]">•</span>
                        <span>{d.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {menu.dishes.mains.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#722F37] uppercase mb-2">Plats</h4>
                  <ul className="space-y-1">
                    {menu.dishes.mains.map(d => (
                      <li key={d.id} className="text-sm text-[#1A1A1A]/70 flex items-start gap-2">
                        <span className="text-[#722F37]">•</span>
                        <span>{d.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {menu.dishes.desserts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#D4AF37] uppercase mb-2">Desserts</h4>
                  <ul className="space-y-1">
                    {menu.dishes.desserts.map(d => (
                      <li key={d.id} className="text-sm text-[#1A1A1A]/70 flex items-start gap-2">
                        <span className="text-[#D4AF37]">•</span>
                        <span>{d.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Allergens */}
          {menu.allergens.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Allergènes
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {menu.allergens.map(a => (
                  <span key={a} className="px-2 py-0.5 bg-white border border-amber-300 rounded text-xs text-amber-800">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* CONDITIONS — Highlighted prominently as required */}
          {menu.deliveryNotes && (
            <div className="bg-[#722F37] rounded-xl p-4 text-white ring-2 ring-[#D4AF37] ring-offset-2">
              <h3 className="font-bold text-sm flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-[#D4AF37]" /> Conditions importantes
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">{menu.deliveryNotes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => onOrder(menu)}
              size="lg"
              className="flex-1 h-12"
              disabled={menu.stockQuantity === 0}
            >
              {menu.stockQuantity === 0 ? 'Menu épuisé' : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Commander ce menu
                </>
              )}
            </Button>
            <Button onClick={onClose} variant="outline" size="lg" className="flex-1 h-12">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Menu Card
   ══════════════════════════════════════════════════════════ */
function MenuCard({ menu, onDetailClick }: { menu: Menu; onDetailClick: (m: Menu) => void }) {
  const isLowStock = menu.stockQuantity > 0 && menu.stockQuantity <= 5;
  const isSoldOut = menu.stockQuantity === 0;

  return (
    <article className="group bg-white rounded-2xl border border-[#1A1A1A]/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#722F37]/8 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <img
          src={menu.image}
          alt={menu.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Theme badge top-left */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-[#1A1A1A] border-0 text-xs backdrop-blur-sm shadow-sm">
            {THEME_ICONS[menu.theme] || '🍽️'} {menu.theme}
          </Badge>
        </div>

        {/* Stock */}
        {isLowStock && (
          <Badge className="absolute top-3 right-3 bg-red-600 text-white border-0 text-[10px] shadow">
            Plus que {menu.stockQuantity} !
          </Badge>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-[#1A1A1A]/70 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-wide">Épuisé</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-[#1A1A1A] text-lg mb-2 line-clamp-1">{menu.name}</h3>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {menu.dietary.map(d => (
            <Badge key={d} className={`${DIETARY_COLORS[d] || 'bg-gray-700 text-white'} border-0 text-[10px] px-2 py-0`}>
              {d}
            </Badge>
          ))}
        </div>

        <p className="text-[#1A1A1A]/55 text-sm leading-relaxed line-clamp-2 mb-4">{menu.description}</p>

        {/* Key metrics */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-[#1A1A1A]/50">
            <Users className="h-4 w-4 text-[#722F37]" />
            <span>Min. {menu.minPersons} pers.</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#722F37]">{menu.pricePerPerson.toFixed(0)}</span>
            <span className="text-sm text-[#1A1A1A]/50">€/pers.</span>
          </div>
        </div>

        <Button
          onClick={() => onDetailClick(menu)}
          className="w-full group/btn"
          disabled={isSoldOut}
        >
          {isSoldOut ? 'Indisponible' : (
            <>
              Voir le détail
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </Button>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Menus Page
   ══════════════════════════════════════════════════════════ */
export default function MenusPage({ setCurrentPage }: MenusPageProps) {
  const { menus, isLoading, error, refetch } = useMenus({ limit: 50 });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('');
  const [minPeople, setMinPeople] = useState('');

  const themes = getAllThemes();
  const dietaryOptions: DietaryType[] = getAllDietaryTypes();

  // Client-side filtering on fetched menus
  const filteredMenus = useMemo(() => {
    let filtered = [...menus];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.theme.toLowerCase().includes(q)
      );
    }
    if (priceMax) filtered = filtered.filter(m => m.pricePerPerson <= parseFloat(priceMax));
    if (priceMin) filtered = filtered.filter(m => m.pricePerPerson >= parseFloat(priceMin));
    if (selectedTheme && selectedTheme !== 'all') filtered = filtered.filter(m => m.theme === selectedTheme);
    if (selectedDietary && selectedDietary !== 'all') filtered = filtered.filter(m => m.dietary.includes(selectedDietary as DietaryType));
    if (minPeople) filtered = filtered.filter(m => m.minPersons <= Number.parseInt(minPeople));
    return filtered;
  }, [menus, searchQuery, priceMax, priceMin, selectedTheme, selectedDietary, minPeople]);

  const clearFilters = () => {
    setSearchQuery(''); setPriceMax(''); setPriceMin('');
    setSelectedTheme(''); setSelectedDietary(''); setMinPeople('');
  };

  const activeFilterCount = [searchQuery, priceMax, priceMin, selectedTheme, selectedDietary, minPeople].filter(Boolean).length;

  const handleOrder = (_menu: Menu) => {
    setSelectedMenu(null);
    setCurrentPage('contact');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Page Header */}
      <header className="bg-[#1A1A1A] pt-6 pb-10 sm:pt-8 sm:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#722F37] rounded-full px-4 py-1.5 mb-4">
            <ChefHat className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold tracking-wide uppercase">Notre carte</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Nos Menus</h1>
          <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base">
            Découvrez nos menus pour tous vos événements. Filtrez par thème, régime ou budget.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-5">
        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-lg shadow-[#1A1A1A]/5 border border-[#1A1A1A]/5 p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1A1A]/30" />
              <Input
                type="text"
                placeholder="Rechercher un menu, un thème..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]"
                aria-label="Rechercher un menu"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? 'default' : 'outline'}
              className="h-11 shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-white text-[#722F37] text-xs font-bold rounded-full w-5 h-5 inline-flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button onClick={clearFilters} variant="ghost" className="h-11 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0">
                <X className="h-4 w-4 mr-1" /> Effacer
              </Button>
            )}
          </div>

          {/* Filter panel */}
          <div className={`grid transition-all duration-300 ${showFilters ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-[#1A1A1A]/5">
                <div>
                  <Label htmlFor="fPriceMin" className="text-xs text-[#1A1A1A]/60 mb-1.5 block">Prix min. (€)</Label>
                  <Input id="fPriceMin" type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0" min="0" className="h-10 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]" />
                </div>
                <div>
                  <Label htmlFor="fPriceMax" className="text-xs text-[#1A1A1A]/60 mb-1.5 block">Prix max. (€)</Label>
                  <Input id="fPriceMax" type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="100" min="0" className="h-10 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]" />
                </div>
                <div>
                  <Label htmlFor="fTheme" className="text-xs text-[#1A1A1A]/60 mb-1.5 block">Thème</Label>
                  <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                    <SelectTrigger id="fTheme" className="h-10 border-[#1A1A1A]/10"><SelectValue placeholder="Tous" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les thèmes</SelectItem>
                      {themes.map(t => <SelectItem key={t} value={t}>{THEME_ICONS[t] || ''} {t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fDiet" className="text-xs text-[#1A1A1A]/60 mb-1.5 block">Régime</Label>
                  <Select value={selectedDietary} onValueChange={setSelectedDietary}>
                    <SelectTrigger id="fDiet" className="h-10 border-[#1A1A1A]/10"><SelectValue placeholder="Tous" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les régimes</SelectItem>
                      {dietaryOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fPeople" className="text-xs text-[#1A1A1A]/60 mb-1.5 block">Nb personnes</Label>
                  <Input id="fPeople" type="number" value={minPeople} onChange={e => setMinPeople(e.target.value)} placeholder="10" min="1" className="h-10 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-[#722F37] animate-spin mb-4" />
            <p className="text-[#1A1A1A]/60">Chargement des menus...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <Button onClick={refetch} variant="outline" size="sm">
              Réessayer
            </Button>
          </div>
        )}

        {/* Results info */}
        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between mb-5 px-1">
              <p className="text-sm text-[#1A1A1A]/60">
                <span className="font-bold text-[#1A1A1A]">{filteredMenus.length}</span>{' '}
                menu{filteredMenus.length !== 1 ? 's' : ''} disponible{filteredMenus.length !== 1 ? 's' : ''}
              </p>
              {activeFilterCount > 0 && (
                <p className="text-xs text-[#722F37] flex items-center gap-1">
                  <Filter className="h-3 w-3" /> {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Grid */}
            {filteredMenus.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredMenus.map(menu => (
                  <MenuCard key={menu.id} menu={menu} onDetailClick={setSelectedMenu} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#1A1A1A]/5 rounded-2xl flex items-center justify-center">
                  <Search className="h-7 w-7 text-[#1A1A1A]/20" />
                </div>
                <h3 className="font-bold text-[#1A1A1A] text-lg mb-2">Aucun menu trouvé</h3>
                <p className="text-[#1A1A1A]/50 text-sm mb-4">
                  {menus.length === 0 
                    ? 'Les menus seront bientôt disponibles.' 
                    : 'Essayez de modifier vos critères de recherche'}
                </p>
                {activeFilterCount > 0 && (
                  <Button onClick={clearFilters} variant="outline" size="sm">Réinitialiser les filtres</Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 mb-8 bg-[#1A1A1A] rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Besoin d'un menu personnalisé ?
          </h2>
          <p className="text-white/50 mb-6 max-w-md mx-auto text-sm">
            Notre équipe crée des menus sur mesure adaptés à vos besoins et votre budget.
          </p>
          <Button onClick={() => setCurrentPage('contact')} variant="champagne" size="lg">
            Nous contacter
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMenu && (
        <MenuDetailModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} onOrder={handleOrder} />
      )}
    </div>
  );
}
