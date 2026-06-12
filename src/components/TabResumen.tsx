'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { FaShieldAlt, FaCloud, FaCertificate, FaClock, FaCheckCircle, FaFileAlt, FaChevronRight } from 'react-icons/fa';
import { Chip } from '@/components/Chip';
import { ActionButton } from '@/components/ActionButton';
import { UploadDocumentWizard } from '@/components/UploadDocumentWizard';

function getPendingCountFromDetails(details: Record<string, { filled: number; total: number }>) {
  return Object.values(details).reduce((sum, block) => sum + (block.total - block.filled), 0);
}

function RadarChart({ values }: { values: { label: string; value: number }[] }) {
  const N = values.length;
  const viewSize = 510;
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const radius = 150;
  const labelRadius = 172;

  const getPoint = (index: number, distance: number) => {
    const angle = (index * 2 * Math.PI) / N - Math.PI / 2;
    return { x: cx + distance * Math.cos(angle), y: cy + distance * Math.sin(angle) };
  };

  const dataPoints = values.map((v, i) => getPoint(i, (v.value / 100) * radius));

  return (
    <svg viewBox={`0 0 ${viewSize} ${viewSize}`} overflow="visible" className="w-full max-w-[400px] h-auto shrink-0" preserveAspectRatio="xMidYMid meet">
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon
          key={k}
          points={values.map((_, i) => {
            const p = getPoint(i, k * radius);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke="var(--color-border-inner)"
          strokeWidth={1}
        />
      ))}
      {values.map((_, i) => {
        const p = getPoint(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="var(--color-border-inner)" strokeWidth={1} />;
      })}
      <polygon
        points={dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill="var(--color-accent-violet)"
        fillOpacity={0.15}
        stroke="var(--color-accent-violet)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={4.5} fill="var(--color-accent-violet)" stroke="var(--color-bg-card)" strokeWidth={2} />
      ))}
      {values.map((v, i) => {
        const p = getPoint(i, labelRadius);
        const isLeft = p.x < cx - 5;
        const isRight = p.x > cx + 5;
        const textAnchor = isLeft ? 'end' : isRight ? 'start' : 'middle';
        const dx = isLeft ? -6 : isRight ? 6 : 0;
        return (
          <text key={i} x={p.x + dx} y={p.y} textAnchor={textAnchor} dominantBaseline="middle" fill="var(--color-text-secondary)" fontSize={17} fontWeight={500}>
            {v.label}
          </text>
        );
      })}
    </svg>
  );
}

