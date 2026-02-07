import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactCards = [
    {
      icon: MapPin,
      title: 'Adresse',
      content: (
        <>
          <p className="text-gray-700 leading-relaxed">
            Vite & Gourmand<br />
            15 Rue Sainte-Catherine<br />
            33000 Bordeaux, France
          </p>
          <Button
            variant="outline"
            className="mt-4 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 w-full sm:w-auto"
            onClick={() => window.open('https://maps.google.com/?q=15+Rue+Sainte-Catherine+Bordeaux+France', '_blank')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Voir sur Google Maps
          </Button>
        </>
      ),
      gradient: 'from-[#722F37] to-[#5a252c]'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: (
        <>
          <a href="tel:+33556000000" className="text-2xl font-bold text-gray-900 hover:text-orange-600 transition-colors block mb-2">
            +33 5 56 00 00 00
          </a>
          <p className="text-sm text-gray-500">
            Du lundi au vendredi, de 9h à 18h
          </p>
        </>
      ),
      gradient: 'from-[#556B2F] to-[#3d4e22]'
    },
    {
      icon: Mail,
      title: 'Email',
      content: (
        <>
          <a href="mailto:contact@vite-gourmand.fr" className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors block mb-2">
            contact@vite-gourmand.fr
          </a>
          <p className="text-sm text-gray-500">
            Réponse sous 24-48h ouvrées
          </p>
        </>
      ),
      gradient: 'from-[#D4AF37] to-[#b8962e]'
    },
    {
      icon: Clock,
      title: 'Horaires d\'ouverture',
      content: (
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600">Lundi - Vendredi</span>
            <span className="font-semibold text-gray-900">9h00 - 18h00</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600">Samedi</span>
            <span className="font-semibold text-gray-900">10h00 - 16h00</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-gray-600">Dimanche</span>
            <span className="font-semibold text-red-500">Fermé</span>
          </div>
        </div>
      ),
      gradient: 'from-[#722F37] to-[#D4AF37]'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#f5ede3]">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#722F37] to-[#5a252c] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
            Contact
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Contactez-nous</h1>
          <p className="text-lg sm:text-xl text-orange-100 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
            et vous accompagner dans l'organisation de vos événements.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-12">
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {contactCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="group bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {card.content}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form - Takes 3 columns */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#1A1A1A] to-[#2d2d2d] text-white">
                <CardTitle className="flex items-center text-xl">
                  <MessageCircle className="h-6 w-6 mr-3 text-orange-400" />
                  Envoyez-nous un message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-semibold">Message envoyé avec succès !</p>
                      <p className="text-green-700 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">Nom complet *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        required
                        className="mt-2 h-12 rounded-xl border-gray-200 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jean@exemple.fr"
                        required
                        className="mt-2 h-12 rounded-xl border-gray-200 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 font-medium">Téléphone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="06 12 34 56 78"
                        className="mt-2 h-12 rounded-xl border-gray-200 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-gray-700 font-medium">Sujet *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Demande de devis"
                        required
                        className="mt-2 h-12 rounded-xl border-gray-200 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">Message *</Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre projet ou posez-nous vos questions..."
                      required
                      rows={5}
                      className="mt-2 flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#722F37] to-[#5a252c] hover:from-[#5a252c] hover:to-[#722F37] text-white h-14 rounded-xl text-lg font-semibold shadow-lg shadow-[#722F37]/25 hover:shadow-[#722F37]/40 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Nos services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'Menus pour événements familiaux (Noël, Pâques, anniversaires)',
                    'Prestations pour événements professionnels',
                    'Menus personnalisés selon vos besoins',
                    'Options végétariennes, vegan et sans gluten',
                    'Prise en compte des allergies et régimes spéciaux'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#722F37] to-[#5a252c] border-0 shadow-xl text-white">
              <CardHeader>
                <CardTitle className="text-xl text-white">Zone de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-100 mb-4 leading-relaxed">
                  Nous livrons principalement dans la région bordelaise et ses environs (Gironde).
                </p>
                <p className="text-orange-200 text-sm">
                  Pour des événements en dehors de cette zone, n'hésitez pas à nous contacter 
                  pour étudier les possibilités. Des frais de déplacement peuvent s'appliquer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
