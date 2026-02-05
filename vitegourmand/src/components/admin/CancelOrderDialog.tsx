import { useState } from 'react';
import { X, Phone, Mail, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface CancelOrderDialogProps {
  orderId: string;
  orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onConfirm: (contactMethod: string, contactReason: string, cancelReason: string) => void;
  onClose: () => void;
}

export default function CancelOrderDialog({ orderId, orderData, onConfirm, onClose }: CancelOrderDialogProps) {
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | ''>('');
  const [contactReason, setContactReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [step, setStep] = useState<'contact' | 'cancel'>('contact');

  const handleContactConfirm = () => {
    if (!contactMethod) {
      toast.error('Veuillez sélectionner un mode de contact');
      return;
    }
    if (!contactReason.trim()) {
      toast.error('Veuillez préciser la raison du contact');
      return;
    }
    setStep('cancel');
  };

  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      toast.error('Veuillez préciser la raison de l\'annulation');
      return;
    }
    onConfirm(contactMethod, contactReason, cancelReason);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {step === 'contact' ? '📞 Contact client requis' : '❌ Annulation de commande'}
            </h2>
            <p className="text-red-100">
              {step === 'contact' 
                ? 'Contactez le client avant d\'annuler la commande'
                : 'Confirmer l\'annulation de la commande'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'contact' ? (
            <>
              {/* Customer Info */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 mb-6 border-2 border-orange-200">
                <h3 className="font-bold text-gray-900 mb-3">Informations du client</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Nom :</span> <span className="font-semibold">{orderData.customerName}</span></p>
                  <p><span className="text-gray-600">Email :</span> <span className="font-semibold">{orderData.customerEmail}</span></p>
                  <p><span className="text-gray-600">Téléphone :</span> <span className="font-semibold">{orderData.customerPhone}</span></p>
                </div>
              </div>

              {/* Alert */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6">
                <div className="flex gap-3">
                  <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-yellow-900 mb-1">Procédure obligatoire</h4>
                    <p className="text-sm text-yellow-800">
                      Avant d'annuler ou de modifier une commande, vous devez contacter le client par téléphone ou par email 
                      pour l'informer et expliquer la situation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Method */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Mode de contact utilisé *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setContactMethod('phone')}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      contactMethod === 'phone'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Phone className={contactMethod === 'phone' ? 'text-orange-600' : 'text-gray-400'} size={24} />
                      <div className="text-left">
                        <p className="font-bold text-gray-900">Téléphone</p>
                        <p className="text-xs text-gray-500">Appel GSM</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setContactMethod('email')}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      contactMethod === 'email'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Mail className={contactMethod === 'email' ? 'text-orange-600' : 'text-gray-400'} size={24} />
                      <div className="text-left">
                        <p className="font-bold text-gray-900">Email</p>
                        <p className="text-xs text-gray-500">Courrier électronique</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Contact Reason */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Raison du contact / Discussion *
                </label>
                <textarea
                  value={contactReason}
                  onChange={(e) => setContactReason(e.target.value)}
                  placeholder="Ex: Client informé du problème d'approvisionnement, proposition de menu alternatif refusée..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleContactConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Confirmer le contact
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Cancel Reason */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 mb-6 border-2 border-red-200">
                <h3 className="font-bold text-gray-900 mb-3">Contact effectué ✓</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Mode :</span> {contactMethod === 'phone' ? 'Téléphone' : 'Email'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Détails :</span> {contactReason}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Motif d'annulation de la commande *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none mb-3"
                >
                  <option value="">Sélectionner un motif</option>
                  <option value="Problème d'approvisionnement">Problème d'approvisionnement</option>
                  <option value="Indisponibilité du personnel">Indisponibilité du personnel</option>
                  <option value="Problème de livraison">Problème de livraison</option>
                  <option value="Demande du client">Demande du client (après accord)</option>
                  <option value="Paiement non confirmé">Paiement non confirmé</option>
                  <option value="Autre">Autre raison</option>
                </select>

                {cancelReason === 'Autre' && (
                  <textarea
                    placeholder="Précisez la raison..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                    rows={3}
                  />
                )}
              </div>

              {/* Warning */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
                <div className="flex gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">Action irréversible</h4>
                    <p className="text-sm text-red-800">
                      Cette action annulera définitivement la commande. Le client sera notifié par email.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('contact')}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Annuler la commande
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
