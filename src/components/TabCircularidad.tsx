'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { useDrawer } from '@/lib/DrawerContext';
import {
  FaTint, FaWind, FaTemperatureHigh, FaBan, FaTshirt, FaFlask,
  FaLeaf, FaWater, FaBolt, FaFilter,
  FaRecycle, FaHandHoldingHeart, FaTrashAlt, FaStore, FaMapMarkerAlt,
  FaEdit, FaWrench, FaTools, FaShieldAlt,
  FaQuestionCircle, FaInfoCircle, FaTimes,
  FaFileAlt, FaEye,
} from 'react-icons/fa';
import { useTheme } from '@/lib/ThemeContext';
import { Tooltip } from '@/components/Tooltip';
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal';
import { ActionButton } from '@/components/ActionButton';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const handle = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(handle);
  }, [map]);
  return null;
};

const careIcons: Record<string, React.ReactNode> = {
  washing: <FaTint />,
  bleaching: <FaFlask />,
  drying: <FaWind />,
  ironing: <FaTemperatureHigh />,
  dry_cleaning: <FaTshirt />,
};

const recycleIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background:#34D399;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;border:2px solid #18181B;box-shadow:0 2px 4px rgba(0,0,0,0.4);">♻️</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const normalizeStageText = (text: string) => {
  const map: Record<string, string> = {
    'Electricidad grid': 'Electricidad de red',
    'Grid electricity': 'Grid electricity',
    'Renovables on-site': 'Energía renovable propia',
    'On-site renewables': 'On-site renewables',
    'Acabado + Packaging': 'Acabado + embalaje',
    'Finishing + Packaging': 'Finishing + packaging',
    'Cultivo algodón': 'Cultivo de algodón',
    'Cotton cultivation': 'Cotton cultivation',
    'Recycling center': 'Centro de reciclaje',
    '10% descuento en próxima compra': '10% de descuento en la próxima compra',
    '10% discount on next purchase': '10% discount on next purchase',
  };
  return map[text] || text;
};

