import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const phoneNumber = '33556000000'; // À remplacer par le vrai numéro
    const message = encodeURIComponent('Bonjour, je souhaite obtenir des informations sur vos services de traiteur.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Bubble principale */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        {/* Tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-20 bottom-2 bg-white px-4 py-3 rounded-lg shadow-xl border border-gray-200 whitespace-nowrap"
            >
              <p className="text-sm font-medium text-gray-900">Besoin d'aide ?</p>
              <p className="text-xs text-gray-600">Discutez avec nous !</p>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton principal */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full shadow-2xl flex items-center justify-center text-white group"
        >
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          
          {/* Icon */}
          <MessageCircle size={28} className="relative z-10" />

          {/* Notification badge */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
          >
            1
          </motion.div>
        </motion.button>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-green-500 blur-xl opacity-50 animate-pulse" />
      </motion.div>
    </>
  );
}
