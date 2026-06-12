'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { useDrawer } from '@/lib/DrawerContext';
import { useTheme } from '@/lib/ThemeContext';
import { Tooltip, LabelWithTooltip } from '@/components/Tooltip';
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal';
import { Chip } from '@/components/Chip';
import { ActionButton } from '@/components/ActionButton';
import { FaMapMarkerAlt, FaIndustry, FaRoute, FaCalendarAlt, FaArrowRight, FaLink, FaEdit, FaCertificate, FaClipboardCheck, FaCheckCircle, FaShieldAlt, FaQuestionCircle, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { FileText, Eye } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ── Helpers ── */
const numberedIcon = (num: number) =>
  L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background:#34D399;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#0F0F0F;font-size:12px;font-weight:700;border:2px solid #0F0F0F;box-shadow:0 2px 4px rgba(0,0,0,0.4);">${num}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

function translateStage(stage: string, isEs: boolean) {
  if (!isEs) return stage;
  if (stage === 'Ginning') return 'Desmotado de algodón';
  return stage;
}

export default function TabCadena() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { activeProduct, getEffectiveStatus } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const { openDrawer } = useDrawer();
  const origin = productData.origin;
  const traceability = productData.traceability;

  const [showModal, setShowModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const routeCoords = origin.facilities.map((f: any) => f.coordinates as [number, number]);

  const routeDates = [
    '2026-03-15',
    '2026-03-22',
    '2026-03-29',
    '2026-04-01',
    '2026-04-02',
  ];

  const handleManageChain = () => {
    openDrawer({ mode: 'section', section: 'cadena' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{t('tabs.chain')}</h2>
          <p className="text-sm text-text-muted mt-0.5">{t('tabs.chainSubtitle')}</p>
        </div>
        <button
          onClick={handleManageChain}
          className="inline-flex items-center gap-2 text-text-link text-sm font-medium hover:underline transition-colors"
        >
          <FaEdit size={14} />
          {t('drawer.manageChain')}
        </button>
      </div>
      {/* ─── Map + Info Cards ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Map */}
        <div className="lg:col-span-2 bg-bg-card rounded-xl border border-border overflow-hidden flex flex-col min-h-[520px]">
          <div className="flex-1 h-full">
            <MapContainer center={[37.5, 10]} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: 'var(--color-bg-card)' }}>
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url={`https://{s}.basemaps.cartocdn.com/${theme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`}
              />
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: '#34D399', weight: 2, dashArray: '6 6', opacity: 0.9 }}
              />
              {origin.facilities.map((f: any, idx: number) => (
                <Marker key={idx} position={f.coordinates as [number, number]} icon={numberedIcon(idx + 1)}>
                  <Popup>
                    <div className="p-1">
                      <p className="font-semibold text-sm text-[#18181B]">{f.name}</p>
                      <p className="text-xs text-gray-600">{isEs ? translateStage(f.stage, isEs) : f.stage_en}</p>
                      <p className="text-xs text-gray-500">{isEs ? f.location : f.location_en}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Info Cards */}
        <div className="flex flex-col gap-3 h-full">
          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-text-link">
              <FaMapMarkerAlt size={14} />
              <span className="text-xs font-medium text-text-secondary"><LabelWithTooltip label={isEs ? 'Origen final declarado' : 'Declared final origin'} tooltip={isEs ? 'País declarado como origen final del producto. Sirve para informar desde dónde se considera terminado o puesto en mercado.' : 'Country declared as the final origin of the product. Used to inform from where it is considered finished or placed on the market.'} /></span>
            </div>
            <p className="text-lg font-semibold text-text-primary">España</p>
          </div>

          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-text-link">
              <FaIndustry size={14} />
              <span className="text-xs font-medium text-text-secondary"><LabelWithTooltip label={isEs ? 'País de confección' : 'Assembly country'} tooltip={isEs ? 'País donde se armó la prenda final. Sirve para identificar dónde se realizó la fabricación principal.' : 'Country where the final garment was assembled. Used to identify where the main manufacturing took place.'} /></span>
            </div>
            <p className="text-lg font-semibold text-text-primary">Túnez</p>
          </div>

          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-text-link">
              <FaCalendarAlt size={14} />
              <span className="text-xs font-medium text-text-secondary"><LabelWithTooltip label={isEs ? 'Período de producción' : 'Production period'} tooltip={isEs ? 'Fechas entre las que se produjo este lote. Sirve para ubicar la fabricación en el tiempo.' : 'Dates between which this batch was produced. Used to place manufacturing in time.'} /></span>
            </div>
            <p className="text-lg font-semibold text-text-primary">2026-03-15 → 2026-04-02</p>
          </div>

          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-text-link">
              <FaLink size={14} />
              <span className="text-xs font-medium text-text-secondary"><LabelWithTooltip label={isEs ? 'Cobertura de la cadena' : 'Chain coverage'} tooltip={isEs ? 'Cantidad de etapas y países registrados en la cadena de suministro. Sirve para saber qué tan completa está la trazabilidad.' : 'Number of stages and countries registered in the supply chain. Used to know how complete the traceability is.'} /></span>
            </div>
            <p className="text-lg font-semibold text-text-primary">5 {isEs ? 'etapas' : 'stages'} · 5 {isEs ? 'países' : 'countries'}</p>
          </div>

          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-text-link">
              <FaRoute size={14} />
              <span className="text-xs font-medium text-text-secondary"><LabelWithTooltip label={isEs ? 'Distancia total recorrida' : 'Total distance traveled'} tooltip={isEs ? 'Distancia aproximada que recorrió el producto entre etapas. Sirve para entender el recorrido logístico.' : 'Approximate distance traveled by the product between stages. Used to understand the logistical route.'} /></span>
            </div>
            <p className="text-lg font-semibold text-text-primary">4,850 km</p>
          </div>
        </div>
      </div>

      {/* ─── Route Table ─── */}
      <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-text-primary uppercase tracking-wide">
            {isEs ? 'Ruta de producción' : 'Production route'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider w-12"></th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">{isEs ? 'Etapa' : 'Stage'}</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">{isEs ? 'Instalación' : 'Facility'}</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">{isEs ? 'País' : 'Country'}</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider"><LabelWithTooltip label={isEs ? 'Fecha' : 'Date'} tooltip={isEs ? 'Fecha registrada para esa etapa. Sirve para reconstruir cuándo ocurrió cada paso de la producción.' : 'Date recorded for this stage. Used to rebuild when each production step happened.'} /></th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider"><LabelWithTooltip label={isEs ? 'Tier' : 'Tier'} tooltip={isEs ? 'Nivel del proveedor dentro de la cadena. Sirve para entender qué tan cerca o lejos está esa etapa del producto final.' : 'Supplier level within the chain. Used to understand how close or far that stage is from the final product.'} /></th>
              </tr>
            </thead>
            <tbody>
              {origin.facilities.map((f: any, idx: number) => {
                const stageName = translateStage(isEs ? f.stage : f.stage_en, isEs);
                const stageTooltip = isEs ? (
                  stageName === 'Desmotado de algodón' ? 'Separación inicial de la fibra de algodón. También se conoce como ginning en inglés. Sirve para preparar la materia prima antes de convertirla en hilo.' :
                  stageName === 'Hilatura' ? 'Proceso donde la fibra se transforma en hilo. Sirve para preparar el material que luego se teje.' :
                  stageName === 'Tejeduría' ? 'Proceso donde los hilos se transforman en tela. Sirve para crear la base textil de la prenda.' :
                  stageName === 'Confección' ? 'Proceso donde se corta y cose la prenda. Sirve para transformar la tela en producto final.' :
                  stageName === 'Acabado' ? 'Últimos tratamientos aplicados a la prenda. Sirve para mejorar tacto, color, apariencia o desempeño.' :
                  undefined
                ) : (
                  stageName === 'Ginning' ? 'Initial separation of cotton fiber from seeds and plant residues. Used to prepare the raw material before turning it into yarn.' :
                  stageName === 'Spinning' ? 'Process where fiber is turned into yarn. Used to prepare the material that will later be woven.' :
                  stageName === 'Weaving' ? 'Process where yarns are turned into fabric. Used to create the textile base of the garment.' :
                  stageName === 'Garment making' ? 'Process where the garment is cut and sewn. Used to turn fabric into the final product.' :
                  stageName === 'Finishing' ? 'Final treatments applied to the garment. Used to improve feel, color, appearance or performance.' :
                  undefined
                );
                return (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-bg-inner/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-text-link">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-text-primary">
                      {stageTooltip ? <LabelWithTooltip label={stageName} tooltip={stageTooltip} /> : stageName}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary">{f.name}</td>
                    <td className="px-4 py-4 text-sm text-text-secondary">{f.country}</td>
                    <td className="px-4 py-4 text-sm font-mono text-text-primary">{routeDates[idx]}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-bg-inner text-text-secondary text-xs font-medium border border-border-inner">
                        {idx === origin.facilities.length - 1 ? (isEs ? 'Final' : 'Final') : `Tier ${origin.facilities.length - idx}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Cadena de suministro y evidencia ─── */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <FaShieldAlt className="text-text-link" size={16} />
              {t('traceability.custodyAndEvidence')}
            </h3>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              {t('traceability.custodyAndEvidenceSubtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:bg-bg-inner hover:text-text-primary transition-colors shrink-0"
          >
            <FaQuestionCircle size={12} />
            {t('traceability.howItWorks')}
          </button>
        </div>

        {/* 4 cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 — GOTS */}
          {(() => {
            const cert = traceability.certifications[0];
            return (
              <div className="bg-bg-inner border border-border-inner rounded-lg p-4 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-text-link/10 flex items-center justify-center text-text-link self-center">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">
                      {isEs ? cert.material_supported : cert.material_supported_en}
                    </span>
                    <Chip variant="withIcon" color="green" icon={<FaCheckCircle size={10} />}>
                      {t('traceability.active')}
                    </Chip>
                  </div>
                  <p className="font-semibold text-text-primary text-sm mb-1">
                    {isEs ? cert.custody_model : cert.custody_model_en}
                  </p>
                  <p className="text-xs text-text-muted mb-1">
                    {t('traceability.sourceLabel')}: {isEs ? cert.source_evidence : cert.source_evidence_en}
                  </p>
                  <ActionButton
                    variant="textWithIcon"
                    intent="accent"
                    icon={<Eye size={12} />}
                    onClick={() => setPreviewDoc('c1')}
                    className="mt-1"
                  >
                    {t('traceability.viewDocument')}
                  </ActionButton>
                </div>
              </div>
            );
          })()}

          {/* Card 2 — GRS */}
          {(() => {
            const cert = traceability.certifications[1];
            return (
              <div className="bg-bg-inner border border-border-inner rounded-lg p-4 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-text-link/10 flex items-center justify-center text-text-link self-center">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">
                      {isEs ? cert.material_supported : cert.material_supported_en}
                    </span>
                    <Chip variant="withIcon" color="green" icon={<FaCheckCircle size={10} />}>
                      {t('traceability.active')}
                    </Chip>
                  </div>
                  <p className="font-semibold text-text-primary text-sm mb-1">
                    {isEs ? cert.custody_model : cert.custody_model_en}
                  </p>
                  <p className="text-xs text-text-muted mb-1">
                    {t('traceability.sourceLabel')}: {isEs ? cert.source_evidence : cert.source_evidence_en}
                  </p>
                  <ActionButton
                    variant="textWithIcon"
                    intent="accent"
                    icon={<Eye size={12} />}
                    onClick={() => setPreviewDoc('c2')}
                    className="mt-1"
                  >
                    {t('traceability.viewDocument')}
                  </ActionButton>
                </div>
              </div>
            );
          })()}

          {/* Divider row */}
          <div className="col-span-1 md:col-span-2 border-t border-border pt-3 mt-1">
            <h4 className="text-sm font-semibold text-text-primary">
              {t('traceability.additionalEvidence')}
            </h4>
          </div>

          {/* Card 3 — OEKO-TEX */}
          {(() => {
            const cert = traceability.certifications[2];
            return (
              <div className="bg-bg-inner border border-border-inner rounded-lg p-4 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-text-link/10 flex items-center justify-center text-text-link self-center">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">
                      {t('traceability.custodyProductCertLabel')}
                    </span>
                    <Chip variant="withIcon" color="green" icon={<FaCheckCircle size={10} />}>
                      {t('traceability.active')}
                    </Chip>
                  </div>
                  <p className="font-semibold text-text-primary text-sm mb-1">
                    {cert.name}
                  </p>
                  <p className="text-xs text-text-muted mb-1">
                    {t('traceability.sourceLabel')}: {isEs ? cert.source_evidence : cert.source_evidence_en}
                  </p>
                  <ActionButton
                    variant="textWithIcon"
                    intent="accent"
                    icon={<Eye size={12} />}
                    onClick={() => setPreviewDoc('c4')}
                    className="mt-1"
                  >
                    {t('traceability.viewDocument')}
                  </ActionButton>
                </div>
              </div>
            );
          })()}

          {/* Card 4 — SMETA */}
          {(() => {
            const audit = traceability.audits[0];
            return (
              <div className="bg-bg-inner border border-border-inner rounded-lg p-4 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-text-link/10 flex items-center justify-center text-text-link self-center">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">
                      {t('traceability.custodySupplierAuditLabel')}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green shrink-0">
                      <FaCheckCircle size={10} /> {t('traceability.auditStatus')}
                    </span>
                  </div>
                  <p className="font-semibold text-text-primary text-sm mb-1">
                    {audit.type}
                  </p>
                  <p className="text-xs text-text-muted mb-1">
                    {t('traceability.sourceLabel')}: {isEs ? 'Auditoría SMETA 4P' : 'SMETA 4P audit'}
                  </p>
                  <ActionButton
                    variant="textWithIcon"
                    intent="accent"
                    icon={<Eye size={12} />}
                    onClick={() => setPreviewDoc('c3')}
                    className="mt-1"
                  >
                    {t('traceability.viewDocument')}
                  </ActionButton>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Document preview modal */}
      {(() => {
        const docMap: Record<string, { title: string; type: string }> = {
          c1: { title: 'GOTS', type: isEs ? 'Certificación' : 'Certification' },
          c2: { title: 'GRS', type: isEs ? 'Certificación' : 'Certification' },
          c4: { title: 'OEKO-TEX Standard 100', type: isEs ? 'Certificación' : 'Certification' },
          c3: { title: 'SMETA 4P', type: isEs ? 'Auditoría' : 'Audit' },
        };
        const keyToReqId: Record<string, string> = {
          c1: 'req-gots',
          c2: 'req-grs',
          c4: 'req-oekotex',
          c3: 'req-smeta',
        };
        const doc = previewDoc ? docMap[previewDoc] : null;
        const reqId = previewDoc ? keyToReqId[previewDoc] : undefined;
        const req = reqId ? activeProduct?.documentRequirements.find(r => r.id === reqId) : null;
        const effectiveStatus = req ? getEffectiveStatus(req) : 'active';
        const statusLabel = effectiveStatus === 'active' ? t('drawer.statusActive')
          : effectiveStatus === 'expiring' ? t('drawer.statusExpiring')
          : effectiveStatus === 'expired' ? t('drawer.statusExpired')
          : t('drawer.statusPending');
        return doc ? (
          <DocumentPreviewModal
            key={previewDoc}
            isOpen={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            title={doc.title}
            type={doc.type}
            status={effectiveStatus}
            statusLabel={statusLabel}
            isEs={isEs}
          />
        ) : null;
      })()}

      {/* Modal ¿Cómo funciona? */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <FaInfoCircle className="text-text-link" size={16} />
                {t('traceability.howItWorksTitle')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-inner transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>
            <div className="p-5 space-y-5 text-sm text-text-secondary">
              {/* Intro */}
              <div>
                <p className="font-medium text-text-primary mb-1">{t('traceability.howItWorksIntro')}</p>
                <p>{t('traceability.howItWorksPurpose')}</p>
              </div>

              {/* What this block may include */}
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium mb-2">{t('traceability.whatThisBlockMayInclude')}</p>
                <div className="space-y-3">
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('traceability.materialCustody')}</p>
                    <p className="text-text-secondary">{t('traceability.materialCustodyDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('traceability.finalProductEvidence')}</p>
                    <p className="text-text-secondary">{t('traceability.finalProductEvidenceDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('traceability.supplierAudits')}</p>
                    <p className="text-text-secondary">{t('traceability.supplierAuditsDesc')}</p>
                  </div>
                </div>
              </div>

              {/* Main custody models */}
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium mb-2">{t('traceability.mainModels')}</p>
                <div className="space-y-3">
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('traceability.segregation')}</p>
                    <p className="text-text-secondary">{t('traceability.segregationDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('traceability.massBalance')}</p>
                    <p className="text-text-secondary">{t('traceability.massBalanceDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('traceability.bookAndClaim')}</p>
                    <p className="text-text-secondary">{t('traceability.bookAndClaimDesc')}</p>
                  </div>
                </div>
              </div>

              {/* Possible certifications */}
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium mb-2">{t('traceability.possibleCertifications')}</p>
                <div className="space-y-3">
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">GOTS</p>
                    <p className="text-text-secondary">{t('traceability.gotsShortDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">GRS</p>
                    <p className="text-text-secondary">{t('traceability.grsShortDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">OEKO-TEX Standard 100</p>
                    <p className="text-text-secondary">{t('traceability.oekotexShortDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">BCI / Better Cotton</p>
                    <p className="text-text-secondary">{t('traceability.bciShortDesc')}</p>
                  </div>
                </div>
              </div>

              {/* Important note */}
              <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium mb-1">{t('traceability.importantNote')}</p>
                <p className="text-text-secondary">{t('traceability.importantNoteDesc')}</p>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-bg-inner border border-border text-sm text-text-primary hover:border-text-link transition-colors"
              >
                {isEs ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
