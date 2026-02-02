import { Suspense, lazy } from 'react'
import './App.css'

// Lazy load to see errors clearly
const AuthPortal = lazy(() => import('./test/AuthPortal').then(m => ({ default: m.AuthPortal })));

function App() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        ⏳ Chargement...
      </div>
    }>
      <AuthPortal onBack={() => window.location.reload()} />
    </Suspense>
  );
}

export default App
