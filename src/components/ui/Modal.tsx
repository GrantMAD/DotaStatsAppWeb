'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimationWrapper } from './AnimationWrapper';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  id?: string;
}

export function Modal({ isOpen, onClose, title, children, className, size = 'md', id }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalId = id || `modal-${title?.toLowerCase().replace(/\s+/g, '-') || 'default'}`;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        
        // Simple Focus Trap
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      
      // Auto-focus the first element or the modal container
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          modalRef.current?.focus();
        }
      }, 100);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-[95vw]'
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 lg:p-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${modalId}-title`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <AnimationWrapper
            animationType="slide-up"
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-h-[90vh] glass-card overflow-hidden flex flex-col p-0 border-(--card-border)",
              sizeClasses[size],
              className
            )}
            ref={modalRef}
            tabIndex={-1}
          >
            <div className="flex items-center justify-between p-6 border-b border-(--card-border)">
              <h3 
                id={`${modalId}-title`}
                className="text-xl font-bold text-foreground"
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-(--nav-hover) rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </AnimationWrapper>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