export default function TabResumen() {
  const { t, i18n } = useTranslation();
  const { activeProduct, getReadinessScore, addDocument, replaceDocument, getPendingDocumentTasks, getEffectiveStatus } = useData();
  const isEs = i18n.language === 'es';

  const productData = activeProduct?.data;
  if (!productData) return null;

  // ── Wizard state ──
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<'create' | 'uploadForTask' | 'replace'>('create');
  const [wizardContext, setWizardContext] = useState<{ taskName?: string }>({});
  const [activeReqId, setActiveReqId] = useState<string | null>(null);

  const openWizard = (mode: 'create' | 'uploadForTask' | 'replace', ctx?: { taskName?: string }, reqId?: string) => {
    setWizardMode(mode);
    setWizardContext(ctx || {});
    setActiveReqId(reqId || null);
    setWizardOpen(true);
  };

  // ── Real metrics from data ──
  const readiness = getReadinessScore?.(activeProduct?.id || '') || { score: 0, total: 0, details: {} };
  const complianceScore = readiness.score;
  const fieldsCovered = `${readiness.total > 0 ? Math.round((readiness.total - getPendingCountFromDetails(readiness.details)) / readiness.total * 100) : 0}%`;
  const carbonFootprint = productData.environmental_impact?.carbon_footprint?.total_kg_co2eq ?? 8.5;
  const certifications = (activeProduct?.documentRequirements || []).filter((r) => getEffectiveStatus(r) === 'active' && (r.type === 'certification' || r.type === 'audit')).length;
  const washCycles = productData.durability?.wash_cycles ?? 50;
  const warrantyYears = productData.durability?.warranty?.duration_years ?? 2;

  // ── Radar dimension values ──
  const radarValues = [
    { label: isEs ? 'Carbono' : 'Carbon', value: 78 },
    { label: isEs ? 'Hídrica' : 'Water', value: 72 },
    { label: isEs ? 'Trazabilidad' : 'Traceability', value: 92 },
    { label: isEs ? 'Durabilidad' : 'Durability', value: 85 },
    { label: isEs ? 'Circularidad' : 'Circularity', value: 68 },
    { label: isEs ? 'Materiales' : 'Materials', value: 88 },
  ];

  // ── Pending tasks from real document requirements ──
  const pendingReqs = getPendingDocumentTasks?.(activeProduct?.id || '') || [];
  const pendingTasks: {
    name: string;
    subtitle: string;
    chip: string;
    chipColor: 'green' | 'amber' | 'blue' | 'violet' | 'gray' | 'red';
    action: string;
    reqId: string;
    status: 'pending' | 'expiring' | 'expired';
  }[] = pendingReqs.map((req) => {
    const status = req.status as 'pending' | 'expiring' | 'expired';
    const isExpired = status === 'expired';
    const isExpiring = status === 'expiring';
    return {
      name: isEs ? req.label : req.labelEn,
      subtitle: isExpired
        ? (isEs ? 'Documento vencido, requiere reemplazo' : 'Expired document, replacement required')
        : isExpiring
          ? (isEs ? 'Documento próximo a vencer, requiere reemplazo' : 'Document expiring soon, replacement required')
          : (isEs ? 'Documento requerido pendiente de carga' : 'Required document pending upload'),
      chip: isExpired ? t('drawer.statusExpired') : isExpiring ? t('drawer.statusExpiring') : t('drawer.statusPending'),
      chipColor: (isExpired ? 'red' : 'amber') as 'red' | 'amber',
      action: isExpired || isExpiring ? t('summary.replace') : t('summary.load'),
      reqId: req.id,
      status,
    };
  });

  const missingCount = pendingTasks.length;

  const handleWizardSave = (doc: any) => {
    if (!activeProduct || !activeReqId) return;
    const payload = {
      type: doc.type || 'Certification',
      filename: doc.name || 'document.pdf',
      issuer: doc.issuer || '',
      issueDate: doc.issueDate || '',
      expiryDate: doc.expiryDate || '',
      category: doc.type || 'other',
      notes: '',
    };
    const req = activeProduct.documentRequirements.find((r) => r.id === activeReqId);
    if (wizardMode === 'replace' && req?.linkedDocumentId) {
      replaceDocument(activeProduct.id, req.linkedDocumentId, payload, activeReqId);
    } else {
      addDocument(activeProduct.id, payload, activeReqId);
    }
    setWizardOpen(false);
    setActiveReqId(null);
  };

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance */}
        <div className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-inner transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary font-medium">{t('summary.complianceScore')}</span>
            <span className="text-text-muted"><FaShieldAlt size={16} /></span>
          </div>
          <div className="text-3xl font-bold text-text-primary tracking-tight">{complianceScore}%</div>
          <div className="text-xs text-accent-green mt-1">{fieldsCovered} {t('summary.fieldsCovered')}</div>
        </div>

        {/* Carbon */}
        <div className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-inner transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary font-medium">{t('summary.carbonFootprint')}</span>
            <span className="text-text-muted"><FaCloud size={16} /></span>
          </div>
          <div className="text-3xl font-bold text-text-primary tracking-tight">{carbonFootprint} <span className="text-lg font-normal text-text-secondary">kg CO₂eq</span></div>
          <div className="text-xs text-accent-green mt-1">-25% {t('summary.vsIndustry')}</div>
        </div>

        {/* Certifications */}
        <div className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-inner transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary font-medium">{t('summary.certificationsActive')}</span>
            <span className="text-text-muted"><FaCertificate size={16} /></span>
          </div>
          <div className="text-3xl font-bold text-text-primary tracking-tight">{certifications}</div>
          <div className="text-xs text-accent-green mt-1">GOTS, GRS, OEKO-TEX</div>
        </div>

        {/* Durability */}
        <div className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-inner transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary font-medium">{t('summary.durability')}</span>
            <span className="text-text-muted"><FaClock size={16} /></span>
          </div>
          <div className="text-3xl font-bold text-text-primary tracking-tight">{washCycles} <span className="text-lg font-normal text-text-secondary">{t('durability.washCycles')}</span></div>
          <div className="text-xs text-accent-green mt-1">{warrantyYears} {t('durability.warrantyYears')}</div>
        </div>
      </div>

      {/* Bottom Row: Publication Status + Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Sustainability Score */}
        <div className="bg-bg-card border border-border rounded-xl p-6 hover:border-border-inner transition-colors flex flex-col items-center">
          <h3 className="text-xl font-semibold text-text-primary self-start">{isEs ? 'Score de sostenibilidad' : 'Sustainability score'}</h3>

          <div className="flex items-center justify-center flex-1 w-full">
            <RadarChart values={radarValues} />
          </div>

          <p className="text-xs text-text-muted text-left mt-3 leading-relaxed whitespace-nowrap">
            {isEs ? 'Síntesis de atributos clave de sostenibilidad del DPP.' : 'Key sustainability attribute overview for this DPP.'}
          </p>
        </div>

        {/* Card 2: Pending Tasks */}
        <div className="bg-bg-card border border-border rounded-xl p-7 hover:border-border-inner transition-colors flex flex-col">
          <h3 className="text-xl font-semibold text-text-primary mb-5">{t('summary.pendingTasks')}</h3>

          <div className="flex-1">
            {pendingTasks.length > 0 && (
              <div className="space-y-2">
                {[...pendingTasks]
                  .sort((a, b) => {
                    const order = { expired: 0, pending: 1, expiring: 2 };
                    return order[a.status] - order[b.status];
                  })
                  .map((task, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-bg-inner border border-border-inner rounded-lg p-3">
                      <FaFileAlt size={14} className="text-text-muted shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-text-primary leading-snug">{task.name}</p>
                          <Chip color={task.chipColor} variant="textOnly">
                            {task.chip}
                          </Chip>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 leading-snug">{task.subtitle}</p>
                      </div>
                      <ActionButton variant="secondary" intent="accent" onClick={() => {
                        const mode = task.action === t('summary.replace') ? 'replace' : 'uploadForTask';
                        openWizard(mode, { taskName: task.name }, task.reqId);
                      }}>
                        {task.action}
                      </ActionButton>
                    </div>
                  ))}
              </div>
            )}

            {pendingTasks.length === 0 && (
              <div className="flex items-center gap-3 bg-accent-green/10 border border-accent-green/20 rounded-lg p-4">
                <FaCheckCircle size={16} className="text-accent-green" />
                <p className="text-sm text-accent-green">{isEs ? 'Todas las tareas completadas' : 'All tasks completed'}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-6 pt-5 border-t border-border">
            <ActionButton variant="textOnly" intent="accent" icon={<FaChevronRight size={10} />}>
              {t('summary.viewAllTasks')}
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Upload Document Wizard */}
      <UploadDocumentWizard
        isOpen={wizardOpen}
        onClose={() => { setWizardOpen(false); setActiveReqId(null); }}
        onSave={handleWizardSave}
        mode={wizardMode}
        context={wizardContext}
      />
    </div>
  );
}
