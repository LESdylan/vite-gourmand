/**
 * Test Result Display
 * ====================
 * Displays API test results with status indicators
 */

export interface TestResult {
  name?: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: unknown;
}

interface TestResultDisplayProps {
  result: TestResult | null;
}

export function TestResultDisplay({ result }: TestResultDisplayProps) {
  if (!result) {
    return null;
  }

  return (
    <div style={getContainerStyle(result.status)}>
      <StatusIcon status={result.status} />
      {result.name && <span style={{ fontWeight: 'bold' }}>{result.name}</span>}
      {result.message && <MessageDisplay message={result.message} />}
      {result.data !== undefined && <DataDisplay data={result.data} />}
    </div>
  );
}

function StatusIcon({ status }: { status: TestResult['status'] }) {
  const icons = {
    pending: '⏳',
    success: '✅',
    error: '❌',
  };
  return <span style={{ marginRight: '8px' }}>{icons[status]}</span>;
}

function MessageDisplay({ message }: { message: string }) {
  return <p style={{ margin: '4px 0', color: '#666' }}>{message}</p>;
}

function DataDisplay({ data }: { data: unknown }) {
  return (
    <pre style={preStyle}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function getContainerStyle(status: TestResult['status']) {
  const colors = {
    pending: '#fff3cd',
    success: '#d4edda',
    error: '#f8d7da',
  };
  
  return {
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '4px',
    backgroundColor: colors[status],
    border: `1px solid ${colors[status]}`,
  };
}

const preStyle = {
  backgroundColor: '#f5f5f5',
  padding: '8px',
  borderRadius: '4px',
  overflow: 'auto',
  fontSize: '12px',
  maxHeight: '200px',
};
