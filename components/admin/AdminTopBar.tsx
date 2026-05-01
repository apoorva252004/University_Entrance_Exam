'use client';

import { useState } from 'react';

interface Props {
  userName: string;
  pendingCount: number;
}

export default function AdminTopBar({ userName, pendingCount }: Props) {
  const [search, setSearch] = useState('');
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  const initial = userName.charAt(0).toUpperCase() || 'A';

  return (
    <div style={{
      height: 72,
      background: '#fff',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 16,
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search students, teachers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            height: 40,
            paddingLeft: 38,
            paddingRight: 14,
            borderRadius: 10,
            border: '1.5px solid #E5E7EB',
            background: '#F9FAFB',
            fontSize: 13.5,
            color: '#111827',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
          }}
          onFocus={e => { e.target.style.borderColor = '#0F2D52'; e.target.style.boxShadow = '0 0 0 3px rgba(15,45,82,0.08)'; e.target.style.background = '#fff'; }}
          onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9FAFB'; }}
        />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Date */}
      <div style={{ fontSize: 12.5, color: '#9CA3AF', whiteSpace: 'nowrap', display: 'none' }} className="admin-topbar-date">
        {dateStr}
      </div>

      {/* Notification */}
      <button
        style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 150ms ease', flexShrink: 0 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0F2D52'; (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
      >
        <svg width="17" height="17" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {pendingCount > 0 && (
          <div style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#DC2626', border: '1.5px solid #fff' }} />
        )}
      </button>

      {/* Admin avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F2D52', lineHeight: 1.2 }}>{userName}</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>Administrator</p>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #0F2D52, #173F73)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#C79A2B', flexShrink: 0, boxShadow: '0 2px 8px rgba(15,45,82,0.20)', cursor: 'pointer' }}>
          {initial}
        </div>
      </div>

      <style>{`
        @media (min-width: 1200px) { .admin-topbar-date { display: block !important; } }
      `}</style>
    </div>
  );
}
