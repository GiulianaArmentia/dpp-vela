'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { Tooltip } from '@/components/Tooltip';
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal';
import { Chip, CategoryProgressBar } from '@/components/Chip';
import { ActionButton } from '@/components/ActionButton';
import { UploadDocumentWizard } from '@/components/UploadDocumentWizard';
import {
  FaUpload,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaFolder,
  FaCertificate,
  FaClipboardCheck,
  FaFlask,
  FaLeaf,
  FaTools,
  FaRecycle,
  FaBalanceScale,
  FaBuilding,
  FaTrash,
  FaSync,
  FaPlus,
  FaPaperPlane,
  FaTimes,
} from 'react-icons/fa';

const statusConfig = {
  active: { color: 'green' as const, icon: <FaCheckCircle className="w-3 h-3" /> },
  expiring: { color: 'amber' as const, icon: <FaExclamationTriangle className="w-3 h-3" /> },
  expired: { color: 'red' as const, icon: <FaExclamationTriangle className="w-3 h-3" /> },
  pending: { color: 'amber' as const, icon: <FaClock className="w-3 h-3" /> },
};

const familyIcons: Record<string, React.ReactNode> = {
  chain: <FaCertificate className="text-text-link" size={18} />,
  chemicals: <FaFlask className="text-text-link" size={18} />,
  materials: <FaFileAlt className="text-text-link" size={18} />,
  impact: <FaLeaf className="text-text-link" size={18} />,
  durability: <FaTools className="text-text-link" size={18} />,
  endOfLife: <FaRecycle className="text-text-link" size={18} />,
  regulatory: <FaBalanceScale className="text-text-link" size={18} />,
  product: <FaBuilding className="text-text-link" size={18} />,
};

const familyNameKeys: Record<string, string> = {
  chain: 'documentHub.families.chain',
  chemicals: 'documentHub.families.chemicals',
  materials: 'documentHub.families.materials',
  impact: 'documentHub.families.impact',
  durability: 'documentHub.families.durability',
  endOfLife: 'documentHub.families.endOfLife',
  regulatory: 'documentHub.families.regulatory',
  product: 'documentHub.families.product',
};

