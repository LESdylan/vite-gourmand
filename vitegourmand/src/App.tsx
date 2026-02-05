import React, { useState, useEffect } from 'react';
import './styles/globals.css';
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import HomePage from './components/HomePageNew';
import MenuCatalog from './components/MenuCatalog';
import MenuDetailPage from './components/MenuDetailPage';
import LoginPage from './components/LoginPage';
import OrderPage from './components/OrderPage';
import OrderPageModern from './components/OrderPageModern';
import OrderSuccessPage from './components/OrderSuccessPage';
import ContactPage from './components/ContactPageNew';
import OutstandingPage from './components/OutstandingPage';
import WhatsAppWidget from './components/WhatsAppWidget';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminPanelComplete from './components/AdminPanelComplete';
// UserSpace Dynamic - Real-time tracking system
import UserSpaceDynamic from './components/UserSpaceDynamic';
import UserOrderTracking from './components/UserOrderTracking';
import UserProfile from './components/UserProfile';
import LegalPage from './components/LegalPage';
import DemoAccountsSetup from './components/DemoAccountsSetup';
import DemoRoleSelector from './components/DemoRoleSelector';
import DesignSystemPage from './components/DesignSystemPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReviewsSlider from './components/ReviewsSlider';
// Quick User Switcher Component for fast role switching
import QuickUserSwitcher from './components/QuickUserSwitcher';
import WelcomeTestMode from './components/WelcomeTestMode';
import InitDemoButton from './components/InitDemoButton';
import { Menu as MenuType } from './data/menus';
import { getUserById } from './utils/mockUsers';

export type User = {
  id: string;
  email: string;
  metadata?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  };
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  role: 'user' | 'employee' | 'admin' | 'customer';
};

export type Page = 
  | 'home'
  | 'menu'
  | 'contact'
  | 'outstanding'
  | 'admin'
  | 'user-space'
  | 'user-profile'
  | 'demo-setup'
  | 'design-system'
  | 'legal-mentions'
  | 'legal-cgv';

