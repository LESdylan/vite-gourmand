/**
 * Test Dashboard
 * ===============
 * Main page for running integration tests against the backend
 */

import { HealthCheckTest } from './health';
import { LoginTest, RegisterTest, PasswordResetTest } from './auth';

export function TestDashboard() {
  return (
    <div style={containerStyle}>
      <Header />
      <main style={mainStyle}>
        <HealthCheckTest />
        <LoginTest />
        <RegisterTest />
        <PasswordResetTest />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>🧪 Integration Test Dashboard</h1>
      <p style={subtitleStyle}>
        Test frontend-backend communication component by component
      </p>
    </header>
  );
}

const containerStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '20px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '32px',
  paddingBottom: '16px',
  borderBottom: '2px solid #eee',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '28px',
  color: '#333',
};

const subtitleStyle: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#666',
  fontSize: '16px',
};

const mainStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

export default TestDashboard;
