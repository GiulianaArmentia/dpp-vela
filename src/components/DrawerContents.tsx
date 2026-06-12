'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { useDrawer } from '@/lib/DrawerContext';
import { useWizard } from '@/lib/useWizard';
import {
  DrawerHeader, DrawerSection, DrawerField, DrawerStatusBadge,
  DrawerSourceDocs, DrawerActionBar, DrawerInfoBanner,
  type SourceDoc,
} from './DrawerComponents';
import { Tooltip, LabelWithTooltip } from '@/components/Tooltip';
import { UploadDocumentWizard } from '@/components/UploadDocumentWizard';
import type { WizardMode, WizardContext } from '@/components/UploadDocumentWizard';
import {
  FaFileAlt, FaDatabase, FaLink, FaFileAlt as FaDoc, FaTrash, FaSync, FaPlus, FaClock,
} from 'react-icons/fa';

/* ═══════════════════════════════════════════
   UTILS
═══════════════════════════════════════════ */
function useEditableFields(initial: Record<string, string>) {
  const [values, setValues] = useState(initial);
  const update = (key: string, val: string) => setValues((p) => ({ ...p, [key]: val }));
  return { values, update };
}

function openDocumentHub() {
  console.log('Abrir Central de documentación');
}

function translateSource(source: string, isEs: boolean) {
  const mapEs: Record<string, string> = {
    'Third-party': 'Entidad externa',
    'Interno': 'Interno',
    'Proveedor': 'Proveedor',
    'Regulatorio': 'Regulatorio',
  };
  const mapEn: Record<string, string> = {
    'Third-party': 'External entity',
    'Interno': 'Internal',
    'Proveedor': 'Supplier',
    'Regulatorio': 'Regulatory',
  };
  return isEs ? (mapEs[source] || source) : (mapEn[source] || source);
}

