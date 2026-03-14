import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import '../../App.css'; 

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal fade-up" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close" onClick={onCancel}>
          <X size={20} />
        </button>
        
        <div className={`confirm-icon-wrapper ${type}`}>
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button onClick={onCancel} className="confirm-btn-cancel">
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }} 
            className={`confirm-btn-action ${type}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
