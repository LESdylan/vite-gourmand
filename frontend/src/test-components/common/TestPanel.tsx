/**
 * Test Panel
 * ===========
 * Container component for grouping related tests
 */

import type { ReactNode } from 'react';

interface TestPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function TestPanel({ title, description, children }: TestPanelProps) {
  return (
    <section style={panelStyle}>
      <PanelHeader title={title} description={description} />
      <div style={contentStyle}>{children}</div>
    </section>
  );
}

function PanelHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header style={headerStyle}>
      <h2 style={titleStyle}>{title}</h2>
      {description && <p style={descStyle}>{description}</p>}
    </header>
  );
}

const panelStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  marginBottom: '16px',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '16px',
  borderBottom: '1px solid #ddd',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '18px',
  color: '#333',
};

const descStyle: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#666',
  fontSize: '14px',
};

const contentStyle: React.CSSProperties = {
  padding: '16px',
};
