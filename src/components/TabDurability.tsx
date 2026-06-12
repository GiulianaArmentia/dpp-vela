'use client';

import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { FaTint, FaSun, FaWind, FaTemperatureHigh, FaBan } from 'react-icons/fa';

const careIcons: Record<string, React.ReactNode> = {
  washing: <FaTint />,
  bleaching: <FaBan />,
  drying: <FaWind />,
  ironing: <FaTemperatureHigh />,
  dry_cleaning: <FaBan />,
};

export default function TabDurability() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const d = productData.durability;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#18181B] rounded-xl p-5 border border-[#27272A]">
          <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-1">{t('durability.washCycles')}</p>
          <p className="text-2xl font-bold text-white">{d.wash_cycles}</p>
        </div>
        <div className="bg-[#18181B] rounded-xl p-5 border border-[#27272A]">
          <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-1">{t('durability.tensileStrength')}</p>
          <p className="text-2xl font-bold text-white">{d.tensile_strength_N} N</p>
        </div>
        <div className="bg-[#18181B] rounded-xl p-5 border border-[#27272A]">
          <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-1">{t('durability.colorFastness')}</p>
          <p className="text-2xl font-bold text-white">{d.color_fastness}</p>
        </div>
        <div className="bg-[#18181B] rounded-xl p-5 border border-[#27272A]">
          <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-1">{t('durability.pillingResistance')}</p>
          <p className="text-2xl font-bold text-white">{d.pilling_resistance}</p>
        </div>
      </div>

      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <h3 className="text-lg font-semibold text-white mb-4">{t('durability.careInstructions')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(d.care_instructions).map(([key, value]: [string, any]) => (
            <div key={key} className="bg-[#27272A] rounded-lg p-4 border border-[#27272A] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center text-[#34D399] shrink-0 border border-[#3F3F46]">
                {careIcons[key]}
              </div>
              <div>
                <p className="text-sm font-medium text-white capitalize">{t(`durability.${key}`)}</p>
                <p className="text-sm text-[#A1A1AA]">{isEs ? value.es : value.en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <h3 className="text-lg font-semibold text-white mb-4">{t('durability.warranty')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#27272A] rounded-lg p-4 border border-[#27272A]">
            <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-1">{t('durability.duration')}</p>
            <p className="text-xl font-bold text-white">{d.warranty.duration_years} {t('durability.years')}</p>
          </div>
          <div className="bg-[#27272A] rounded-lg p-4 border border-[#27272A]">
            <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-1">{t('durability.coverage')}</p>
            <p className="text-sm text-white">{isEs ? d.warranty.coverage : d.warranty.coverage_en}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
