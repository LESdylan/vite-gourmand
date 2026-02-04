import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

// Lazy load DevBoard
const DevBoard = lazy(() => import('./components/DevBoard').then(m => ({ default: m.DevBoard })));

// Lazy load test pages
const FormTestPage = lazy(() => import('./tests/form').then(m => ({ default: m.FormTestPage })));
const RealTimeTestPage = lazy(() => import('./tests/real_time').then(m => ({ default: m.RealTimeTestPage })));
const KanbanTestPage = lazy(() => import('./tests/kanban').then(m => ({ default: m.KanbanTestPage })));

function LoadingSpinner() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0d0a09',
      color: '#f5f2ef',
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
          <Route path="/test/form" element={<FormTestPage />} />
          <Route path="/test/realtime" element={<RealTimeTestPage />} />
          <Route path="/test/kanban" element={<KanbanTestPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App
