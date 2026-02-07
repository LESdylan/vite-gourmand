import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PortalAuthProvider, ProtectedRoute, Unauthorized } from './portal_dashboard'
import './App.css'

// Lazy load components
const DevBoard = lazy(() => import('./components/DevBoard').then(m => ({ default: m.DevBoard })));
const Portal = lazy(() => import('./portal_dashboard').then(m => ({ default: m.Portal })));
const PublicSPA = lazy(() => import('./pages/PublicSPA'));

// Lazy load scenario pages
// const FormTestPage = lazy(() => import('./tests/form').then(m => ({ default: m.FormTestPage })));
const KanbanScenario = lazy(() => import('./scenarios/kanban').then(m => ({ default: m.KanbanScenario })));
const MinitalkScenario = lazy(() => import('./scenarios/minitalk').then(m => ({ default: m.MinitalkScenario })));
const AuthScenario = lazy(() => import('./scenarios/auth').then(m => ({ default: m.AuthScenario })));
const FoodCardScenario = lazy(() => import('./scenarios/FoodCardScenario').then(m => ({ default: m.FoodCardScenario })));

function LoadingSpinner() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f9f9fd',
      color: 'rgba(40, 25, 80, 0.75)',
      fontSize: '18px'
    }}>
      ⏳ Chargement...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PortalAuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public SPA - Landing page with internal navigation */}
            <Route path="/" element={<PublicSPA />} />
            
            {/* Portal & Auth */}
            <Route path="/portal" element={<Portal />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Unified Dashboard - SPA with role switching */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'employee']}>
                <DevBoard />
              </ProtectedRoute>
            } />
            
            {/* Legacy routes - redirect to dashboard */}
            <Route path="/dev" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="/employee" element={<Navigate to="/dashboard" replace />} />
            
            {/* Scenario pages (dev tools) */}
            {/* <Route path="/scenario/form" element={<FormTestPage />} /> */}
            <Route path="/scenario/foodcard" element={<FoodCardScenario />} />
            <Route path="/scenario/kanban" element={<KanbanScenario />} />
            <Route path="/scenario/minitalk" element={<MinitalkScenario />} />
            <Route path="/scenario/auth" element={<AuthScenario />} />
          </Routes>
        </Suspense>
      </PortalAuthProvider>
    </BrowserRouter>
  );
}

export default App
