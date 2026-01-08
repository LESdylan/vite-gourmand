import React from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, Leaf } from 'lucide-react';

export default function TeamSection() {
  const team = [
    {
      name: "Julie",
      role: "Chef cuisinière & Co-fondatrice",
      image: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=400&fit=crop",
      description: "Passionnée de gastronomie française, Julie crée des menus uniques alliant tradition et modernité."
    },
    {
      name: "José",
      role: "Chef pâtissier & Co-fondateur",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop",
      description: "Expert en pâtisserie, José sublime chaque dessert avec créativité et finesse."
    }
  ];

  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "Chaque plat est préparé avec le plus grand soin et attention aux détails."
    },
    {
      icon: Leaf,
      title: "Fraîcheur",
      description: "Nous sélectionnons uniquement des produits frais et de saison."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Notre amour pour la cuisine se retrouve dans chaque création."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] font-medium tracking-wider uppercase text-sm">Notre équipe</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] mt-2">
            Deux passionnés à votre service
          </h2>
          <div className="w-24 h-1 bg-[#722F37] mx-auto mt-4" />
        </motion.div>

        {/* Team Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-[#FFF8F0] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-center p-6 gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#D4AF37]/30">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#722F37] rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-bold text-[#722F37]">{member.name}</h3>
                  <p className="text-[#D4AF37] font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-[#2C2C2C]/70 leading-relaxed">{member.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-8 rounded-xl bg-gradient-to-br from-[#722F37]/5 to-transparent hover:from-[#722F37]/10 transition-colors"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-[#722F37] flex items-center justify-center mb-4">
                <value.icon className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">{value.title}</h3>
              <p className="text-[#2C2C2C]/70">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}