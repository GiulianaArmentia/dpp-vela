'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  FaSearch, FaBell, FaSun, FaMoon, FaGlobe, FaRegClock, FaChartLine, FaThLarge,
  FaChevronRight, FaClipboardCheck,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/lib/ThemeContext';
import Link from 'next/link';
import AppSidebar from '@/components/AppSidebar';

// ─── Types ───
type DppStatus = 'completo' | 'en_progreso';

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  status: DppStatus;
  completitud: number;
  pendientes: number | null;
  updatedAt: string;
}

// ─── Mock Data ───
const products: ProductRow[] = [
  { id: 'vt-cam-001', sku: 'VT-CAM-001', name: 'Camiseta unisex algodón orgánico', category: 'Camisetas', status: 'en_progreso', completitud: 78, pendientes: 6, updatedAt: 'Hace 2 días' },
  { id: 'vt-hoo-014', sku: 'VT-HOO-014', name: 'Sudadera con capucha reciclada', category: 'Sudaderas', status: 'completo', completitud: 100, pendientes: null, updatedAt: 'Hace 5 h' },
  { id: 'vt-den-022', sku: 'VT-DEN-022', name: 'Vaquero recto algodón BCI', category: 'Pantalones', status: 'en_progreso', completitud: 41, pendientes: 1, updatedAt: 'Hace 1 día' },
  { id: 'vt-knt-031', sku: 'VT-KNT-031', name: 'Jersey punto lana merino', category: 'Punto', status: 'completo', completitud: 100, pendientes: null, updatedAt: 'Hace 3 días' },
  { id: 'vt-cam-007', sku: 'VT-CAM-007', name: 'Camisa lino europeo', category: 'Camisas', status: 'en_progreso', completitud: 68, pendientes: 1, updatedAt: 'Hace 6 h' },
  { id: 'vt-jac-009', sku: 'VT-JAC-009', name: 'Chaqueta acolchada poliéster rec.', category: 'Abrigos', status: 'en_progreso', completitud: 33, pendientes: 2, updatedAt: 'Hace 2 días' },
  { id: 'vt-leg-018', sku: 'VT-LEG-018', name: 'Legging técnico elastano', category: 'Deporte', status: 'en_progreso', completitud: 79, pendientes: 1, updatedAt: 'Hace 8 h' },
  { id: 'vt-sck-040', sku: 'VT-SCK-040', name: 'Pack calcetines algodón orgánico', category: 'Accesorios', status: 'completo', completitud: 100, pendientes: null, updatedAt: 'Hace 4 días' },
];

const tabs = [
  { key: 'todos', label: 'Todos', count: 8 },
  { key: 'completo', label: 'Completo', count: 3 },
  { key: 'en_progreso', label: 'En progreso', count: 5 },
];

// ─── Components ───
function ProgressBar({ value, color = '#3B82F6' }: { value: number; color?: string }) {
  return (
    <div className="w-full h-2 bg-bg-inner rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

function StatusBadge({ status }: { status: DppStatus }) {
  if (status === 'completo') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-green/10 text-accent-green border border-accent-green/20">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
        Completo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
      En progreso
    </span>
  );
}

function StatCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 hover:border-border-inner transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary font-medium">{title}</span>
        <span className="text-text-muted">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-text-primary tracking-tight">{value}</div>
      <div className="text-xs text-text-muted mt-1">{subtitle}</div>
    </div>
  );
}

