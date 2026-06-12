'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type DrawerMode = 'section' | 'document' | 'missing' | 'group' | 'resumen';

export type DocStatus =
  | 'active'
  | 'expired'
  | 'pending'
  | 'missing'
  | 'underReview'
  | 'rejected'
  | 'notApplicable'
  | 'replaced'
  | 'conforme'
  | 'parcial';

export type SectionStatus =
  | 'completo'
  | 'enProgreso'
  | 'conPendientes'
  | 'faltanEvidencias'
  | 'noAplica';

export interface DrawerContextState {
  isOpen: boolean;
  mode: DrawerMode;
  section?: string;       // 'producto' | 'cadena' | 'materiales' | 'circularidad' | 'cumplimiento' | 'documentacion'
  entityType?: string;    // 'material' | 'etapa' | 'certificacion' | etc.
  entityId?: string;
  documentId?: string;
  groupId?: string;
  subtitle?: string;
  status?: SectionStatus | DocStatus;
}

interface DrawerContextType {
  drawer: DrawerContextState;
  openDrawer: (params: Omit<DrawerContextState, 'isOpen'>) => void;
  closeDrawer: () => void;
}

const defaultDrawer: DrawerContextState = {
  isOpen: false,
  mode: 'section',
};

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState<DrawerContextState>(defaultDrawer);

  const openDrawer = useCallback((params: Omit<DrawerContextState, 'isOpen'>) => {
    setDrawer({ ...params, isOpen: true });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawer((prev) => ({ ...prev, isOpen: false }));
    // Small delay to allow exit animation before fully resetting
    setTimeout(() => {
      setDrawer(defaultDrawer);
    }, 350);
  }, []);

  return (
    <DrawerContext.Provider value={{ drawer, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within DrawerProvider');
  return context;
}
