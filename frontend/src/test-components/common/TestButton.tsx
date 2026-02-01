/**
 * Test Button
 * ============
 * Button component for triggering tests
 */

interface TestButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function TestButton({
  label,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
}: TestButtonProps) {
  const style = getButtonStyle(variant, disabled || loading);

  return (
    <button style={style} onClick={onClick} disabled={disabled || loading}>
      {loading ? <LoadingSpinner /> : label}
    </button>
  );
}

function LoadingSpinner() {
  return <span style={spinnerStyle}>⏳</span>;
}

function getButtonStyle(
  variant: 'primary' | 'secondary' | 'danger',
  disabled: boolean
): React.CSSProperties {
  const colors = {
    primary: { bg: '#007bff', hover: '#0056b3' },
    secondary: { bg: '#6c757d', hover: '#545b62' },
    danger: { bg: '#dc3545', hover: '#c82333' },
  };

  return {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: colors[variant].bg,
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.65 : 1,
    marginRight: '8px',
    marginBottom: '8px',
  };
}

const spinnerStyle: React.CSSProperties = {
  display: 'inline-block',
  animation: 'spin 1s linear infinite',
};