/* ═══════════════════════════════════════════
   PRODUCTO DRAWER
═══════════════════════════════════════════ */
export function ProductoDrawer() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const { closeDrawer } = useDrawer();
  const isEs = i18n.language === 'es';
  const p = activeProduct.data.product;
  const m = activeProduct.data.metadata;
  const wizard = useWizard();

  const [sourceDocs, setSourceDocs] = useState<SourceDoc[]>([
    { id: 'sd1', name: 'Registro operador económico.pdf', type: 'Legal', status: 'active', origin: 'file', fileName: 'registro_operador.pdf', uploadDate: '2026-01-15', linkedSections: ['producto'], source: 'Interno' },
    { id: 'sd2', name: 'Evidencia de publicación', type: 'Evidencia', status: 'active', origin: 'link', url: 'https://dpp.velatextile.eu/vt-cam-001', uploadDate: '2026-04-02', linkedSections: ['producto'], source: 'Interno' },
    { id: 'sd3', name: 'Certificado fabricante.pdf', type: 'Legal', status: 'active', origin: 'file', fileName: 'cert_fab_2026.pdf', uploadDate: '2026-02-14', linkedSections: ['producto'], source: 'Proveedor' },
    { id: 'sd4', name: 'Ficha técnica', type: 'Técnica', status: 'missing', origin: 'file', fileName: '', uploadDate: '', linkedSections: ['producto'], source: 'Proveedor' },
  ]);

  const handleDeleteDoc = (docId: string) => {
    if (window.confirm(isEs ? '¿Eliminar documento de forma permanente? Se eliminará de todas las secciones vinculadas.' : 'Permanently delete document? It will be removed from all linked sections.')) {
      setSourceDocs((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  const ident = useEditableFields({
    uid: p.uid, batch_uid: p.batch_uid, gtin: p.gtin, sku: activeProduct.sku,
    name: isEs ? p.name : p.name_en, brand: p.brand,
    category: isEs ? p.category : p.category_en, color: isEs ? p.color : p.color_en,
    size: p.size_range, season: p.season,
  });
  const meta = useEditableFields({
    issue_date: m.issue_date, last_update: m.last_update, version: m.version,
    format: m.data_format, languages: m.languages.join(', '),
    status: activeProduct.status, accessibility: m.accessibility,
  });
  const op = useEditableFields({
    name: m.operator.name, vat: m.operator.vat,
    address: isEs ? m.operator.address : m.operator.address_en,
    email: m.operator.email, phone: m.operator.phone,
  });

  return (
    <>
      <DrawerHeader
        title={isEs ? 'Editar datos del producto' : 'Edit product data'}
        subtitle={isEs ? 'Documentación fuente y datos extraídos para revisar antes de publicar.' : 'Source documentation and extracted data to review before publishing.'}
        onClose={closeDrawer}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* 1. Documentación fuente */}
        <DrawerSection title={isEs ? 'Documentación fuente' : 'Source documentation'} icon={<FaFileAlt size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Estos documentos alimentan la extracción de datos de esta sección.' : 'These documents feed the data extraction for this section.'} />
          <DrawerSourceDocs
            docs={sourceDocs}
            translateSource={(src) => translateSource(src, isEs)}
            onOpenDoc={(id) => console.log('Abrir doc', id)}
            onReplace={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('replace', { taskName: doc?.name });
            }}
            onDelete={handleDeleteDoc}
            onRequest={(id) => console.log('Solicitar', id)}
            onUploadFile={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('uploadForTask', { taskName: doc?.name });
            }}
          />
        </DrawerSection>

        <DrawerSection title={isEs ? 'Extracción de datos' : 'Content extraction'} icon={<FaDatabase size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Información extraída automáticamente desde la documentación fuente. Revisá y editá los campos antes de guardar.' : 'Information automatically extracted from source documentation. Review and edit fields before saving.'} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DrawerField label={isEs ? 'UID producto' : 'Product UID'} value={ident.values.uid} onChange={(v) => ident.update('uid', v)} provenance={{ source: 'Evidencia publicación', status: 'confirmado' }} />
            <DrawerField label={isEs ? 'UID lote' : 'Batch UID'} value={ident.values.batch_uid} onChange={(v) => ident.update('batch_uid', v)} />
            <DrawerField label="GTIN" value={ident.values.gtin} onChange={(v) => ident.update('gtin', v)} provenance={{ source: 'Registro operador', status: 'confirmado' }} />
            <DrawerField label={isEs ? 'SKU interno' : 'Internal SKU'} value={ident.values.sku} onChange={(v) => ident.update('sku', v)} />
            <DrawerField label={isEs ? 'Nombre' : 'Name'} value={ident.values.name} onChange={(v) => ident.update('name', v)} provenance={{ source: 'Evidencia publicación', status: 'pendienteRevision' }} />
            <DrawerField label={isEs ? 'Marca' : 'Brand'} value={ident.values.brand} onChange={(v) => ident.update('brand', v)} />
            <DrawerField label={isEs ? 'Categoría' : 'Category'} value={ident.values.category} onChange={(v) => ident.update('category', v)} />
            <DrawerField label={isEs ? 'Color' : 'Color'} value={ident.values.color} onChange={(v) => ident.update('color', v)} />
            <DrawerField label={isEs ? 'Talle' : 'Size'} value={ident.values.size} onChange={(v) => ident.update('size', v)} />
            <DrawerField label={isEs ? 'Temporada' : 'Season'} value={ident.values.season} onChange={(v) => ident.update('season', v)} />
            <DrawerField label={isEs ? 'Fecha emisión' : 'Issue date'} value={meta.values.issue_date} type="date" onChange={(v) => meta.update('issue_date', v)} provenance={{ source: 'Evidencia publicación', status: 'pendienteRevision' }} />
            <DrawerField label={isEs ? 'Última actualización' : 'Last update'} value={meta.values.last_update} type="date" onChange={(v) => meta.update('last_update', v)} />
            <DrawerField label={isEs ? 'Versión' : 'Version'} value={meta.values.version} onChange={(v) => meta.update('version', v)} />
            <DrawerField label={isEs ? 'Formato' : 'Format'} value={meta.values.format} onChange={(v) => meta.update('format', v)} />
            <DrawerField label={isEs ? 'Idiomas' : 'Languages'} value={meta.values.languages} onChange={(v) => meta.update('languages', v)} />
            <DrawerField label={isEs ? 'Estado publicación' : 'Publication status'} value={meta.values.status} type="select" onChange={(v) => meta.update('status', v)} />
            <DrawerField label={isEs ? 'Accesibilidad' : 'Accessibility'} value={meta.values.accessibility} onChange={(v) => meta.update('accessibility', v)} />
            <DrawerField label={isEs ? 'Operador económico' : 'Economic operator'} value={op.values.name} onChange={(v) => op.update('name', v)} provenance={{ source: 'Registro operador', status: 'confirmado' }} />
            <DrawerField label="VAT" value={op.values.vat} onChange={(v) => op.update('vat', v)} />
            <DrawerField label={isEs ? 'Dirección' : 'Address'} value={op.values.address} onChange={(v) => op.update('address', v)} className="md:col-span-2" />
            <DrawerField label="Email" value={op.values.email} onChange={(v) => op.update('email', v)} />
            <DrawerField label={isEs ? 'Teléfono' : 'Phone'} value={op.values.phone} onChange={(v) => op.update('phone', v)} />
            <DrawerField label="URL pública" value={m.public_url} isLink className="md:col-span-2" />
          </div>
        </DrawerSection>

        <DrawerActionBar
          primaryLabel={isEs ? 'Guardar cambios' : 'Save changes'}
          onPrimary={() => { console.log('Guardar producto'); closeDrawer(); }}
          linkLabel={t('drawer.openDocumentHub')}
          onLink={openDocumentHub}
        />
      </div>

      <UploadDocumentWizard
        isOpen={wizard.isOpen}
        onClose={wizard.close}
        onSave={(doc) => console.log('Document saved:', doc)}
        mode={wizard.mode}
        context={wizard.context}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   CADENA DRAWER
═══════════════════════════════════════════ */
export function CadenaDrawer() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const { closeDrawer } = useDrawer();
  const isEs = i18n.language === 'es';
  const wizard = useWizard();
  const origin = activeProduct.data.origin;
  const traceability = activeProduct.data.traceability;

  const routeDates = ['2026-03-15', '2026-03-22', '2026-03-29', '2026-04-01', '2026-04-02'];

  const [sourceDocs, setSourceDocs] = useState<SourceDoc[]>([
    { id: 'c1', name: 'GOTS', type: 'Certificación', status: 'active', origin: 'file', fileName: 'gots_2026.pdf', uploadDate: '2026-01-10', linkedSections: ['cadena', 'materiales'], source: 'Third-party' },
    { id: 'c2', name: 'GRS', type: 'Certificación', status: 'expiring', origin: 'file', fileName: 'grs_2026.pdf', uploadDate: '2025-12-01', linkedSections: ['cadena', 'materiales'], source: 'Third-party' },
    { id: 'c4', name: 'OEKO-TEX Standard 100', type: 'Certificación', status: 'active', origin: 'file', fileName: 'oeko_2026.pdf', uploadDate: '2026-02-01', linkedSections: ['cadena'], source: 'Third-party' },
    { id: 'c3', name: 'Auditoría SMETA', type: 'Auditoría', status: 'expiring', origin: 'file', fileName: 'smeta_2025.pdf', uploadDate: '2025-11-15', linkedSections: ['cadena'], source: 'Third-party' },
    { id: 'c5', name: 'Evidencia de lote', type: 'Evidencia', status: 'active', origin: 'link', url: 'https://trace.vela-textile.com/batch/VT-CAM-001-2026-Q2', uploadDate: '2026-04-02', linkedSections: ['cadena'], source: 'Interno' },
  ]);

  const handleDeleteDoc = (docId: string) => {
    if (window.confirm(isEs ? '¿Eliminar documento permanentemente?' : 'Permanently delete document?')) setSourceDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const [etapas, setEtapas] = useState(
    origin.facilities.map((f: any, idx: number) => ({
      id: `etapa-${idx}`, stage: isEs ? f.stage : f.stage_en, facility: f.name, country: f.country,
      location: isEs ? f.location : f.location_en, date: routeDates[idx] || '',
      tier: idx === origin.facilities.length - 1 ? 'Final' : `Tier ${origin.facilities.length - idx}`,
    }))
  );

  const stageTooltipDrawer = (stageName: string) => {
    if (!isEs) return undefined;
    const map: Record<string, string> = {
      'Ginning': 'Separación inicial de la fibra de algodón. Sirve como primera etapa de preparación de la materia prima.',
      'Hilatura': 'Proceso donde la fibra se transforma en hilo. Sirve para preparar el material que luego se teje.',
      'Tejeduría': 'Proceso donde los hilos se transforman en tela. Sirve para crear la base textil de la prenda.',
      'Confección': 'Proceso donde se corta y cose la prenda. Sirve para transformar la tela en producto final.',
      'Acabado': 'Últimos tratamientos aplicados a la prenda. Sirve para mejorar tacto, color, apariencia o desempeño.',
    };
    return map[stageName] || undefined;
  };

  return (
    <>
      <DrawerHeader
        title={isEs ? 'Editar cadena de suministro' : 'Edit supply chain'}
        subtitle={isEs ? 'Documentación fuente y datos extraídos para revisar antes de publicar.' : 'Source documentation and extracted data to review before publishing.'}
        onClose={closeDrawer}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <DrawerSection title={isEs ? 'Documentación fuente' : 'Source documentation'} icon={<FaFileAlt size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Estos documentos alimentan la extracción de datos de esta sección.' : 'These documents feed the data extraction for this section.'} />
          <DrawerSourceDocs
            docs={sourceDocs}
            translateSource={(src) => translateSource(src, isEs)}
            onOpenDoc={(id) => console.log('Abrir doc', id)}
            onReplace={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('replace', { taskName: doc?.name });
            }}
            onDelete={handleDeleteDoc}
            onRequest={(id) => console.log('Solicitar', id)}
            onUploadFile={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('uploadForTask', { taskName: doc?.name });
            }}
          />
        </DrawerSection>

        <DrawerSection title={isEs ? 'Extracción de datos' : 'Content extraction'} icon={<FaDatabase size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Información extraída automáticamente desde la documentación fuente. Revisá y editá los campos antes de guardar.' : 'Information automatically extracted from source documentation. Review and edit fields before saving.'} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DrawerField label={isEs ? 'Origen final' : 'Final origin'} value={isEs ? origin.final_country : origin.final_country_en} provenance={{ source: 'Evidencia lote', status: 'confirmado' }} tooltip={isEs ? 'País declarado como origen final del producto. Sirve para informar desde dónde se considera terminado o puesto en mercado.' : 'Country declared as the final origin of the product. Used to inform from where it is considered finished or placed on the market.'} />
            <DrawerField label={isEs ? 'País confección' : 'Assembly country'} value={isEs ? origin.manufacturing_country : origin.manufacturing_country_en} provenance={{ source: 'Auditoría SMETA', status: 'confirmado' }} tooltip={isEs ? 'País donde se armó la prenda final. Sirve para identificar dónde se realizó la fabricación principal.' : 'Country where the final garment was assembled. Used to identify where the main manufacturing took place.'} />
            <DrawerField label={isEs ? 'Inicio producción' : 'Production start'} value={origin.production_start} type="date" provenance={{ source: 'Evidencia lote', status: 'confirmado' }} tooltip={isEs ? 'Fecha de inicio de la producción. Sirve para ubicar la fabricación en el tiempo.' : 'Production start date. Used to place manufacturing in time.'} />
            <DrawerField label={isEs ? 'Fin producción' : 'Production end'} value={origin.production_end} type="date" tooltip={isEs ? 'Fecha de finalización de la producción. Sirve para saber cuándo terminó la fabricación.' : 'Production end date. Used to know when manufacturing finished.'} />
            <DrawerField label={isEs ? 'Unidades lote' : 'Batch size'} value={String(origin.batch_size)} tooltip={isEs ? 'Cantidad de unidades producidas en este lote. Sirve para saber el volumen de fabricación.' : 'Number of units produced in this batch. Used to know the manufacturing volume.'} />
            <DrawerField label={isEs ? 'Cadena de custodia' : 'Chain of custody'} value={isEs ? traceability.chain_of_custody : traceability.chain_of_custody_en} provenance={{ source: 'GOTS', status: 'pendienteRevision' }} tooltip={isEs ? 'Forma en que se controla el material a lo largo de la cadena. Sirve para demostrar cómo se mantiene o verifica su origen.' : 'How the material is controlled throughout the chain. Used to demonstrate how its origin is maintained or verified.'} />
          </div>
          <p className="text-xs text-text-muted mt-4 mb-2">{isEs ? 'Etapas productivas' : 'Production stages'}</p>
          <div className="space-y-3">
            {etapas.map((etapa, idx) => (
              <div key={etapa.id} className="p-3 bg-bg-inner rounded-lg border border-border-inner space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-link">#{idx + 1}</span>
                  <span className="text-[10px] text-text-muted">{etapa.tier}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DrawerField label={isEs ? 'Etapa' : 'Stage'} value={etapa.stage} onChange={(v) => { const c = [...etapas]; c[idx].stage = v; setEtapas(c); }} tooltip={stageTooltipDrawer(etapa.stage)} />
                  <DrawerField label={isEs ? 'Instalación' : 'Facility'} value={etapa.facility} onChange={(v) => { const c = [...etapas]; c[idx].facility = v; setEtapas(c); }} tooltip={isEs ? 'Lugar o empresa donde se realizó una etapa de producción. Sirve para saber quién participó en la fabricación.' : 'Place or company where a production stage was carried out. Used to know who participated in manufacturing.'} />
                  <DrawerField label={isEs ? 'País' : 'Country'} value={etapa.country} onChange={(v) => { const c = [...etapas]; c[idx].country = v; setEtapas(c); }} tooltip={isEs ? 'País donde se realizó esa etapa. Sirve para ubicar geográficamente la cadena de suministro.' : 'Country where that stage was carried out. Used to geographically locate the supply chain.'} />
                  <DrawerField label={isEs ? 'Fecha' : 'Date'} value={etapa.date} type="date" onChange={(v) => { const c = [...etapas]; c[idx].date = v; setEtapas(c); }} tooltip={isEs ? 'Fecha registrada para esa etapa. Sirve para reconstruir cuándo ocurrió cada paso.' : 'Registered date for that stage. Used to reconstruct when each step occurred.'} />
                </div>
              </div>
            ))}
          </div>
        </DrawerSection>

        <DrawerActionBar
          primaryLabel={isEs ? 'Guardar cambios' : 'Save changes'}
          onPrimary={() => { console.log('Guardar cadena'); closeDrawer(); }}
          linkLabel={t('drawer.openDocumentHub')}
          onLink={openDocumentHub}
        />
      </div>

      <UploadDocumentWizard
        isOpen={wizard.isOpen}
        onClose={wizard.close}
        onSave={(doc) => console.log('Document saved:', doc)}
        mode={wizard.mode}
        context={wizard.context}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   MATERIALES DRAWER
═══════════════════════════════════════════ */
export function MaterialesDrawer() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const { closeDrawer } = useDrawer();
  const isEs = i18n.language === 'es';
  const wizard = useWizard();
  const comp = activeProduct.data.composition;

  const [sourceDocs, setSourceDocs] = useState<SourceDoc[]>([
    { id: 'm1', name: 'GOTS', type: 'Certificación', status: 'active', origin: 'file', fileName: 'gots_2026.pdf', uploadDate: '2026-01-10', linkedSections: ['materiales', 'cadena'], source: 'Third-party' },
    { id: 'm2', name: 'GRS', type: 'Certificación', status: 'expiring', origin: 'file', fileName: 'grs_2026.pdf', uploadDate: '2025-12-01', linkedSections: ['materiales', 'cadena'], source: 'Third-party' },
    { id: 'm3', name: 'OEKO-TEX Standard 100', type: 'Certificación', status: 'active', origin: 'file', fileName: 'oekotex_2026.pdf', uploadDate: '2026-02-15', linkedSections: ['materiales'], source: 'Third-party' },
    { id: 'm4', name: 'Declaración SVHC', type: 'Declaración', status: 'active', origin: 'file', fileName: 'svhc_decl.pdf', uploadDate: '2026-02-01', linkedSections: ['materiales', 'cumplimiento'], source: 'Regulatorio' },
    { id: 'm5', name: 'Declaración composición', type: 'Declaración', status: 'active', origin: 'file', fileName: 'composicion_decl.pdf', uploadDate: '2026-03-01', linkedSections: ['materiales'], source: 'Proveedor' },
    { id: 'm7', name: 'Ficha técnica de tintura', type: 'Técnica', status: 'active', origin: 'file', fileName: 'tinte_tec_2026.pdf', uploadDate: '2026-02-01', linkedSections: ['materiales'], source: 'Proveedor' },
    { id: 'm8', name: 'Ficha técnica de suavizante', type: 'Técnica', status: 'active', origin: 'file', fileName: 'suavizante_tec_2026.pdf', uploadDate: '2026-02-01', linkedSections: ['materiales'], source: 'Proveedor' },
    { id: 'm6', name: 'Ficha técnica de acabado enzimático', type: 'Técnica', status: 'missing', origin: 'file', fileName: '', uploadDate: '', linkedSections: ['materiales'], source: 'Proveedor' },
  ]);

  const handleDeleteDoc = (docId: string) => {
    if (window.confirm(isEs ? '¿Eliminar documento permanentemente?' : 'Permanently delete document?')) setSourceDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const [materiales, setMateriales] = useState(
    comp.materials.map((m: any, idx: number) => ({
      id: `mat-${idx}`, name: isEs ? m.name : m.name_en, percentage: String(m.percentage),
      weight_g: String(m.weight_g), origin: isEs ? m.origin : m.origin_en,
      certification: m.certification || '',
    }))
  );

  const [tratamientos] = useState(
    comp.chemical_treatments.map((t: any, idx: number) => ({
      id: `trt-${idx}`, name: isEs ? t.es : t.en, function: 'Acabado', status: 'active' as const,
    }))
  );

  return (
    <>
      <DrawerHeader
        title={isEs ? 'Editar composición' : 'Edit composition'}
        subtitle={isEs ? 'Documentación fuente y datos extraídos para revisar antes de publicar.' : 'Source documentation and extracted data to review before publishing.'}
        onClose={closeDrawer}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <DrawerSection title={isEs ? 'Documentación fuente' : 'Source documentation'} icon={<FaFileAlt size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Estos documentos alimentan la extracción de datos de esta sección.' : 'These documents feed the data extraction for this section.'} />
          <DrawerSourceDocs
            docs={sourceDocs}
            onOpenDoc={(id) => console.log('Abrir doc', id)}
            onReplace={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('replace', { taskName: doc?.name });
            }}
            onDelete={handleDeleteDoc}
            onRequest={(id) => console.log('Solicitar', id)}
            onUploadFile={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('uploadForTask', { taskName: doc?.name });
            }}
          />
        </DrawerSection>

        <DrawerSection title={isEs ? 'Extracción de datos' : 'Content extraction'} icon={<FaDatabase size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Información extraída automáticamente desde la documentación fuente. Revisá y editá los campos antes de guardar.' : 'Information automatically extracted from source documentation. Review and edit fields before saving.'} />
          <p className="text-xs text-text-muted mb-2">{isEs ? 'Composición' : 'Composition'}</p>
          <div className="space-y-3">
            {materiales.map((mat, idx) => (
              <div key={mat.id} className="p-3 bg-bg-inner rounded-lg border border-border-inner space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">{mat.name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DrawerField label="%" value={mat.percentage} onChange={(v) => { const c = [...materiales]; c[idx].percentage = v; setMateriales(c); }} provenance={{ source: 'Declaración composición', status: 'confirmado' }} />
                  <DrawerField label={isEs ? 'Peso (g)' : 'Weight (g)'} value={mat.weight_g} onChange={(v) => { const c = [...materiales]; c[idx].weight_g = v; setMateriales(c); }} />
                  <DrawerField label={isEs ? 'Origen' : 'Origin'} value={mat.origin} onChange={(v) => { const c = [...materiales]; c[idx].origin = v; setMateriales(c); }} provenance={{ source: 'GOTS', status: 'pendienteRevision' }} />
                  <DrawerField label={isEs ? 'Certificación' : 'Certification'} value={mat.certification} onChange={(v) => { const c = [...materiales]; c[idx].certification = v; setMateriales(c); }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-4 mb-2">{isEs ? 'Tratamientos químicos' : 'Chemical treatments'}</p>
          <div className="space-y-2">
            {tratamientos.map((trt) => (
              <div key={trt.id} className="flex items-center justify-between p-3 bg-bg-inner rounded-lg border border-border-inner">
                <div><p className="text-sm text-text-primary">{trt.name}</p><p className="text-[10px] text-text-muted">{trt.function}</p></div>
                <DrawerStatusBadge status={trt.status} />
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-4 mb-2">{isEs ? 'SVHC (REACH)' : 'SVHC (REACH)'}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DrawerField label={isEs ? 'Estado' : 'Status'} value={isEs ? comp.svhc_status : comp.svhc_status_en} readOnly provenance={{ source: 'Declaración SVHC', status: 'confirmado' }} />
            <DrawerField label={isEs ? 'Última verificación' : 'Last verification'} value={comp.svhc_verification_date} type="date" />
          </div>
        </DrawerSection>

        <DrawerActionBar
          primaryLabel={isEs ? 'Guardar cambios' : 'Save changes'}
          onPrimary={() => { console.log('Guardar materiales'); closeDrawer(); }}
          linkLabel={t('drawer.openDocumentHub')}
          onLink={openDocumentHub}
        />
      </div>

      <UploadDocumentWizard
        isOpen={wizard.isOpen}
        onClose={wizard.close}
        onSave={(doc) => console.log('Document saved:', doc)}
        mode={wizard.mode}
        context={wizard.context}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   CIRCULARIDAD DRAWER
   ═══════════════════════════════════════════ */
export function CircularidadDrawer() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const { closeDrawer } = useDrawer();
  const isEs = i18n.language === 'es';
  const wizard = useWizard();
  const d = activeProduct.data.durability;
  const impact = activeProduct.data.environmental_impact;
  const eol = activeProduct.data.end_of_life;

  const docName = (key: string) => t(`drawer.${key}`);
  const srcName = (key: string) => t(`drawer.source${key}`);

  const [sourceDocs, setSourceDocs] = useState<SourceDoc[]>([
    { id: 'cr1', name: docName('docDurabilityTest'), type: 'Ensayo', status: 'active', origin: 'file', fileName: 'durability_test.pdf', uploadDate: '2025-10-10', linkedSections: ['circularidad'], source: 'ThirdParty' },
    { id: 'cr2', name: docName('docPEFMethodology'), type: 'Metodología', status: 'active', origin: 'link', url: 'https://ec.europa.eu/environment/pef', uploadDate: '2026-01-05', linkedSections: ['circularidad'], source: 'Regulatory' },
    { id: 'cr3', name: docName('docLCAReport'), type: 'Reporte', status: 'active', origin: 'file', fileName: 'lca_report_2026.pdf', uploadDate: '2026-02-20', linkedSections: ['circularidad'], source: 'ThirdParty' },
    { id: 'cr5', name: docName('docMicrofiberTest'), type: 'Ensayo', status: 'active', origin: 'file', fileName: 'microfiber_test_2026.pdf', uploadDate: '2026-02-20', linkedSections: ['circularidad'], source: 'ThirdParty' },
    { id: 'cr6', name: docName('docRecyclabilityAssessment'), type: 'Evaluación', status: 'active', origin: 'file', fileName: 'recyclability_eol_2026.pdf', uploadDate: '2026-02-15', linkedSections: ['circularidad'], source: 'ThirdParty' },
    { id: 'cr4', name: docName('docTakebackPolicy'), type: 'Política', status: 'active', origin: 'file', fileName: 'takeback_policy.pdf', uploadDate: '2025-09-01', linkedSections: ['circularidad'], source: 'Internal' },
    { id: 'cr7', name: docName('docCollectionDirectory'), type: 'Directorio', status: 'active', origin: 'file', fileName: 'collection_points_2026.pdf', uploadDate: '2026-03-01', linkedSections: ['circularidad'], source: 'Internal' },
  ]);

  const handleDeleteDoc = (docId: string) => {
    if (window.confirm(isEs ? '¿Eliminar documento permanentemente?' : 'Permanently delete document?')) setSourceDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const durFields = useEditableFields({
    wash_cycles: String(d.wash_cycles),
    tensile: String(d.tensile_strength_N),
    color: d.color_fastness,
    pilling: d.pilling_resistance,
    repair_possible: d.repairability.available ? t('endOfLife.yes') : t('endOfLife.no'),
    repair_type: isEs ? d.repairability.recommended : d.repairability.recommended_en,
    spare_parts: isEs ? d.repairability.spare_parts : d.repairability.spare_parts_en,
    repair_note: isEs ? 'La prenda no requiere piezas reemplazables específicas.' : 'The garment does not require specific replaceable parts.',
  });

  const impactFields = useEditableFields({
    carbon: String(impact.carbon_footprint.total_kg_co2eq),
    water: String(impact.water_footprint.total_liters),
    energy: String(impact.energy.total_kwh),
    micro_wash: String(impact.microplastics.per_wash_mg),
    micro_life: String(impact.microplastics.lifetime_mg),
    micro_filter: impact.microplastics.mitigation ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No'),
  });

  const eolFields = useEditableFields({
    recyclable: String(eol.recyclability_index),
    compostable: eol.compostable ? t('endOfLife.yes') : t('endOfLife.no'),
    compostable_reason: isEs ? eol.compostable_reason : eol.compostable_reason_en,
    takeback: eol.take_back_program.available ? t('endOfLife.yes') : t('endOfLife.no'),
    takeback_conditions: isEs ? eol.take_back_program.conditions : eol.take_back_program.conditions_en,
    takeback_source: isEs ? eol.take_back_program.source : eol.take_back_program.source_en,
  });

  return (
    <>
      <DrawerHeader
        title={t('drawer.manageCircularity')}
        subtitle={isEs ? 'Documentación fuente y datos extraídos para revisar antes de publicar.' : 'Source documentation and extracted data to review before publishing.'}
        onClose={closeDrawer}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <DrawerSection title={t('drawer.sourceDocs')} icon={<FaFileAlt size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Estos documentos alimentan la extracción de datos de esta sección.' : 'These documents feed the data extraction for this section.'} />
          <DrawerSourceDocs
            docs={sourceDocs}
            translateSource={(src) => {
              const map: Record<string, string> = {
                'ThirdParty': t('drawer.sourceThirdParty'),
                'Internal': t('drawer.sourceInternal'),
                'Regulatory': t('drawer.sourceRegulatory'),
                'Supplier': t('drawer.sourceSupplier'),
              };
              return map[src] || src;
            }}
            onOpenDoc={(id) => console.log('Abrir doc', id)}
            onReplace={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('replace', { taskName: doc?.name });
            }}
            onDelete={handleDeleteDoc}
            onRequest={(id) => console.log('Solicitar', id)}
            onUploadFile={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('uploadForTask', { taskName: doc?.name });
            }}
          />
        </DrawerSection>

        <DrawerSection title={t('drawer.extraction')} icon={<FaDatabase size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Información extraída automáticamente desde la documentación fuente. Revisá y editá los campos antes de guardar.' : 'Information automatically extracted from source documentation. Review and edit fields before saving.'} />

          {/* Durabilidad y reparación */}
          <div className="mt-6 mb-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3">{t('drawer.durabilitySection')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DrawerField label={t('durability.washCycles')} value={durFields.values.wash_cycles} onChange={(v) => durFields.update('wash_cycles', v)} provenance={{ source: docName('docDurabilityTest'), status: 'confirmado' }} />
              <DrawerField label={t('durability.tensileStrength')} value={durFields.values.tensile} onChange={(v) => durFields.update('tensile', v)} provenance={{ source: docName('docDurabilityTest'), status: 'confirmado' }} />
              <DrawerField label={t('durability.colorFastness')} value={durFields.values.color} onChange={(v) => durFields.update('color', v)} />
              <DrawerField label={t('durability.pillingResistance')} value={durFields.values.pilling} onChange={(v) => durFields.update('pilling', v)} />
              <DrawerField label={t('drawer.repairPossible')} value={durFields.values.repair_possible} />
              <DrawerField label={t('drawer.repairType')} value={durFields.values.repair_type} onChange={(v) => durFields.update('repair_type', v)} />
              <DrawerField label={t('drawer.spareParts')} value={durFields.values.spare_parts} onChange={(v) => durFields.update('spare_parts', v)} />
              <DrawerField label={t('drawer.repairNote')} value={durFields.values.repair_note} onChange={(v) => durFields.update('repair_note', v)} className="md:col-span-2" />
            </div>
          </div>

          {/* Impacto ambiental */}
          <div className="border-t border-border/50 pt-5 mt-5 mb-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3">{t('drawer.impactSection')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DrawerField label={t('impact.carbonFootprint')} value={impactFields.values.carbon} onChange={(v) => impactFields.update('carbon', v)} provenance={{ source: docName('docLCAReport'), status: 'confirmado' }} />
              <DrawerField label={t('impact.waterFootprint')} value={impactFields.values.water} onChange={(v) => impactFields.update('water', v)} />
              <DrawerField label={t('impact.energy')} value={impactFields.values.energy} onChange={(v) => impactFields.update('energy', v)} />
              <DrawerField label={t('impact.perWash')} value={impactFields.values.micro_wash} onChange={(v) => impactFields.update('micro_wash', v)} />
              <DrawerField label={t('impact.lifetime')} value={impactFields.values.micro_life} onChange={(v) => impactFields.update('micro_life', v)} />
              <DrawerField label={t('drawer.microfiberFilter')} value={impactFields.values.micro_filter} />
            </div>
          </div>

          {/* Fin de vida */}
          <div className="border-t border-border/50 pt-5 mt-5 mb-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3">{t('drawer.endOfLifeSection')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DrawerField label={t('endOfLife.recyclabilityIndex')} value={eolFields.values.recyclable} onChange={(v) => eolFields.update('recyclable', v)} provenance={{ source: docName('docRecyclabilityAssessment'), status: 'pendienteRevision' }} />
              <DrawerField label={t('endOfLife.compostable')} value={eolFields.values.compostable} />
              <DrawerField label={t('drawer.compostableReason')} value={eolFields.values.compostable_reason} onChange={(v) => eolFields.update('compostable_reason', v)} />
              <DrawerField label={t('drawer.takebackIncluded')} value={eolFields.values.takeback} />
              <DrawerField label={t('drawer.takebackConditions')} value={eolFields.values.takeback_conditions} onChange={(v) => eolFields.update('takeback_conditions', v)} />
              <DrawerField label={t('drawer.takebackSource')} value={eolFields.values.takeback_source} onChange={(v) => eolFields.update('takeback_source', v)} provenance={{ source: docName('docTakebackPolicy'), status: 'confirmado' }} />
            </div>
          </div>
        </DrawerSection>

        <DrawerActionBar
          primaryLabel={isEs ? 'Guardar cambios' : 'Save changes'}
          onPrimary={() => { console.log('Guardar circularidad'); closeDrawer(); }}
          linkLabel={t('drawer.openDocumentHub')}
          onLink={openDocumentHub}
        />
      </div>

      <UploadDocumentWizard
        isOpen={wizard.isOpen}
        onClose={wizard.close}
        onSave={(doc) => console.log('Document saved:', doc)}
        mode={wizard.mode}
        context={wizard.context}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   CUMPLIMIENTO DRAWER
   ═══════════════════════════════════════════ */
export function CumplimientoDrawer() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const { closeDrawer } = useDrawer();
  const isEs = i18n.language === 'es';
  const wizard = useWizard();
  const compliance = activeProduct.data.compliance;

  const [sourceDocs, setSourceDocs] = useState<SourceDoc[]>([
    { id: 'r1', name: 'Declaración REACH', type: 'Regulatorio', status: 'active', origin: 'file', fileName: 'reach_decl.pdf', uploadDate: '2026-02-01', linkedSections: ['cumplimiento'], source: 'Regulatorio' },
    { id: 'r2', name: 'Declaración SVHC', type: 'Regulatorio', status: 'active', origin: 'file', fileName: 'svhc_decl.pdf', uploadDate: '2026-02-01', linkedSections: ['cumplimiento', 'materiales'], source: 'Regulatorio' },
    { id: 'r3', name: 'Checklist ESPR', type: 'Regulatorio', status: 'active', origin: 'file', fileName: 'espr_checklist.pdf', uploadDate: '2026-03-10', linkedSections: ['cumplimiento'], source: 'Regulatorio' },
    { id: 'r4', name: 'Mapeo ESRS', type: 'Regulatorio', status: 'active', origin: 'link', url: 'https://reporting.velatextile.eu/esrs', uploadDate: '2026-01-20', linkedSections: ['cumplimiento'], source: 'Interno' },
  ]);

  const handleDeleteDoc = (docId: string) => {
    if (window.confirm(isEs ? '¿Eliminar documento permanentemente?' : 'Permanently delete document?')) setSourceDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const reachFields = useEditableFields({ status: compliance.reach.status, restricted: String(compliance.reach.restricted_substances), svhc: String(compliance.reach.svhc_substances), date: compliance.reach.verification_date });
  const esprFields = useEditableFields({ status: compliance.espr.status, fields: compliance.espr.fields_covered, carrier: compliance.espr.data_carrier });
  const eudrFields = useEditableFields({ applies: compliance.eudr.applies ? 'Sí' : 'No', note: isEs ? compliance.eudr.note : compliance.eudr.note_en });

  return (
    <>
      <DrawerHeader
        title={isEs ? 'Revisar cumplimiento' : 'Review compliance'}
        subtitle={isEs ? 'Documentación fuente y datos extraídos para revisar antes de publicar.' : 'Source documentation and extracted data to review before publishing.'}
        onClose={closeDrawer}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <DrawerSection title={isEs ? 'Documentación fuente' : 'Source documentation'} icon={<FaFileAlt size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Estos documentos alimentan la extracción de datos de esta sección.' : 'These documents feed the data extraction for this section.'} />
          <DrawerSourceDocs
            docs={sourceDocs}
            onOpenDoc={(id) => console.log('Abrir doc', id)}
            onReplace={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('replace', { taskName: doc?.name });
            }}
            onDelete={handleDeleteDoc}
            onRequest={(id) => console.log('Solicitar', id)}
            onUploadFile={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('uploadForTask', { taskName: doc?.name });
            }}
          />
        </DrawerSection>

        <DrawerSection title={isEs ? 'Extracción de datos' : 'Content extraction'} icon={<FaDatabase size={14} />}>
          <DrawerInfoBanner text={isEs ? 'Información extraída automáticamente desde la documentación fuente. Revisá y editá los campos antes de guardar.' : 'Information automatically extracted from source documentation. Review and edit fields before saving.'} />
          <p className="text-xs text-text-muted mb-2">REACH</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DrawerField label={isEs ? 'Estado' : 'Status'} value={reachFields.values.status} provenance={{ source: 'Declaración REACH', status: 'confirmado' }} />
            <DrawerField label={isEs ? 'Sustancias restringidas' : 'Restricted substances'} value={reachFields.values.restricted} onChange={(v) => reachFields.update('restricted', v)} />
            <DrawerField label="SVHC" value={reachFields.values.svhc} onChange={(v) => reachFields.update('svhc', v)} provenance={{ source: 'Declaración SVHC', status: 'confirmado' }} />
            <DrawerField label={isEs ? 'Última verificación' : 'Last verification'} value={reachFields.values.date} type="date" onChange={(v) => reachFields.update('date', v)} />
          </div>
          <p className="text-xs text-text-muted mt-4 mb-2">ESPR</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DrawerField label={isEs ? 'Estado' : 'Status'} value={esprFields.values.status} provenance={{ source: 'Checklist ESPR', status: 'confirmado' }} />
            <DrawerField label={isEs ? 'Campos cubiertos' : 'Fields covered'} value={esprFields.values.fields} onChange={(v) => esprFields.update('fields', v)} provenance={{ source: 'Checklist ESPR', status: 'confirmado' }} />
            <DrawerField label={isEs ? 'Portador de datos' : 'Data carrier'} value={esprFields.values.carrier} onChange={(v) => esprFields.update('carrier', v)} />
          </div>
          <p className="text-xs text-text-muted mt-4 mb-2">EUDR</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DrawerField label={isEs ? 'Aplica' : 'Applies'} value={eudrFields.values.applies} provenance={{ source: 'Mapeo ESRS', status: 'pendienteRevision' }} />
            <DrawerField label={isEs ? 'Nota' : 'Note'} value={eudrFields.values.note} type="textarea" onChange={(v) => eudrFields.update('note', v)} className="md:col-span-2" />
          </div>
          <p className="text-xs text-text-muted mt-4 mb-2">CSRD / ESRS</p>
          <div className="space-y-2">
            {Object.entries(compliance.csrd.esrs_mapping).map(([key, val]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-bg-inner rounded-lg border border-border-inner">
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{key}</span>
                  <span className="text-xs text-text-primary">{isEs ? val.es : val.en}</span>
                </div>
                <DrawerStatusBadge status="conforme" />
              </div>
            ))}
          </div>
        </DrawerSection>

        <DrawerActionBar
          primaryLabel={isEs ? 'Guardar cambios' : 'Save changes'}
          onPrimary={() => { console.log('Guardar cumplimiento'); closeDrawer(); }}
          linkLabel={t('drawer.openDocumentHub')}
          onLink={openDocumentHub}
        />
      </div>

      <UploadDocumentWizard
        isOpen={wizard.isOpen}
        onClose={wizard.close}
        onSave={(doc) => console.log('Document saved:', doc)}
        mode={wizard.mode}
        context={wizard.context}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   DOCUMENTO DRAWER
   ═══════════════════════════════════════════ */
export function DocumentoDrawer({ documentId }: { documentId: string }) {
  const { t, i18n } = useTranslation();
  const { closeDrawer } = useDrawer();
  const isEs = i18n.language === 'es';
  const wizard = useWizard();

  const docMap: Record<string, any> = {
    'c1': { name: 'GOTS', type: 'Certificación', family: 'Cadena y trazabilidad', issuer: 'Control Union', number: 'GOTS-2026-TR-001234', validUntil: '2027-01-31', status: 'active', version: '1' },
    'c2': { name: 'GRS', type: 'Certificación', family: 'Cadena y trazabilidad', issuer: 'Textile Exchange', number: 'GRS-ES-005678', validUntil: '2026-07-15', status: 'expiring', version: '1' },
    'c3': { name: 'Auditoría SMETA', type: 'Auditoría', family: 'Cadena y trazabilidad', issuer: 'SGS', number: 'SMETA-2025-001', validUntil: '2026-11-20', status: 'active', version: '1' },
    'c4': { name: 'OEKO-TEX Standard 100', type: 'Certificación', family: 'Químicos y seguridad de producto', issuer: 'Hohenstein', number: '26.HTR.12345', validUntil: '2027-03-31', status: 'active', version: '1' },
  };

  const doc = docMap[documentId] || { name: 'Documento', type: 'Otro', family: '-', issuer: '-', number: '-', validUntil: '-', status: 'active', version: '1' };

  const relaciones = [
    { section: 'Materiales', entity: 'Algodón orgánico' },
    { section: 'Cadena', entity: 'Ginning' },
    { section: 'Cadena', entity: 'Hilatura' },
    { section: 'Cumplimiento', entity: 'Soporte ESPR' },
  ];

  const handleDelete = () => {
    if (window.confirm(isEs ? '¿Eliminar documento permanentemente? Se eliminará de todas las secciones vinculadas.' : 'Permanently delete document? It will be removed from all linked sections.')) {
      console.log('Eliminar documento', documentId);
      closeDrawer();
    }
  };

  return (
    <>
      <DrawerHeader title={doc.name} subtitle={`${doc.type} · ${doc.family}`} status={doc.status} onClose={closeDrawer} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <DrawerSection title={isEs ? 'Datos del documento' : 'Document data'} icon={<FaDoc size={14} />}>
          <div className="grid grid-cols-1 gap-3">
            <DrawerField label={isEs ? 'Nombre' : 'Name'} value={doc.name} />
            <DrawerField label={isEs ? 'Tipo' : 'Type'} value={doc.type} />
            <DrawerField label={isEs ? 'Familia' : 'Family'} value={doc.family} />
            <DrawerField label={isEs ? 'Nº certificado' : 'Certificate No.'} value={doc.number} />
            <DrawerField label={isEs ? 'Emisor' : 'Issuer'} value={doc.issuer} />
            <DrawerField label={isEs ? 'Válido hasta' : 'Valid until'} value={doc.validUntil} type="date" />
          </div>
        </DrawerSection>

        <DrawerSection title={isEs ? 'Relaciones' : 'Relationships'} icon={<FaLink size={14} />}>
          <div className="space-y-2">
            {relaciones.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-bg-inner rounded-lg border border-border-inner">
                <span className="text-xs text-text-primary">{r.section}</span>
                <span className="text-[10px] text-text-muted">{r.entity}</span>
              </div>
            ))}
          </div>
        </DrawerSection>

        <div className="flex flex-wrap gap-2 pt-2">
          <button onClick={() => wizard.open('replace', { taskName: doc.name })} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-violet/10 border border-accent-violet/30 text-accent-violet hover:bg-accent-violet/20 hover:border-accent-violet/50 transition-colors">
            <FaSync size={12} /> {isEs ? 'Reemplazar' : 'Replace'}
          </button>
          <button onClick={handleDelete} className="px-3 py-2 rounded-lg bg-bg-inner border border-border-inner text-xs text-text-secondary hover:text-[#FCA5A5] hover:border-[#FCA5A5] transition-colors flex items-center gap-1.5">
            <FaTrash size={12} /> {isEs ? 'Eliminar documento' : 'Delete document'}
          </button>
        </div>

        <DrawerActionBar primaryLabel={isEs ? 'Guardar cambios' : 'Save changes'} onPrimary={() => { console.log('Guardar documento'); closeDrawer(); }} />
      </div>

      <UploadDocumentWizard
        isOpen={wizard.isOpen}
        onClose={wizard.close}
        onSave={(doc) => console.log('Document saved:', doc)}
        mode={wizard.mode}
        context={wizard.context}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   MISSING DRAWER
═══════════════════════════════════════════ */
export function MissingDrawer({ title, section, entity, reason }: { title: string; section: string; entity?: string; reason?: string }) {
  const { t, i18n } = useTranslation();
  const { closeDrawer } = useDrawer();
  const isEs = i18n.language === 'es';

  const fields = useEditableFields({ responsible: entity || '', note: '', dueDate: '' });

  return (
    <>
      <DrawerHeader title={isEs ? 'Solicitar evidencia faltante' : 'Request missing evidence'} subtitle={title} status="missing" onClose={closeDrawer} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <DrawerSection title={isEs ? 'Detalle de la solicitud' : 'Request details'} icon={<FaClock size={14} />}>
          <div className="grid grid-cols-1 gap-3">
            <DrawerField label={isEs ? 'Documento requerido' : 'Required document'} value={title} readOnly />
            <DrawerField label={isEs ? 'Sección' : 'Section'} value={section} readOnly />
            <DrawerField label={isEs ? 'Entidad' : 'Entity'} value={entity || '-'} readOnly />
            <DrawerField label={isEs ? 'Motivo' : 'Reason'} value={reason || ''} type="textarea" readOnly />
            <DrawerField label={isEs ? 'Responsable sugerido' : 'Suggested responsible'} value={fields.values.responsible} onChange={(v) => fields.update('responsible', v)} />
            <DrawerField label={isEs ? 'Fecha requerida' : 'Required date'} value={fields.values.dueDate} type="date" onChange={(v) => fields.update('dueDate', v)} />
            <DrawerField label={isEs ? 'Nota interna' : 'Internal note'} value={fields.values.note} type="textarea" onChange={(v) => fields.update('note', v)} />
          </div>
        </DrawerSection>

        <DrawerActionBar primaryLabel={isEs ? 'Solicitar al proveedor' : 'Request from supplier'} onPrimary={() => { console.log('Solicitar'); closeDrawer(); }} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   RESUMEN DRAWER
═══════════════════════════════════════════ */
export function ResumenDrawer() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const { closeDrawer } = useDrawer();
  const isEs = i18n.language === 'es';
  const wizard = useWizard();

  const [sourceDocs, setSourceDocs] = useState<SourceDoc[]>([
    { id: 's1', name: 'GOTS', type: 'Certificación', status: 'active', origin: 'file', fileName: 'gots.pdf', uploadDate: '2026-01-10', linkedSections: ['cadena', 'materiales'], source: 'Third-party' },
    { id: 's2', name: 'Declaración REACH', type: 'Regulatorio', status: 'active', origin: 'file', fileName: 'reach.pdf', uploadDate: '2026-02-01', linkedSections: ['cumplimiento'], source: 'Regulatorio' },
  ]);

  const handleDeleteDoc = (docId: string) => {
    if (window.confirm(isEs ? '¿Eliminar documento permanentemente?' : 'Permanently delete document?')) setSourceDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  return (
    <>
      <DrawerHeader title={isEs ? 'Revisar DPP' : 'Review DPP'} subtitle={isEs ? 'KPIs, insights y pendientes generales' : 'KPIs, insights and general pending items'} status={activeProduct.completitud === 100 ? 'completo' : 'enProgreso'} onClose={closeDrawer} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <DrawerSection title={isEs ? 'Documentación fuente' : 'Source documentation'} icon={<FaFileAlt size={14} />}>
          <DrawerSourceDocs
            docs={sourceDocs}
            onOpenDoc={(id) => console.log('Abrir doc', id)}
            onReplace={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('replace', { taskName: doc?.name });
            }}
            onDelete={handleDeleteDoc}
            onRequest={(id) => console.log('Solicitar', id)}
            onUploadFile={(id) => {
              const doc = sourceDocs.find((d) => d.id === id);
              wizard.open('uploadForTask', { taskName: doc?.name });
            }}
            translateSource={(src) => translateSource(src, isEs)}
          />
        </DrawerSection>

        <DrawerSection title={isEs ? 'Top insights' : 'Top insights'} icon={<FaDatabase size={14} />}>
          <div className="space-y-2">
            <p className="text-sm text-text-primary">{isEs ? '60% algodón orgánico certificado GOTS' : '60% GOTS-certified organic cotton'}</p>
            <p className="text-sm text-text-primary">{isEs ? 'Huella de carbono 25% inferior al sector' : 'Carbon footprint 25% below industry average'}</p>
            <p className="text-sm text-text-primary">{isEs ? 'Cadena trazada en 5 países' : 'Supply chain traced across 5 countries'}</p>
          </div>
        </DrawerSection>

        <DrawerActionBar primaryLabel={isEs ? 'Guardar cambios' : 'Save changes'} onPrimary={() => { console.log('Guardar resumen'); closeDrawer(); }} />
      </div>

      <UploadDocumentWizard
        isOpen={wizard.isOpen}
        onClose={wizard.close}
        onSave={(doc) => console.log('Document saved:', doc)}
        mode={wizard.mode}
        context={wizard.context}
      />
    </>
  );
}