export default function TabCircularidad() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { activeProduct, getEffectiveStatus } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const { openDrawer } = useDrawer();
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showTakeBackDoc, setShowTakeBackDoc] = useState(false);

  const d = productData.durability;
  const impact = productData.environmental_impact;
  const eol = productData.end_of_life;
  const repair = d.repairability;

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

  const disposalIcons: Record<string, React.ReactNode> = {
    Donación: <FaHandHoldingHeart />,
    Donation: <FaHandHoldingHeart />,
    'Punto de recogida textil': <FaRecycle />,
    'Textile collection point': <FaRecycle />,
    'Recycling center': <FaRecycle />,
  };

  const handleManageCircularity = () => {
    openDrawer({ mode: 'section', section: 'circularidad' });
  };

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{t('tabs.circularity')}</h2>
          <p className="text-sm text-text-muted mt-0.5">{t('tabs.circularitySubtitle')}</p>
        </div>
        <button
          onClick={handleManageCircularity}
          className="inline-flex items-center gap-2 text-text-link text-sm font-medium hover:underline transition-colors"
        >
          <FaEdit size={14} />
          {t('drawer.manageCircularity')}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          BLOQUE 1 — DURABILIDAD Y REPARACIÓN
          ═══════════════════════════════════════════════════ */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{t('durability.title')}</h3>

        {/* KPIs de durabilidad */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{t('durability.washCycles')}</p>
              <Tooltip text={t('durability.washCyclesTooltip')} iconSize={12} side="top" align="center" sideOffset={6} collisionPadding={8}>
                <span className="sr-only">{t('durability.washCycles')}</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-text-primary">{d.wash_cycles}</p>
          </div>
          <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{t('durability.tensileStrength')}</p>
              <Tooltip text={t('durability.tensileStrengthTooltip')} iconSize={12} side="top" align="center" sideOffset={6} collisionPadding={8}>
                <span className="sr-only">{t('durability.tensileStrength')}</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-text-primary">{d.tensile_strength_N} <span className="text-sm">N</span></p>
          </div>
          <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{t('durability.colorFastness')}</p>
              <Tooltip text={t('durability.colorFastnessTooltip')} iconSize={12} side="top" align="center" sideOffset={6} collisionPadding={8}>
                <span className="sr-only">{t('durability.colorFastness')}</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-text-primary">{d.color_fastness}</p>
          </div>
          <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{t('durability.pillingResistance')}</p>
              <Tooltip text={t('durability.pillingResistanceTooltip')} iconSize={12} side="top" align="center" sideOffset={6} collisionPadding={8}>
                <span className="sr-only">{t('durability.pillingResistance')}</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-text-primary">{d.pilling_resistance}</p>
          </div>
        </div>

        {/* Instrucciones de cuidado */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-text-muted mb-3">{t('durability.careInstructions')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(d.care_instructions).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-bg-inner rounded-lg p-3 border border-border-inner flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-card flex items-center justify-center text-text-link shrink-0 border border-border">
                  {careIcons[key]}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary capitalize">{t(`durability.${key}`)}</p>
                  <p className="text-sm text-text-muted">{isEs ? value.es : value.en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reparación y repuestos */}
        <div>
          <h4 className="text-sm font-semibold text-text-muted mb-3">{t('durability.repairability')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-card flex items-center justify-center text-accent-green shrink-0 border border-border">
                  <FaWrench size={14} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{t('durability.repairPossible')}</p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{isEs ? (repair.available ? 'Sí' : 'No') : repair.available_en}</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-card flex items-center justify-center text-text-link shrink-0 border border-border">
                  <FaTools size={14} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{t('durability.repairType')}</p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{t('durability.repairTypeValue')}</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-card flex items-center justify-center text-accent-blue shrink-0 border border-border">
                  <FaRecycle size={14} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{t('durability.spareParts')}</p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{t('durability.sparePartsValue')}</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-card flex items-center justify-center text-accent-amber shrink-0 border border-border">
                  <FaShieldAlt size={14} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{t('durability.repairNote')}</p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{t('durability.repairNoteValue')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          BLOQUE 2 — IMPACTO AMBIENTAL
          ═══════════════════════════════════════════════════ */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">{t('impact.title')}</h3>
          <button
            onClick={() => setShowImpactModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:bg-bg-inner hover:text-text-primary transition-colors shrink-0"
          >
            <FaQuestionCircle size={12} />
            {t('impact.howItWorks')}
          </button>
        </div>

        {/* 3 columnas: carbono + hídrica + energía */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Huella de carbono */}
          <div className="bg-bg-inner rounded-lg p-4 border border-border-inner flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FaLeaf className="text-accent-green" size={18} />
              <h4 className="text-base font-semibold text-text-primary">{t('impact.carbonFootprint')}</h4>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-text-primary">{impact.carbon_footprint.total_kg_co2eq}</span>
              <span className="text-sm text-text-muted">kg CO₂eq</span>
            </div>
            <div className="space-y-3 flex-1">
              {impact.carbon_footprint.breakdown.map((s: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">{isEs ? normalizeStageText(s.stage) : s.stage_en}</span>
                    <span className="text-text-primary font-medium">{s.kg} kg <span className="text-text-muted">({s.percentage}%)</span></span>
                  </div>
                  <div className="w-full bg-bg-card rounded-full h-1.5">
                    <div className="bg-text-link h-1.5 rounded-full" style={{ width: `${(s.kg / maxCarbon) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-text-muted">
              {t('impact.methodology')}: {impact.carbon_footprint.methodology} · {t('impact.verification')}: {impact.carbon_footprint.verification}
            </div>
          </div>

          {/* Huella hídrica */}
          <div className="bg-bg-inner rounded-lg p-4 border border-border-inner flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FaWater className="text-accent-blue" size={18} />
              <h4 className="text-base font-semibold text-text-primary">{t('impact.waterFootprint')}</h4>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-text-primary">{impact.water_footprint.total_liters.toLocaleString()}</span>
              <span className="text-sm text-text-muted">litros</span>
            </div>
            <div className="space-y-3 flex-1">
              {impact.water_footprint.breakdown.map((s: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">{isEs ? normalizeStageText(s.stage) : s.stage_en}</span>
                    <span className="text-text-primary font-medium">{s.liters.toLocaleString()} L <span className="text-text-muted">({s.percentage}%)</span></span>
                  </div>
                  <div className="w-full bg-bg-card rounded-full h-1.5">
                    <div className="bg-[#60A5FA] h-1.5 rounded-full" style={{ width: `${(s.liters / maxWater) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Energía */}
          <div className="bg-bg-inner rounded-lg p-4 border border-border-inner flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FaBolt className="text-accent-amber" size={18} />
              <h4 className="text-base font-semibold text-text-primary">{t('impact.energy')}</h4>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-text-primary">{energyTotal}</span>
              <span className="text-sm text-text-muted">kWh</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-6">
              <div className="relative w-28 h-28 shrink-0">
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
                        stroke={energyColors[s.type] || energyColors[s.type_en] || '#34D399'}
                        strokeWidth="10"
                        strokeDasharray={`${dash} ${energyCircumference}`}
                        strokeDashoffset={offset}
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="space-y-2">
                {impact.energy.sources.map((s: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ background: energyColors[s.type] || energyColors[s.type_en] || '#34D399' }} />
                    <span className="text-text-muted">{isEs ? normalizeStageText(s.type) : s.type_en}</span>
                    <span className="font-medium text-text-primary">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Microplásticos */}
        <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
          <div className="flex items-center gap-2 mb-3">
            <FaFilter className="text-text-muted" size={18} />
            <h4 className="text-base font-semibold text-text-primary">{t('impact.microplastics')}</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium">{t('impact.perWash')}</p>
                <Tooltip text={t('impact.perWashTooltip')} iconSize={12} side="top" align="center" sideOffset={6} collisionPadding={8}>
                  <span className="sr-only">{t('impact.perWash')}</span>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-text-primary">{impact.microplastics.per_wash_mg} <span className="text-sm">mg</span></p>
            </div>
            <div className="bg-bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium">{t('impact.lifetime')}</p>
                <Tooltip text={t('impact.lifetimeTooltip')} iconSize={12} side="top" align="center" sideOffset={6} collisionPadding={8}>
                  <span className="sr-only">{t('impact.lifetime')}</span>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-text-primary">{impact.microplastics.lifetime_mg} <span className="text-sm">mg</span></p>
            </div>
            <div className="bg-bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs uppercase tracking-wide text-text-muted font-medium">{t('impact.microfiberFilter')}</p>
                <Tooltip text={t('impact.microfiberFilterTooltip')} iconSize={12} side="top" align="center" sideOffset={6} collisionPadding={8}>
                  <span className="sr-only">{t('impact.microfiberFilter')}</span>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-text-primary">{t('impact.microfiberFilterValue')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal ¿Cómo funciona el impacto ambiental? */}
      {showImpactModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowImpactModal(false)} />
          <div className="relative bg-bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <FaInfoCircle className="text-text-link" size={16} />
                {t('impact.howItWorksTitle')}
              </h3>
              <button onClick={() => setShowImpactModal(false)} className="p-1 rounded-lg hover:bg-bg-inner transition-colors">
                <FaTimes className="text-text-muted" size={16} />
              </button>
            </div>
            <div className="p-6 space-y-6 text-text-primary">
              <p className="text-sm text-text-muted">{t('impact.howItWorksIntro')}</p>

              <div className="space-y-4">
                <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
                  <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <FaLeaf className="text-accent-green" size={14} />
                    {t('impact.carbonFootprint')}
                  </h4>
                  <p className="text-sm text-text-muted mb-2">{t('impact.carbonFootprintDesc')}</p>
                  <p className="text-sm text-text-muted">{t('impact.carbonFootprintWhat')}</p>
                </div>

                <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
                  <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <FaWater className="text-accent-blue" size={14} />
                    {t('impact.waterFootprint')}
                  </h4>
                  <p className="text-sm text-text-muted mb-2">{t('impact.waterFootprintDesc')}</p>
                  <p className="text-sm text-text-muted">{t('impact.waterFootprintWhat')}</p>
                </div>

                <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
                  <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <FaBolt className="text-accent-amber" size={14} />
                    {t('impact.energy')}
                  </h4>
                  <p className="text-sm text-text-muted mb-2">{t('impact.energyDesc')}</p>
                  <p className="text-sm text-text-muted">{t('impact.energyWhat')}</p>
                </div>

                <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
                  <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <FaFilter className="text-text-muted" size={14} />
                    {t('impact.microplastics')}
                  </h4>
                  <p className="text-sm text-text-muted mb-2">{t('impact.microplasticsDesc')}</p>
                  <p className="text-sm text-text-muted">{t('impact.microplasticsWhat')}</p>
                </div>
              </div>

              <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
                <p className="text-xs font-semibold text-text-primary mb-1">{t('impact.note')}</p>
                <p className="text-xs text-text-muted">{t('impact.noteText')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          BLOQUE 3 — FIN DE VIDA
          ═══════════════════════════════════════════════════ */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{t('endOfLife.title')}</h3>

        {/* Grid: Reciclabilidad (izq) | Compostable + Plan devolución (der) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Reciclabilidad — izquierda, ocupa altura de ambas derechas */}
          <div className="lg:row-span-2 bg-bg-inner rounded-lg p-4 border border-border-inner flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FaRecycle size={18} className="text-text-link" />
              <h4 className="text-base font-semibold text-text-primary">{t('endOfLife.recyclabilityIndex')}</h4>
              <Tooltip text={t('endOfLife.recyclabilityIndexTooltip')} iconSize={12} side="top" align="center" sideOffset={6} collisionPadding={8}>
                <span className="sr-only">{t('endOfLife.recyclabilityIndexTooltip')}</span>
              </Tooltip>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="8"
                    strokeDasharray={`${eol.recyclability_index * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-text-primary">{eol.recyclability_index}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-2 text-center">{isEs ? 'Separables por composición' : 'Separable by composition'}</p>
          </div>

          {/* Compostable — arriba derecha */}
          <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
            <div className="flex items-center gap-2 mb-2">
              <FaLeaf size={18} className="text-text-link" />
              <h4 className="text-base font-semibold text-text-primary">{t('endOfLife.compostable')}</h4>
              <Tooltip text={t('endOfLife.compostableTooltip')} iconSize={12} side="top" align="center" sideOffset={6} collisionPadding={8}>
                <span className="sr-only">{t('endOfLife.compostableTooltip')}</span>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${eol.compostable ? 'text-accent-green' : 'text-text-primary'}`}>
                {eol.compostable ? t('endOfLife.compostableYes') : t('endOfLife.compostableNo')}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              <span className="text-text-secondary">{t('endOfLife.compostableReasonLabel')}:</span> {isEs ? eol.compostable_reason : eol.compostable_reason_en}
            </p>
          </div>

          {/* Plan de devolución de marca — abajo derecha */}
          <div className="lg:col-start-2 bg-accent-green/10 rounded-lg p-4 border border-accent-green/20 flex items-center gap-3">
            {/* Icono de documento */}
            <div className="shrink-0 w-9 h-9 rounded-lg bg-[#86EFAC]/10 flex items-center justify-center text-accent-green">
              <FaFileAlt size={18} />
            </div>
            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-primary mb-1">{t('endOfLife.takeBackProgram')}</h4>
              <div className="space-y-0 text-xs leading-relaxed">
                <p className="text-text-secondary">
                  <span className="text-text-muted">{t('endOfLife.available')}:</span> {eol.take_back_program.available ? t('endOfLife.yes') : t('endOfLife.no')}
                </p>
                <p className="text-text-secondary">
                  <span className="text-text-muted">{t('endOfLife.source')}:</span> {isEs ? eol.take_back_program.source : eol.take_back_program.source_en}
                </p>
              </div>
              {eol.take_back_program.has_document && (
                <button
                  onClick={() => setShowTakeBackDoc(true)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent-green hover:text-accent-green transition-colors"
                >
                  <FaEye size={12} /> {t('endOfLife.viewDocument')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Opciones de fin de vida */}
        <div className="bg-bg-inner rounded-lg p-4 border border-border-inner mb-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('endOfLife.disposalOptions')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {eol.disposal_options.map((opt: any, idx: number) => {
              const optName = isEs ? normalizeStageText(opt.option) : opt.option_en;
              return (
                <div key={idx} className="bg-bg-card rounded-lg p-3 border border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bg-inner flex items-center justify-center text-base text-text-link border border-border shrink-0">
                    {disposalIcons[optName] || <FaTrashAlt />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary text-sm leading-tight">{optName}</h4>
                    {opt.condition && <p className="text-xs text-text-muted leading-snug mt-0.5">{isEs ? opt.condition : opt.condition_en}</p>}
                    {opt.type && <p className="text-xs text-text-muted leading-snug mt-0.5">{isEs ? opt.type : opt.type_en}</p>}
                    {opt.note && <p className="text-xs text-text-muted leading-snug mt-0.5">{isEs ? opt.note : opt.note_en}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Puntos de recogida cercanos: mapa + lista */}
        <div className="bg-bg-inner rounded-lg p-4 border border-border-inner">
          <div className="mb-3">
            <h4 className="text-base font-semibold text-text-primary">{t('endOfLife.collectionMapTitle')}</h4>
            <p className="text-sm text-text-muted mt-1">{t('endOfLife.collectionMapSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-4">
            {/* Mapa */}
            <div className="h-[320px] min-h-[280px] rounded-lg overflow-hidden flex flex-col">
              <MapContainer className="flex-1 w-full h-full min-h-0" center={[39.47, -0.38]} zoom={13} scrollWheelZoom={false} style={{ background: 'var(--color-bg-card)' }}>
                <MapResizer />
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url={`https://{s}.basemaps.cartocdn.com/${theme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`}
                />
                {eol.collection_points.map((point: any, idx: number) => (
                  <Marker key={idx} position={point.coords} icon={recycleIcon}>
                    <Popup>
                      <div className="p-1">
                        <p className="font-semibold text-sm">{isEs ? point.name : point.name_en}</p>
                        <p className="text-xs text-gray-600">{point.distance}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Lista de puntos */}
            <div className="relative flex flex-col h-[320px] min-h-[280px]">
              {/* Fade superior */}
              <div className="absolute top-0 left-0 right-2 h-3 bg-gradient-to-b from-[var(--color-bg-inner)] to-transparent z-10 pointer-events-none rounded-t-lg" />
              {/* Panel scrolleable */}
              <div className="flex-1 overflow-y-auto scrollbar-dark pr-2 pb-1 space-y-2.5">
                {eol.collection_points.map((point: any, idx: number) => {
                  const pointIcon = point.icon === 'donation' ? <FaHandHoldingHeart size={14} /> : <FaRecycle size={14} />;
                  return (
                    <div key={idx} className="bg-bg-card rounded-lg p-2.5 border border-border">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-md bg-bg-inner flex items-center justify-center text-text-link border border-border shrink-0">
                          {pointIcon}
                        </div>
                        <h5 className="text-sm font-semibold text-text-primary leading-tight">{isEs ? point.name : point.name_en}</h5>
                      </div>
                      <div className="space-y-0.5 text-xs text-text-muted leading-relaxed">
                        <p><span className="text-text-secondary font-medium">{t('endOfLife.collectionPointType')}:</span> {isEs ? point.type : point.type_en}</p>
                        <p><span className="text-text-secondary font-medium">{t('endOfLife.collectionPointAddress')}:</span> {point.address}</p>
                      </div>
                      <ActionButton
                        variant="textWithIcon"
                        intent="accent"
                        icon={<FaMapMarkerAlt size={10} />}
                        onClick={() => console.log('Ver en mapa', point.name)}
                        className="mt-1.5"
                      >
                        {t('endOfLife.collectionPointViewOnMap')}
                      </ActionButton>
                    </div>
                  );
                })}
              </div>
              {/* Fade inferior */}
              <div className="absolute bottom-0 left-0 right-2 h-4 bg-gradient-to-t from-[var(--color-bg-inner)] to-transparent z-10 pointer-events-none rounded-b-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {showTakeBackDoc && (() => {
      const takeReq = activeProduct?.documentRequirements.find(r => r.id === 'req-take');
      const takeStatus = takeReq ? getEffectiveStatus(takeReq) : 'active';
      const takeLabel = takeStatus === 'active' ? t('drawer.statusActive')
        : takeStatus === 'expiring' ? t('drawer.statusExpiring')
        : takeStatus === 'expired' ? t('drawer.statusExpired')
        : t('drawer.statusPending');
      return (
        <DocumentPreviewModal
          isOpen={showTakeBackDoc}
          onClose={() => setShowTakeBackDoc(false)}
          title={isEs ? 'Política take-back' : 'Take-back policy'}
          type={isEs ? 'Política' : 'Policy'}
          status={takeStatus}
          statusLabel={takeLabel}
        />
      );
    })()}
    </>
  );
}
