'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: 'Admin' | 'Teacher' | 'Student';
  userName?: string;
  subtitle?: string;
  items: SidebarItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function Sidebar({ role, userName, subtitle, items, activeTab, onTabChange }: SidebarProps) {
  const router = useRouter();
  const initial = userName?.charAt(0).toUpperCase() ?? '?';

  return (
    <div
      className="sidebar flex flex-col h-screen overflow-hidden"
      style={{ width: '260px', flexShrink: 0 }}
    >
      {/* Brand */}
      <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Image
            src="/mcv23476_rvu-logo.png"
            alt="RV University"
            width={22}
            height={22}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">RV University</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{role} Portal</div>
        </div>
      </div>

      {/* User profile */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: '#C79A2B', color: '#0F2D52' }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{userName ?? 'User'}</div>
            <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.50)' }}>
              {subtitle ?? role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`sidebar-item w-full${activeTab === item.id ? ' sidebar-item-active' : ''}`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => router.push('/api/auth/signout')}
          className="sidebar-item w-full"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
