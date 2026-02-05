import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Page } from '../App';

type DesignSystemPageProps = {
  setCurrentPage: (page: Page) => void;
};

export default function DesignSystemPage({ setCurrentPage }: DesignSystemPageProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers !');
  };

  const colors = [
    { name: 'Orange Primary', value: '#ea580c', tailwind: 'orange-600' },
    { name: 'Orange Dark', value: '#c2410c', tailwind: 'orange-700' },
    { name: 'Orange Light', value: '#fed7aa', tailwind: 'orange-200' },
    { name: 'Orange Pale', value: '#ffedd5', tailwind: 'orange-100' },
    { name: 'Gray Dark', value: '#1f2937', tailwind: 'gray-800' },
    { name: 'Gray Medium', value: '#6b7280', tailwind: 'gray-500' },
    { name: 'Gray Light', value: '#f3f4f6', tailwind: 'gray-100' },
    { name: 'White', value: '#ffffff', tailwind: 'white' },
    { name: 'Success', value: '#16a34a', tailwind: 'green-600' },
    { name: 'Warning', value: '#eab308', tailwind: 'yellow-500' },
    { name: 'Error', value: '#dc2626', tailwind: 'red-600' },
    { name: 'Info', value: '#2563eb', tailwind: 'blue-600' },
  ];

  const typography = [
    { name: 'Heading 1', class: 'text-4xl font-bold', example: 'The quick brown fox' },
    { name: 'Heading 2', class: 'text-3xl font-bold', example: 'The quick brown fox' },
    { name: 'Heading 3', class: 'text-2xl font-bold', example: 'The quick brown fox' },
    { name: 'Heading 4', class: 'text-xl font-bold', example: 'The quick brown fox' },
    { name: 'Body Large', class: 'text-lg', example: 'The quick brown fox jumps over the lazy dog' },
    { name: 'Body', class: 'text-base', example: 'The quick brown fox jumps over the lazy dog' },
    { name: 'Body Small', class: 'text-sm', example: 'The quick brown fox jumps over the lazy dog' },
    { name: 'Caption', class: 'text-xs', example: 'The quick brown fox jumps over the lazy dog' },
  ];

  const spacing = [
    { name: 'xs', value: '0.25rem', class: 'p-1' },
    { name: 'sm', value: '0.5rem', class: 'p-2' },
    { name: 'md', value: '1rem', class: 'p-4' },
    { name: 'lg', value: '1.5rem', class: 'p-6' },
    { name: 'xl', value: '2rem', class: 'p-8' },
    { name: '2xl', value: '3rem', class: 'p-12' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            onClick={() => setCurrentPage({ type: 'admin' })}
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'administration
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Charte Graphique</h1>
          <p className="text-lg text-gray-600">
            Design System officiel de Vite & Gourmand
          </p>
        </div>

        {/* Colors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Palette de couleurs</CardTitle>
            <CardDescription>Couleurs principales et secondaires du système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {colors.map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="h-24 rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: color.value }}
                    onClick={() => copyToClipboard(color.value)}
                  />
                  <div>
                    <p className="font-semibold text-sm">{color.name}</p>
                    <p className="text-xs text-gray-600 font-mono">{color.value}</p>
                    <button
                      onClick={() => copyToClipboard(color.tailwind)}
                      className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 mt-1"
                    >
                      <Copy className="h-3 w-3" />
                      {color.tailwind}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Typographie</CardTitle>
            <CardDescription>Hiérarchie des textes et styles disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {typography.map((type) => (
                <div key={type.name} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{type.name}</span>
                    <button
                      onClick={() => copyToClipboard(type.class)}
                      className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      {type.class}
                    </button>
                  </div>
                  <p className={type.class}>{type.example}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Boutons</CardTitle>
            <CardDescription>Variantes de boutons disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Primary</p>
                <Button className="bg-orange-600 hover:bg-orange-700 w-full">
                  Button
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Secondary</p>
                <Button variant="outline" className="w-full">
                  Button
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Ghost</p>
                <Button variant="ghost" className="w-full">
                  Button
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Destructive</p>
                <Button variant="destructive" className="w-full">
                  Button
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Link</p>
                <Button variant="link" className="w-full">
                  Button
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Disabled</p>
                <Button disabled className="w-full">
                  Button
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Sizes</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Small</Button>
                <Button size="default" className="bg-orange-600 hover:bg-orange-700">Default</Button>
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">Large</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Étiquettes et statuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-orange-600 text-white">Orange</Badge>
              <Badge className="bg-green-600 text-white">Success</Badge>
              <Badge className="bg-blue-600 text-white">Info</Badge>
              <Badge className="bg-yellow-500 text-white">Warning</Badge>
              <Badge className="bg-red-600 text-white">Error</Badge>
              <Badge className="bg-gray-600 text-white">Neutral</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Alertes</CardTitle>
            <CardDescription>Messages d'information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-900">
                <strong>Info:</strong> Ceci est une alerte d'information
              </AlertDescription>
            </Alert>
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-900">
                <strong>Succès:</strong> Opération réussie avec succès
              </AlertDescription>
            </Alert>
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-900">
                <strong>Attention:</strong> Veuillez faire attention à cette information
              </AlertDescription>
            </Alert>
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-900">
                <strong>Erreur:</strong> Une erreur s'est produite
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Spacing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Espacement</CardTitle>
            <CardDescription>Système d'espacement cohérent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spacing.map((space) => (
                <div key={space.name} className="flex items-center gap-4">
                  <div className="w-24">
                    <p className="text-sm font-medium">{space.name}</p>
                    <p className="text-xs text-gray-600">{space.value}</p>
                  </div>
                  <div className="flex-1">
                    <div className="bg-orange-100 inline-block">
                      <div className={`bg-orange-600 ${space.class}`}></div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(space.class)}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shadows */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ombres</CardTitle>
            <CardDescription>Profondeur et élévation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium mb-2">shadow-sm</p>
                <div className="h-24 bg-white shadow-sm rounded-lg"></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">shadow</p>
                <div className="h-24 bg-white shadow rounded-lg"></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">shadow-md</p>
                <div className="h-24 bg-white shadow-md rounded-lg"></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">shadow-lg</p>
                <div className="h-24 bg-white shadow-lg rounded-lg"></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">shadow-xl</p>
                <div className="h-24 bg-white shadow-xl rounded-lg"></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">shadow-2xl</p>
                <div className="h-24 bg-white shadow-2xl rounded-lg"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Border Radius */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Arrondis</CardTitle>
            <CardDescription>Rayon des bordures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium mb-2">rounded-sm</p>
                <div className="h-24 bg-orange-600 rounded-sm"></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">rounded</p>
                <div className="h-24 bg-orange-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">rounded-lg</p>
                <div className="h-24 bg-orange-600 rounded-lg"></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">rounded-full</p>
                <div className="h-24 bg-orange-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Principes de Design</CardTitle>
            <CardDescription>Lignes directrices pour maintenir la cohérence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">🎨 Couleurs</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Utiliser l'orange (#ea580c) comme couleur primaire pour les CTA</li>
                <li>Maintenir un contraste suffisant pour l'accessibilité (WCAG AA minimum)</li>
                <li>Utiliser les couleurs sémantiques (vert, rouge, jaune) de manière cohérente</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">📝 Typographie</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Respecter la hiérarchie des titres (H1 &gt; H2 &gt; H3...)</li>
                <li>Limiter la longueur des lignes à ~65-75 caractères pour la lisibilité</li>
                <li>Utiliser une taille de police minimum de 14px pour le corps du texte</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🔘 Composants</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Utiliser des boutons primaires pour les actions principales</li>
                <li>Garder un espacement cohérent entre les éléments</li>
                <li>Appliquer des ombres pour créer de la profondeur</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">♿ Accessibilité</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Fournir des alt-text pour toutes les images</li>
                <li>Assurer une navigation au clavier complète</li>
                <li>Maintenir un contraste de couleur conforme WCAG AA</li>
                <li>Utiliser des labels explicites pour les formulaires</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
