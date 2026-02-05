import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-600">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Vite & Gourmand<br />
                  Bordeaux, France<br />
                  33000 Bordeaux
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-orange-600" />
                  Téléphone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  <a href="tel:+33556000000" className="hover:text-orange-600 transition-colors">
                    +33 5 56 XX XX XX
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-orange-600" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  <a href="mailto:contact@vite-gourmand.fr" className="hover:text-orange-600 transition-colors">
                    contact@vite-gourmand.fr
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Horaires d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Lundi - Vendredi</span>
                    <span>9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Samedi</span>
                    <span>10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Dimanche</span>
                    <span className="text-red-600">Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>À propos de nous</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Vite & Gourmand est une entreprise familiale fondée par Julie et José il y a 25 ans à Bordeaux. 
                  Nous sommes spécialisés dans la prestation traiteur pour tous types d'événements.
                </p>
                <p className="text-gray-700">
                  Notre passion pour la gastronomie et notre engagement envers la qualité nous permettent de créer 
                  des expériences culinaires mémorables pour nos clients.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nos services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>Menus pour événements familiaux (Noël, Pâques, anniversaires)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>Prestations pour événements professionnels</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>Menus personnalisés selon vos besoins</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>Options végétariennes et véganes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>Prise en compte des allergies et régimes spéciaux</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zone de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Nous livrons principalement dans la région bordelaise et ses environs. 
                  Pour des événements en dehors de cette zone, n'hésitez pas à nous contacter 
                  pour étudier les possibilités.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
