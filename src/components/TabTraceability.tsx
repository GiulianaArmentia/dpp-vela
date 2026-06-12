'use client';

import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { FaCertificate, FaCheckCircle, FaExclamationTriangle, FaCalendarAlt, FaBuilding } from 'react-icons/fa';

function CertStatusBadge({ status }: { status: string }) {
  if (status === 'vigente') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#14532D] text-[#86EFAC]">
        <FaCheckCircle /> Vigente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#78350F] text-[#FCD34D]">
      <FaExclamationTriangle /> {status}
    </span>
  );
}

export default function TabTraceability() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';

  return (
    <div className="space-y-6">
      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <h3 className="text-lg font-semibold text-white mb-4">{t('traceability.chainOfCustody')}</h3>
        <div className="flex items-center gap-3 p-4 bg-[#27272A] rounded-lg border border-[#27272A]">
          <FaCertificate className="text-[#34D399] text-xl" />
          <span className="text-white font-medium">{isEs ? productData.traceability.chain_of_custody : productData.traceability.chain_of_custody_en}</span>
        </div>
      </div>

      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <h3 className="text-lg font-semibold text-white mb-4">{t('traceability.certifications')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {productData.traceability.certifications.map((cert: any, idx: number) => (
            <div key={idx} className="bg-[#27272A] rounded-lg p-4 border border-[#27272A] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{cert.name}</span>
                <CertStatusBadge status={cert.status} />
              </div>
              <p className="text-xs text-[#A1A1AA]">{cert.full_name}</p>
              <div className="text-xs text-[#A1A1AA] space-y-1 mt-1">
                <div className="flex items-center gap-1"><FaBuilding className="text-[#71717A]" /> {cert.certifier}</div>
                <div className="flex items-center gap-1"><FaCalendarAlt className="text-[#71717A]" /> {t('traceability.validUntil')}: <span className="text-white">{cert.valid_until}</span></div>
                <div className="flex items-center gap-1"><FaCertificate className="text-[#71717A]" /> {cert.certificate_number}</div>
              </div>
              <p className="text-xs text-[#71717A]">{isEs ? cert.scope : cert.scope_en}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <h3 className="text-lg font-semibold text-white mb-4">{t('traceability.audits')}</h3>
        <div className="space-y-3">
          {productData.traceability.audits.map((audit: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-[#27272A] rounded-lg border border-[#27272A]">
              <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center text-white font-bold text-sm shrink-0 border border-[#3F3F46]">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white">{audit.type}</p>
                  <span className="text-xs text-[#A1A1AA]">{audit.date}</span>
                </div>
                <p className="text-sm text-[#86EFAC]">{isEs ? audit.result : audit.result_en}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-[#A1A1AA]">
                  <span><FaBuilding className="inline mr-1" />{isEs ? audit.facility : audit.facility_en}</span>
                  <span><FaCertificate className="inline mr-1" />{audit.auditor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
