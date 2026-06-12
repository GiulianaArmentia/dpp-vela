'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { useDrawer } from '@/lib/DrawerContext';
import { FaEdit, FaCheckCircle, FaQuestionCircle, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { Eye, FileText } from 'lucide-react';
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal';
import { Chip } from '@/components/Chip';
import { ActionButton } from '@/components/ActionButton';

function StatusBadge({ status }: { status: 'certified' | 'declared' | 'pending' }) {
  const colorMap = {
    certified: 'green' as const,
    declared: 'amber' as const,
    pending: 'red' as const,
  };
  const labels = { certified: 'Certificado', declared: 'Declarado', pending: 'Pendiente' };
  return (
    <Chip variant="withIcon" color={colorMap[status]} icon={<FaCheckCircle size={10} />}>
      {labels[status]}
    </Chip>
  );
}

export default function TabMateriales() {
  const { t, i18n } = useTranslation();
  const { activeProduct, getEffectiveStatus } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const { openDrawer } = useDrawer();
  const materials = productData.composition.materials;
  const totalWeight = materials.reduce((sum: number, m: any) => sum + m.weight_g, 0);

  const [showModal, setShowModal] = useState(false);
  const [showTreatmentsModal, setShowTreatmentsModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const donutData = materials;
  const colors = ['#34D399', '#60A5FA', '#FBBF24'];
  const circumference = 2 * Math.PI * 40;
  let cumulative = 0;

  const handleManageMaterials = () => {
    openDrawer({ mode: 'section', section: 'materiales' });
  };

  // Treatment data now comes from productData.composition.chemical_treatments

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{t('tabs.materials')}</h2>
          <p className="text-sm text-text-muted mt-0.5">{t('tabs.materialsSubtitle')}</p>
        </div>
        <button
          onClick={handleManageMaterials}
          className="inline-flex items-center gap-2 text-text-link text-sm font-medium hover:underline transition-colors"
        >
          <FaEdit size={14} />
          {t('drawer.manageMaterials')}
        </button>
      </div>

      {/* Card 1 — Composición del producto */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">{t('composition.productComposition')}</h3>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:bg-bg-inner hover:text-text-primary transition-colors shrink-0"
          >
            <FaQuestionCircle size={12} />
            {t('composition.howItWorks')}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Materials list */}
          <div className="space-y-3">
            {materials.map((m: any, idx: number) => {
              const originLine = m.source_short || m.source
                ? `${isEs ? m.origin : m.origin_en} · ${isEs ? (m.source_short || m.source) : (m.source_short_en || m.source_en)}`
                : `${isEs ? m.origin : m.origin_en}`;
              const docId = m.source_evidence === 'Certificación GOTS' ? 'c1'
                : m.source_evidence === 'Certificación GRS' ? 'c2'
                : null;
              return (
                <div key={idx} className="flex items-start justify-between p-3 bg-bg-inner rounded-lg border border-border-inner">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary">{isEs ? m.name : m.name_en}</p>
                    <p className="text-xs text-text-muted">
                      {t('composition.originLabel')}: {originLine}
                    </p>
                    <p className="text-xs text-text-muted">
                      {t('composition.sourceLabel')}: {isEs ? m.source_evidence : m.source_evidence_en}
                    </p>
                    {docId ? (
                      <ActionButton
                        variant="textWithIcon"
                        intent="accent"
                        icon={<Eye size={12} />}
                        onClick={() => setPreviewDoc(docId)}
                        className="mt-0.5"
                      >
                        {t('traceability.viewDocument')}
                      </ActionButton>
                    ) : (
                      <p className="text-xs text-text-muted mt-0.5">{t('composition.noAssociatedDocument')}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-semibold text-text-primary">{m.percentage}%</p>
                    <p className="text-xs text-text-muted">{m.weight_g} g</p>
                  </div>
                </div>
              );
            })}
            <div className="bg-bg-inner rounded-lg p-3 border border-border-inner flex justify-between items-center text-sm">
              <span className="text-text-primary font-medium">{t('composition.weight')}</span>
              <span className="font-semibold text-text-primary">{totalWeight} g</span>
            </div>
          </div>

          {/* Right: Visual composition card */}
          <div className="bg-bg-inner rounded-lg border border-border-inner p-5 flex flex-col">
            <h4 className="text-sm font-semibold text-text-muted mb-1">{t('composition.visualComposition')}</h4>
            <p className="text-xs text-text-muted mb-4">{t('composition.visualDistribution')}</p>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {donutData.map((m: any, idx: number) => {
                    const dash = (m.percentage / 100) * circumference;
                    const offset = -(cumulative / 100) * circumference;
                    cumulative += m.percentage;
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={colors[idx % colors.length]}
                        strokeWidth="12"
                        strokeDasharray={`${dash} ${circumference}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                {materials.map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ background: colors[idx % colors.length] }} />
                    <span className="text-text-muted">{isEs ? m.name : m.name_en}</span>
                    <span className="font-medium text-text-primary">{m.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2 — Tratamientos y control químico */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">{t('composition.treatmentsAndControl')}</h3>
          <button
            onClick={() => setShowTreatmentsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:bg-bg-inner hover:text-text-primary transition-colors shrink-0"
          >
            <FaQuestionCircle size={12} />
            {t('composition.howItWorks')}
          </button>
        </div>

        {/* Block: Applied treatments */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-text-muted mb-3">{t('composition.appliedTreatments')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {productData.composition.chemical_treatments.map((treat: any, idx: number) => {
              const hasDoc = treat.has_document;
              const docKeys = ['c6t1', 'c6t2', 'c6t3'];
              return (
                <div key={idx} className="bg-bg-inner rounded-lg p-4 border border-border-inner">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-[#60A5FA]/10 flex items-center justify-center text-accent-blue self-center">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text-primary text-sm">{isEs ? treat.es : treat.en}</p>
                      <div className="mt-2">
                        <p className="text-xs text-text-muted">
                          {t('composition.sourceLabel')}: {isEs ? treat.source_evidence : treat.source_evidence_en}
                        </p>
                        {hasDoc ? (
                          <ActionButton
                            variant="textWithIcon"
                            intent="accent"
                            icon={<Eye size={12} />}
                            onClick={() => setPreviewDoc(docKeys[idx])}
                            className="mt-0.5"
                          >
                            {t('composition.viewTreatmentSheet')}
                          </ActionButton>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs text-text-muted mt-0.5 cursor-not-allowed group relative"
                            tabIndex={0}
                          >
                            <Eye size={12} /> {t('composition.viewTreatmentSheet')}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-md bg-bg-card border border-border text-xs text-text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-50">
                              {t('composition.noAttachedDoc')}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtle divider */}
        <div className="border-t border-border my-4" />

        {/* Block: Chemical control */}
        <div>
          <h4 className="text-sm font-semibold text-text-muted mb-3">{t('composition.chemicalControl')}</h4>
          <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-text-link/10 flex items-center justify-center text-text-link self-center">
                <FileText size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">
                    {t('composition.chemicalControlLabel')}
                  </span>
                  <StatusBadge status="certified" />
                </div>
                <p className="font-semibold text-text-primary text-sm">{t('composition.chemicalControlTitle')}</p>
                <p className="text-accent-green font-medium text-sm mt-0.5">{t('composition.chemicalControlSubtitle')}</p>
                <p className="text-xs text-text-muted mt-2">
                  {t('composition.chemicalControlVerified')}: {productData.composition.svhc_verification_date}
                </p>
                {productData.composition.svhc_source_evidence && (
                  <div className="mt-2">
                    <p className="text-xs text-text-muted">
                      {t('composition.sourceLabel')}: {isEs ? productData.composition.svhc_source_evidence : productData.composition.svhc_source_evidence_en}
                    </p>
                    <ActionButton
                      variant="textWithIcon"
                      intent="accent"
                      icon={<Eye size={12} />}
                      onClick={() => setPreviewDoc('c5')}
                      className="mt-0.5"
                    >
                      {t('traceability.viewDocument')}
                    </ActionButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document preview modal */}
      {(() => {
        const docMap: Record<string, { title: string; type: string }> = {
          c1: { title: 'GOTS', type: isEs ? 'Certificación' : 'Certification' },
          c2: { title: 'GRS', type: isEs ? 'Certificación' : 'Certification' },
          c5: { title: 'SVHC / REACH', type: isEs ? 'Declaración' : 'Declaration' },
          c6t1: { title: isEs ? 'Ficha técnica de tintura' : 'Dyeing technical sheet', type: isEs ? 'Técnica' : 'Technical' },
          c6t2: { title: isEs ? 'Ficha técnica de suavizante' : 'Softener technical sheet', type: isEs ? 'Técnica' : 'Technical' },
          c6t3: { title: isEs ? 'Ficha técnica de acabado enzimático' : 'Enzymatic finish technical sheet', type: isEs ? 'Técnica' : 'Technical' },
        };
        const keyToReqId: Record<string, string> = {
          c1: 'req-gots',
          c2: 'req-grs',
          c5: 'req-svhc',
          c6t1: 'req-dye',
          c6t2: 'req-soft',
          c6t3: 'req-enz',
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

      {/* Modal ¿Cómo funciona? — Composición */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <FaInfoCircle className="text-text-link" size={16} />
                {t('composition.howItWorksTitle')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-inner transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>
            <div className="p-5 space-y-5 text-sm text-text-secondary">
              <div>
                <p className="font-medium text-text-primary mb-1">{t('composition.howItWorksIntro')}</p>
                <p>{t('composition.howItWorksPurpose')}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium mb-2">{t('composition.whatThisSectionMayInclude')}</p>
                <div className="space-y-3">
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('composition.materialsAndPercentages')}</p>
                    <p className="text-text-secondary">{t('composition.materialsAndPercentagesDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('composition.fiberOrigin')}</p>
                    <p className="text-text-secondary">{t('composition.fiberOriginDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('composition.chemicalTreatmentsInfo')}</p>
                    <p className="text-text-secondary">{t('composition.chemicalTreatmentsInfoDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('composition.chemicalSafety')}</p>
                    <p className="text-text-secondary">{t('composition.chemicalSafetyDesc')}</p>
                  </div>
                  <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                    <p className="font-medium text-text-primary mb-0.5">{t('composition.additionalComponentsInfo')}</p>
                    <p className="text-text-secondary">{t('composition.additionalComponentsInfoDesc')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium mb-1">{t('composition.importantNote')}</p>
                <p className="text-text-secondary">{t('composition.importantNoteDesc')}</p>
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

      {/* Modal ¿Cómo funciona? — Tratamientos */}
      {showTreatmentsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowTreatmentsModal(false)} />
          <div className="relative bg-bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <FaInfoCircle className="text-text-link" size={16} />
                {isEs ? '¿Cómo funcionan los tratamientos y control químico?' : 'How do treatments and chemical control work?'}
              </h3>
              <button
                onClick={() => setShowTreatmentsModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-inner transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>
            <div className="p-5 space-y-5 text-sm text-text-secondary">
              <div>
                <p className="font-medium text-text-primary mb-1">
                  {isEs ? 'Los tratamientos aplicados muestran qué procesos químicos o mecánicos recibió la tela o prenda durante la fabricación.' : 'Applied treatments show which chemical or mechanical processes the fabric or garment received during manufacturing.'}
                </p>
                <p>
                  {isEs ? 'Sirven para entender si el producto tiene modificaciones de color, tacto, apariencia o desempeño.' : 'They help understand whether the product has color, feel, appearance or performance modifications.'}
                </p>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-1">
                  {isEs ? 'El control químico indica si el producto fue evaluado para sustancias restringidas o de preocupación.' : 'Chemical control indicates whether the product was evaluated for restricted or concerning substances.'}
                </p>
                <p>
                  {isEs ? 'SVHC (sustancias de muy alta preocupación) y REACH (regulación europea de sustancias químicas) son controles que sirven para proteger la salud y el ambiente.' : 'SVHC (substances of very high concern) and REACH (European chemicals regulation) are controls that serve to protect health and the environment.'}
                </p>
              </div>
              <div className="bg-bg-inner rounded-lg p-3 border border-border-inner">
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium mb-1">{t('composition.importantNote')}</p>
                <p className="text-text-secondary">
                  {isEs ? 'No todos los productos tienen los mismos tratamientos, certificaciones o componentes. Cada producto debe mostrar solo los datos que aplican a su composición y proceso.' : 'Not all products have the same treatments, certifications or components. Each product should only show data that applies to its composition and process.'}
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end">
              <button
                onClick={() => setShowTreatmentsModal(false)}
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
