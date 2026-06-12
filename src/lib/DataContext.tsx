'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { productData as defaultData } from '@/lib/data';

export type DppStatus = 'borrador' | 'revision' | 'aprobado' | 'publicado' | 'archivado';
export type FieldStatus = 'certified' | 'declared' | 'pending';

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: 'edit' | 'create' | 'import' | 'export' | 'verify' | 'publicar' | 'aprobar' | 'archive' | 'invite';
  field: string;
  oldValue?: string;
  newValue?: string;
  block: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  deadline?: string;
  createdAt: string;
  resolved: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  stage: string;
  location: string;
  country: string;
  status: 'completado' | 'pendiente' | 'no_invitado';
  dataLoaded: string;
  lastUpdate: string;
  email: string;
  certifications: string[];
}

export interface Document {
  id: string;
  type: string;
  filename: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  category: string;
  linkedProducts?: string[];
  notes?: string;
  uploadedAt: string;
}

export interface DocumentRequirement {
  id: string;
  label: string;
  labelEn: string;
  type: string;
  required: boolean;
  category: string;
  linkedDocumentId?: string | null;
  status: 'active' | 'expiring' | 'expired' | 'pending';
  sourceKey?: string;
  tooltipKey?: string;
  expiryDate?: string;
}

export interface DppProduct {
  id: string;
  sku: string;
  name: string;
  status: DppStatus;
  completitud: number;
  riskScore: number;
  errors: number;
  warnings: number;
  createdAt: string;
  updatedAt: string;
  data: typeof defaultData;
  fields: Record<string, EditableField>;
  auditTrail: AuditEntry[];
  alerts: AlertItem[];
  suppliers: Supplier[];
  version: number;
  documentRequirements: DocumentRequirement[];
  documentRegistry: Document[];
}

export interface EditableField {
  value: any;
  status: FieldStatus;
  lastModified: string;
  modifiedBy: string;
}

function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], pre + key));
      } else {
        result[pre + key] = obj[key];
      }
    }
  }
  return result;
}

function initializeFields(data: typeof defaultData): Record<string, EditableField> {
  const flat = flattenObject(data);
  const fields: Record<string, EditableField> = {};
  Object.keys(flat).forEach((key) => {
    fields[key] = {
      value: flat[key],
      status: 'declared',
      lastModified: new Date().toISOString(),
      modifiedBy: 'system',
    };
  });
  return fields;
}

const initialAudit: AuditEntry[] = [
  { id: '1', timestamp: '2026-06-07T10:00:00Z', user: 'system', role: 'DPP Engine', action: 'create', field: 'DPP', block: 'Metadata' },
  { id: '2', timestamp: '2026-06-07T10:05:00Z', user: 'compliance@velatextile.eu', role: 'Sustainability Manager', action: 'verify', field: 'GOTS Certificate', block: 'Traceability' },
  { id: '3', timestamp: '2026-06-07T10:15:00Z', user: 'supplier@anatolian-cotton.com.tr', role: 'Supplier (Tier 1)', action: 'edit', field: 'Ginning facility data', oldValue: '—', newValue: 'Anatolian Cotton Ginning Co., Adana', block: 'Origin' },
  { id: '4', timestamp: '2026-06-07T10:30:00Z', user: 'auditor@controlunion.com', role: 'Third-party Auditor', action: 'verify', field: 'SMETA 4P Audit', block: 'Traceability' },
];

const initialSuppliers: Supplier[] = [
  { id: 's1', name: 'Anatolian Cotton Ginning Co.', stage: 'Ginning', location: 'Adana, Turquía', country: 'TR', status: 'completado', dataLoaded: 'Certificación GOTS, datos de fibra', lastUpdate: 'hace 2 horas', email: 'contact@anatolian-cotton.com.tr', certifications: ['GOTS'] },
  { id: 's2', name: 'Fiação Moderna Lda.', stage: 'Hilatura', location: 'Guimarães, Portugal', country: 'PT', status: 'pendiente', dataLoaded: 'Falta: certificación GOTS, datos de proceso', lastUpdate: 'hace 1 día', email: 'info@fiaçãomoderna.pt', certifications: [] },
  { id: 's3', name: 'Textiles de l\'Atlas SARL', stage: 'Tejeduría', location: 'Casablanca, Marruecos', country: 'MA', status: 'no_invitado', dataLoaded: '—', lastUpdate: '—', email: '', certifications: [] },
  { id: 's4', name: 'Confection du Sahel SA', stage: 'Confección', location: 'Monastir, Túnez', country: 'TN', status: 'completado', dataLoaded: 'Auditoría SMETA 4P, datos de confección', lastUpdate: 'hace 3 horas', email: 'production@confectiondusahel.tn', certifications: ['SMETA'] },
  { id: 's5', name: 'Acabados Textiles del Levante SL', stage: 'Acabado', location: 'Valencia, España', country: 'ES', status: 'completado', dataLoaded: 'Datos de acabado enzimático', lastUpdate: 'hace 5 horas', email: 'admin@acabadoslevante.es', certifications: [] },
];

