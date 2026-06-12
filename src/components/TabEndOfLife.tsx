'use client';

import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { useTheme } from '@/lib/ThemeContext';
import { FaRecycle, FaHandHoldingHeart, FaTrashAlt, FaStore, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const recycleIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background:#34D399;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;border:2px solid #18181B;box-shadow:0 2px 4px rgba(0,0,0,0.4);">♻️</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const collectionPoints = [
  { name: 'Cáritas Textil Recycling', distance: '1.2 km', coords: [39.47, -0.38] as [number, number] },
  { name: 'Punto Verde Municipal', distance: '2.5 km', coords: [39.48, -0.35] as [number, number] },
  { name: 'Humana Recogida Textil', distance: '3.1 km', coords: [39.46, -0.42] as [number, number] },
];

export default function TabEndOfLife() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const eol = productData.end_of_life;

  const disposalIcons: Record<string, React.ReactNode> = {
    Donación: <FaHandHoldingHeart />,
    Donation: <FaHandHoldingHeart />,
    'Punto de recogida textil': <FaRecycle />,
    'Textile collection point': <FaRecycle />,
    'Recycling center': <FaRecycle />,
  };

  return (
    <div className="space-y-6">
      {/* Recyclability Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A] text-center">
          <h3 className="text-lg font-semibold text-white mb-4">{t('endOfLife.recyclabilityIndex')}</h3>
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#27272A" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#34D399"
                strokeWidth="10"
                strokeDasharray={`${eol.recyclability_index * 2.83} 283`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{eol.recyclability_index}%</span>
            </div>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-2">{isEs ? 'Separable por composición' : 'Separable by composition'}</p>
        </div>

        <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
          <h3 className="text-lg font-semibold text-white mb-4">{t('endOfLife.compostable')}</h3>
          <div className="flex items-center justify-center h-32">
            <span className={`text-4xl font-bold ${eol.compostable ? 'text-[#86EFAC]' : 'text-[#FCA5A5]'}`}>
              {eol.compostable ? t('endOfLife.yes') : t('endOfLife.no')}
            </span>
          </div>
          <p className="text-sm text-[#A1A1AA] text-center">{isEs ? 'Mezcla de fibras sintéticas' : 'Synthetic fiber blend'}</p>
        </div>

        {/* Take-back Program */}
        <div className="bg-[#14532D]/20 rounded-xl p-6 border border-[#86EFAC]/30">
          <h3 className="text-lg font-semibold text-white mb-3">{t('endOfLife.takeBackProgram')}</h3>
          <div className="space-y-2 text-sm">
            <p className="text-[#A1A1AA]"><strong className="text-white">{t('endOfLife.available')}:</strong> {eol.take_back_program.available ? t('endOfLife.yes') : t('endOfLife.no')}</p>
            <p className="text-[#A1A1AA]"><strong className="text-white">{t('endOfLife.conditions')}:</strong> {isEs ? eol.take_back_program.conditions : eol.take_back_program.conditions_en}</p>
            <p className="text-[#A1A1AA]"><strong className="text-white">{t('endOfLife.source')}:</strong> {isEs ? eol.take_back_program.source : eol.take_back_program.source_en}</p>
          </div>
          {eol.take_back_program.has_document && (
            <button className="mt-4 w-full py-2 px-4 rounded-lg bg-[#34D399]/20 border border-[#34D399]/40 text-[#86EFAC] text-sm font-medium hover:bg-[#34D399]/30 transition-colors flex items-center justify-center gap-2">
              <FaFileAlt /> {t('endOfLife.viewDocument')}
            </button>
          )}
        </div>
      </div>

      {/* Disposal Options */}
      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <h3 className="text-lg font-semibold text-white mb-4">{t('endOfLife.disposalOptions')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {eol.disposal_options.map((opt: any, idx: number) => (
            <div key={idx} className="bg-[#27272A] rounded-lg p-5 border border-[#27272A] text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#18181B] flex items-center justify-center text-xl text-[#34D399] shadow-sm border border-[#3F3F46]">
                {disposalIcons[isEs ? opt.option : opt.option_en] || <FaTrashAlt />}
              </div>
              <h4 className="font-semibold text-white">{isEs ? opt.option : opt.option_en}</h4>
              {opt.condition && <p className="text-xs text-[#A1A1AA] mt-1">{isEs ? opt.condition : opt.condition_en}</p>}
              {opt.type && <p className="text-xs text-[#71717A] mt-1">{isEs ? opt.type : opt.type_en}</p>}
              {opt.note && <p className="text-xs text-[#71717A] mt-1">{isEs ? opt.note : opt.note_en}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Collection Points Map */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{t('endOfLife.collectionMapTitle')}</h3>
        <div className="h-[350px] rounded-lg overflow-hidden">
          <MapContainer center={[39.47, -0.38]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', background: 'var(--color-bg-card)' }}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url={`https://{s}.basemaps.cartocdn.com/${theme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`}
            />
            {collectionPoints.map((point, idx) => (
              <Marker key={idx} position={point.coords} icon={recycleIcon}>
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold text-sm">{point.name}</p>
                    <p className="text-xs text-gray-600">{point.distance}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
