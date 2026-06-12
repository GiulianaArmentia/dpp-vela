'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaEllipsisV, FaShieldAlt, FaIndustry, FaChartLine, FaClipboardList } from 'react-icons/fa';

export default function AppSidebar() {
  const pathname = usePathname();

  const isDashboard = pathname === '/dashboard' || pathname === '/dashboard/' || pathname === '/' || pathname === '';
  const isDpp = pathname.startsWith('/dpp/');

  return (
    <aside className="w-[260px] min-h-screen bg-bg-page border-r border-bg-card flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">VT</div>
        <span className="text-text-primary font-semibold text-lg tracking-tight">Vela Textile</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2">
        <div className="space-y-1 mt-4">
          <Link
            href="/dashboard/"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              isDashboard
                ? 'bg-bg-card text-text-primary border border-border'
                : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <FaClipboardList className="text-primary" size={16} />
              <span className="font-medium">Gestión de DPPs</span>
            </div>
            <span className="text-[11px] font-semibold bg-bg-inner text-text-secondary px-2 py-0.5 rounded-full">220</span>
          </Link>
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors text-sm">
            <div className="flex items-center gap-3">
              <FaShieldAlt size={16} />
              <span>Cumplimiento</span>
            </div>
            <span className="text-[11px] font-semibold bg-accent-amber/10 text-accent-amber px-2 py-0.5 rounded-full">36</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors text-sm">
            <div className="flex items-center gap-3">
              <FaIndustry size={16} />
              <span>Proveedores</span>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors text-sm">
            <div className="flex items-center gap-3">
              <FaChartLine size={16} />
              <span>Reporting CSRD</span>
            </div>
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold text-xs">LM</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Laura Méndez</p>
            <p className="text-xs text-text-muted truncate">Sustainability Manager</p>
          </div>
          <button className="text-text-muted hover:text-text-primary transition-colors"><FaEllipsisV size={14} /></button>
        </div>
      </div>
    </aside>
  );
}
