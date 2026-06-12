'use client';

import { useState } from 'react';
import { Tooltip } from '@/components/Tooltip';
import {
  FaTimes, FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationTriangle,
  FaClock, FaFileAlt, FaUpload, FaGlobe, FaTrash, FaSync,
  FaSave, FaInfoCircle, FaBan, FaQuestionCircle, FaEdit, FaPaperPlane,
  FaDatabase,
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */
export type DrawerStatus =
  | 'active' | 'expired' | 'expiring' | 'pending' | 'missing' | 'underReview'
  | 'rejected' | 'notApplicable' | 'replaced' | 'conforme' | 'parcial'
  | 'completo' | 'enProgreso' | 'conPendientes' | 'faltanEvidencias' | 'noAplica'
  | 'cargado' | 'procesando' | 'extraido' | 'requiereRevision' | 'errorExtraccion'
  | 'altaConfianza' | 'mediaConfianza' | 'bajaConfianza' | 'confirmado'
  | 'ignorado' | 'conflicto' | 'editadoManual' | 'pendienteRevision';

export interface SourceDoc {
  id: string;
  name: string;
  type: string;
  status: DrawerStatus;
  origin: 'file' | 'link';
  url?: string;
  fileName?: string;
  uploadDate: string;
  expiry?: string;
  lastExtraction?: string;
  linkedSections: string[];
  source: string; // Fuente: Interno, Proveedor externo, Third-party, Regulatorio
}

export interface ExtractedField {
  id: string;
  field: string;
  value: string;
  source: string;
  confidence: 'alta' | 'media' | 'baja';
  status: 'pendienteRevision' | 'confirmado' | 'ignorado' | 'editadoManual' | 'conflicto';
  applied: boolean;
}

export interface ConflictItem {
  id: string;
  field: string;
  valueA: string;
  valueB: string;
  sourceA: string;
  sourceB: string;
  resolved?: string;
}

export interface PendingItem {
  id: string;
  title: string;
  section: string;
  entity?: string;
  reason?: string;
  priority?: 'alta' | 'media' | 'baja';
}

/* ═══════════════════════════════════════════
   STATUS CONFIG
═══════════════════════════════════════════ */
const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  active:            { bg: 'bg-[#86EFAC]/10', text: 'text-[#86EFAC]', label: 'Vigente',       icon: <FaCheckCircle size={10} /> },
  conforme:          { bg: 'bg-[#86EFAC]/10', text: 'text-[#86EFAC]', label: 'Conforme',      icon: <FaCheckCircle size={10} /> },
  completo:          { bg: 'bg-[#86EFAC]/10', text: 'text-[#86EFAC]', label: 'Completo',      icon: <FaCheckCircle size={10} /> },
  confirmado:        { bg: 'bg-[#86EFAC]/10', text: 'text-[#86EFAC]', label: 'Confirmado',    icon: <FaCheckCircle size={10} /> },
  altaConfianza:     { bg: 'bg-[#86EFAC]/10', text: 'text-[#86EFAC]', label: 'Alta confianza', icon: <FaCheckCircle size={10} /> },
  expired:           { bg: 'bg-[#FCA5A5]/10', text: 'text-[#FCA5A5]', label: 'Vencido',      icon: <FaExclamationTriangle size={10} /> },
  expiring:          { bg: 'bg-[#FBBF24]/10', text: 'text-[#FBBF24]', label: 'Por vencer',    icon: <FaClock size={10} /> },
  pending:           { bg: 'bg-orange-400/10', text: 'text-orange-400', label: 'Pendiente',     icon: <FaExclamationTriangle size={10} /> },
  missing:           { bg: 'bg-orange-400/10', text: 'text-orange-400', label: 'Pendiente',     icon: <FaExclamationTriangle size={10} /> },
  faltanEvidencias:  { bg: 'bg-[#FCA5A5]/10', text: 'text-[#FCA5A5]', label: 'Faltan evidencias', icon: <FaExclamationTriangle size={10} /> },
  conPendientes:     { bg: 'bg-orange-400/10', text: 'text-orange-400', label: 'Con pendientes', icon: <FaExclamationTriangle size={10} /> },
  enProgreso:        { bg: 'bg-[#93C5FD]/10', text: 'text-[#93C5FD]', label: 'En progreso',   icon: <FaClock size={10} /> },
  underReview:       { bg: 'bg-[#93C5FD]/10', text: 'text-[#93C5FD]', label: 'En revisión',   icon: <FaClock size={10} /> },
  pendienteRevision: { bg: 'bg-[#93C5FD]/10', text: 'text-[#93C5FD]', label: 'Pendiente revisión', icon: <FaClock size={10} /> },
  mediaConfianza:    { bg: 'bg-orange-400/10', text: 'text-orange-400', label: 'Media confianza', icon: <FaExclamationTriangle size={10} /> },
  bajaConfianza:     { bg: 'bg-[#FCA5A5]/10', text: 'text-[#FCA5A5]', label: 'Baja confianza', icon: <FaExclamationTriangle size={10} /> },
  rejected:          { bg: 'bg-[#FCA5A5]/10', text: 'text-[#FCA5A5]', label: 'Rechazado',     icon: <FaExclamationTriangle size={10} /> },
  errorExtraccion:   { bg: 'bg-[#FCA5A5]/10', text: 'text-[#FCA5A5]', label: 'Error extracción', icon: <FaExclamationTriangle size={10} /> },
  notApplicable:     { bg: 'bg-[#A1A1AA]/10', text: 'text-[#A1A1AA]', label: 'No aplica',     icon: <FaTimes size={10} /> },
  noAplica:          { bg: 'bg-[#A1A1AA]/10', text: 'text-[#A1A1AA]', label: 'No aplica',     icon: <FaTimes size={10} /> },
  replaced:          { bg: 'bg-[#A1A1AA]/10', text: 'text-[#A1A1AA]', label: 'Reemplazado',   icon: <FaEdit size={10} /> },
  parcial:           { bg: 'bg-orange-400/10', text: 'text-orange-400', label: 'Parcial',       icon: <FaExclamationTriangle size={10} /> },
  cargado:           { bg: 'bg-[#93C5FD]/10', text: 'text-[#93C5FD]', label: 'Cargado',       icon: <FaUpload size={10} /> },
  procesando:        { bg: 'bg-orange-400/10', text: 'text-orange-400', label: 'Procesando',    icon: <FaSync size={10} /> },
  extraido:          { bg: 'bg-[#86EFAC]/10', text: 'text-[#86EFAC]', label: 'Extraído',      icon: <FaCheckCircle size={10} /> },
  requiereRevision:  { bg: 'bg-[#93C5FD]/10', text: 'text-[#93C5FD]', label: 'Requiere revisión', icon: <FaQuestionCircle size={10} /> },
  ignorado:          { bg: 'bg-[#A1A1AA]/10', text: 'text-[#A1A1AA]', label: 'Ignorado',      icon: <FaBan size={10} /> },
  conflicto:         { bg: 'bg-[#FCA5A5]/10', text: 'text-[#FCA5A5]', label: 'Conflicto',     icon: <FaExclamationTriangle size={10} /> },
  editadoManual:     { bg: 'bg-[#93C5FD]/10', text: 'text-[#93C5FD]', label: 'Editado manual', icon: <FaEdit size={10} /> },
};

