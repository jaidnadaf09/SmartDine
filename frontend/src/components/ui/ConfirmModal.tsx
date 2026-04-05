import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel
}) => {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="modal-backdrop-premium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                    />
                    <motion.div
                        className="confirm-modal-premium"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="confirm-modal-content">
                            <h3 className="confirm-modal-title">{title}</h3>
                            <p className="confirm-modal-description">{description}</p>
                            
                            <div className="confirm-modal-actions">
                                <button
                                    className="confirm-modal-btn btn-secondary"
                                    onClick={onCancel}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    className="confirm-modal-btn btn-danger-filled"
                                    onClick={onConfirm}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
