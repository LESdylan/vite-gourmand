import React from 'react';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import type { Page } from '../App';

type FooterProps = {
  setCurrentPage: (page: Page) => void;
};

export default function Footer({ setCurrentPage }: FooterProps) {
  const hours = [
    { day: 'Lundi', time: '9h00 - 18h00' },
    { day: 'Mardi', time: '9h00 - 18h00' },
    { day: 'Mercredi', time: '9h00 - 18h00' },
    { day: 'Jeudi', time: '9h00 - 18h00' },
    { day: 'Vendredi', time: '9h00 - 18h00' },
    { day: 'Samedi', time: '10h00 - 16h00' },
    { day: 'Dimanche', time: 'Fermé' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Vite & Gourmand</h3>
            <p className="text-sm mb-4">
              Votre partenaire traiteur depuis 25 ans à Bordeaux. Julie et José mettent leur expertise
              au service de vos événements pour des moments inoubliables.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>Bordeaux, France</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <span>+33 5 56 XX XX XX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <span>contact@vite-gourmand.fr</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              Horaires d'ouverture
            </h3>
            <div className="space-y-2 text-sm">
              {hours.map((schedule) => (
                <div key={schedule.day} className="flex justify-between">
                  <span className="font-medium">{schedule.day}</span>
                  <span className={schedule.time === 'Fermé' ? 'text-red-400' : ''}>
                    {schedule.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Informations légales</h3>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => setCurrentPage('legal-mentions')}
                className="block hover:text-orange-500 transition-colors"
              >
                Mentions légales
              </button>
              <button
                onClick={() => setCurrentPage('legal-cgv')}
                className="block hover:text-orange-500 transition-colors"
              >
                Conditions générales de vente
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className="block hover:text-orange-500 transition-colors"
              >
                Contact
              </button>
            </div>
            <div className="mt-6 text-xs text-gray-400">
              <p>Conformité RGPD</p>
              <p className="mt-1">
                Vos données personnelles sont protégées et utilisées uniquement dans le cadre de nos services.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Vite & Gourmand. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