// Stockage local des commandes en mode démo
const DEMO_ORDERS_KEY = 'vite-gourmand-demo-orders';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [selectedMenuForOrder, setSelectedMenuForOrder] = useState<MenuType | null>(null);
  const [showOrderPage, setShowOrderPage] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [successOrderData, setSuccessOrderData] = useState<any>(null);

  // Check for existing session on mount and initialize data
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Migrate old orders to new format (one-time operation)
    try {
      const migrateResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/migrate-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      if (migrateResponse.ok) {
        const result = await migrateResponse.json();
        console.log('[App] Migration result:', result);
      }
    } catch (error) {
      console.log('[App] Migration skipped or failed:', error);
    }
    
    // Auto-login avec le premier utilisateur (Marie Dubois - cliente)
    const defaultUser = getUserById('u005');
    if (defaultUser) {
      setUser({
        id: defaultUser.id,
        email: defaultUser.email,
        firstName: defaultUser.firstName,
        lastName: defaultUser.lastName,
        phone: defaultUser.phone,
        address: defaultUser.address || '',
        role: defaultUser.role as any,
        metadata: {
          firstName: defaultUser.firstName,
          lastName: defaultUser.lastName,
          phone: defaultUser.phone,
          address: defaultUser.address
        }
      });
      setAccessToken('mock-token-' + defaultUser.id);
      setIsDemoMode(true);
    }
    
    setLoading(false);
  };

  const checkSession = async () => {
    // No longer needed with mock users
    setLoading(false);
  };

  const fetchUserProfile = async (token: string) => {
    // No longer needed with mock users
  };

  const handleLogin = async (email: string, password: string) => {
    // No longer needed - using UserSwitcher instead
    return false;
  };

  const handleSignup = async (formData: any) => {
    // No longer needed - using mock users
    return false;
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      setAccessToken(null);
      setCurrentPage('home');
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleDemoLogin = (demoUser: User) => {
    setUser(demoUser);
    setAccessToken('demo-token-' + demoUser.id);
    setIsDemoMode(true);
    setCurrentPage('home');
    toast.success(`Connecté en tant que ${demoUser.firstName} ${demoUser.lastName} (${demoUser.role})`);
  };

  const handleSwitchUser = (newUser: any) => {
    setUser(newUser);
    setAccessToken('mock-token-' + newUser.id);
    setIsDemoMode(true);
    toast.success(`Basculé vers ${newUser.firstName} ${newUser.lastName} (${newUser.role === 'admin' ? 'Admin' : newUser.role === 'employee' ? 'Employé' : 'Client'})`);
  };

  const handleResetPassword = async (email: string) => {
    // No longer needed with mock users
    toast.info('Mode test : réinitialisation de mot de passe désactivée');
    return false;
  };

  const handleOrderSubmit = (orderData: any) => {
    try {
      // Close order form
      setShowOrderPage(false);
      
      // Show success page
      setSuccessOrderData(orderData);
      setShowOrderSuccess(true);
      
      if (isDemoMode) {
        // Sauvegarder en mode démo
        const existingOrders = JSON.parse(localStorage.getItem(DEMO_ORDERS_KEY) || '[]');
        const newOrder = {
          id: orderData.orderId || 'ord-' + Date.now(),
          userId: user?.id,
          ...orderData,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          statusHistory: [{
            status: 'confirmed',
            date: new Date().toISOString(),
            note: 'Commande créée'
          }]
        };
        existingOrders.push(newOrder);
        localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(existingOrders));
      } else {
        // Already handled by orderManager in OrderPageModern
        console.log('Order submitted via API');
      }
    } catch (error) {
      console.error('Error in handleOrderSubmit:', error);
      toast.error('Erreur lors de la validation de la commande');
    }
  };

  const handleMenuOrder = (menu: MenuType) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour passer commande');
      setCurrentPage('demo-setup');
      return;
    }
    setSelectedMenuForOrder(menu);
    setShowOrderPage(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />

      {/* Demo Mode Banner */}
      {isDemoMode && user && (
        <div className="bg-gradient-to-r from-purple-600 to-orange-600 text-white px-4 py-2 text-center text-sm">
          <span className="font-semibold">🎯 Mode Démonstration</span>
          <span className="mx-2">•</span>
          <span>Vous explorez l'application en tant que {user.firstName} {user.lastName} ({user.role === 'admin' ? 'Administrateur' : user.role === 'employee' ? 'Employé' : 'Client'})</span>
        </div>
      )}
      
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user}
        onLogout={handleLogout}
        isDemoMode={isDemoMode}
      />
      
      <main className="flex-grow">
        {/* Order Page Modal */}
        {showOrderPage && selectedMenuForOrder && user && (
          <OrderPageModern
            menuId={selectedMenuForOrder.id}
            userInfo={{
              id: user.id,
              firstName: user.firstName || user.metadata?.firstName || '',
              lastName: user.lastName || user.metadata?.lastName || '',
              email: user.email,
              phone: user.phone || user.metadata?.phone || '',
              address: user.address || user.metadata?.address || ''
            }}
            onClose={() => {
              setShowOrderPage(false);
              setSelectedMenuForOrder(null);
            }}
            onSubmit={handleOrderSubmit}
          />
        )}

        {/* Order Success Page */}
        {showOrderSuccess && successOrderData && (
          <OrderSuccessPage
            orderId={successOrderData.orderId || 'N/A'}
            orderData={{
              menuName: successOrderData.menuName || '',
              customerName: successOrderData.customerName || '',
              persons: successOrderData.persons || 0,
              totalPrice: successOrderData.totalPrice || 0,
              deliveryAddress: successOrderData.deliveryAddress || '',
              deliveryDate: successOrderData.deliveryDate || new Date().toISOString(),
              status: successOrderData.status || 'pending'
            }}
            onClose={() => {
              setShowOrderSuccess(false);
              setSuccessOrderData(null);
              setSelectedMenuForOrder(null);
              setCurrentPage('home');
            }}
            onViewOrders={() => {
              setShowOrderSuccess(false);
              setSuccessOrderData(null);
              setSelectedMenuForOrder(null);
              setCurrentPage('user-space');
            }}
          />
        )}

        {currentPage === 'home' && (
          <>
            <HomePage setCurrentPage={setCurrentPage} />
            <ReviewsSlider />
          </>
        )}
        
        {currentPage === 'menu' && (
          <MenuCatalog onMenuOrder={handleMenuOrder} />
        )}
        
        {currentPage === 'contact' && (
          <ContactPage />
        )}

        {currentPage === 'outstanding' && (
          <OutstandingPage />
        )}
        
        {currentPage === 'admin' && (user?.role === 'admin' || user?.role === 'employee') && (
          <AdminDashboard 
            user={{
              id: user.id,
              firstName: user.firstName || user.metadata?.firstName || 'User',
              lastName: user.lastName || user.metadata?.lastName || '',
              email: user.email,
              role: user.role as 'admin' | 'employee'
            }}
            accessToken={accessToken}
            onLogout={handleLogout}
          />
        )}
        
        {/* User Space - Dynamic with real-time tracking */}
        {currentPage === 'user-space' && user && (
          <UserSpaceDynamic 
            user={user}
            accessToken={accessToken}
            setCurrentPage={setCurrentPage}
            onUserUpdate={fetchUserProfile}
          />
        )}

        {currentPage === 'user-profile' && user && (
          <UserProfile
            user={user}
            onLogout={handleLogout}
            setCurrentPage={setCurrentPage}
          />
        )}
        
        {currentPage === 'demo-setup' && (
          <DemoRoleSelector onSelectRole={handleDemoLogin} />
        )}
        
        {currentPage === 'design-system' && (
          <DesignSystemPage />
        )}
        
        {currentPage === 'legal-mentions' && (
          <LegalPage section="mentions" />
        )}
        
        {currentPage === 'legal-cgv' && (
          <LegalPage section="cgv" />
        )}
      </main>
      
      <Footer setCurrentPage={setCurrentPage} />
      
      {/* WhatsApp Widget */}
      <WhatsAppWidget />

      {/* Init Demo Button - Visible only in demo mode */}
      {isDemoMode && <InitDemoButton />}

      {/* Quick User Switcher - Always visible when logged in */}
      {user && (
        <>
          <QuickUserSwitcher 
            currentUser={user}
            onSwitchUser={handleSwitchUser}
          />
          <WelcomeTestMode />
        </>
      )}
    </div>
  );
}

export default App;