// ─── Main Page ───
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('todos');
  const [search, setSearch] = useState('');
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [showLang, setShowLang] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEs = i18n.language === 'es';

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeTab === 'completo') list = list.filter((p) => p.status === 'completo');
    if (activeTab === 'en_progreso') list = list.filter((p) => p.status === 'en_progreso');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, search]);

  const stats = {
    tareas: 36,
    pendientesPub: 16,
    completitud: '88%',
    refs: 220,
  };

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-[260px]">
        {/* Top Bar */}
        <header className="relative flex items-center h-16 border-b border-border px-4 sm:px-8 bg-bg-page">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-inner transition-colors mr-3 shrink-0"
            aria-label="Abrir menú"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H17M1 7H17M1 13H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[720px] hidden sm:block">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
              <input
                type="text"
                placeholder={t('searchPlaceholder') || 'Buscar en todo...'}
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

        {/* Content */}
        <div className="px-4 sm:px-8 lg:px-12 py-4 sm:py-8">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">{t('dashboard.title') || 'Gestión de DPPs'}</h1>
              <p className="text-sm text-text-secondary mt-1">{t('dashboard.subtitle') || 'Gestiona, resuelve y prepara el cumplimiento de tus productos en un solo lugar'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-bg-card hover:border-border-inner transition-colors">
                <span>↻</span> {t('dashboard.update') || 'Actualizar'}
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary-dark transition-colors duration-200 shadow-lg shadow-primary/20">
                <FaClipboardCheck size={16} /> {t('dashboard.pendingTasks') || 'Tareas pendientes'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title={t('dashboard.stats.pendingTasks') || 'Tareas pendientes'} value={String(stats.tareas)} subtitle={t('dashboard.stats.requireAttention') || 'Requieren tu atención'} icon={<FaBell size={16} />} />
            <StatCard title={t('dashboard.stats.pendingPublish') || 'DPP Pendientes de publicar'} value={String(stats.pendientesPub)} subtitle={t('dashboard.stats.alreadyPublished') || '184 ya publicados'} icon={<FaRegClock size={16} />} />
            <StatCard title={t('dashboard.stats.avgCompleteness') || 'Completitud media'} value={stats.completitud} subtitle={t('dashboard.stats.thisMonth') || '+4 pts este mes'} icon={<FaChartLine size={16} />} />
            <StatCard title={t('dashboard.stats.totalRefs') || 'Referencias totales'} value={String(stats.refs)} subtitle={t('dashboard.stats.catalog') || 'Catálogo Vela Textile'} icon={<FaThLarge size={16} />} />
          </div>

          {/* Table Section */}
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            {/* Filters */}
            <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                <input
                  type="text"
                  placeholder={t('dashboard.searchRef') || 'Buscar referencia...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-bg-page border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-inner transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-inner'
                    }`}
                  >
                    {tab.label} <span className="ml-1 opacity-70">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">{t('dashboard.table.product') || 'Producto'}</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">{t('dashboard.table.status') || 'Estado DPP'}</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">{t('dashboard.table.completeness') || 'Completitud'}</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-center">{t('dashboard.table.pending') || 'Pendientes'}</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">{t('dashboard.table.updated') || 'Actualizado'}</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-right">{t('dashboard.table.action') || 'Acción'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-bg-inner/50 transition-colors group">
                      {/* Producto */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-bg-inner border border-border-inner flex items-center justify-center text-text-secondary">
                            <span className="text-lg">👕</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{product.name}</p>
                            <p className="text-xs text-text-muted">{product.sku} · {product.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} />
                      </td>

                      {/* Completitud */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 max-w-[140px]">
                          <ProgressBar value={product.completitud} color={product.status === 'completo' ? '#22C55E' : '#3B82F6'} />
                          <span className="text-sm text-text-secondary font-medium w-10 text-right">{product.completitud}%</span>
                        </div>
                      </td>

                      {/* Pendientes */}
                      <td className="px-5 py-4 text-center">
                        {product.pendientes !== null ? (
                          <span className="text-sm font-semibold text-accent-amber">{product.pendientes}</span>
                        ) : (
                          <span className="text-sm text-text-muted">—</span>
                        )}
                      </td>

                      {/* Actualizado */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-text-secondary">{product.updatedAt}</span>
                      </td>

                      {/* Acción */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={product.id === 'vt-cam-001' ? '/dpp/vt-cam-001/' : '#'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-primary hover:bg-bg-inner hover:border-border-inner transition-colors group-hover:border-border-inner"
                        >
                          {t('dashboard.viewPassport') || 'Ver pasaporte'} <FaChevronRight size={10} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
