'use client';

import React, { createContext, useContext, useState } from 'react';

export type DocumentStatus = 'vigente' | 'por_vencer' | 'vencido';
export type DocumentType = 'Certificación GOTS' | 'Certificación OEKO-TEX' | 'Certificación GRS' | 'Certificación BCI' | 'Fair Trade' | 'SA8000' | 'ISO 14001' | 'Auditoría Third-party' | 'Transaction Certificate' | 'Chain of Custody' | 'Test Report' | 'Declaración REACH' | 'Declaración SVHC';

export interface DocumentVersion {
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  reason?: string;
}

export interface DppDocument {
  id: string;
  fileName: string;
  type: DocumentType;
  subType?: string;
  supplierId: string;
  supplierName: string;
  supplierStage: string;
  certificateNumber?: string;
  certifier?: string;
  issueDate: string;
  expiryDate: string;
  status: DocumentStatus;
  daysRemaining: number;
  associatedProducts: string[];
  notes?: string;
  versions: DocumentVersion[];
  sizeMB: number;
  createdAt: string;
  updatedAt: string;
}

const initialDocuments: DppDocument[] = [
  {
    id: 'doc-1',
    fileName: 'GOTS-2026-TR-001234.pdf',
    type: 'Certificación GOTS',
    certificateNumber: 'GOTS-2026-TR-001234',
    certifier: 'Control Union',
    supplierId: 's1',
    supplierName: 'Anatolian Cotton Ginning Co.',
    supplierStage: 'Ginning',
    issueDate: '2025-01-15',
    expiryDate: '2027-01-31',
    status: 'vigente',
    daysRemaining: 238,
    associatedProducts: ['VT-CAM-001', 'VT-JKT-002'],
    sizeMB: 2.3,
    versions: [{ version: 'v1.0', uploadedAt: '2025-01-15T14:32:00Z', uploadedBy: 'María García', fileName: 'GOTS-2026-TR-001234.pdf' }],
    createdAt: '2025-01-15T14:32:00Z',
    updatedAt: '2025-01-15T14:32:00Z',
  },
  {
    id: 'doc-2',
    fileName: 'OEKO-TEX-26.HTR.12345.pdf',
    type: 'Certificación OEKO-TEX',
    certificateNumber: '26.HTR.12345',
    certifier: 'Hohenstein',
    supplierId: 'hohenstein',
    supplierName: 'Hohenstein',
    supplierStage: 'Laboratorio',
    issueDate: '2025-07-07',
    expiryDate: '2026-07-07',
    status: 'por_vencer',
    daysRemaining: 30,
    associatedProducts: ['VT-CAM-001'],
    sizeMB: 1.8,
    versions: [{ version: 'v1.0', uploadedAt: '2025-07-07T10:15:00Z', uploadedBy: 'Sistema', fileName: 'OEKO-TEX-26.HTR.12345.pdf' }],
    createdAt: '2025-07-07T10:15:00Z',
    updatedAt: '2025-07-07T10:15:00Z',
  },
  {
    id: 'doc-3',
    fileName: 'GRS-ES-005678.pdf',
    type: 'Certificación GRS',
    certificateNumber: 'GRS-ES-005678',
    certifier: 'Textile Exchange',
    supplierId: 's2',
    supplierName: 'Fiação Moderna Lda.',
    supplierStage: 'Hilatura',
    issueDate: '2024-12-31',
    expiryDate: '2026-12-31',
    status: 'por_vencer',
    daysRemaining: 207,
    associatedProducts: ['VT-CAM-001', 'VT-PNT-003'],
    sizeMB: 1.5,
    versions: [{ version: 'v1.0', uploadedAt: '2024-12-31T09:00:00Z', uploadedBy: 'Juan Pérez', fileName: 'GRS-ES-005678.pdf' }],
    createdAt: '2024-12-31T09:00:00Z',
    updatedAt: '2024-12-31T09:00:00Z',
  },
  {
    id: 'doc-4',
    fileName: 'SMETA-4P-2025-1115.pdf',
    type: 'Auditoría Third-party',
    certificateNumber: 'SMETA-4P-2025-TN-001',
    certifier: 'SGS',
    supplierId: 's4',
    supplierName: 'Confection du Sahel SA',
    supplierStage: 'Confección',
    issueDate: '2025-11-15',
    expiryDate: '2026-11-15',
    status: 'vigente',
    daysRemaining: 161,
    associatedProducts: ['VT-CAM-001'],
    sizeMB: 4.2,
    versions: [{ version: 'v1.0', uploadedAt: '2025-11-15T16:45:00Z', uploadedBy: 'auditor@sgstunisia.tn', fileName: 'SMETA-4P-2025-1115.pdf' }],
    createdAt: '2025-11-15T16:45:00Z',
    updatedAt: '2025-11-15T16:45:00Z',
  },
  {
    id: 'doc-5',
    fileName: 'REACH-DECL-2026-0201.pdf',
    type: 'Declaración REACH',
    supplierId: 'internal',
    supplierName: 'Vela Textile SL',
    supplierStage: 'Interno',
    issueDate: '2026-02-01',
    expiryDate: '2027-02-01',
    status: 'vigente',
    daysRemaining: 240,
    associatedProducts: ['VT-CAM-001'],
    sizeMB: 0.8,
    versions: [{ version: 'v1.0', uploadedAt: '2026-02-01T11:00:00Z', uploadedBy: 'compliance@velatextile.eu', fileName: 'REACH-DECL-2026-0201.pdf' }],
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z',
  },
];

