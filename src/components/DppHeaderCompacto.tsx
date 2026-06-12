'use client';

import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { Chip } from '@/components/Chip';

const statusMap: Record<string, { labelKey: string; color: 'green' | 'amber' | 'blue' | 'gray' | 'violet' }> = {
  borrador: { labelKey: 'dppStatus.draft', color: 'amber' },
  revision: { labelKey: 'dppStatus.review', color: 'blue' },
  aprobado: { labelKey: 'dppStatus.approved', color: 'green' },
  publicado: { labelKey: 'dppStatus.published', color: 'green' },
  archivado: { labelKey: 'dppStatus.archived', color: 'gray' },
  enProgreso: { labelKey: 'dppStatus.inProgress', color: 'violet' },
};

export default function DppHeaderCompacto() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const isEs = i18n.language === 'es';

  const product = activeProduct;
  const name = product?.name || (isEs ? product?.data?.product?.name : product?.data?.product?.name_en) || (isEs ? 'Producto sin nombre' : 'Unnamed product');
  const identifier = product?.sku || product?.id || '';
  const status = product?.status || 'borrador';

  // Estado visual: si está publicado, mostrar "En progreso" para esta iteración
  // ya que el DPP no está completamente cerrado. En el futuro se puede usar
  // un cálculo real basado en campos cubiertos, documentos pendientes, etc.
  const visualStatus = 'enProgreso';
  const statusConfig = statusMap[visualStatus] || statusMap.enProgreso;

  // Progreso visual: 80% representa un estado avanzado pero no cerrado.
  // Conectar a getReadinessScore() o métrica real cuando esté disponible.
  const progress = 80;
  const progressColor = progress >= 100 ? '#86EFAC' : progress >= 80 ? '#34D399' : '#FCD34D';

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        {/* Left: Product info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Thumbnail placeholder */}
          <div className="w-12 h-12 rounded-lg bg-bg-inner border border-border-inner flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-text-primary tracking-tight truncate">{name}</h1>
              <Chip color={statusConfig.color} variant="textOnly">
                {t(statusConfig.labelKey)}
              </Chip>
            </div>
            <span className="text-xs text-text-muted font-mono truncate block mt-1">{t('uidProduct')}: {identifier}</span>
          </div>
        </div>

        {/* Right: Progress + Publish */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 lg:min-w-[280px] lg:max-w-[320px] flex-shrink-0">
          {/* Progress: percentage + bar */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-semibold text-text-primary shrink-0">{progress}%</span>
            <div className="flex-1 h-2 rounded-full bg-bg-inner overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: progressColor }}
              />
            </div>
          </div>
          {/* Publish */}
          <button
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium bg-accent-violet border border-accent-violet text-bg-page hover:bg-primary-light transition-colors flex-shrink-0"
          >
            {t('header.publish')}
          </button>
        </div>
      </div>
    </div>
  );
}
