'use client';

import { useState } from 'react';
import type { WizardMode, WizardContext } from '@/components/UploadDocumentWizard';

export function useWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<WizardMode>('create');
  const [context, setContext] = useState<WizardContext>({});
  const open = (m: WizardMode, ctx?: WizardContext) => {
    setMode(m);
    setContext(ctx || {});
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);
  return { isOpen, mode, context, open, close };
}
