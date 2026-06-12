'use client';

import { useTranslation } from 'react-i18next';
import { useTheme } from '@/lib/ThemeContext';
import { useDrawer } from '@/lib/DrawerContext';
import { QRCodeSVG } from 'qrcode.react';
import { Tooltip } from '@/components/Tooltip';
import {
  FaTag,
  FaBarcode,
  FaHashtag,
  FaPalette,
  FaRuler,
  FaCalendar,
  FaGlobe,
  FaBuilding,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaQrcode,
  FaEdit,
  FaFileAlt,
  FaLanguage,
  FaCheckCircle,
  FaUniversalAccess,
} from 'react-icons/fa';

export default function TabProducto() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const isEs = i18n.language === 'es';

  const publicUrl = 'https://trace.vela-textile.com/dpp/VT-CAM-001';

  const handleManageProduct = () => {
    openDrawer({ mode: 'section', section: 'producto' });
  };

  const Field = ({ icon, label, value, isLink = false, tooltip, href, className }: { icon: React.ReactNode; label: string; value: string; isLink?: boolean; tooltip?: string; href?: string; className?: string }) => (
    <div className={`bg-bg-inner border border-border-inner rounded-lg px-3 py-2 flex items-center gap-3 ${className || ''}`}>
      <div className="text-text-link shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted mb-0.5 flex items-center">
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </p>
        {isLink ? (
          <a href={href || value} target="_blank" rel="noopener noreferrer" className="text-sm text-text-link hover:underline truncate block">
            {value}
          </a>
        ) : (
          <p className="text-sm text-text-primary font-medium truncate">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{t('tabs.product')}</h2>
          <p className="text-sm text-text-muted mt-0.5">{t('tabs.productSubtitle')}</p>
        </div>
        <button
          onClick={handleManageProduct}
          className="inline-flex items-center gap-2 text-text-link text-sm font-medium hover:underline transition-colors"
        >
          <FaEdit size={14} />
          {t('drawer.manageProduct')}
        </button>
      </div>

      {/* Section 1: Datos del producto */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FaTag className="text-text-link" size={16} />
          {isEs ? 'Datos del producto' : 'Product data'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field icon={<FaHashtag size={14} />} label={isEs ? 'UID producto' : 'Product UID'} value="VT-CAM-001" tooltip={isEs ? '(UID: Identificador único). Sirve para reconocer este producto dentro del pasaporte digital y no confundirlo con otros.' : '(UID: Unique Identifier). Used to recognize this product within the digital passport and not confuse it with others.'} />
          <Field icon={<FaHashtag size={14} />} label={isEs ? 'UID lote' : 'Batch UID'} value="VT-CAM-001-2026-Q2-BATCH-042" tooltip={isEs ? '(UID: Identificador único). Sirve para saber a qué tanda de fabricación pertenece este producto.' : '(UID: Unique Identifier). Used to know which manufacturing batch this product belongs to.'} />
          <Field icon={<FaBarcode size={14} />} label="GTIN" value="8431234567890" tooltip={isEs ? '(GTIN: Número Global de Artículo Comercial). Sirve para identificar productos de forma estándar y suele estar asociado al código de barras.' : '(GTIN: Global Trade Item Number). Used to identify products in a standard way and is usually associated with the barcode.'} />
          <Field icon={<FaTag size={14} />} label={isEs ? 'SKU interno' : 'Internal SKU'} value="VT-CAM-001-NAT-SS26" tooltip={isEs ? '(SKU: Unidad de Gestión de Stock). Sirve como código interno de la marca para buscar, ordenar y gestionar este producto en su catálogo.' : '(SKU: Stock Keeping Unit). Used as the brand\'s internal code to search, sort, and manage this product in its catalog.'} />
          <Field icon={<FaFileAlt size={14} />} label={isEs ? 'Nombre' : 'Name'} value="Camiseta Unisex Algodón Orgánico" />
          <Field icon={<FaBuilding size={14} />} label={isEs ? 'Marca' : 'Brand'} value="Vela Textile" />
          <Field icon={<FaTag size={14} />} label={isEs ? 'Categoría' : 'Category'} value={isEs ? 'Prenda de vestir superior / Camiseta' : 'Upper body garment / T-shirt'} />
          <Field icon={<FaPalette size={14} />} label={isEs ? 'Color' : 'Color'} value="Natural" />
          <Field icon={<FaRuler size={14} />} label={isEs ? 'Talle' : 'Size'} value="S-XXL" />
          <Field icon={<FaCalendar size={14} />} label={isEs ? 'Temporada' : 'Season'} value="SS26" tooltip={isEs ? 'Colección o período comercial del producto. Sirve para ubicarlo dentro del calendario de la marca.' : 'Collection or commercial period of the product. Used to place it within the brand calendar.'} />
          <div className="md:col-span-2">
            <Field icon={<FaGlobe size={14} />} label={isEs ? 'URL pública' : 'Public URL'} value={publicUrl} isLink tooltip={isEs ? '(URL: Dirección web). Sirve para abrir y consultar la información del producto desde un navegador o QR.' : '(URL: Web address). Used to open and view the product information from a browser or QR.'} />
          </div>
        </div>
      </div>

      {/* Section 2: Datos del pasaporte */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FaFileAlt className="text-text-link" size={16} />
          {isEs ? 'Datos del pasaporte' : 'Passport data'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field icon={<FaCalendar size={14} />} label={isEs ? 'Fecha de emisión' : 'Issue date'} value="2026-04-02" tooltip={isEs ? 'Fecha en la que se creó esta versión del pasaporte digital. Sirve para saber desde cuándo existe esta información.' : 'Date when this version of the digital passport was created. Used to know since when this information exists.'} />
          <Field icon={<FaCalendar size={14} />} label={isEs ? 'Última actualización' : 'Last update'} value="2026-04-02" />
          <Field icon={<FaHashtag size={14} />} label={isEs ? 'Versión' : 'Version'} value="1.0.0" tooltip={isEs ? 'Número de versión del pasaporte digital. Sirve para saber si se está viendo una versión nueva o una anterior.' : 'Version number of the digital passport. Used to know if you are viewing a new or a previous version.'} />
          <Field icon={<FaFileAlt size={14} />} label={isEs ? 'Formato' : 'Format'} value="JSON-LD + PDF" tooltip={isEs ? '(JSON-LD: formato de datos para web) y (PDF: documento descargable). Sirve para saber en qué formatos se puede consultar o compartir el pasaporte.' : '(JSON-LD: web data format) and (PDF: downloadable document). Used to know in which formats the passport can be viewed or shared.'} />
          <Field icon={<FaLanguage size={14} />} label={isEs ? 'Idiomas' : 'Languages'} value="ES, EN" />
          <Field icon={<FaCheckCircle size={14} />} label={isEs ? 'Estado' : 'Status'} value={isEs ? 'Publicado' : 'Published'} />
          <Field icon={<FaUniversalAccess size={14} />} label={isEs ? 'Accesibilidad' : 'Accessibility'} value="WCAG 2.1 AA" tooltip={isEs ? '(WCAG: reglas de accesibilidad web). Sirve para indicar si el pasaporte puede ser usado por personas con distintas necesidades de acceso.' : '(WCAG: web accessibility rules). Used to indicate if the passport can be used by people with different access needs.'} />
        </div>
      </div>

      {/* Section 3: Empresa responsable */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FaBuilding className="text-text-link" size={16} />
          {isEs ? 'Empresa responsable' : 'Responsible company'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field icon={<FaBuilding size={14} />} label={isEs ? 'Nombre legal' : 'Legal name'} value="Vela Textile SL" tooltip={isEs ? 'Nombre oficial de la empresa responsable. Sirve para saber quién responde legalmente por este producto.' : 'Official name of the responsible company. Used to know who is legally responsible for this product.'} />
          <Field icon={<FaIdCard size={14} />} label="VAT" value="B-12345678" tooltip={isEs ? '(VAT: número fiscal de la empresa). Sirve para identificar legalmente al operador responsable.' : '(VAT: company tax number). Used to legally identify the responsible operator.'} />
          <div className="md:col-span-2 bg-bg-inner border border-border-inner rounded-lg px-3 py-2 flex items-center gap-3">
            <FaMapMarkerAlt size={14} className="text-text-link shrink-0" />
            <div>
              <p className="text-xs text-text-muted">{isEs ? 'Dirección' : 'Address'}</p>
              <p className="text-sm text-text-primary font-medium">Carrer de la Indústria 42, 08004 Barcelona, España</p>
            </div>
          </div>
          <div className="bg-bg-inner border border-border-inner rounded-lg px-3 py-2 flex items-center gap-3">
            <FaEnvelope size={14} className="text-text-link shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <a href="mailto:compliance@vela-textile.com" className="text-sm text-text-link hover:underline font-medium">
                compliance@vela-textile.com
              </a>
            </div>
          </div>
          <div className="bg-bg-inner border border-border-inner rounded-lg px-3 py-2 flex items-center gap-3">
            <FaPhone size={14} className="text-text-link shrink-0" />
            <div>
              <p className="text-xs text-text-muted">{isEs ? 'Teléfono' : 'Phone'}</p>
              <p className="text-sm text-text-primary font-medium">+34 933 123 456</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: QR grande */}
      <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-4">
          <FaQrcode className="text-text-link" size={16} />
          <h3 className="text-base font-semibold text-text-primary">{isEs ? 'Código QR' : 'QR Code'}</h3>
        </div>
        <QRCodeSVG value={publicUrl} size={180} bgColor="white" fgColor="black" />
        <p className="mt-3 text-xs text-text-muted text-center break-all max-w-md">{publicUrl}</p>
      </div>


    </div>
  );
}
