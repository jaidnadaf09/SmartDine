import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@components/icons/IconSystem';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmText = "Yes, Clear",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="confirm-overlay">
          <motion.div
            className="confirm-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.18 }}
          >
            <div className="confirm-icon">
              <Icons.warning size={22} />
            </div>

            <h3>{title}</h3>

            <p>{message}</p>

            <div className="confirm-actions">
              <button
                className="btn-secondary"
                onClick={onCancel}
              >
                {cancelText}
              </button>

              <button
                className="btn-danger"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