const initialAlerts: AlertItem[] = [
  { id: 'a1', title: 'Certificación OEKO-TEX vence en 30 días', description: 'Certificado: 26.HTR.12345. Vencimiento: 2026-07-07. Proveedor: Hohenstein.', severity: 'warning', deadline: '2026-07-07', createdAt: '2026-06-07T00:00:00Z', resolved: false },
];

const defaultDocumentRegistry: Document[] = [
  { id: 'doc-gots', type: 'certification', filename: 'gots_2026.pdf', issuer: 'Control Union', issueDate: '2026-01-15', expiryDate: '2027-01-31', category: 'chain', notes: 'Organic textile standard certification', uploadedAt: '2026-01-15T10:00:00Z' },
  { id: 'doc-grs', type: 'certification', filename: 'grs_2026.pdf', issuer: 'Textile Exchange', issueDate: '2025-12-01', expiryDate: '2026-07-15', category: 'chain', notes: 'Global Recycled Standard', uploadedAt: '2025-12-01T10:00:00Z' },
  { id: 'doc-smeta', type: 'audit', filename: 'smeta_2025.pdf', issuer: 'SGS', issueDate: '2025-11-15', expiryDate: '2026-11-15', category: 'chain', notes: 'SMETA 4P ethical audit', uploadedAt: '2025-11-15T10:00:00Z' },
  { id: 'doc-trace', type: 'evidence', filename: 'traceability_batch_001.pdf', issuer: 'Vela Textile', issueDate: '2026-04-02', category: 'chain', notes: 'Chain of custody evidence', uploadedAt: '2026-04-02T10:00:00Z' },
  { id: 'doc-oekotex', type: 'certification', filename: 'oekotex_2026.pdf', issuer: 'Hohenstein', issueDate: '2026-03-01', expiryDate: '2027-03-31', category: 'chemicals', notes: 'OEKO-TEX Standard 100', uploadedAt: '2026-03-01T10:00:00Z' },
  { id: 'doc-svhc', type: 'regulatoryStatement', filename: 'svhc_declaration.pdf', issuer: 'Vela Textile', issueDate: '2026-02-01', expiryDate: '2026-02-01', category: 'chemicals', notes: 'SVHC declaration', uploadedAt: '2026-02-01T10:00:00Z' },
  { id: 'doc-reach', type: 'regulatoryStatement', filename: 'reach_declaration.pdf', issuer: 'Vela Textile', issueDate: '2026-02-01', expiryDate: '2026-02-01', category: 'chemicals', notes: 'REACH declaration', uploadedAt: '2026-02-01T10:00:00Z' },
  { id: 'doc-comp', type: 'supplierDeclaration', filename: 'composition_declaration.pdf', issuer: 'Supplier', issueDate: '2026-03-01', category: 'materials', notes: 'Composition declaration', uploadedAt: '2026-03-01T10:00:00Z' },
  { id: 'doc-dye', type: 'chemicalSheet', filename: 'dyeing_sheet.pdf', issuer: 'Supplier', issueDate: '2026-02-01', category: 'materials', notes: 'Dyeing technical sheet', uploadedAt: '2026-02-01T10:00:00Z' },
  { id: 'doc-soft', type: 'chemicalSheet', filename: 'softener_sheet.pdf', issuer: 'Supplier', issueDate: '2026-02-01', category: 'materials', notes: 'Softener technical sheet', uploadedAt: '2026-02-01T10:00:00Z' },
  { id: 'doc-pef', type: 'methodology', filename: 'pef_methodology.pdf', issuer: 'EU Commission', issueDate: '2026-01-05', category: 'impact', notes: 'PEF methodology', uploadedAt: '2026-01-05T10:00:00Z' },
  { id: 'doc-quantis', type: 'labReport', filename: 'quantis_verification.pdf', issuer: 'Quantis', issueDate: '2026-02-20', category: 'impact', notes: 'Quantis verification', uploadedAt: '2026-02-20T10:00:00Z' },
  { id: 'doc-lca', type: 'labReport', filename: 'lca_report.pdf', issuer: 'Quantis', issueDate: '2026-02-20', category: 'impact', notes: 'LCA report', uploadedAt: '2026-02-20T10:00:00Z' },
  { id: 'doc-wash', type: 'labReport', filename: 'wash_test.pdf', issuer: 'AITEX', issueDate: '2025-10-10', category: 'durability', notes: 'Wash test', uploadedAt: '2025-10-10T10:00:00Z' },
  { id: 'doc-color', type: 'labReport', filename: 'color_fastness_test.pdf', issuer: 'AITEX', issueDate: '2025-10-10', category: 'durability', notes: 'Color fastness test', uploadedAt: '2025-10-10T10:00:00Z' },
  { id: 'doc-pill', type: 'labReport', filename: 'pilling_test.pdf', issuer: 'AITEX', issueDate: '2025-10-10', category: 'durability', notes: 'Pilling test', uploadedAt: '2025-10-10T10:00:00Z' },
  { id: 'doc-care', type: 'policy', filename: 'care_instructions.pdf', issuer: 'Vela Textile', issueDate: '2026-01-01', category: 'durability', notes: 'Care instructions', uploadedAt: '2026-01-01T10:00:00Z' },
  { id: 'doc-take', type: 'policy', filename: 'takeback_policy.pdf', issuer: 'Vela Textile', issueDate: '2025-09-01', category: 'endOfLife', notes: 'Take-back policy', uploadedAt: '2025-09-01T10:00:00Z' },
  { id: 'doc-recyc', type: 'labReport', filename: 'recyclability_assessment.pdf', issuer: 'AITEX', issueDate: '2026-02-15', category: 'endOfLife', notes: 'Recyclability assessment', uploadedAt: '2026-02-15T10:00:00Z' },
  { id: 'doc-coll', type: 'dataset', filename: 'collection_points.pdf', issuer: 'Vela Textile', issueDate: '2026-03-01', category: 'endOfLife', notes: 'Collection points directory', uploadedAt: '2026-03-01T10:00:00Z' },
  { id: 'doc-esrs', type: 'dataset', filename: 'esrs_mapping.pdf', issuer: 'Vela Textile', issueDate: '2026-01-20', category: 'regulatory', notes: 'ESRS mapping', uploadedAt: '2026-01-20T10:00:00Z' },
  { id: 'doc-espr', type: 'audit', filename: 'espr_checklist.pdf', issuer: 'Vela Textile', issueDate: '2026-03-10', category: 'regulatory', notes: 'ESPR checklist', uploadedAt: '2026-03-10T10:00:00Z' },
  { id: 'doc-sust', type: 'dataset', filename: 'sustainability_data.pdf', issuer: 'Vela Textile', issueDate: '2026-01-20', category: 'regulatory', notes: 'Sustainability data', uploadedAt: '2026-01-20T10:00:00Z' },
  { id: 'doc-op', type: 'regulatoryStatement', filename: 'operator_registration.pdf', issuer: 'Vela Textile', issueDate: '2026-01-15', category: 'product', notes: 'Operator registration', uploadedAt: '2026-01-15T10:00:00Z' },
  { id: 'doc-pub', type: 'evidence', filename: 'dpp_publication.pdf', issuer: 'Vela Textile', issueDate: '2026-04-02', category: 'product', notes: 'DPP publication evidence', uploadedAt: '2026-04-02T10:00:00Z' },
  { id: 'doc-gs1', type: 'evidence', filename: 'gs1_digital_link.pdf', issuer: 'GS1', issueDate: '2026-01-01', category: 'product', notes: 'GS1 Digital Link', uploadedAt: '2026-01-01T10:00:00Z' },
];

