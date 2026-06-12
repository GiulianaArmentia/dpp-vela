'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaFileAlt } from 'react-icons/fa';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: string;
  status: string;
  statusLabel: string;
  isEs?: boolean;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  title,
  type,
  status,
  statusLabel,
  isEs = true,
}: DocumentPreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative bg-bg-card border border-border rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-violet/10 flex items-center justify-center text-text-link">
              <FaFileAlt size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary leading-tight">
                {title}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                {type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#14532D] text-[#86EFAC]">
              {statusLabel}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-inner transition-colors"
              aria-label="Cerrar"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Body — PDF preview placeholder */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="bg-bg-page border border-border-inner rounded-lg p-6 min-h-[320px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-bg-inner border border-border-inner flex items-center justify-center mb-4">
              <FaFileAlt size={28} className="text-text-link" />
            </div>
            <p className="text-sm font-medium text-text-primary mb-1">
              {title}
            </p>
            <p className="text-xs text-text-muted mb-4">
              {type} · {statusLabel}
            </p>
            {/* Document preview lines */}
            <div className="w-full max-w-md space-y-2">
              <div className="h-2 bg-bg-inner rounded-full w-full" />
              <div className="h-2 bg-bg-inner rounded-full w-[92%]" />
              <div className="h-2 bg-bg-inner rounded-full w-[85%]" />
              <div className="h-2 bg-bg-inner rounded-full w-[90%]" />
              <div className="h-2 bg-bg-inner rounded-full w-[70%]" />
              <div className="h-2 bg-bg-inner rounded-full w-[80%]" />
              <div className="h-2 bg-bg-inner rounded-full w-[95%]" />
              <div className="h-2 bg-bg-inner rounded-full w-[60%]" />
            </div>
            <p className="text-xs text-text-muted mt-4">
              {isEs
                ? 'Vista previa del documento no disponible en entorno de demostración.'
                : 'Document preview not available in demo environment.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-bg-inner border border-border text-sm text-text-primary hover:border-text-link transition-colors"
          >
            {isEs ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
