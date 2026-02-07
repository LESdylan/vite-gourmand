import { Clock, MapPin, Phone, Mail, ChefHat, Facebook, Instagram, Linkedin } from 'lucide-react';

// Page type for navigation
type Page = 'home' | 'menu' | 'contact' | 'legal-mentions' | 'legal-cgv' | 'user-profile';

type FooterProps = {
  setCurrentPage: (page: Page) => void;
};

function companyInfo() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white">Vite & Gourmand</span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">
        Votre partenaire traiteur depuis 25 ans à Bordeaux. Julie et José mettent leur expertise
        au service de vos événements pour des moments inoubliables.
      </p>
      <div className="space-y-3">
        <div className="flex items-center space-x-3 text-gray-400 hover:text-orange-400 transition-colors cursor-pointer">
          <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <span className="text-sm">15 Rue Sainte-Catherine, 33000 Bordeaux</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-400 hover:text-orange-400 transition-colors cursor-pointer">
          <Phone className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <span className="text-sm">+33 5 56 00 00 00</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-400 hover:text-orange-400 transition-colors cursor-pointer">
          <Mail className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <span className="text-sm">contact@vite-gourmand.fr</span>
        </div>
      </div>
    </div>
  );
}

function openingHours() {
  const hours = [
    { day: 'Lundi - Vendredi', time: '9h00 - 18h00' },
    { day: 'Samedi', time: '10h00 - 16h00' },
    { day: 'Dimanche', time: 'Fermé' },
  ];

  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-orange-500" />
        Horaires d'ouverture
      </h3>
      <div className="space-y-3">
        {hours.map((schedule) => (
          <div key={schedule.day} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
            <span className="text-gray-400 text-sm">{schedule.day}</span>
            <span className={`text-sm font-medium ${schedule.time === 'Fermé' ? 'text-red-400' : 'text-white'}`}>
              {schedule.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function legalLinks(setCurrentPage: (page: Page) => void) {
  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-6">Informations légales</h3>
      <div className="space-y-3">
        <button
          onClick={() => setCurrentPage('legal-mentions')}
          className="block text-gray-400 hover:text-orange-400 transition-colors text-sm"
        >
          Mentions légales
        </button>
        <button
          onClick={() => setCurrentPage('legal-cgv')}
          className="block text-gray-400 hover:text-orange-400 transition-colors text-sm"
        >
          Conditions générales de vente
        </button>
        <button
          onClick={() => setCurrentPage('contact')}
          className="block text-gray-400 hover:text-orange-400 transition-colors text-sm"
        >
          Contact
        </button>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-2 font-medium">Conformité RGPD</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Vos données personnelles sont protégées et utilisées uniquement dans le cadre de nos services.
        </p>
      </div>
    </div>
  );
}

function socialLinks() {
  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-6">Suivez-nous</h3>
      <div className="flex space-x-3">
        <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors group">
          <Facebook className="h-5 w-5 text-gray-400 group-hover:text-white" />
        </a>
        <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors group">
          <Instagram className="h-5 w-5 text-gray-400 group-hover:text-white" />
        </a>
        <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors group">
          <Linkedin className="h-5 w-5 text-gray-400 group-hover:text-white" />
        </a>
      </div>
      <div className="mt-6">
        <p className="text-gray-400 text-sm mb-3">Newsletter</p>
        <div className="flex">
          <input 
            type="email" 
            placeholder="Votre email" 
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-r-lg text-sm font-medium transition-colors">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Footer({ setCurrentPage }: FooterProps) {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {companyInfo()}
          {openingHours()}
          {legalLinks(setCurrentPage)}
          {socialLinks()}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Vite & Gourmand. Tous droits réservés.
            </p>
            <p className="text-xs text-gray-600">
              Fait avec ❤️ à Bordeaux
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
