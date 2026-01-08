import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, Plus, Edit, Trash2, UtensilsCrossed, 
  Loader2, Euro, Users, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const themes = [
  { value: 'noel', label: 'Noël' },
  { value: 'paques', label: 'Pâques' },
  { value: 'classique', label: 'Classique' },
  { value: 'evenement', label: 'Événement' },
];

const regimes = [
  { value: 'classique', label: 'Classique' },
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'sans_gluten', label: 'Sans gluten' },
  { value: 'halal', label: 'Halal' },
];

const emptyMenu = {
  title: '',
  description: '',
  theme: 'classique',
  regime: 'classique',
  min_persons: 6,
  base_price: 0,
  price_per_person: 0,
  conditions: '',
  advance_days: 3,
  stock: 10,
  is_active: true,
  images: [],
};

export default function AdminMenus() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState(emptyMenu);
  const [saving, setSaving] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin' && user.role !== 'employe') {
        window.location.href = createPageUrl('Home');
        return;
      }
      const data = await base44.entities.Menu.list('-created_date');
      setMenus(data);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingMenu(null);
    setFormData(emptyMenu);
    setShowDialog(true);
  };

  const openEditDialog = (menu) => {
    setEditingMenu(menu);
    setFormData({
      title: menu.title || '',
      description: menu.description || '',
      theme: menu.theme || 'classique',
      regime: menu.regime || 'classique',
      min_persons: menu.min_persons || 6,
      base_price: menu.base_price || 0,
      price_per_person: menu.price_per_person || 0,
      conditions: menu.conditions || '',
      advance_days: menu.advance_days || 3,
      stock: menu.stock || 10,
      is_active: menu.is_active !== false,
      images: menu.images || [],
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingMenu) {
        await base44.entities.Menu.update(editingMenu.id, formData);
        setMenus(menus.map(m => m.id === editingMenu.id ? { ...m, ...formData } : m));
      } else {
        const newMenu = await base44.entities.Menu.create(formData);
        setMenus([newMenu, ...menus]);
      }
      setShowDialog(false);
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!menuToDelete) return;
    try {
      await base44.entities.Menu.delete(menuToDelete.id);
      setMenus(menus.filter(m => m.id !== menuToDelete.id));
      setShowDeleteDialog(false);
      setMenuToDelete(null);
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    }
  };

  const toggleActive = async (menu) => {
    try {
      await base44.entities.Menu.update(menu.id, { is_active: !menu.is_active });
      setMenus(menus.map(m => m.id === menu.id ? { ...m, is_active: !m.is_active } : m));
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#2C2C2C]">Gestion des menus</h1>
              <p className="text-[#2C2C2C]/60">{menus.length} menu{menus.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button onClick={openCreateDialog} className="bg-[#722F37] hover:bg-[#8B4049]">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau menu
          </Button>
        </div>

        {/* Menus Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu, index) => (
            <motion.div
              key={menu.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`overflow-hidden ${!menu.is_active ? 'opacity-60' : ''}`}>
                <div className="h-40 bg-gray-200 relative">
                  {menu.images?.[0] ? (
                    <img src={menu.images[0]} alt={menu.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {!menu.is_active && (
                    <Badge className="absolute top-2 right-2 bg-red-500">Inactif</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-[#2C2C2C] mb-2">{menu.title}</h3>
                  <p className="text-sm text-[#2C2C2C]/60 line-clamp-2 mb-4">{menu.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{themes.find(t => t.value === menu.theme)?.label}</Badge>
                    <Badge variant="outline">{regimes.find(r => r.value === menu.regime)?.label}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-[#2C2C2C]/60 mb-4">
                    <span className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {menu.base_price}€
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Min. {menu.min_persons}
                    </span>
                    <span className="flex items-center gap-1">
                      Stock: {menu.stock}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={menu.is_active}
                        onCheckedChange={() => toggleActive(menu)}
                      />
                      <span className="text-sm">Actif</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(menu)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setMenuToDelete(menu);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Edit/Create Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMenu ? 'Modifier le menu' : 'Nouveau menu'}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nom du menu"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thème</Label>
                  <Select 
                    value={formData.theme} 
                    onValueChange={(v) => setFormData({ ...formData, theme: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du menu..."
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Régime alimentaire</Label>
                  <Select 
                    value={formData.regime} 
                    onValueChange={(v) => setFormData({ ...formData, regime: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regimes.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Personnes minimum</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.min_persons}
                    onChange={(e) => setFormData({ ...formData, min_persons: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Prix de base (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix/pers. supp. (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_per_person}
                    onChange={(e) => setFormData({ ...formData, price_per_person: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock disponible</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Jours de commande à l'avance</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.advance_days}
                  onChange={(e) => setFormData({ ...formData, advance_days: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Conditions (stockage, délai, etc.)</Label>
                <Textarea
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  placeholder="Conditions particulières du menu..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Menu actif (visible sur le site)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving || !formData.title}
                className="bg-[#722F37] hover:bg-[#8B4049]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce menu ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le menu "{menuToDelete?.title}" sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}