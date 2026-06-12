'use client';

import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { useTheme } from '@/lib/ThemeContext';
import { FaMapMarkerAlt, FaIndustry, FaRoute, FaCalendarAlt, FaArrowRight, FaLink } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const numberedIcon = (num: number) =>
  L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background:#34D399;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#0F0F0F;font-size:12px;font-weight:700;border:2px solid #0F0F0F;box-shadow:0 2px 4px rgba(0,0,0,0.4);">${num}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

interface TabOriginProps {
  onViewTraceability?: () => void;
}

export default function TabOrigin({ onViewTraceability }: TabOriginProps) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const origin = productData.origin;

  const routeCoords = origin.facilities.map((f: any) => f.coordinates as [number, number]);

  // Fechas coherentes con la ruta de producción
  const routeDates = [
    '2026-03-15',
    '2026-03-22',
    '2026-03-29',
    '2026-04-01',
    '2026-04-02',
  ];

  return (
    <div className="space-y-6">
      {/* ─── Map + Info Cards ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Map */}
        <div className="lg:col-span-2 bg-bg-card rounded-xl border border-border overflow-hidden flex flex-col min-h-[520px]">
          <div className="flex-1 h-full">
            <MapContainer center={[37.5, 10]} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: 'var(--color-bg-card)' }}>
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url={`https://{s}.basemaps.cartocdn.com/${theme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`}
              />
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: '#34D399', weight: 2, dashArray: '6 6', opacity: 0.9 }}
              />
              {origin.facilities.map((f: any, idx: number) => (
                <Marker key={idx} position={f.coordinates as [number, number]} icon={numberedIcon(idx + 1)}>
                  <Popup>
                    <div className="p-1">
                      <p className="font-semibold text-sm text-[#18181B]">{f.name}</p>
                      <p className="text-xs text-gray-600">{isEs ? f.stage : f.stage_en}</p>
                      <p className="text-xs text-gray-500">{isEs ? f.location : f.location_en}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Info Cards */}
        <div className="flex flex-col gap-3 h-full">
          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-[#34D399]">
              <FaMapMarkerAlt size={14} />
              <span className="text-xs font-medium text-text-secondary">{isEs ? 'Origen final declarado' : 'Declared final origin'}</span>
            </div>
            <p className="text-lg font-semibold text-text-primary">España</p>
          </div>

          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-[#34D399]">
              <FaIndustry size={14} />
              <span className="text-xs font-medium text-text-secondary">{isEs ? 'País de confección' : 'Assembly country'}</span>
            </div>
            <p className="text-lg font-semibold text-text-primary">Túnez</p>
          </div>

          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-[#34D399]">
              <FaCalendarAlt size={14} />
              <span className="text-xs font-medium text-text-secondary">{isEs ? 'Período de producción' : 'Production period'}</span>
            </div>
            <p className="text-lg font-semibold text-text-primary">2026-03-15 → 2026-04-02</p>
          </div>

          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-[#34D399]">
              <FaLink size={14} />
              <span className="text-xs font-medium text-text-secondary">{isEs ? 'Cobertura de la cadena' : 'Chain coverage'}</span>
            </div>
            <p className="text-lg font-semibold text-text-primary">5 {isEs ? 'etapas' : 'stages'} · 5 {isEs ? 'países' : 'countries'}</p>
          </div>

          <div className="flex-1 bg-bg-card rounded-xl p-5 border border-border flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-[#34D399]">
              <FaRoute size={14} />
              <span className="text-xs font-medium text-text-secondary">{isEs ? 'Distancia total recorrida' : 'Total distance traveled'}</span>
            </div>
            <p className="text-lg font-semibold text-text-primary">4,850 km</p>
          </div>
        </div>
      </div>

      {/* ─── Route Table ─── */}
      <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <h3 className="text-base font-semibold text-text-primary uppercase tracking-wide">
            {isEs ? 'Información de ruta de producción' : 'Production route information'}
          </h3>
          {onViewTraceability && (
            <button
              onClick={onViewTraceability}
              className="inline-flex items-center gap-1.5 text-[#34D399] text-sm font-medium hover:underline transition-all"
            >
              {isEs ? 'Ver trazabilidad completa' : 'View full traceability'}
              <FaArrowRight size={12} />
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider w-12"></th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">{isEs ? 'Etapa' : 'Stage'}</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">{isEs ? 'Instalación' : 'Facility'}</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">{isEs ? 'País' : 'Country'}</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">{isEs ? 'Fecha' : 'Date'}</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">{isEs ? 'Tier' : 'Tier'}</th>
              </tr>
            </thead>
            <tbody>
              {origin.facilities.map((f: any, idx: number) => (
                <tr key={idx} className="border-b border-border last:border-0 hover:bg-bg-inner/50 transition-colors">
                  <td className="px-4 py-4 text-sm font-bold text-[#34D399]">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-text-primary">{isEs ? f.stage : f.stage_en}</td>
                  <td className="px-4 py-4 text-sm text-text-secondary">{f.name}</td>
                  <td className="px-4 py-4 text-sm text-text-secondary">{f.country}</td>
                  <td className="px-4 py-4 text-sm font-mono text-text-primary">{routeDates[idx]}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-bg-inner text-text-secondary text-xs font-medium border border-border-inner">
                      {idx === origin.facilities.length - 1 ? (isEs ? 'Final' : 'Final') : `Tier ${origin.facilities.length - idx}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
