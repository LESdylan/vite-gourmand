import { useState } from 'react'
import { TestDashboard, DevDashboard } from './test-components'
import './App.css'

type DashboardMode = 'app' | 'test' | 'dev'

function App() {
  const [mode, setMode] = useState<DashboardMode>('dev')

  if (mode === 'dev') {
    return (
      <div>
        <div style={{ 
          position: 'fixed', 
          top: 10, 
          right: 10, 
          zIndex: 1000,
          display: 'flex',
          gap: '8px'
        }}>
          <button 
            onClick={() => setMode('test')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Simple Tests
          </button>
          <button 
            onClick={() => setMode('app')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            ← Back to App
          </button>
        </div>
        <DevDashboard />
      </div>
    )
  }

  if (mode === 'test') {
    return (
      <div>
        <button 
          onClick={() => setMode('app')}
          style={{ margin: '10px', padding: '8px 16px' }}
        >
          ← Back to App
        </button>
        <button 
          onClick={() => setMode('dev')}
          style={{ margin: '10px', padding: '8px 16px' }}
        >
          🔧 Dev Dashboard
        </button>
        <TestDashboard />
      </div>
    )
  }

  return (
    <main role="main" aria-label="Vite Gourmand Application">
      <h1>Vite Gourmand</h1>
      <div className="card" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => setMode('test')}>
          🧪 Simple Tests
        </button>
        <button onClick={() => setMode('dev')}>
          🔧 Dev Dashboard
        </button>
      </div>
    </main>
  )
}

export default App
