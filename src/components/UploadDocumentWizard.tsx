'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUpload, FaFileAlt, FaTimes, FaChevronRight, FaCheckCircle, FaExclamationTriangle, FaTrash, FaFilePdf } from 'react-icons/fa';

export type WizardMode = 'create' | 'uploadForTask' | 'replace';

export interface WizardContext {
  taskName?: string;
  taskDocType?: string;
  docName?: string;
  family?: string;
}

interface UploadDocumentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (doc: any) => void;
  mode?: WizardMode;
  context?: WizardContext;
}

const steps = ['upload', 'extraction', 'validation'] as const;

const docTypeMap: Record<string, string> = {
  gots: 'gots',
  grs: 'grs',
  oekotex: 'oekotex',
  svhc: 'svhc',
  reach: 'reach',
  dyeing: 'dyeing',
  softener: 'softener',
  enzymatic: 'enzymatic',
  takeback: 'takeback',
  traceability: 'traceability',
  pef: 'pef',
  chemical: 'chemical',
  audit: 'audit',
  operator: 'operator',
  other: 'other',
};

const docTypeOptions = [
  { key: 'gots', label: 'Certificación GOTS' },
  { key: 'grs', label: 'Certificación GRS' },
  { key: 'oekotex', label: 'Certificación OEKO-TEX' },
  { key: 'svhc', label: 'Declaración SVHC' },
  { key: 'reach', label: 'Declaración REACH' },
  { key: 'dyeing', label: 'Ficha técnica de tintura' },
  { key: 'softener', label: 'Ficha técnica de suavizante' },
  { key: 'enzymatic', label: 'Ficha técnica de acabado enzimático' },
  { key: 'takeback', label: 'Política take-back' },
  { key: 'traceability', label: 'Evidencia de trazabilidad' },
  { key: 'pef', label: 'Metodología PEF / verificación' },
  { key: 'chemical', label: 'Ensayo químico' },
  { key: 'audit', label: 'Auditoría de proveedor' },
  { key: 'operator', label: 'Documento de operador económico' },
  { key: 'other', label: 'Otro' },
];

