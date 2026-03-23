import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../icons/IconSystem';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: string;
    size?: 'sm' | 'md' | 'lg'; // Added size prop
    showClose?: boolean;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth,
    size = 'md',
    showClose = true,
    className = ''
}) => {
    // Robust scroll locking to prevent layout shift
    useEffect(() => {
        if (isOpen) {
            // Calculate scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            // Apply lock and padding-right to prevent shift
            document.body.classList.add('modal-open');
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            
            // Also lock fixed-position elements if necessary (like header/sidebar)
            const header = document.querySelector('.main-header');
            if (header) (header as HTMLElement).style.paddingRight = `${scrollbarWidth}px`;
        } else {
            // Revert changes
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = '0';
            
            const header = document.querySelector('.main-header');
            if (header) (header as HTMLElement).style.paddingRight = '0';
        }

        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = '0';
            const header = document.querySelector('.main-header');
            if (header) (header as HTMLElement).style.paddingRight = '0';
        };
    }, [isOpen]);

    // Handle Esc key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const sizeClass = `modal-${size}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-root-wrapper">
                    <motion.div
                        className="modal-overlay-new"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className="modal-container-centered">
                        <motion.div
                            className={`modal-content-premium ${sizeClass} ${className}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ 
                                type: 'spring', 
                                damping: 25, 
                                stiffness: 300,
                                mass: 0.5 
                            }}
                            style={maxWidth ? { maxWidth } : {}}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {showClose && (
                                <button className="modal-close-btn-new" onClick={onClose} aria-label="Close modal">
                                    <Icons.close size={20} />
                                </button>
                            )}
                            
                            {title && (
                                <div className="modal-header-premium">
                                    <h3 className="modal-title-premium">{title}</h3>
                                </div>
                            )}
                            
                            <div className="modal-body-premium">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
