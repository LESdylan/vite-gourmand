import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, Phone, MapPin, Send, Loader2, Check, 
  MessageSquare, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: 'contact@viteetgourmand.fr',
        subject: `[Contact] ${formData.title}`,
        body: `
Nouveau message de contact reçu :

De : ${formData.email}
Sujet : ${formData.title}

Message :
${formData.message}
        `
      });
      setSent(true);
    } catch (e) {
      console.error('Erreur envoi:', e);
      throw e;
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">Message envoyé !</h2>
          <p className="text-[#2C2C2C]/70 mb-6">
            Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
          </p>
          <Button 
            onClick={() => {
              setSent(false);
              setFormData({ title: '', email: '', message: '' });
            }}
            className="bg-[#722F37] hover:bg-[#8B4049]"
          >
            Envoyer un autre message
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Hero */}
      <section className="bg-[#722F37] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Contactez-nous
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Une question, une demande spéciale ? N'hésitez pas à nous contacter.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#722F37]/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-[#722F37]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2C2C2C] mb-1">Adresse</h3>
                        <p className="text-[#2C2C2C]/70 text-sm">
                          Vite & Gourmand<br />
                          33000 Bordeaux<br />
                          France
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#722F37]/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-[#722F37]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2C2C2C] mb-1">Téléphone</h3>
                        <p className="text-[#2C2C2C]/70 text-sm">
                          05 XX XX XX XX
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#722F37]/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-[#722F37]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2C2C2C] mb-1">Email</h3>
                        <p className="text-[#2C2C2C]/70 text-sm">
                          contact@viteetgourmand.fr
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#722F37]/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-[#722F37]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2C2C2C] mb-1">Horaires</h3>
                        <p className="text-[#2C2C2C]/70 text-sm">
                          Lun - Ven : 9h - 18h<br />
                          Samedi : 9h - 12h
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[#2C2C2C] mb-6">
                    Envoyez-nous un message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Votre email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="votre@email.com"
                          className="border-gray-200 focus:border-[#722F37] focus:ring-[#722F37]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Sujet *</Label>
                        <Input
                          id="title"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Objet de votre message"
                          className="border-gray-200 focus:border-[#722F37] focus:ring-[#722F37]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Votre message *</Label>
                      <Textarea
                        id="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Décrivez votre demande..."
                        className="border-gray-200 focus:border-[#722F37] focus:ring-[#722F37] resize-none"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#722F37] hover:bg-[#8B4049] py-6"
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}