export default function TabCentralDocumentacion() {
  const { t, i18n } = useTranslation();
  const { activeProduct, addDocument, replaceDocument, deleteDocument, getDocumentStats, getEffectiveStatus } = useData();
  const isEs = i18n.language === 'es';

  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<'create' | 'uploadForTask' | 'replace'>('create');
  const [wizardContext, setWizardContext] = useState<{ taskName?: string; taskDocType?: string }>({});
  const [activeReqId, setActiveReqId] = useState<string | null>(null);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<{ reqId: string; docId: string; name: string } | null>(null);

  const reqs = activeProduct?.documentRequirements || [];
  const registry = activeProduct?.documentRegistry || [];

  const openWizard = (mode: 'create' | 'uploadForTask' | 'replace', ctx?: { taskName?: string; taskDocType?: string }, reqId?: string) => {
    setWizardMode(mode);
    setWizardContext(ctx || {});
    setActiveReqId(reqId || null);
    setWizardOpen(true);
  };

  const handleUploadDocument = () => {
    openWizard('create');
  };

  const stats = getDocumentStats?.(activeProduct?.id || '') || { total: 0, active: 0, expiring: 0, expired: 0, pending: 0 };
  const statItems = [
    { label: t('documentHub.totals'), value: stats.total, icon: <FaFolder size={16} /> },
    { label: t('documentHub.valid'), value: stats.active, icon: <FaCheckCircle size={16} /> },
    { label: t('documentHub.expiringSoon'), value: stats.expiring, icon: <FaExclamationTriangle size={16} /> },
    { label: t('documentHub.expired'), value: stats.expired, icon: <FaExclamationTriangle size={16} /> },
    { label: t('documentHub.pending'), value: stats.pending, icon: <FaClock size={16} /> },
  ];

  // Group by category
  const familiesMap: Record<string, typeof reqs> = {};
  reqs.forEach((req) => {
    const cat = req.category || 'other';
    if (!familiesMap[cat]) familiesMap[cat] = [];
    familiesMap[cat].push(req);
  });

  const handleWizardSave = (doc: any) => {
    if (!activeProduct) return;
    const payload = {
      type: doc.type || 'Certification',
      filename: doc.name || 'document.pdf',
      issuer: doc.issuer || '',
      issueDate: doc.issueDate || '',
      expiryDate: doc.expiryDate || '',
      category: doc.type || 'other',
      notes: '',
    };

    if (wizardMode === 'replace' && activeReqId) {
      const req = reqs.find((r) => r.id === activeReqId);
      const oldDocId = req?.linkedDocumentId || null;
      if (oldDocId) {
        replaceDocument(activeProduct.id, oldDocId, payload, activeReqId);
      } else {
        addDocument(activeProduct.id, payload, activeReqId);
      }
    } else if (activeReqId) {
      addDocument(activeProduct.id, payload, activeReqId);
    } else {
      // create without specific req — find first pending matching type or add to first pending
      const firstPending = reqs.find((r) => getEffectiveStatus(r) === 'pending');
      if (firstPending) {
        addDocument(activeProduct.id, payload, firstPending.id);
      }
    }
    setWizardOpen(false);
    setActiveReqId(null);
  };

  const handleDelete = (reqId: string) => {
    const req = reqs.find((r) => r.id === reqId);
    if (!req || !req.linkedDocumentId || !activeProduct) return;
    const doc = registry.find((d) => d.id === req.linkedDocumentId);
    setConfirmDelete({ reqId, docId: req.linkedDocumentId, name: doc?.filename || req.label });
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete || !activeProduct) return;
    deleteDocument(activeProduct.id, confirmDelete.docId, confirmDelete.reqId);
    setConfirmDelete(null);
  };

  const renderActions = (req: typeof reqs[0], effectiveStatus: 'active' | 'expiring' | 'expired' | 'pending') => {
    if (effectiveStatus === 'active') {
      return (
          <ActionButton
            variant="secondary"
            intent="danger"
            icon={<FaTrash size={12} />}
            onClick={() => handleDelete(req.id)}
          >
            {t('drawer.actionDelete')}
          </ActionButton>
      );
    }
    if (effectiveStatus === 'expiring' || effectiveStatus === 'expired') {
      return (
        <div className="flex items-center gap-2">
          <ActionButton
            variant="secondary"
            intent="accent"
            icon={<FaSync size={12} />}
            onClick={() => openWizard('replace', { taskName: isEs ? req.label : req.labelEn }, req.id)}
          >
            {t('drawer.actionReplace')}
          </ActionButton>
          <ActionButton
            variant="secondary"
            intent="neutral"
            icon={<FaPaperPlane size={12} />}
            onClick={() => console.log('Solicitar', req.id)}
          >
            {t('drawer.actionRequest')}
          </ActionButton>
        </div>
      );
    }
    // pending
    return (
      <div className="flex items-center gap-2">
        <ActionButton
          variant="secondary"
          intent="accent"
          icon={<FaUpload size={12} />}
          onClick={() => openWizard('uploadForTask', { taskName: isEs ? req.label : req.labelEn }, req.id)}
        >
          {t('drawer.actionUpload')}
        </ActionButton>
        <ActionButton
          variant="secondary"
          intent="neutral"
          icon={<FaPaperPlane size={12} />}
          onClick={() => console.log('Solicitar', req.id)}
        >
          {t('drawer.actionRequest')}
        </ActionButton>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{t('documentHub.title')}</h2>
          <p className="text-sm text-text-muted mt-0.5">{t('tabs.documentHubSubtitle')}</p>
        </div>
        <button
          onClick={handleUploadDocument}
          className="inline-flex items-center gap-2 text-text-link text-sm font-medium hover:underline transition-colors"
        >
          <FaUpload size={14} />
          {t('drawer.uploadDocument')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statItems.map((stat, idx) => {
          const statTooltip = isEs ? (
            idx === 0 ? 'Cantidad total de archivos cargados. Sirve para tener una vista rápida del volumen de documentación.' :
            idx === 1 ? 'Documentos válidos actualmente. Sirve para saber cuántas evidencias todavía pueden usarse.' :
            idx === 2 ? 'Documentos que ya superaron su fecha de validez. Sirve para identificar qué debe renovarse.' :
            idx === 3 ? 'Documentos necesarios que todavía no fueron cargados. Sirve para saber qué información falta completar.' :
            undefined
          ) : (
            idx === 0 ? 'Total number of uploaded files. Used to quickly see the amount of documentation.' :
            idx === 1 ? 'Documents that are currently valid. Used to know how many pieces of evidence can still be used.' :
            idx === 2 ? 'Documents that passed their validity date. Used to identify what needs renewal.' :
            idx === 3 ? 'Required documents that have not been uploaded yet. Used to know what information still needs to be completed.' :
            undefined
          );
          return (
            <div key={stat.label} className="bg-bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2 text-text-muted text-sm">
                {stat.icon}
                <span>{stat.label}{statTooltip && <Tooltip text={statTooltip} />}</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Document families */}
      <div className="space-y-4">
        {Object.entries(familiesMap).map(([category, categoryReqs]) => (
          <div key={category} className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {familyIcons[category] || <FaFileAlt className="text-text-link" size={18} />}
                <h3 className="text-lg font-semibold text-text-primary">{t(familyNameKeys[category] || category)}</h3>
              </div>
              <CategoryProgressBar
                percentage={Math.round(
                  ((categoryReqs.filter((d) => {
                    const s = getEffectiveStatus(d);
                    return s === 'active' || s === 'expiring' || s === 'expired';
                  }).length) / categoryReqs.length) * 100
                )}
              />
            </div>

            {/* Table header */}
            <div className="hidden sm:grid grid-cols-5 text-xs text-text-muted mb-2 px-3">
              <div>{t('documentHub.columns.document')}</div>
              <div>{t('documentHub.columns.type')}</div>
              <div>{t('documentHub.columns.source')}</div>
              <div>{t('documentHub.columns.status')}</div>
              <div>{t('documentHub.columns.actions')}</div>
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {categoryReqs.map((req, idx) => {
                const effectiveStatus = getEffectiveStatus(req);
                const cfg = statusConfig[effectiveStatus];
                const statusLabel = effectiveStatus === 'active' ? t('drawer.statusActive') : effectiveStatus === 'expiring' ? t('drawer.statusExpiring') : effectiveStatus === 'expired' ? t('drawer.statusExpired') : t('drawer.statusPending');
                const docName = isEs ? req.label : req.labelEn;
                const linkedDoc = req.linkedDocumentId ? registry.find((d) => d.id === req.linkedDocumentId) : null;
                return (
                  <div
                    key={req.id}
                    className="flex flex-col sm:grid sm:grid-cols-5 gap-2 sm:gap-0 items-start sm:items-center py-3 px-3 rounded-lg bg-bg-inner border border-border-inner"
                  >
                    <div className="flex items-center gap-2 text-sm text-text-primary w-full">
                      <FaFileAlt className="text-text-muted shrink-0" size={14} />
                      <button
                        onClick={() => setPreviewDoc(req.id)}
                        className="truncate text-left hover:text-text-link transition-colors underline underline-offset-2 decoration-text-link/30"
                      >
                        {docName}
                      </button>
                      {req.tooltipKey && (
                        <Tooltip text={t(req.tooltipKey)} ariaLabel={isEs ? `Más información sobre ${docName}` : `More information about ${docName}`} />
                      )}
                    </div>
                    <div className="w-full">
                      <Chip color="gray" variant="textOnly">
                        {t(`documentHub.types.${req.type}`) || req.type}
                      </Chip>
                    </div>
                    <div className="text-xs text-text-muted w-full">{req.sourceKey ? t(req.sourceKey) : '-'}</div>
                    <div className="w-full">
                      <Chip variant="withIcon" color={cfg.color} icon={cfg.icon}>
                        {statusLabel}
                      </Chip>
                    </div>
                    <div className="w-full">{renderActions(req, effectiveStatus)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Document preview modal */}
      {(() => {
        if (!previewDoc) return null;
        const req = reqs.find((r) => r.id === previewDoc);
        if (!req) return null;
        const effectiveStatus = getEffectiveStatus(req);
        const statusLabel = effectiveStatus === 'active' ? t('drawer.statusActive') : effectiveStatus === 'expiring' ? t('drawer.statusExpiring') : effectiveStatus === 'expired' ? t('drawer.statusExpired') : t('drawer.statusPending');
        return (
          <DocumentPreviewModal
            isOpen={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            title={isEs ? req.label : req.labelEn}
            type={t(`documentHub.types.${req.type}`) || req.type}
            status={effectiveStatus}
            statusLabel={statusLabel}
            isEs={isEs}
          />
        );
      })()}

      {/* Upload Document Wizard */}
      <UploadDocumentWizard
        isOpen={wizardOpen}
        onClose={() => { setWizardOpen(false); setActiveReqId(null); }}
        onSave={handleWizardSave}
        mode={wizardMode}
        context={wizardContext}
      />

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bg-card/80 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-[400px] bg-bg-card border border-border rounded-xl shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">{isEs ? 'Eliminar documento' : 'Delete document'}</h3>
              <button onClick={() => setConfirmDelete(null)} className="w-8 h-8 rounded-lg bg-bg-inner border border-border-inner flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border transition-colors">
                <FaTimes size={14} />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              {isEs
                ? 'Este documento dejará de respaldar los datos del DPP. Las secciones que dependan de él pasarán a estado pendiente.'
                : 'This document will no longer support the DPP data. Sections depending on it will become pending.'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg text-xs font-medium border border-border text-text-secondary hover:text-text-primary hover:bg-bg-inner transition-colors">
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
              <button onClick={confirmDeleteAction} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-red-500 border border-red-500 text-[#18181B] hover:bg-red-400 transition-colors">
                <FaTrash size={12} />
                {isEs ? 'Eliminar documento' : 'Delete document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
