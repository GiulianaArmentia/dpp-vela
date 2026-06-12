'use client';

import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { FaLeaf, FaWater, FaBolt, FaFilter } from 'react-icons/fa';

export default function TabImpact() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const impact = productData.environmental_impact;

  const maxCarbon = Math.max(...impact.carbon_footprint.breakdown.map((s: any) => s.kg));
  const maxWater = Math.max(...impact.water_footprint.breakdown.map((s: any) => s.liters));
  const energyTotal = impact.energy.total_kwh;

  const energyColors: Record<string, string> = {
    'Electricidad grid': '#34D399',
    'Grid electricity': '#34D399',
    'Gas natural': '#60A5FA',
    'Natural gas': '#60A5FA',
    'Renovables on-site': '#FBBF24',
    'On-site renewables': '#FBBF24',
  };

  let cumulativeEnergy = 0;
  const energyCircumference = 2 * Math.PI * 40;

  return (
    <div className="space-y-6">
      {/* Carbon Footprint */}
      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <div className="flex items-center gap-2 mb-4">
          <FaLeaf className="text-[#86EFAC]" />
          <h3 className="text-lg font-semibold text-white">{t('impact.carbonFootprint')}</h3>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-white">{impact.carbon_footprint.total_kg_co2eq}</span>
          <span className="text-sm text-[#A1A1AA]">kg CO₂eq</span>
        </div>
        <div className="space-y-3">
          {impact.carbon_footprint.breakdown.map((s: any, idx: number) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#A1A1AA]">{isEs ? s.stage : s.stage_en}</span>
                <span className="text-white font-medium">{s.kg} kg <span className="text-[#A1A1AA]">({s.percentage}%)</span></span>
              </div>
              <div className="w-full bg-[#27272A] rounded-full h-2">
                <div className="bg-[#34D399] h-2 rounded-full" style={{ width: `${(s.kg / maxCarbon) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-[#71717A]">
          {t('impact.methodology')}: {impact.carbon_footprint.methodology} · {t('impact.verification')}: {impact.carbon_footprint.verification}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Water Footprint */}
        <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
          <div className="flex items-center gap-2 mb-4">
            <FaWater className="text-[#60A5FA]" />
            <h3 className="text-lg font-semibold text-white">{t('impact.waterFootprint')}</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-white">{impact.water_footprint.total_liters.toLocaleString()}</span>
            <span className="text-sm text-[#A1A1AA]">litros</span>
          </div>
          <div className="space-y-3">
            {impact.water_footprint.breakdown.map((s: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#A1A1AA]">{isEs ? s.stage : s.stage_en}</span>
                  <span className="text-white font-medium">{s.liters.toLocaleString()} L <span className="text-[#A1A1AA]">({s.percentage}%)</span></span>
                </div>
                <div className="w-full bg-[#27272A] rounded-full h-2">
                  <div className="bg-[#60A5FA] h-2 rounded-full" style={{ width: `${(s.liters / maxWater) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Mix */}
        <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
          <div className="flex items-center gap-2 mb-4">
            <FaBolt className="text-[#FCD34D]" />
            <h3 className="text-lg font-semibold text-white">{t('impact.energy')}</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-white">{energyTotal}</span>
            <span className="text-sm text-[#A1A1AA]">kWh</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {impact.energy.sources.map((s: any, idx: number) => {
                  const dash = (s.percentage / 100) * energyCircumference;
                  const offset = -(cumulativeEnergy / 100) * energyCircumference;
                  cumulativeEnergy += s.percentage;
                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={energyColors[isEs ? s.type : s.type_en] || '#34D399'}
                      strokeWidth="10"
                      strokeDasharray={`${dash} ${energyCircumference}`}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="space-y-2">
              {impact.energy.sources.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ background: energyColors[isEs ? s.type : s.type_en] || '#34D399' }} />
                  <span className="text-[#A1A1AA]">{isEs ? s.type : s.type_en}</span>
                  <span className="font-medium text-white">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Microplastics */}
      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-[#A1A1AA]" />
          <h3 className="text-lg font-semibold text-white">{t('impact.microplastics')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#27272A] rounded-lg p-4 border border-[#27272A]">
            <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-1">{t('impact.perWash')}</p>
            <p className="text-xl font-bold text-white">{impact.microplastics.per_wash_mg} mg</p>
          </div>
          <div className="bg-[#27272A] rounded-lg p-4 border border-[#27272A]">
            <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-1">{t('impact.lifetime')}</p>
            <p className="text-xl font-bold text-white">{impact.microplastics.lifetime_mg} mg</p>
          </div>
          <div className="bg-[#27272A] rounded-lg p-4 border border-[#27272A] flex items-center">
            <p className="text-sm text-[#A1A1AA]">{isEs ? impact.microplastics.mitigation : impact.microplastics.mitigation_en}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
