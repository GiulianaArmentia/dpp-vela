'use client';

import { useDrawer } from '@/lib/DrawerContext';
import Drawer from './Drawer';
import {
  ProductoDrawer, CadenaDrawer, MaterialesDrawer, CircularidadDrawer,
  CumplimientoDrawer, DocumentoDrawer, MissingDrawer, ResumenDrawer,
} from './DrawerContents';

export default function DrawerManager() {
  const { drawer, closeDrawer } = useDrawer();

  const renderContent = () => {
    switch (drawer.mode) {
      case 'section':
        switch (drawer.section) {
          case 'producto': return <ProductoDrawer />;
          case 'cadena': return <CadenaDrawer />;
          case 'materiales': return <MaterialesDrawer />;
          case 'circularidad': return <CircularidadDrawer />;
          case 'cumplimiento': return <CumplimientoDrawer />;
          default: return null;
        }
      case 'document':
        if (drawer.documentId) return <DocumentoDrawer documentId={drawer.documentId} />;
        return null;
      case 'missing':
        return (
          <MissingDrawer
            title={drawer.subtitle || 'Documento faltante'}
            section={drawer.section || ''}
            entity={drawer.entityId}
            reason={drawer.subtitle}
          />
        );
      case 'resumen':
        return <ResumenDrawer />;
      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <Drawer isOpen={drawer.isOpen} onClose={closeDrawer} title="">
      {content}
    </Drawer>
  );
}
