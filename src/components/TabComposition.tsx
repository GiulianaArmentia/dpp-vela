'use client';

import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { FaCheckCircle, FaExclamationTriangle, FaFlask } from 'react-icons/fa';

function StatusBadge({ status }: { status: 'certified' | 'declared' | 'pending' }) {
  const styles = {
    certified: 'bg-[#14532D] text-[#86EFAC]',
    declared: 'bg-[#78350F] text-[#FCD34D]',
    pending: 'bg-[#7F1D1D] text-[#FCA5A5]',
  };
  const labels = { certified: 'Certificado', declared: 'Declarado', pending: 'Pendiente' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status === 'certified' ? <FaCheckCircle /> : status === 'pending' ? <FaExclamationTriangle /> : <FaFlask />}
      {labels[status]}
    </span>
  );
}

export default function TabComposition() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const materials = productData.composition.materials;
  const totalWeight = materials.reduce((sum: number, m: any) => sum + m.weight_g, 0);

  const donutData = materials;
  const colors = ['#34D399', '#60A5FA', '#FBBF24'];
  const circumference = 2 * Math.PI * 40;
  let cumulative = 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materials Table */}
        <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
          <h3 className="text-lg font-semibold text-white mb-4">{t('composition.materials')}</h3>
          <div className="space-y-3">
            {materials.map((m: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#27272A] rounded-lg border border-[#27272A]">
                <div>
                  <p className="font-medium text-white">{isEs ? m.name : m.name_en}</p>
                  <p className="text-xs text-[#A1A1AA]">{isEs ? m.origin : m.origin_en}{m.certification ? ` · ${m.certification}` : ''}{m.source ? ` · ${isEs ? m.source : m.source_en}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{m.percentage}%</p>
                  <p className="text-xs text-[#A1A1AA]">{m.weight_g} g</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#27272A] flex justify-between text-sm">
            <span className="text-[#A1A1AA]">{t('composition.totalWeight')}</span>
            <span className="font-semibold text-white">{totalWeight} g</span>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A] flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white mb-4 self-start">{t('composition.compositionChart')}</h3>
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
          <div className="mt-4 flex flex-wrap gap-3">
            {materials.map((m: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ background: colors[idx % colors.length] }} />
                <span className="text-[#A1A1AA]">{isEs ? m.name : m.name_en}</span>
                <span className="font-medium text-white">{m.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chemical Treatments */}
      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <h3 className="text-lg font-semibold text-white mb-4">{t('composition.chemicalTreatments')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {productData.composition.chemical_treatments.map((ct: any, idx: number) => (
            <div key={idx} className="bg-[#27272A] rounded-lg p-3 border border-[#27272A]">
              <p className="text-sm text-white">{isEs ? ct.es : ct.en}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SVHC */}
      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">{t('composition.svhcStatus')}</h3>
          <StatusBadge status="certified" />
        </div>
        <p className="text-[#86EFAC] font-medium">{isEs ? productData.composition.svhc_status : productData.composition.svhc_status_en}</p>
        <p className="text-sm text-[#A1A1AA] mt-1">{t('composition.verified')}: {productData.composition.svhc_verification_date}</p>
      </div>

      {/* Components */}
      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <h3 className="text-lg font-semibold text-white mb-4">{t('composition.components')}</h3>
        <div className="space-y-2">
          {productData.composition.components.map((c: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-[#27272A] rounded-lg border border-[#27272A]">
              <FaCheckCircle className="text-[#86EFAC] shrink-0" />
              <span className="text-sm text-white">{isEs ? c.es : c.en}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
