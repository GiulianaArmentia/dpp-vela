'use client';

import { useState } from 'react';
import {
  FaSearch, FaBell, FaGlobe, FaSun, FaMoon,
  FaArrowLeft,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/lib/ThemeContext';
import { useDrawer } from '@/lib/DrawerContext';
import AppSidebar from '@/components/AppSidebar';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Tabs that use browser-only APIs (leaflet) must be loaded client-side
const TabCadena = dynamic(() => import('@/components/TabCadena'), { ssr: false });
const TabCircularidad = dynamic(() => import('@/components/TabCircularidad'), { ssr: false });

import TabProducto from '@/components/TabProducto';
import TabMateriales from '@/components/TabMateriales';
import TabCumplimiento from '@/components/TabCumplimiento';
import TabCentralDocumentacion from '@/components/TabCentralDocumentacion';
import TabResumen from '@/components/TabResumen';
import DppHeaderCompacto from '@/components/DppHeaderCompacto';
import DrawerManager from '@/components/DrawerManager';

export default function DppPage() {
  const [activeTab, setActiveTab] = useState('resumen');
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { openDrawer } = useDrawer();
  const [showLang, setShowLang] = useState(false);

  const tabs = [
    { key: 'resumen', label: t('tabs.summary') },
    { key: 'producto', label: t('tabs.product') },
    { key: 'cadena', label: t('tabs.chain') },
    { key: 'materiales', label: t('tabs.materials') },
    { key: 'circularidad', label: t('tabs.circularity') },
    { key: 'cumplimiento', label: t('tabs.compliance') },
    { key: 'documentacion', label: t('tabs.documentHub') },
  ];

  const isEs = i18n.language === 'es';

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex">
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-[260px]">
        {/* Top Bar */}
        <header className="relative flex items-center h-16 border-b border-border px-8 bg-bg-page">
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[720px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
              <input
                type="text"
                placeholder={t('searchPlaceholder') || 'Buscar en todo: producto, proveedor, certificación, material...'}
                className="w-full bg-bg-card border border-border rounded-lg pl-10 pr-12 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-inner transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-text-muted bg-bg-inner px-1.5 py-0.5 rounded">⌘K</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-inner transition-colors"
              title={theme === 'dark' ? t('header.themeToggleLight') : t('header.themeToggleDark')}
              aria-label={theme === 'dark' ? t('header.themeToggleLight') : t('header.themeToggleDark')}
            >
              {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowLang((v) => !v)}
                className="w-9 h-9 rounded-lg bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-inner transition-colors"
                title="Idioma / Language"
              >
                <FaGlobe size={16} />
              </button>
              {showLang && (
                <div className="absolute right-0 top-10 z-50 bg-bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                  <button
                    onClick={() => { i18n.changeLanguage('es'); setShowLang(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-bg-inner transition-colors ${isEs ? 'text-text-link font-medium' : 'text-text-primary'}`}
                  >
                    Español
                  </button>
                  <button
                    onClick={() => { i18n.changeLanguage('en'); setShowLang(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-bg-inner transition-colors ${!isEs ? 'text-text-link font-medium' : 'text-text-primary'}`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            <button className="w-9 h-9 rounded-lg bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-inner transition-colors relative">
              <FaBell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="bg-bg-page min-h-[calc(100vh-64px)] p-6 pl-12">
          {/* Volver */}
          <div className="mb-4">
            <Link
              href="/dashboard/"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <FaArrowLeft size={12} /> {t('back') || 'Volver'}
            </Link>
          </div>

          {/* DPP Compact Header */}
          <DppHeaderCompacto />

          {/* ─── Tabs ─── */}
          <div className="bg-bg-card border border-border rounded-xl px-2 mb-6">
            <nav className="flex overflow-x-auto gap-1 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.key
                      ? 'border-primary text-text-link'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ─── Resumen Content ─── */}
          {activeTab === 'resumen' && <TabResumen />}

          {/* ─── Tab Content ─── */}
          {activeTab === 'producto' && <TabProducto />}
          {activeTab === 'cadena' && <TabCadena />}
          {activeTab === 'materiales' && <TabMateriales />}
          {activeTab === 'circularidad' && <TabCircularidad />}
          {activeTab === 'cumplimiento' && <TabCumplimiento />}
          {activeTab === 'documentacion' && <TabCentralDocumentacion />}
        </div>
      </main>
      <DrawerManager />
    </div>
  );
}
