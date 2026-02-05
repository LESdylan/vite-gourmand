import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Sparkles } from 'lucide-react';

export default function WelcomeTestMode() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show welcome message after a short delay
    const timer = setTimeout(() => {
      const hasSeenWelcome = localStorage.getItem('vite-gourmand-welcome-seen');
      if (!hasSeenWelcome) {
        setIsVisible(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('vite-gourmand-welcome-seen', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-purple-600 to-orange-600 rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-white relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />

            {/* Content */}
            <div className="relative z-10">
              <button
                onClick={handleClose}
                className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={32} className="animate-pulse" />
                <h2 className="text-3xl font-bold">Mode Test Activé !</h2>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-lg text-white/90">
                  Bienvenue dans l'application <strong>Vite & Gourmand</strong> en mode test.
                </p>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <p className="font-semibold flex items-center gap-2">
                    <Users size={20} />
                    Vous pouvez changer d'utilisateur instantanément !
                  </p>
                  <p className="text-sm text-white/80">
                    Cliquez sur le bouton flottant en bas à droite pour accéder à 8 utilisateurs de test : 1 admin, 2 employés et 5 clients.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm text-white/90">
                  <div className="flex items-start gap-2">
                    <span className="text-green-300">🛒</span>
                    <div><strong>Clients</strong> : Commander des menus, voir l'historique, points fidélité</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-300">👔</span>
                    <div><strong>Employés</strong> : Gérer le Kanban, prendre en charge les commandes</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-300">👑</span>
                    <div><strong>Admin</strong> : Dashboard complet, gestion utilisateurs et menus</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Compris ! Commençons 🚀
              </button>

              <p className="text-xs text-center text-white/60 mt-3">
                Ce message ne s'affichera qu'une seule fois
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
