import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../icons/IconSystem';
import '../../styles/ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDanger = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="confirm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal Container */}
          <div className="confirm-modal-wrapper" onClick={onCancel}>
            <motion.div
              className="confirm-modal-content"
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon Section */}
              <div className={`confirm-modal-icon-container ${isDanger ? 'danger' : 'warning'}`}>
                {isDanger ? <Icons.trash size={28} /> : <Icons.warning size={28} />}
              </div>

              {/* Text Section */}
              <h2 className="confirm-modal-title">{title}</h2>
              <p className="confirm-modal-message">{message}</p>

              {/* Action Buttons */}
              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="confirm-modal-btn cancel"
                  onClick={onCancel}
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  className={`confirm-modal-btn confirm ${isDanger ? 'danger' : ''}`}
                  onClick={() => {
                    onConfirm();
                  }}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
