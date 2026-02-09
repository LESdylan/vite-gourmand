/**
 * Shell - Main terminal component (resizable & draggable)
 */

import { useShell } from './useShell';
import { ShellOutput } from './ShellOutput';
import { ShellInput } from './ShellInput';
import './Shell.css';

interface Props {
  onClose?: () => void;
  style?: React.CSSProperties;
  onHeaderMouseDown?: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent) => void;
}

export function Shell({ onClose, style, onHeaderMouseDown, onResizeStart }: Props) {
  const sh = useShell();

  const handleClick = () => {
    document.querySelector<HTMLInputElement>('.shell-input input')?.focus();
  };

  return (
    <div className="shell" style={style} onClick={handleClick}>
      <header className="shell-header" onMouseDown={onHeaderMouseDown}>
        <div className="shell-dots">
          <span className="dot red" onClick={onClose} />
          <span className="dot yellow" onClick={sh.clear} />
          <span className="dot green" />
        </div>
        <span className="shell-title">cloud-shell — {sh.cwd}</span>
        <div className="shell-actions">
          <button onClick={sh.clear} title="Clear">⌫</button>
          {onClose && <button onClick={onClose} title="Close">×</button>}
        </div>
      </header>
      <div className="shell-body">
        <ShellOutput lines={sh.lines} />
        <ShellInput
          value={sh.input}
          prompt={sh.cwd}
          loading={sh.loading}
          onChange={sh.setInput}
          onSubmit={sh.run}
          onNavigate={sh.navigateHistory}
        />
      </div>
      {onResizeStart && (
        <div className="shell-resize-handle" onMouseDown={onResizeStart} />
      )}
    </div>
  );
}