const defaultDocumentRequirements: DocumentRequirement[] = [
  { id: 'req-gots', label: 'GOTS', labelEn: 'GOTS', type: 'certification', required: true, category: 'chain', linkedDocumentId: 'doc-gots', status: 'active', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.gots', expiryDate: '2027-01-31' },
  { id: 'req-grs', label: 'GRS', labelEn: 'GRS', type: 'certification', required: true, category: 'chain', linkedDocumentId: 'doc-grs', status: 'expiring', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.grs', expiryDate: '2026-07-15' },
  { id: 'req-smeta', label: 'Auditoría SMETA 4P', labelEn: 'SMETA 4P audit', type: 'audit', required: true, category: 'chain', linkedDocumentId: 'doc-smeta', status: 'active', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.smeta', expiryDate: '2026-07-15' },
  { id: 'req-trace', label: 'Evidencia de trazabilidad', labelEn: 'Traceability evidence', type: 'evidence', required: true, category: 'chain', linkedDocumentId: 'doc-trace', status: 'active', sourceKey: 'drawer.sourceInternal', tooltipKey: 'documentHub.tooltips.traceabilityEvidence' },
  { id: 'req-oekotex', label: 'OEKO-TEX Standard 100', labelEn: 'OEKO-TEX Standard 100', type: 'certification', required: true, category: 'chemicals', linkedDocumentId: 'doc-oekotex', status: 'active', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.oekotex', expiryDate: '2027-03-31' },
  { id: 'req-svhc', label: 'Declaración SVHC', labelEn: 'SVHC declaration', type: 'regulatoryStatement', required: true, category: 'chemicals', linkedDocumentId: 'doc-svhc', status: 'active', sourceKey: 'drawer.sourceRegulatory', tooltipKey: 'documentHub.tooltips.svhcDeclaration' },
  { id: 'req-reach', label: 'Declaración REACH', labelEn: 'REACH declaration', type: 'regulatoryStatement', required: true, category: 'chemicals', linkedDocumentId: 'doc-reach', status: 'active', sourceKey: 'drawer.sourceRegulatory', tooltipKey: 'documentHub.tooltips.reachDeclaration' },
  { id: 'req-comp', label: 'Declaración composición', labelEn: 'Composition declaration', type: 'supplierDeclaration', required: true, category: 'materials', linkedDocumentId: 'doc-comp', status: 'active', sourceKey: 'drawer.sourceSupplier', tooltipKey: 'documentHub.tooltips.compositionDeclaration' },
  { id: 'req-dye', label: 'Ficha técnica de tintura', labelEn: 'Dyeing technical sheet', type: 'chemicalSheet', required: true, category: 'materials', linkedDocumentId: 'doc-dye', status: 'active', sourceKey: 'drawer.sourceSupplier', tooltipKey: 'documentHub.tooltips.dyeingSheet' },
  { id: 'req-soft', label: 'Ficha técnica de suavizante', labelEn: 'Softener technical sheet', type: 'chemicalSheet', required: true, category: 'materials', linkedDocumentId: 'doc-soft', status: 'active', sourceKey: 'drawer.sourceSupplier', tooltipKey: 'documentHub.tooltips.softenerSheet' },
  { id: 'req-enz', label: 'Acabado enzimático', labelEn: 'Enzymatic finish', type: 'chemicalSheet', required: true, category: 'materials', linkedDocumentId: null, status: 'pending', sourceKey: 'drawer.sourceSupplier', tooltipKey: 'documentHub.tooltips.enzymaticFinish' },
  { id: 'req-pef', label: 'Metodología PEF', labelEn: 'PEF methodology', type: 'methodology', required: true, category: 'impact', linkedDocumentId: 'doc-pef', status: 'active', sourceKey: 'drawer.sourceRegulatory', tooltipKey: 'documentHub.tooltips.pefMethodology' },
  { id: 'req-quantis', label: 'Verificación Quantis', labelEn: 'Quantis verification', type: 'labReport', required: true, category: 'impact', linkedDocumentId: 'doc-quantis', status: 'active', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.quantisVerification' },
  { id: 'req-lca', label: 'Reporte LCA', labelEn: 'LCA report', type: 'labReport', required: true, category: 'impact', linkedDocumentId: 'doc-lca', status: 'active', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.lcaReport' },
  { id: 'req-wash', label: 'Test de lavado', labelEn: 'Wash test', type: 'labReport', required: true, category: 'durability', linkedDocumentId: 'doc-wash', status: 'active', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.washTest' },
  { id: 'req-color', label: 'Test de solidez del color', labelEn: 'Color fastness test', type: 'labReport', required: true, category: 'durability', linkedDocumentId: 'doc-color', status: 'active', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.colorFastnessTest' },
  { id: 'req-pill', label: 'Test de pilling', labelEn: 'Pilling test', type: 'labReport', required: true, category: 'durability', linkedDocumentId: 'doc-pill', status: 'active', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.pillingTest' },
  { id: 'req-care', label: 'Instrucciones de cuidado', labelEn: 'Care instructions', type: 'policy', required: true, category: 'durability', linkedDocumentId: 'doc-care', status: 'active', sourceKey: 'drawer.sourceInternal', tooltipKey: 'documentHub.tooltips.careInstructions' },
  { id: 'req-take', label: 'Política take-back', labelEn: 'Take-back policy', type: 'policy', required: true, category: 'endOfLife', linkedDocumentId: 'doc-take', status: 'active', sourceKey: 'drawer.sourceInternal', tooltipKey: 'documentHub.tooltips.takebackPolicy' },
  { id: 'req-recyc', label: 'Evaluación de reciclabilidad', labelEn: 'Recyclability assessment', type: 'labReport', required: true, category: 'endOfLife', linkedDocumentId: 'doc-recyc', status: 'active', sourceKey: 'drawer.sourceThirdParty', tooltipKey: 'documentHub.tooltips.recyclabilityAssessment' },
  { id: 'req-coll', label: 'Directorio de puntos de recogida', labelEn: 'Collection points directory', type: 'dataset', required: true, category: 'endOfLife', linkedDocumentId: 'doc-coll', status: 'active', sourceKey: 'drawer.sourceInternal', tooltipKey: 'documentHub.tooltips.collectionPointsDirectory' },
  { id: 'req-esrs', label: 'Mapeo ESRS', labelEn: 'ESRS mapping', type: 'dataset', required: true, category: 'regulatory', linkedDocumentId: 'doc-esrs', status: 'active', sourceKey: 'drawer.sourceInternal', tooltipKey: 'documentHub.tooltips.esrsMapping' },
  { id: 'req-espr', label: 'Checklist ESPR', labelEn: 'ESPR checklist', type: 'audit', required: true, category: 'regulatory', linkedDocumentId: 'doc-espr', status: 'active', sourceKey: 'drawer.sourceRegulatory', tooltipKey: 'documentHub.tooltips.esprChecklist' },
  { id: 'req-sust', label: 'Datos de sostenibilidad', labelEn: 'Sustainability data', type: 'dataset', required: true, category: 'regulatory', linkedDocumentId: 'doc-sust', status: 'active', sourceKey: 'drawer.sourceInternal', tooltipKey: 'documentHub.tooltips.sustainabilityData' },
  { id: 'req-op', label: 'Registro operador', labelEn: 'Operator registration', type: 'regulatoryStatement', required: true, category: 'product', linkedDocumentId: 'doc-op', status: 'active', sourceKey: 'drawer.sourceInternal', tooltipKey: 'documentHub.tooltips.operatorRegistration' },
  { id: 'req-pub', label: 'Evidencia de publicación DPP', labelEn: 'DPP publication evidence', type: 'evidence', required: true, category: 'product', linkedDocumentId: 'doc-pub', status: 'active', sourceKey: 'drawer.sourceInternal', tooltipKey: 'documentHub.tooltips.dppPublication' },
  { id: 'req-gs1', label: 'GS1 Digital Link / QR', labelEn: 'GS1 Digital Link / QR', type: 'evidence', required: true, category: 'product', linkedDocumentId: 'doc-gs1', status: 'active', sourceKey: 'drawer.sourceRegulatory', tooltipKey: 'documentHub.tooltips.gs1DigitalLink' },
];

const defaultProduct: DppProduct = {
  id: 'vt-cam-001',
  sku: 'VT-CAM-001',
  name: 'Camiseta Unisex Algodón Orgánico',
  status: 'publicado',
  completitud: 100,
  riskScore: 92,
  errors: 0,
  warnings: 1,
  createdAt: '2026-06-04T11:30:00Z',
  updatedAt: '2026-06-07T14:32:00Z',
  data: defaultData,
  fields: initializeFields(defaultData),
  auditTrail: initialAudit,
  alerts: initialAlerts,
  suppliers: initialSuppliers,
  version: 4,
  documentRequirements: defaultDocumentRequirements,
  documentRegistry: defaultDocumentRegistry,
};

interface AppState {
  products: DppProduct[];
  activeProductId: string | null;
}

const defaultAppState: AppState = {
  products: [
    defaultProduct,
    { ...defaultProduct, id: 'vt-jkt-002', sku: 'VT-JKT-002', name: 'Chaqueta Impermeable Reciclada', status: 'revision', completitud: 78, riskScore: 65, errors: 2, warnings: 5, createdAt: '2026-06-05T09:00:00Z', updatedAt: '2026-06-06T16:00:00Z', version: 2, documentRequirements: defaultDocumentRequirements.map((r) => ({ ...r })), documentRegistry: [] },
    { ...defaultProduct, id: 'vt-pnt-003', sku: 'VT-PNT-003', name: 'Pantalón Denim Orgánico', status: 'borrador', completitud: 45, riskScore: 30, errors: 18, warnings: 8, createdAt: '2026-06-07T08:00:00Z', updatedAt: '2026-06-07T08:00:00Z', version: 1, documentRequirements: defaultDocumentRequirements.map((r) => ({ ...r })), documentRegistry: [] },
  ],
  activeProductId: 'vt-cam-001',
};

interface DataContextType {
  state: AppState;
  activeProduct: DppProduct;
  setActiveProduct: (id: string) => void;
  updateField: (productId: string, path: string, value: any, user?: string, role?: string) => void;
  updateFieldStatus: (productId: string, path: string, status: FieldStatus, user?: string, role?: string) => void;
  updateProductStatus: (productId: string, newStatus: DppStatus, user?: string, role?: string) => void;
  addAuditEntry: (productId: string, entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  addAlert: (productId: string, alert: Omit<AlertItem, 'id' | 'createdAt'>) => void;
  resolveAlert: (productId: string, alertId: string) => void;
  updateSupplier: (productId: string, supplierId: string, updates: Partial<Supplier>) => void;
  addSupplier: (productId: string, supplier: Omit<Supplier, 'id'>) => void;
  exportProduct: (productId: string) => string;
  importProduct: (json: string, user?: string, role?: string) => void;
  createProduct: (sku: string, name: string, user?: string) => void;
  resetAll: () => void;
  getReadinessScore: (productId: string) => { score: number; total: number; details: Record<string, { filled: number; total: number }> };
  getCertifiedCount: (productId: string) => number;
  getDeclaredCount: (productId: string) => number;
  getPendingCount: (productId: string) => number;
  // Document management
  getDocumentStatus: (productId: string, reqId: string) => DocumentRequirement['status'];
  getEffectiveStatus: (req: DocumentRequirement) => 'active' | 'expiring' | 'expired' | 'pending';
  addDocument: (productId: string, doc: Omit<Document, 'id' | 'uploadedAt'>, reqId: string) => void;
  replaceDocument: (productId: string, docId: string, newDoc: Omit<Document, 'id' | 'uploadedAt'>, reqId: string) => void;
  deleteDocument: (productId: string, docId: string, reqId: string) => void;
  getDocumentStats: (productId: string) => { total: number; active: number; expiring: number; expired: number; pending: number };
  getPendingDocumentTasks: (productId: string) => DocumentRequirement[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultAppState);

  const activeProduct = state.products.find((p) => p.id === state.activeProductId) || state.products[0];

  const setActiveProduct = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeProductId: id }));
  }, []);

  const updateField = useCallback((productId: string, path: string, value: any, user = 'admin', role = 'Admin') => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        const oldField = p.fields[path];
        const newAudit: AuditEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          user,
          role,
          action: 'edit',
          field: path,
          oldValue: oldField ? String(oldField.value) : undefined,
          newValue: String(value),
          block: path.split('.')[0],
        };
        return {
          ...p,
          fields: { ...p.fields, [path]: { value, status: oldField?.status || 'declared', lastModified: new Date().toISOString(), modifiedBy: user } },
          auditTrail: [newAudit, ...p.auditTrail],
          version: p.version + 1,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const updateFieldStatus = useCallback((productId: string, path: string, status: FieldStatus, user = 'admin', role = 'Admin') => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        const oldField = p.fields[path];
        return {
          ...p,
          fields: {
            ...p.fields,
            [path]: { ...(oldField || { value: '', lastModified: new Date().toISOString(), modifiedBy: user }), status, lastModified: new Date().toISOString(), modifiedBy: user },
          },
          auditTrail: [{
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            user,
            role,
            action: status === 'certified' ? 'verify' : 'edit',
            field: path,
            oldValue: oldField?.status,
            newValue: status,
            block: path.split('.')[0],
          }, ...p.auditTrail],
          version: p.version + 1,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const updateProductStatus = useCallback((productId: string, newStatus: DppStatus, user = 'admin', role = 'Admin') => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        const actionMap: Record<DppStatus, AuditEntry['action']> = {
          borrador: 'create',
          revision: 'edit',
          aprobado: 'aprobar',
          publicado: 'publicar',
          archivado: 'archive',
        };
        return {
          ...p,
          status: newStatus,
          auditTrail: [{
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            user,
            role,
            action: actionMap[newStatus],
            field: 'Status',
            oldValue: p.status,
            newValue: newStatus,
            block: 'Metadata',
          }, ...p.auditTrail],
          version: p.version + 1,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const addAuditEntry = useCallback((productId: string, entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? { ...p, auditTrail: [{ ...entry, id: Date.now().toString(), timestamp: new Date().toISOString() }, ...p.auditTrail], version: p.version + 1, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  const addAlert = useCallback((productId: string, alert: Omit<AlertItem, 'id' | 'createdAt'>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? { ...p, alerts: [{ ...alert, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...p.alerts], updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  const resolveAlert = useCallback((productId: string, alertId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? { ...p, alerts: p.alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)), updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  const updateSupplier = useCallback((productId: string, supplierId: string, updates: Partial<Supplier>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? { ...p, suppliers: p.suppliers.map((s) => (s.id === supplierId ? { ...s, ...updates } : s)), updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  const addSupplier = useCallback((productId: string, supplier: Omit<Supplier, 'id'>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? { ...p, suppliers: [...p.suppliers, { ...supplier, id: `s${Date.now()}` }], updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  const exportProduct = useCallback((productId: string) => {
    const product = state.products.find((p) => p.id === productId);
    return JSON.stringify(product, null, 2);
  }, [state.products]);

  const importProduct = useCallback((json: string, user = 'admin', role = 'Admin') => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.id && parsed.data) {
        setState((prev) => ({
          ...prev,
          products: [...prev.products, { ...parsed, version: (parsed.version || 0) + 1, updatedAt: new Date().toISOString() }],
        }));
      }
    } catch { alert('Invalid JSON format'); }
  }, []);

  const createProduct = useCallback((sku: string, name: string, user = 'admin') => {
    const newProduct: DppProduct = {
      ...defaultProduct,
      id: sku.toLowerCase(),
      sku,
      name,
      status: 'borrador',
      completitud: 0,
      riskScore: 0,
      errors: 0,
      warnings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      auditTrail: [{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        user,
        role: 'Sustainability Manager',
        action: 'create',
        field: 'DPP',
        block: 'Metadata',
      }],
      documentRequirements: defaultDocumentRequirements.map((r) => ({ ...r, linkedDocumentId: null, status: 'pending' as const })),
      documentRegistry: [],
    };
    setState((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
      activeProductId: newProduct.id,
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultAppState);
  }, []);

  const getReadinessScore = useCallback((productId: string) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { score: 0, total: 0, details: {} };
    const blocks = ['product', 'origin', 'composition', 'traceability', 'durability', 'environmental_impact', 'end_of_life', 'compliance', 'metadata'];
    const details: Record<string, { filled: number; total: number }> = {};
    let totalFilled = 0;
    let totalFields = 0;
    blocks.forEach((block) => {
      const blockFields = Object.keys(product.fields).filter((k) => k.startsWith(block));
      const filled = blockFields.filter((k) => {
        const v = product.fields[k]?.value;
        return v !== undefined && v !== null && v !== '' && v !== '—';
      }).length;
      details[block] = { filled, total: blockFields.length };
      totalFilled += filled;
      totalFields += blockFields.length;
    });
    return { score: totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0, total: totalFields, details };
  }, [state.products]);

  const getCertifiedCount = useCallback((productId: string) => {
    const product = state.products.find((p) => p.id === productId);
    return product ? Object.values(product.fields).filter((f) => f.status === 'certified').length : 0;
  }, [state.products]);

  const getDeclaredCount = useCallback((productId: string) => {
    const product = state.products.find((p) => p.id === productId);
    return product ? Object.values(product.fields).filter((f) => f.status === 'declared').length : 0;
  }, [state.products]);

  const getPendingCount = useCallback((productId: string) => {
    const product = state.products.find((p) => p.id === productId);
    return product ? Object.values(product.fields).filter((f) => f.status === 'pending').length : 0;
  }, [state.products]);

  // Document CRUD
  const getEffectiveStatus = useCallback((req: DocumentRequirement): 'active' | 'expiring' | 'expired' | 'pending' => {
    if (!req.linkedDocumentId) return 'pending';
    if (req.expiryDate) {
      const now = new Date();
      const expiry = new Date(req.expiryDate);
      if (expiry < now) return 'expired';
      const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry <= 90) return 'expiring';
    }
    return 'active';
  }, []);

  const getDocumentStatus = useCallback((productId: string, reqId: string) => {
    const product = state.products.find((p) => p.id === productId);
    const req = product?.documentRequirements.find((r) => r.id === reqId);
    if (!req) return 'pending';
    return getEffectiveStatus(req);
  }, [state.products, getEffectiveStatus]);

  const addDocument = useCallback((productId: string, doc: Omit<Document, 'id' | 'uploadedAt'>, reqId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        const newDoc: Document = { ...doc, id: `doc-${Date.now()}`, uploadedAt: new Date().toISOString() };
        const updatedReqs = p.documentRequirements.map((r) => {
          if (r.id === reqId) {
            return { ...r, linkedDocumentId: newDoc.id, status: 'active' as const };
          }
          return r;
        });
        return {
          ...p,
          documentRegistry: [...p.documentRegistry, newDoc],
          documentRequirements: updatedReqs,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const replaceDocument = useCallback((productId: string, docId: string, newDoc: Omit<Document, 'id' | 'uploadedAt'>, reqId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        const replacement: Document = { ...newDoc, id: `doc-${Date.now()}`, uploadedAt: new Date().toISOString() };
        const updatedRegistry = p.documentRegistry.filter((d) => d.id !== docId);
        const updatedReqs = p.documentRequirements.map((r) => {
          if (r.id === reqId) {
            return { ...r, linkedDocumentId: replacement.id, status: 'active' as const };
          }
          return r;
        });
        return {
          ...p,
          documentRegistry: [...updatedRegistry, replacement],
          documentRequirements: updatedReqs,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const deleteDocument = useCallback((productId: string, docId: string, reqId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        const updatedRegistry = p.documentRegistry.filter((d) => d.id !== docId);
        const updatedReqs = p.documentRequirements.map((r) => {
          if (r.id === reqId) {
            return { ...r, linkedDocumentId: null, status: 'pending' as const };
          }
          return r;
        });
        return {
          ...p,
          documentRegistry: updatedRegistry,
          documentRequirements: updatedReqs,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const getDocumentStats = useCallback((productId: string) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { total: 0, active: 0, expiring: 0, expired: 0, pending: 0 };
    const reqs = product.documentRequirements;
    const statuses = reqs.map((r) => getEffectiveStatus(r));
    return {
      total: reqs.length,
      active: statuses.filter((s) => s === 'active').length,
      expiring: statuses.filter((s) => s === 'expiring').length,
      expired: statuses.filter((s) => s === 'expired').length,
      pending: statuses.filter((s) => s === 'pending').length,
    };
  }, [state.products, getEffectiveStatus]);

  const getPendingDocumentTasks = useCallback((productId: string) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return [];
    return product.documentRequirements
      .map((r) => ({ ...r, status: getEffectiveStatus(r) }))
      .filter((r) => r.status === 'pending' || r.status === 'expiring' || r.status === 'expired');
  }, [state.products, getEffectiveStatus]);

  return (
    <DataContext.Provider
      value={{
        state,
        activeProduct,
        setActiveProduct,
        updateField,
        updateFieldStatus,
        updateProductStatus,
        addAuditEntry,
        addAlert,
        resolveAlert,
        updateSupplier,
        addSupplier,
        exportProduct,
        importProduct,
        createProduct,
        resetAll,
        getReadinessScore,
        getCertifiedCount,
        getDeclaredCount,
        getPendingCount,
        getDocumentStatus,
        getEffectiveStatus,
        addDocument,
        replaceDocument,
        deleteDocument,
        getDocumentStats,
        getPendingDocumentTasks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
