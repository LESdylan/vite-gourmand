import { useState } from 'react';
import { Button } from './ui/button';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function InitDemoButton() {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const handleInit = async () => {
    setLoading(true);
    try {
      console.log('[InitDemo] Calling init endpoint...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/init-demo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[InitDemo] Success:', data);
        toast.success(`Données initialisées ! ${data.stats.users} utilisateurs, ${data.stats.orders} commandes`);
        setInitialized(true);
        
        // Rafraîchir la page après 2 secondes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const error = await response.json();
        console.error('[InitDemo] Error:', error);
        toast.error(error.error || 'Erreur lors de l\'initialisation');
      }
    } catch (error) {
      console.error('[InitDemo] Exception:', error);
      toast.error('Erreur lors de l\'initialisation des données');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleInit}
        disabled={loading || initialized}
        className={`
          shadow-lg
          ${initialized 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-purple-600 hover:bg-purple-700'
          }
        `}
        size="lg"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Initialisation...
          </>
        ) : initialized ? (
          <>
            <CheckCircle className="h-5 w-5 mr-2" />
            Données initialisées !
          </>
        ) : (
          <>
            <Database className="h-5 w-5 mr-2" />
            Initialiser les données
          </>
        )}
      </Button>
    </div>
  );
}
