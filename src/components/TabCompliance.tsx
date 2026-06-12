'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaDownload } from 'react-icons/fa';

function StatusBadge({ status, compliant }: { status: string; compliant?: boolean }) {
  if (compliant === false) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#7F1D1D] text-[#FCA5A5]">
        <FaTimesCircle /> N/A
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#14532D] text-[#86EFAC]">
      <FaCheckCircle /> {status}
    </span>
  );
}

export default function TabCompliance() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const [exportFormat, setExportFormat] = useState('XBRL');

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ csrd: productData.compliance.csrd }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csrd-export.${exportFormat.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* REACH */}
        <div className="bg-[#18181B] rounded-xl p-5 border border-[#27272A]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white">REACH</h3>
            <StatusBadge status={productData.compliance.reach.status} compliant />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">{t('compliance.restrictedSubstances')}</span>
              <span className="font-semibold text-[#86EFAC]">{productData.compliance.reach.restricted_substances}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">{t('compliance.svhcPresent')}</span>
              <span className="font-semibold text-[#86EFAC]">{productData.compliance.reach.svhc_substances}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">{t('compliance.lastVerification')}</span>
              <span className="text-white">{productData.compliance.reach.verification_date}</span>
            </div>
          </div>
        </div>

        {/* EUDR */}
        <div className="bg-[#18181B] rounded-xl p-5 border border-[#27272A]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white">EUDR</h3>
            <StatusBadge status="N/A" compliant={false} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">{t('compliance.applies')}</span>
              <span className="font-semibold text-[#FCA5A5]">No</span>
            </div>
            <p className="text-[#71717A]">{isEs ? productData.compliance.eudr.note : productData.compliance.eudr.note_en}</p>
          </div>
        </div>

        {/* ESPR */}
        <div className="bg-[#18181B] rounded-xl p-5 border border-[#27272A] md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white">ESPR</h3>
            <StatusBadge status={productData.compliance.espr.status} compliant />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[#A1A1AA] mb-1">{t('compliance.delegatedAct')}</p>
              <p className="font-semibold text-white">{isEs ? productData.compliance.espr.delegated_act : productData.compliance.espr.delegated_act_en}</p>
            </div>
            <div>
              <p className="text-[#A1A1AA] mb-1">{t('compliance.fieldsCovered')}</p>
              <p className="font-semibold text-white">{productData.compliance.espr.fields_covered}</p>
            </div>
            <div>
              <p className="text-[#A1A1AA] mb-1">{t('compliance.dataCarrier')}</p>
              <p className="font-semibold text-white">{productData.compliance.espr.data_carrier}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSRD */}
      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-white">CSRD / {t('compliance.esrsMapping')}</h3>
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="text-sm border border-[#27272A] rounded-lg px-3 py-2 bg-[#27272A] text-white"
            >
              {productData.compliance.csrd.export_formats.map((f: string) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="py-2 px-4 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors flex items-center gap-2"
            >
              <FaDownload /> {t('compliance.exportCsrd')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(productData.compliance.csrd.esrs_mapping).map(([key, value]: [string, any]) => (
            <div key={key} className="bg-[#27272A] rounded-lg p-3 border border-[#27272A]">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#10B981] text-white text-xs font-bold">{key}</span>
                <FaCheckCircle className="text-[#86EFAC] text-xs" />
              </div>
              <p className="text-xs text-[#A1A1AA]">{isEs ? value.es : value.en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
