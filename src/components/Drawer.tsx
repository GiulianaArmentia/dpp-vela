'use client';

import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  // Lock body scroll and add drawer-open class when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('drawer-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('drawer-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('drawer-open');
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[1001] w-full sm:w-[50vw] sm:min-w-[720px] sm:max-w-[920px] max-w-full bg-bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {title ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-card">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-bg-inner border border-border-inner flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border transition-colors"
                aria-label="Cerrar"
              >
                <FaTimes size={14} />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </>
        ) : (
          /* Content manages its own header + scroll */
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        )}
      </div>
    </>
  );
}
