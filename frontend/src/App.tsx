import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PortalAuthProvider, ProtectedRoute, Unauthorized, DebugSwitcher } from './portal_dashboard'
import './App.css'

// Lazy load dashboards
const DevBoard = lazy(() => import('./components/DevBoard').then(m => ({ default: m.DevBoard })));
const AdminDashboard = lazy(() => import('./admin_space').then(m => ({ default: m.AdminDashboard })));
const EmployeeDashboard = lazy(() => import('./employee_space').then(m => ({ default: m.EmployeeDashboard })));
const Portal = lazy(() => import('./portal_dashboard').then(m => ({ default: m.Portal })));

// Lazy load scenario pages
const FormTestPage = lazy(() => import('./tests/form').then(m => ({ default: m.FormTestPage })));
const KanbanScenario = lazy(() => import('./scenarios/kanban').then(m => ({ default: m.KanbanScenario })));
const MinitalkScenario = lazy(() => import('./scenarios/minitalk').then(m => ({ default: m.MinitalkScenario })));
const AuthScenario = lazy(() => import('./scenarios/auth').then(m => ({ default: m.AuthScenario })));

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
            {/* Portal & Auth */}
            <Route path="/portal" element={<Portal />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Role-based dashboards */}
            <Route path="/dev" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DevBoard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            
            {/* Legacy routes - redirect to portal */}
            <Route path="/" element={<Navigate to="/portal" replace />} />
            
            {/* Scenario pages (dev tools) */}
            <Route path="/scenario/form" element={<FormTestPage />} />
            <Route path="/scenario/kanban" element={<KanbanScenario />} />
            <Route path="/scenario/minitalk" element={<MinitalkScenario />} />
            <Route path="/scenario/auth" element={<AuthScenario />} />
          </Routes>
          
          {/* Debug Switcher - only visible for superadmin */}
          <DebugSwitcher />
        </Suspense>
      </PortalAuthProvider>
    </BrowserRouter>
  );
}

export default App