export function DrawerStatusBadge({ status, size = 'sm' }: { status: DrawerStatus; size?: 'sm' | 'md' }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const cls = size === 'md'
    ? `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${cfg.bg} ${cfg.text}`
    : `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.text}`;
  return <span className={cls}>{cfg.icon}{cfg.label}</span>;
}

/* ═══════════════════════════════════════════
   HEADER
═══════════════════════════════════════════ */
export function DrawerHeader({ title, subtitle, status, onClose }: {
  title: string; subtitle?: string; status?: DrawerStatus; onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between px-6 py-4 border-b border-border bg-bg-card">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-text-primary truncate">{title}</h2>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
        {status && <div className="mt-2"><DrawerStatusBadge status={status} size="md" /></div>}
      </div>
      <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-inner border border-border-inner flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border transition-colors shrink-0 ml-3" aria-label="Cerrar">
        <FaTimes size={14} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION (collapsible)
═══════════════════════════════════════════ */
export function DrawerSection({ title, icon, children, defaultOpen = true, action }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-3 bg-bg-inner hover:bg-bg-card transition-colors text-left">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-text-link">{icon}</span>}
          <span className="text-sm font-semibold text-text-primary">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {action}
          {open ? <FaChevronUp size={12} className="text-text-muted" /> : <FaChevronDown size={12} className="text-text-muted" />}
        </div>
      </button>
      {open && <div className="px-5 py-5 bg-bg-card space-y-4">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   FIELD
   ═══════════════════════════════════════════ */
export function DrawerField({ label, value, onChange, type = 'text', readOnly = false, placeholder, isLink, provenance, className = '', tooltip }: {
  label: string; value: string; onChange?: (val: string) => void; type?: 'text' | 'textarea' | 'select' | 'date';
  readOnly?: boolean; placeholder?: string; isLink?: boolean; provenance?: { source?: string; status?: DrawerStatus }; className?: string; tooltip?: string;
}) {
  const baseInput = `w-full bg-bg-inner border border-border-inner rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary placeholder-text-muted focus:outline-none focus:border-[#34D399] transition-colors ${readOnly ? 'opacity-70 cursor-default' : ''}`;
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-text-muted flex items-center">
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </label>
        {provenance && (
          <div className="flex items-center gap-1.5">
            {provenance.source && <span className="text-[11px] text-text-muted">{provenance.source}</span>}
            {provenance.status && <DrawerStatusBadge status={provenance.status} />}
          </div>
        )}
      </div>
      {type === 'textarea' ? (
        <textarea className={baseInput} value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={readOnly} placeholder={placeholder} rows={3} />
      ) : type === 'select' ? (
        <select className={baseInput} value={value} onChange={(e) => onChange?.(e.target.value)} disabled={readOnly}>
          <option value="">{placeholder || 'Seleccionar...'}</option>
          <option value="publicado">Publicado</option>
          <option value="borrador">Borrador</option>
          <option value="revision">En revisión</option>
        </select>
      ) : isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-text-link hover:underline block truncate">{value}</a>
      ) : (
        <input type={type === 'date' ? 'date' : 'text'} className={baseInput} value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={readOnly} placeholder={placeholder} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SOURCE DOCS SECTION — Table style (clean)
   Estados: active=Vigente, expired=PorVencer, missing/pending=Pendiente
   Acciones segun estado:
   - Vigente   => Eliminar
   - PorVencer => Reemplazar + Solicitar
   - Pendiente => Cargar + Solicitar
   No hay boton Ver. El nombre es clickeable.
═══════════════════════════════════════════ */
export function DrawerSourceDocs({
  docs,
  onOpenDoc,
  onReplace,
  onDelete,
  onRequest,
  onUploadFile,
  translateSource,
}: {
  docs: SourceDoc[];
  onOpenDoc?: (id: string) => void;
  onReplace?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRequest?: (id: string) => void;
  onUploadFile?: (id: string) => void;
  translateSource?: (source: string) => string;
}) {
  const isVigente = (s: DrawerStatus) => s === 'active';
  const isPorVencer = (s: DrawerStatus) => s === 'expiring';
  const isPendiente = (s: DrawerStatus) => s === 'missing' || s === 'pending';
  const iconBtn = 'inline-flex items-center justify-center w-8 h-8 rounded-md bg-bg-inner border border-border-inner text-text-secondary hover:text-text-primary hover:border-border transition-colors';

  return (
    <div className="space-y-2">
      {/* Table header */}
      <div className="hidden sm:grid grid-cols-12 gap-3 text-[10px] text-text-muted uppercase tracking-wide px-3 py-2.5">
        <div className="col-span-4">Documento</div>
        <div className="col-span-2">Fuente</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-2">Fecha</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      {/* Rows */}
      {docs.map((doc) => (
        <div key={doc.id} className="flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-3 px-3 py-3 rounded-lg bg-bg-inner border border-border-inner hover:border-border transition-colors">
          {/* Documento */}
          <div className="col-span-4 flex items-center gap-2 min-w-0">
            {doc.origin === 'link' ? <FaGlobe size={12} className="text-accent-blue shrink-0" /> : <FaFileAlt size={12} className="text-text-link shrink-0" />}
            <button
              onClick={() => onOpenDoc?.(doc.id)}
              className="text-sm font-medium text-text-primary truncate hover:text-text-link hover:underline transition-colors text-left"
              title={doc.name}
            >
              {doc.name}
            </button>
          </div>

          {/* Fuente */}
          <div className="col-span-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-bg-inner border border-border-inner text-text-secondary">
              {translateSource ? translateSource(doc.source) : doc.source}
            </span>
          </div>

          {/* Estado */}
          <div className="col-span-2"><DrawerStatusBadge status={doc.status} size="md" /></div>

          {/* Fecha */}
          <div className="col-span-2 text-xs text-text-muted">{doc.uploadDate || '—'}</div>

          {/* Acciones */}
          <div className="col-span-2 flex flex-wrap items-center justify-start sm:justify-end gap-2">
            {/* Vigente => Eliminar */}
            {isVigente(doc.status) && onDelete && (
              <button onClick={() => onDelete(doc.id)} className={iconBtn} title="Eliminar">
                <FaTrash size={13} />
              </button>
            )}

            {/* Por vencer => Reemplazar + Solicitar */}
            {isPorVencer(doc.status) && (
              <>
                {onReplace && (
                  <button onClick={() => onReplace(doc.id)} className={iconBtn} title="Reemplazar">
                    <FaSync size={13} />
                  </button>
                )}
                {onRequest && (
                  <button onClick={() => onRequest(doc.id)} className={iconBtn} title="Solicitar">
                    <FaPaperPlane size={13} />
                  </button>
                )}
              </>
            )}

            {/* Pendiente => Cargar + Solicitar */}
            {isPendiente(doc.status) && (
              <>
                {onUploadFile && (
                  <button onClick={() => onUploadFile(doc.id)} className={iconBtn} title="Cargar">
                    <FaUpload size={13} />
                  </button>
                )}
                {onRequest && (
                  <button onClick={() => onRequest(doc.id)} className={iconBtn} title="Solicitar">
                    <FaPaperPlane size={13} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}

      {docs.length === 0 && (
        <div className="p-4 text-center text-xs text-text-muted bg-bg-inner rounded-lg border border-border-inner border-dashed">
          No hay documentación fuente vinculada
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   EXTRACTION SECTION (simplified — kept for compat)
═══════════════════════════════════════════ */
export function DrawerExtraction({
  fields,
}: {
  fields: ExtractedField[];
}) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.id} className={`p-3 rounded-lg border space-y-2 ${field.status === 'conflicto' ? 'bg-[#7F1D1D]/10 border-[#FCA5A5]/30' : 'bg-bg-inner border-border-inner'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">{field.field}</span>
            <DrawerStatusBadge status={field.status} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-primary font-medium">{field.value}</span>
          </div>
          <p className="text-[10px] text-text-muted">Fuente: {field.source}</p>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="p-4 text-center text-xs text-text-muted bg-bg-inner rounded-lg border border-border-inner border-dashed">
          No hay datos extraídos. Sube documentación fuente para iniciar extracción automática.
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONFLICT SECTION
═══════════════════════════════════════════ */
export function DrawerConflict({
  conflicts,
  onResolve,
}: {
  conflicts: ConflictItem[];
  onResolve?: (id: string, chosenValue: string) => void;
}) {
  const [manualValues, setManualValues] = useState<Record<string, string>>({});

  if (conflicts.length === 0) return null;

  return (
    <div className="space-y-3">
      {conflicts.map((c) => (
        <div key={c.id} className="p-3 bg-[#7F1D1D]/10 border border-[#FCA5A5]/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">{c.field}</span>
            <DrawerStatusBadge status="conflicto" />
          </div>
          <p className="text-[10px] text-text-muted">Dos fuentes entregan valores distintos para este campo.</p>

          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => onResolve?.(c.id, c.valueA)} className="p-2 rounded-lg bg-bg-inner border border-border-inner text-left hover:border-[#34D399] transition-colors">
              <p className="text-xs text-text-primary font-medium">{c.valueA}</p>
              <p className="text-[10px] text-text-muted">{c.sourceA}</p>
            </button>
            <button onClick={() => onResolve?.(c.id, c.valueB)} className="p-2 rounded-lg bg-bg-inner border border-border-inner text-left hover:border-[#34D399] transition-colors">
              <p className="text-xs text-text-primary font-medium">{c.valueB}</p>
              <p className="text-[10px] text-text-muted">{c.sourceB}</p>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-bg-inner border border-border-inner rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-[#34D399]"
              placeholder="Valor manual"
              value={manualValues[c.id] || ''}
              onChange={(e) => setManualValues((p) => ({ ...p, [c.id]: e.target.value }))}
            />
            <button
              onClick={() => { if (manualValues[c.id]) onResolve?.(c.id, manualValues[c.id]); }}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors"
            >
              Usar manual
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PENDING LIST
═══════════════════════════════════════════ */
export function DrawerPendingList({ items, onRequest, onUpload, onAddLink }: {
  items: PendingItem[];
  onRequest?: (id: string) => void;
  onUpload?: (id: string) => void;
  onAddLink?: (id: string) => void;
}) {
  const priorityColor: Record<string, string> = { alta: 'text-[#FCA5A5]', media: 'text-[#FCD34D]', baja: 'text-[#A1A1AA]' };
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="p-3 bg-[#7F1D1D]/10 border border-[#FCA5A5]/20 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-text-primary">{item.title}</p>
            {item.priority && <span className={`text-[10px] font-semibold uppercase ${priorityColor[item.priority]}`}>{item.priority}</span>}
          </div>
          {item.entity && <p className="text-xs text-text-muted">{item.entity}</p>}
          {item.reason && <p className="text-xs text-text-secondary mt-1">{item.reason}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {onRequest && (
              <button onClick={() => onRequest(item.id)} className="px-2.5 py-1 rounded-md bg-bg-inner border border-border-inner text-[10px] text-text-secondary hover:text-text-primary transition-colors">Solicitar al proveedor</button>
            )}
            {onUpload && (
              <button onClick={() => onUpload(item.id)} className="px-2.5 py-1 rounded-md bg-bg-inner border border-border-inner text-[10px] text-text-secondary hover:text-text-primary transition-colors">Subir archivo</button>
            )}
            {onAddLink && (
              <button onClick={() => onAddLink(item.id)} className="px-2.5 py-1 rounded-md bg-bg-inner border border-border-inner text-[10px] text-text-secondary hover:text-text-primary transition-colors">Agregar enlace</button>
            )}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="p-4 text-center text-xs text-text-muted bg-bg-inner rounded-lg border border-border-inner">No hay pendientes registrados</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ACTION BAR
   Footer: Abrir Central de documentación + Guardar cambios
═══════════════════════════════════════════ */
export function DrawerActionBar({ primaryLabel, onPrimary, linkLabel, onLink }: {
  primaryLabel: string; onPrimary: () => void;
  linkLabel?: string; onLink?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
      <div>
        {linkLabel && onLink && (
          <button onClick={onLink} className="text-xs text-text-link hover:text-primary-light transition-colors underline underline-offset-2 decoration-text-link/30">
            {linkLabel}
          </button>
        )}
      </div>
      <button onClick={onPrimary} className="py-2 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
        <FaSave size={12} /> {primaryLabel}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUMMARY GRID
═══════════════════════════════════════════ */
export function DrawerSummaryGrid({ items }: { items: { label: string; value: string | React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, idx) => (
        <div key={idx} className="bg-bg-inner border border-border-inner rounded-lg p-3">
          <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">{item.label}</p>
          <div className="text-sm text-text-primary font-medium">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MINI QR
═══════════════════════════════════════════ */
export function DrawerMiniQR({ url, size = 120 }: { url: string; size?: number }) {
  return (
    <div className="bg-white rounded-lg p-3 flex flex-col items-center">
      <QRCodeSVG value={url} size={size} bgColor="white" fgColor="black" />
      <p className="mt-2 text-[10px] text-gray-500 text-center break-all max-w-[200px]">{url}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   INFO BANNER
═══════════════════════════════════════════ */
export function DrawerInfoBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
      <FaInfoCircle size={14} className="text-accent-blue shrink-0" />
      <p className="text-sm text-text-secondary">{text}</p>
    </div>
  );
}
