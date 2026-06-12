'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { useDrawer } from '@/lib/DrawerContext';
import { Tooltip, LabelWithTooltip } from '@/components/Tooltip';
import { Chip } from '@/components/Chip';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaDownload, FaEdit, FaChevronDown } from 'react-icons/fa';

function StatusBadge({ status, compliant, isEs }: { status: string; compliant?: boolean; isEs: boolean }) {
  if (compliant === false) {
    return (
      <Chip variant="withIcon" color="red" icon={<FaTimesCircle />}>
        {isEs ? 'No aplica' : 'N/A'}
      </Chip>
    );
  }
  return (
    <Chip variant="withIcon" color="green" icon={<FaCheckCircle />}>
      {status}
    </Chip>
  );
}

export default function TabCumplimiento() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const { openDrawer } = useDrawer();
  const [exportFormat, setExportFormat] = useState('XBRL');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: string) => {
    setShowDropdown(false);
    const blob = new Blob([JSON.stringify({ csrd: productData.compliance.csrd }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csrd-export.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleManageCompliance = () => {
    openDrawer({ mode: 'section', section: 'cumplimiento' });
  };

  // Parse ESPR fields covered
  const esprFields = productData.compliance.espr.fields_covered;
  const [fieldsCovered, fieldsTotal] = esprFields.split('/').map((s: string) => parseInt(s.trim(), 10));
  const isDppComplete = fieldsCovered >= fieldsTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{t('tabs.compliance')}</h2>
          <p className="text-sm text-text-muted mt-0.5">{t('tabs.complianceSubtitle')}</p>
        </div>
        <button
          onClick={handleManageCompliance}
          className="inline-flex items-center gap-2 text-text-link text-sm font-medium hover:underline transition-colors"
        >
          <FaEdit size={14} />
          {t('drawer.manageCompliance')}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* REACH */}
        <div className="bg-bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-text-primary"><LabelWithTooltip label="REACH" tooltip={isEs ? '(REACH: regulación europea sobre sustancias químicas). Sirve para controlar sustancias restringidas o peligrosas en productos vendidos en Europa.' : '(REACH: European chemicals regulation). Used to control restricted or hazardous substances in products sold in Europe.'} /></h3>
            <StatusBadge status={isEs ? 'Cumple' : 'Compliant'} compliant isEs={isEs} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary"><LabelWithTooltip label={t('compliance.restrictedSubstances')} tooltip={isEs ? 'Sustancias químicas con límites o prohibiciones de uso. Sirve para saber si el producto cumple con reglas de seguridad química.' : 'Chemical substances with usage limits or bans. Used to check whether the product meets chemical safety rules.'} /></span>
              <span className="font-semibold text-[#86EFAC]">{productData.compliance.reach.restricted_substances}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary"><LabelWithTooltip label={t('compliance.svhcPresent')} tooltip={isEs ? '(SVHC: sustancias de muy alta preocupación). Sirve para identificar sustancias químicas que pueden representar riesgos para la salud o el ambiente.' : '(SVHC: substances of very high concern). Used to identify chemicals that may pose risks to health or the environment.'} /></span>
              <span className="font-semibold text-[#86EFAC]">{productData.compliance.reach.svhc_substances}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary"><LabelWithTooltip label={t('compliance.lastVerification')} tooltip={isEs ? 'Fecha de la última revisión realizada. Sirve para saber si el dato fue controlado recientemente.' : 'Date of the last review. Used to know whether the data was checked recently.'} /></span>
              <span className="text-text-primary">{productData.compliance.reach.verification_date}</span>
            </div>
          </div>
        </div>

        {/* ESPR / DPP */}
        <div className="bg-bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-text-primary"><LabelWithTooltip label="ESPR / DPP" tooltip={t('compliance.esprDppTooltip')} ariaLabel={t('compliance.esprDppAriaLabel')} /></h3>
            {isDppComplete ? (
              <Chip variant="withIcon" color="green" icon={<FaCheckCircle />}>
                {t('compliance.dppComplete')}
              </Chip>
            ) : (
              <Chip variant="withIcon" color="amber" icon={<FaExclamationTriangle />}>
                {t('compliance.dppIncomplete')}
              </Chip>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary"><LabelWithTooltip label={t('compliance.delegatedAct')} tooltip={t('compliance.delegatedActTooltip')} ariaLabel={t('compliance.delegatedActAriaLabel')} /></span>
              <span className="font-semibold text-text-primary">{isEs ? productData.compliance.espr.delegated_act : productData.compliance.espr.delegated_act_en}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary"><LabelWithTooltip label={t('compliance.fieldsCovered')} tooltip={t('compliance.fieldsCoveredTooltip')} ariaLabel={t('compliance.fieldsCoveredAriaLabel')} /></span>
              <span className="font-semibold text-text-primary">{productData.compliance.espr.fields_covered}</span>
            </div>
            {!isDppComplete && (
              <p className="text-xs text-[#FCD34D]">{t('compliance.missingFieldsForPublication')}</p>
            )}
            <div className="flex justify-between">
              <span className="text-text-secondary"><LabelWithTooltip label={t('compliance.dataCarrier')} tooltip={t('compliance.dataCarrierTooltip')} ariaLabel={t('compliance.dataCarrierAriaLabel')} /></span>
              <span className="font-semibold text-text-primary">{isEs ? 'Código QR con GS1 Digital Link' : 'QR code with GS1 Digital Link'}</span>
            </div>
          </div>
        </div>

        {/* EUDR */}
        <div className="bg-bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-text-primary"><LabelWithTooltip label="EUDR" tooltip={isEs ? '(EUDR: Reglamento Europeo contra la Deforestación). Sirve para revisar si el producto usa materiales alcanzados por reglas contra la deforestación.' : '(EUDR: European Deforestation Regulation). Used to check whether the product uses materials covered by deforestation rules.'} /></h3>
            <StatusBadge status="N/A" compliant={false} isEs={isEs} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary"><LabelWithTooltip label={t('compliance.applies')} tooltip={isEs ? 'Indica si una norma corresponde a este producto. Sirve para separar requisitos obligatorios de requisitos que no aplican.' : 'Indicates whether a rule applies to this product. Used to separate required checks from rules that do not apply.'} /></span>
              <span className="font-semibold text-[#FCA5A5]">{isEs ? 'No' : 'No'}</span>
            </div>
            <p className="text-text-muted">{isEs ? 'El algodón no está dentro del alcance actual' : 'Cotton is not currently in scope'}</p>
          </div>
        </div>
      </div>

      {/* CSRD */}
      <div className="bg-bg-card rounded-xl p-6 border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{t('compliance.sustainabilityReportingTitle')}</h3>
            <p className="text-sm text-text-secondary mt-1">{t('compliance.sustainabilityReportingSubtitle')}</p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="py-2 px-4 rounded-lg border border-text-link text-text-link text-sm font-medium bg-transparent hover:bg-text-link/10 transition-colors flex items-center gap-2"
            >
              <FaDownload /> {t('compliance.exportCsrd')} <FaChevronDown size={14} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-bg-card border border-border rounded-xl shadow-xl shadow-black/40 z-50 p-3">
                <p className="text-xs font-medium text-text-secondary mb-2">{t('compliance.selectFormat')}</p>
                {productData.compliance.csrd.export_formats.map((f: string) => (
                  <button
                    key={f}
                    onClick={() => handleExport(f)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-inner transition-colors mb-1"
                  >
                    {f}
                  </button>
                ))}
                <p className="text-xs text-text-muted mt-2 pt-2 border-t border-border">{t('compliance.formatHelper')}</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(productData.compliance.csrd.esrs_mapping).map(([key, value]: [string, any]) => {
            const eTitle = isEs ? (
              key === 'E1' ? 'Cambio climático' :
              key === 'E2' ? 'Contaminación' :
              key === 'E3' ? 'Agua' :
              key === 'E4' ? 'Biodiversidad' :
              key === 'E5' ? 'Circularidad' :
              key
            ) : (
              key === 'E1' ? 'Climate change' :
              key === 'E2' ? 'Pollution' :
              key === 'E3' ? 'Water' :
              key === 'E4' ? 'Biodiversity' :
              key === 'E5' ? 'Circularity' :
              key
            );
            const eTooltip = isEs ? (
              key === 'E1' ? '(E1: Cambio climático). Sirve para reportar datos como huella de carbono y emisiones.' :
              key === 'E2' ? '(E2: Contaminación). Sirve para reportar datos sobre emisiones al aire, agua o suelo.' :
              key === 'E3' ? '(E3: Agua y recursos marinos). Sirve para reportar datos de consumo e impacto sobre el agua.' :
              key === 'E4' ? '(E4: Biodiversidad y ecosistemas). Sirve para reportar datos relacionados con origen de fibras e impacto sobre ecosistemas.' :
              key === 'E5' ? '(E5: Economía circular). Sirve para reportar datos de reciclabilidad, reutilización y fin de vida del producto.' :
              undefined
            ) : (
              key === 'E1' ? '(E1: Climate change). Used to report data such as carbon footprint and emissions.' :
              key === 'E2' ? '(E2: Pollution). Used to report data on emissions to air, water or soil.' :
              key === 'E3' ? '(E3: Water and marine resources). Used to report data on water use and water impact.' :
              key === 'E4' ? '(E4: Biodiversity and ecosystems). Used to report data related to fiber origin and ecosystem impact.' :
              key === 'E5' ? '(E5: Circular economy). Used to report data on recyclability, reuse and product end of life.' :
              undefined
            );
            return (
              <div key={key} className="bg-bg-inner rounded-lg p-3 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">{key}</span>
                  <span className="text-xs font-semibold text-text-primary">{eTitle}</span>
                  <FaCheckCircle className="text-[#86EFAC] text-xs" />
                  {eTooltip && <Tooltip text={eTooltip} />}
                </div>
                <p className="text-xs text-text-secondary">{isEs ? value.es : value.en}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
