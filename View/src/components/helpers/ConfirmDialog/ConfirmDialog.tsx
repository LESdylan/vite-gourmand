/**
 * ConfirmDialog - Modal confirmation dialog
 * Used for confirming destructive actions
 */

import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <DialogContent
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        variant={variant}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </div>
  );
}

interface DialogContentProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

function DialogContent(props: DialogContentProps) {
  const handleClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="confirm-dialog" role="dialog" aria-modal="true" onClick={handleClick}>
      <h2 className="confirm-dialog-title">{props.title}</h2>
      <p className="confirm-dialog-message">{props.message}</p>
      <DialogActions {...props} />
    </div>
  );
}

function DialogActions(props: DialogContentProps) {
  const confirmClass = props.variant === 'danger' ? 'confirm-btn-danger' : 'confirm-btn-primary';

  return (
    <div className="confirm-dialog-actions">
      <button className="confirm-btn-cancel" onClick={props.onCancel}>
        {props.cancelLabel}
      </button>
      <button className={`confirm-btn ${confirmClass}`} onClick={props.onConfirm}>
        {props.confirmLabel}
      </button>
    </div>
  );
}
