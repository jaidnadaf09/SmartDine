import React from 'react';
import { Icons } from '../icons/IconSystem';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

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
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  return (
    <Modal 
      isOpen={open} 
      onClose={onCancel} 
      size="sm" 
      showClose={false}
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '20px', 
          background: type === 'danger' ? 'rgba(217, 83, 79, 0.1)' : 'rgba(224, 168, 0, 0.1)',
          color: type === 'danger' ? 'var(--error-color)' : 'var(--warning-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          {type === 'danger' ? <Icons.trash size={32} /> : <Icons.alertCircle size={32} />}
        </div>
        
        <h3 style={{ 
          fontSize: '1.4rem', 
          fontWeight: 800, 
          marginBottom: '12px', 
          color: 'var(--text-primary)',
          fontFamily: 'Poppins, sans-serif'
        }}>
          {title}
        </h3>
        
        <p style={{ 
          fontSize: '0.95rem', 
          color: 'var(--text-secondary)', 
          lineHeight: 1.6, 
          marginBottom: '32px' 
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button 
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            style={{ padding: '10px 24px' }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