interface DocumentContextType {
  documents: DppDocument[];
  getDocument: (id: string) => DppDocument | undefined;
  addDocument: (doc: Omit<DppDocument, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => DppDocument;
  updateDocument: (id: string, updates: Partial<DppDocument>) => void;
  updateDocumentMetadata: (id: string, metadata: Partial<DppDocument>, reason: string, user?: string) => void;
  addDocumentVersion: (id: string, version: Omit<DocumentVersion, 'version'>) => void;
  deleteDocument: (id: string) => void;
  getDocumentsByStatus: (status: DocumentStatus) => DppDocument[];
  getDocumentsBySupplier: (supplierId: string) => DppDocument[];
  getDocumentsByProduct: (productId: string) => DppDocument[];
  getExpiringDocuments: (days: number) => DppDocument[];
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<DppDocument[]>(initialDocuments);

  const getDocument = (id: string) => documents.find((d) => d.id === id);
  const getDocumentsByStatus = (status: DocumentStatus) => documents.filter((d) => d.status === status);
  const getDocumentsBySupplier = (supplierId: string) => documents.filter((d) => d.supplierId === supplierId);
  const getDocumentsByProduct = (productId: string) => documents.filter((d) => d.associatedProducts.includes(productId));
  const getExpiringDocuments = (days: number) => documents.filter((d) => d.daysRemaining <= days && d.daysRemaining > 0);

  const addDocument = (doc: Omit<DppDocument, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => {
    const newDoc: DppDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [{ version: 'v1.0', uploadedAt: new Date().toISOString(), uploadedBy: 'María García', fileName: doc.fileName }],
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<DppDocument>) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
  };

  const updateDocumentMetadata = (id: string, metadata: Partial<DppDocument>, reason: string, user = 'María García') => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const updated: DppDocument = { ...d, ...metadata, updatedAt: new Date().toISOString() };
        updated.versions = [
          ...updated.versions,
          { version: `v${(parseFloat(updated.versions[updated.versions.length - 1]?.version?.replace('v', '') || '0') + 0.1).toFixed(1)}`, uploadedAt: new Date().toISOString(), uploadedBy: user, fileName: d.fileName, reason },
        ];
        return updated;
      })
    );
  };

  const addDocumentVersion = (id: string, version: Omit<DocumentVersion, 'version'>) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const nextVersion = `v${(parseFloat(d.versions[d.versions.length - 1]?.version?.replace('v', '') || '0') + 0.1).toFixed(1)}`;
        return { ...d, versions: [...d.versions, { ...version, version: nextVersion }], updatedAt: new Date().toISOString() };
      })
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        getDocument,
        addDocument,
        updateDocument,
        updateDocumentMetadata,
        addDocumentVersion,
        deleteDocument,
        getDocumentsByStatus,
        getDocumentsBySupplier,
        getDocumentsByProduct,
        getExpiringDocuments,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocuments must be used within DocumentProvider');
  return context;
}
