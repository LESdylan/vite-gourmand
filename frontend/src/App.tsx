import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

// Lazy load DevBoard
const DevBoard = lazy(() => import('./components/DevBoard').then(m => ({ default: m.DevBoard })));

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
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<DevBoard />} />
          <Route path="/scenario/form" element={<FormTestPage />} />
          <Route path="/scenario/kanban" element={<KanbanScenario />} />
          <Route path="/scenario/minitalk" element={<MinitalkScenario />} />
          <Route path="/scenario/auth" element={<AuthScenario />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App