export function UploadDocumentWizard({ isOpen, onClose, onSave, mode = 'create', context }: UploadDocumentWizardProps) {
  const { t } = useTranslation();

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [extractedFields, setExtractedFields] = useState({
    docType: 'Certification',
    docName: 'GOTS 2026',
    issuer: 'Control Union',
    issueDate: '2026-01-15',
    expiryDate: '2027-01-15',
    category: 'Chain & traceability',
    linkedProducts: 'VT-CAM-001',
    notes: 'Organic textile standard certification',
    confidence: 'high' as 'high' | 'medium' | 'low',
  });

  const [detectedDocType, setDetectedDocType] = useState('gots');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const reset = useCallback(() => {
    setStep(0);
    setFile(null);
    setDragActive(false);
    setIsLoading(false);
    setExtractedFields({
      docType: 'Certification',
      docName: 'GOTS 2026',
      issuer: 'Control Union',
      issueDate: '2026-01-15',
      expiryDate: '2027-01-15',
      category: 'Chain & traceability',
      linkedProducts: 'VT-CAM-001',
      notes: 'Organic textile standard certification',
      confidence: 'high',
    });
    setDetectedDocType('gots');
    setValidationErrors([]);
    setValidationWarnings([]);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  // Preselect detectedDocType when context changes
  useEffect(() => {
    if (context?.taskDocType && docTypeMap[context.taskDocType]) {
      setDetectedDocType(docTypeMap[context.taskDocType]);
    } else if (context?.taskName) {
      // Try to infer from task name
      const name = context.taskName.toLowerCase();
      if (name.includes('gots')) setDetectedDocType('gots');
      else if (name.includes('grs')) setDetectedDocType('grs');
      else if (name.includes('oekotex') || name.includes('oeko-tex')) setDetectedDocType('oekotex');
      else if (name.includes('svhc')) setDetectedDocType('svhc');
      else if (name.includes('reach')) setDetectedDocType('reach');
      else if (name.includes('tintura') || name.includes('dyeing')) setDetectedDocType('dyeing');
      else if (name.includes('suavizante') || name.includes('softener')) setDetectedDocType('softener');
      else if (name.includes('enzimático') || name.includes('enzymatic')) setDetectedDocType('enzymatic');
      else if (name.includes('smeta') || name.includes('audit')) setDetectedDocType('audit');
      else if (name.includes('pef')) setDetectedDocType('pef');
      else setDetectedDocType('other');
    }
  }, [context]);

  if (!isOpen) return null;

  const stepKeys = ['upload', 'extraction', 'validation'] as const;
  const stepTitle = (idx: number) => t(`wizard.steps.${stepKeys[idx]}`);
  const stepSubtitle = (idx: number) => {
    const subs = [
      t('wizard.uploadArea.dragOrClick'),
      t('wizard.fields.docName'),
      t('wizard.validation.ready'),
    ];
    return subs[idx];
  };

  const progressPercent = ((step + 1) / steps.length) * 100;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const simulateExtraction = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(1);
    }, 1200);
  };

  const simulateValidation = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!extractedFields.docName.trim()) errors.push(t('wizard.validation.docNameMissing'));
    if (!extractedFields.issuer.trim()) errors.push(t('wizard.validation.issuerMissing'));
    if (!extractedFields.expiryDate) warnings.push(t('wizard.validation.expiryMissing'));
    if (extractedFields.confidence === 'low') warnings.push(t('wizard.validation.lowConfidence'));

    setValidationErrors(errors);
    setValidationWarnings(warnings);
    setStep(2);
  };

  const handleSave = () => {
    const newDoc = {
      name: extractedFields.docName || (file?.name ?? 'Document'),
      type: extractedFields.docType,
      status: validationErrors.length > 0 ? 'pending' : 'active',
      issuer: extractedFields.issuer,
      issueDate: extractedFields.issueDate,
      expiryDate: extractedFields.expiryDate,
    };
    onSave?.(newDoc);
    handleClose();
  };

  const canContinue = (() => {
    if (step === 0) return !!file;
    if (step === 1) return !!extractedFields.docName.trim() && !!extractedFields.issuer.trim();
    if (step === 2) return validationErrors.length === 0;
    return false;
  })();

  const footerPrimaryLabel = (() => {
    if (step === 2) {
      if (mode === 'replace') return t('wizard.buttons.saveReplacement');
      return t('wizard.buttons.saveDocument');
    }
    return t('wizard.buttons.continue');
  })();

  const footerSecondaryLabel = (() => {
    if (step === 0) return t('wizard.buttons.cancel');
    return t('wizard.buttons.back');
  })();

  const headerTitle = (() => {
    if (mode === 'replace') return t('wizard.titles.replace');
    if (mode === 'uploadForTask') return t('wizard.titles.uploadForTask');
    return t('wizard.title');
  })();

  const headerSubtitle = (() => {
    if (mode === 'replace') return t('wizard.subtitles.replace');
    if (mode === 'uploadForTask') return t('wizard.subtitles.uploadForTask', { task: context?.taskName || '' });
    return t('wizard.subtitle');
  })();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-card/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[720px] max-h-[90vh] flex flex-col bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{headerTitle}</h2>
              <p className="text-xs text-text-muted mt-0.5">{headerSubtitle}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-bg-inner border border-border-inner flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border transition-colors shrink-0 ml-3"
              aria-label={t('wizard.buttons.cancel')}
            >
              <FaTimes size={14} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-muted">
                {t('wizard.step', { step: step + 1, total: steps.length })} — {stepTitle(step)}
              </span>
              <span className="text-xs text-text-muted">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-inner overflow-hidden">
              <div
                className="h-full rounded-full bg-[#34D399] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 1 — Upload */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary font-medium">{t('wizard.steps.upload')}</p>

              {/* Drop zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-text-link bg-text-link/5' : 'border-border-inner bg-bg-inner hover:border-border hover:bg-text-link/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.xml"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex items-center gap-3 justify-center">
                    <FaFilePdf size={24} className="text-text-link" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-text-primary">{file.name}</p>
                      <p className="text-xs text-text-muted">
                        {(file.size / 1024).toFixed(1)} KB · {file.type || 'PDF'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="ml-2 w-7 h-7 rounded-md bg-bg-inner border border-border-inner flex items-center justify-center text-text-muted hover:text-red-400 hover:border-red-400/40 transition-colors"
                      title={t('wizard.uploadArea.removeFile')}
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FaUpload size={28} className="text-text-link mx-auto" />
                    <p className="text-sm text-text-primary font-medium">{t('wizard.uploadArea.dragOrClick')}</p>
                    <p className="text-xs text-text-muted">{t('wizard.uploadArea.formats')}</p>
                    <p className="text-xs text-text-muted">{t('wizard.uploadArea.maxSize')}</p>
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="flex items-center gap-3 p-3 bg-text-link/5 border border-text-link/20 rounded-lg">
                  <div className="w-4 h-4 border-2 border-text-link border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-text-secondary">{t('wizard.processing')}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Extraction */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary font-medium">{t('wizard.steps.extraction')}</p>

              {/* Document type field */}
              {mode === 'create' ? (
                <div>
                  <label className="text-xs text-text-muted block mb-1">
                    {t('wizard.fields.detectedDocType')}
                  </label>
                  <select
                    className="w-full bg-bg-inner border border-border-inner rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-text-link transition-colors"
                    value={detectedDocType}
                    onChange={(e) => setDetectedDocType(e.target.value)}
                  >
                    {docTypeOptions.map((opt) => (
                      <option key={opt.key} value={opt.key} className="bg-bg-inner text-text-primary">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-text-muted mt-1">
                    {t('wizard.fields.detectedDocTypeHint')}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-text-muted block mb-1">
                    {t('wizard.fields.docType')}
                  </label>
                  <div className="w-full bg-bg-inner border border-border-inner rounded-lg px-3 py-2 text-sm text-text-primary opacity-80 cursor-default select-none">
                    {docTypeOptions.find((o) => o.key === detectedDocType)?.label || detectedDocType}
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    {t('wizard.fields.docTypeFixedHint')}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {[
                  { labelKey: 'wizard.fields.docName', key: 'docName' as const, required: true },
                  { labelKey: 'wizard.fields.issuer', key: 'issuer' as const, required: true },
                  { labelKey: 'wizard.fields.issueDate', key: 'issueDate' as const, type: 'date' as const },
                  { labelKey: 'wizard.fields.expiryDate', key: 'expiryDate' as const, type: 'date' as const },
                  { labelKey: 'wizard.fields.category', key: 'category' as const },
                  { labelKey: 'wizard.fields.linkedProducts', key: 'linkedProducts' as const },
                  { labelKey: 'wizard.fields.notes', key: 'notes' as const, type: 'textarea' as const },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs text-text-muted block mb-1">
                      {t(field.labelKey)}
                      {field.required && <span className="text-text-link ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="w-full bg-bg-inner border border-border-inner rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-link transition-colors resize-none"
                        rows={2}
                        value={extractedFields[field.key]}
                        onChange={(e) => setExtractedFields((p) => ({ ...p, [field.key]: e.target.value }))}
                      />
                    ) : (
                      <input
                        type={field.type === 'date' ? 'date' : 'text'}
                        className="w-full bg-bg-inner border border-border-inner rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-link transition-colors"
                        value={extractedFields[field.key]}
                        onChange={(e) => setExtractedFields((p) => ({ ...p, [field.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Confidence badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#14532D]/10 border border-[#166534]">
                <FaCheckCircle size={14} className="text-[#86EFAC]" />
                <span className="text-xs text-[#86EFAC]">{t('wizard.confidence.high')}</span>
              </div>
            </div>
          )}

          {/* Step 3 — Validation */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary font-medium">{t('wizard.steps.validation')}</p>

              {/* Document summary */}
              <div className="p-4 bg-bg-inner border border-border-inner rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <FaFileAlt size={14} className="text-text-link" />
                  <span className="text-sm font-semibold text-text-primary">{extractedFields.docName}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-text-muted">{t('wizard.fields.docType')}:</span>
                  <span className="text-text-primary">{extractedFields.docType}</span>
                  <span className="text-text-muted">{t('wizard.fields.issuer')}:</span>
                  <span className="text-text-primary">{extractedFields.issuer}</span>
                  <span className="text-text-muted">{t('wizard.validation.validUntil')}:</span>
                  <span className="text-text-primary">{extractedFields.expiryDate || t('wizard.validation.notDefined')}</span>
                  <span className="text-text-muted">{t('wizard.validation.file')}:</span>
                  <span className="text-text-primary truncate">{file?.name}</span>
                </div>
              </div>

              {/* Validation results */}
              {validationErrors.length === 0 && validationWarnings.length === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#14532D]/10 border border-[#166534]">
                  <FaCheckCircle size={16} className="text-[#86EFAC]" />
                  <span className="text-sm text-[#86EFAC] font-medium">{t('wizard.validation.ready')}</span>
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-[#7F1D1D]/10 border border-[#FCA5A5]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FaExclamationTriangle size={14} className="text-[#FCA5A5]" />
                    <span className="text-sm font-semibold text-[#FCA5A5]">{t('wizard.validation.errors')}</span>
                  </div>
                  <ul className="space-y-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx} className="text-xs text-[#FCA5A5] flex items-start gap-1.5">
                        <span>•</span>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validationWarnings.length > 0 && (
                <div className="p-3 rounded-lg bg-[#7C2D12]/10 border border-[#FCD34D]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FaExclamationTriangle size={14} className="text-[#FCD34D]" />
                    <span className="text-sm font-semibold text-[#FCD34D]">{t('wizard.validation.warnings')}</span>
                  </div>
                  <ul className="space-y-1">
                    {validationWarnings.map((w, idx) => (
                      <li key={idx} className="text-xs text-[#FCD34D] flex items-start gap-1.5">
                        <span>•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (step === 0) handleClose();
              else setStep(step - 1);
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium border border-border text-text-secondary hover:text-text-primary hover:bg-bg-inner transition-colors"
          >
            {footerSecondaryLabel}
          </button>

          <button
            onClick={() => {
              if (step === 0) simulateExtraction();
              else if (step === 1) simulateValidation();
              else handleSave();
            }}
            disabled={!canContinue}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              canContinue
                ? 'bg-accent-violet border border-accent-violet text-bg-page hover:bg-primary-light'
                : 'bg-bg-inner/30 border border-border text-text-muted/50 cursor-not-allowed'
            }`}
          >
            {step === 2 && <FaCheckCircle size={12} />}
            {step === 1 && <FaChevronRight size={12} />}
            {footerPrimaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
