'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/lib/DataContext';
import { FaCopy, FaCheck, FaDownload, FaGlobe, FaPhone, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

export default function TabMetadata() {
  const { t, i18n } = useTranslation();
  const { activeProduct } = useData();
  const productData = activeProduct.data;
  const isEs = i18n.language === 'es';
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadJsonLd = () => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.product.name,
      brand: { '@type': 'Brand', name: productData.product.brand },
      sku: productData.product.gtin,
      identifier: productData.product.uid,
    };
    const blob = new Blob([JSON.stringify(jsonLd, null, 2)], { type: 'application/ld+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vt-cam-001.jsonld';
    a.click();
    URL.revokeObjectURL(url);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Info */}
        <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
          <h3 className="text-lg font-semibold text-white mb-4">{t('metadata.title')}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between bg-[#27272A] rounded-lg px-3 py-2 border border-[#27272A]">
              <span className="text-[#A1A1AA]">UID</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-white">{productData.product.uid}</code>
                <button onClick={() => handleCopy(productData.product.uid, 'uid')} className="text-[#34D399] p-1">
                  {copied === 'uid' ? <FaCheck className="text-[#86EFAC]" /> : <FaCopy />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#27272A] rounded-lg px-3 py-2 border border-[#27272A]">
              <span className="text-[#A1A1AA]">{t('metadata.issueDate')}</span>
              <span className="text-white">{productData.metadata.issue_date}</span>
            </div>
            <div className="flex items-center justify-between bg-[#27272A] rounded-lg px-3 py-2 border border-[#27272A]">
              <span className="text-[#A1A1AA]">{t('metadata.lastUpdate')}</span>
              <span className="text-white">{productData.metadata.last_update}</span>
            </div>
            <div className="flex items-center justify-between bg-[#27272A] rounded-lg px-3 py-2 border border-[#27272A]">
              <span className="text-[#A1A1AA]">{t('metadata.version')}</span>
              <span className="font-mono text-white">{productData.metadata.version}</span>
            </div>
            <div className="flex items-center justify-between bg-[#27272A] rounded-lg px-3 py-2 border border-[#27272A]">
              <span className="text-[#A1A1AA]">{t('metadata.dataFormat')}</span>
              <span className="text-white">{productData.metadata.data_format}</span>
            </div>
            <div className="flex items-center justify-between bg-[#27272A] rounded-lg px-3 py-2 border border-[#27272A]">
              <span className="text-[#A1A1AA]">{t('metadata.accessibility')}</span>
              <span className="text-white">{productData.metadata.accessibility}</span>
            </div>
          </div>
        </div>

        {/* QR Code Large */}
        <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A] flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white mb-4">{t('metadata.scanQr')}</h3>
          <QRCodeSVG value={productData.metadata.public_url} size={200} level="H" includeMargin />
          <p className="mt-3 text-xs text-[#A1A1AA] text-center break-all">{productData.metadata.public_url}</p>
          <button
            onClick={() => handleCopy(productData.metadata.public_url, 'url')}
            className="mt-2 text-[#34D399] text-sm flex items-center gap-1 hover:underline"
          >
            {copied === 'url' ? <><FaCheck className="text-[#86EFAC]" /> {t('copied')}</> : <><FaCopy /> {t('metadata.publicUrl')}</>}
          </button>
        </div>
      </div>

      {/* Operator Info */}
      <div className="bg-[#18181B] rounded-xl p-6 border border-[#27272A]">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaBuilding className="text-[#34D399]" /> {t('metadata.operator')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-[#71717A]" />
            <span className="text-white font-medium">{productData.metadata.operator.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaGlobe className="text-[#71717A]" />
            <span className="text-[#A1A1AA]">{isEs ? productData.metadata.operator.address : productData.metadata.operator.address_en}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-[#71717A]" />
            <a href={`mailto:${productData.metadata.operator.email}`} className="text-[#34D399] hover:underline">{productData.metadata.operator.email}</a>
          </div>
          <div className="flex items-center gap-2">
            <FaPhone className="text-[#71717A]" />
            <span className="text-[#A1A1AA]">{productData.metadata.operator.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#71717A] font-mono text-xs">VAT</span>
            <span className="font-mono text-white">{productData.metadata.operator.vat}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadJsonLd}
          className="py-2 px-4 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors flex items-center gap-2"
        >
          <FaDownload /> {t('metadata.downloadJsonLd')}
        </button>
      </div>

      {/* Language Selector */}
      <div className="bg-[#18181B] rounded-xl p-5 border border-[#27272A]">
        <h4 className="text-sm font-semibold text-white mb-2">{t('metadata.languages')}</h4>
        <div className="flex gap-2">
          {productData.metadata.languages.map((lang: string) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang.toLowerCase())}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                i18n.language === lang.toLowerCase()
                  ? 'bg-[#10B981] text-white'
                  : 'bg-[#27272A] text-[#A1A1AA] hover:bg-[#3F3F46]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
