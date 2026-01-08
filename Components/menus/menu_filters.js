import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, RotateCcw } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const themes = [
  { value: 'all', label: 'Tous les thèmes' },
  { value: 'noel', label: 'Noël' },
  { value: 'paques', label: 'Pâques' },
  { value: 'classique', label: 'Classique' },
  { value: 'evenement', label: 'Événement' },
];

const regimes = [
  { value: 'all', label: 'Tous les régimes' },
  { value: 'classique', label: 'Classique' },
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'sans_gluten', label: 'Sans gluten' },
  { value: 'halal', label: 'Halal' },
];

export default function MenuFilters({ filters, setFilters, maxPrice = 500 }) {
  const handleReset = () => {
    setFilters({
      theme: 'all',
      regime: 'all',
      minPrice: 0,
      maxPrice: maxPrice,
      minPersons: 1,
    });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#2C2C2C]">Thème</Label>
        <Select value={filters.theme} onValueChange={(v) => setFilters({ ...filters, theme: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un thème" />
          </SelectTrigger>
          <SelectContent>
            {themes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Regime */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#2C2C2C]">Régime alimentaire</Label>
        <Select value={filters.regime} onValueChange={(v) => setFilters({ ...filters, regime: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un régime" />
          </SelectTrigger>
          <SelectContent>
            {regimes.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-[#2C2C2C]">
          Fourchette de prix: {filters.minPrice}€ - {filters.maxPrice}€
        </Label>
        <div className="flex gap-4 items-center">
          <Input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
            className="w-24"
            min={0}
            placeholder="Min"
          />
          <span className="text-gray-400">à</span>
          <Input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || maxPrice })}
            className="w-24"
            min={0}
            placeholder="Max"
          />
        </div>
      </div>

      {/* Min Persons */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#2C2C2C]">
          Nombre de personnes minimum: {filters.minPersons}
        </Label>
        <Slider
          value={[filters.minPersons]}
          onValueChange={(v) => setFilters({ ...filters, minPersons: v[0] })}
          min={1}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleReset}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Réinitialiser les filtres
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg p-6 sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-[#2C2C2C] flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#722F37]" />
            Filtres
          </h3>
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer les menus
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#722F37]" />
                Filtres
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}