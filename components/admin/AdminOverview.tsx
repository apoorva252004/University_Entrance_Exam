'use client';

import { useState } from 'react';

interface SelectedSchool { schoolName: string; programName: string; }
interface Student {
  id: string; name: string; email: string; phone?: string;
  selectedSchools: SelectedSchool[]; createdAt: string;
}
interface ApprovedStudent {
  id: string; name: string; email: string; phone: string;
  selectedSchools: SelectedSchool[]; createdAt: string;
}
interface Teacher {
  id: string; name: string; email: string; phone: string;
  assignedSchool: string; status: string; createdAt: string;
}

interface Props {
  pendingStudents: Student[];
  approvedStudents: ApprovedStudent[];
  teachers: Teacher[];
  onNavigate: (tab: 'pending' | 'approved' | 'teachers') => void;
  onAssignCredentials: (student: Student) => void;
}

const QUICK_ACTIONS = [
  {
    label: 'Assign Credentials',
    desc: 'Activate pending accounts',
    color: '#C79A2B',
    bg: '#FDF6E3',
    border: '#FDE68A',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    tab: 'pending' as const,
  },
  {
    label: 'View All Students',
    desc: 'Browse approved accounts',
    color: '#16A34A',
    bg: '#DCFCE7',
    border: '#86EFAC',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    tab: 'approved' as const,
  },
  {
    label: 'Manage Teachers',
    desc: 'View teaching staff',
    color: '#2563EB',
    bg: '#DBEAFE',
    border: '#93C5FD',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tab: 'teachers' as const,
  },
  {
    label: 'System Status',
    desc: 'All systems operational',
    color: '#0F2D52',
    bg: '#EAF2FB',
    border: '#BFDBFE',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    tab: null,
  },
];

export default function AdminOverview({ pendingStudents, approvedStudents, teachers, onNavigate, onAssignCredentials }: Props) {
  const [search, setSearch] = useState('');

  const recentAll = [
    ...pendingStudents.map(s => ({ ...s, type: 'pending' as const })),
    ...approvedStudents.map(s => ({ ...s, type: 'approved' as const })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const filtered = recentAll.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* ── Left: Recent Registrations ── */}
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F2D52' }}>Recent Registrations</h3>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Latest student applications</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ height: 34, paddingLeft: 30, paddingRight: 12, borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#F9FAFB', fontSize: 12.5, color: '#111827', outline: 'none', fontFamily: 'inherit', width: 160, transition: 'border-color 150ms ease' }}
                onFocus={e => { e.target.style.borderColor = '#0F2D52'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }}
              />
            </div>
            <button
              onClick={() => onNavigate('pending')}
              style={{ fontSize: 12, fontWeight: 600, color: '#C79A2B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}
            >
              View all →
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                {['Student', 'Email', 'Programs', 'Registered', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 18px', textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
                    No registrations found
                  </td>
                </tr>
              ) : (
                filtered.map((student, idx) => (
                  <tr
                    key={student.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 120ms ease' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFBFF'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: student.type === 'pending' ? '#FEF3C7' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: student.type === 'pending' ? '#92400E' : '#14532D', flexShrink: 0 }}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{student.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{student.email}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#EAF2FB', color: '#0F2D52' }}>
                        {student.selectedSchools.length} program{student.selectedSchools.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 12.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{fmt(student.createdAt)}</td>
                    <td style={{ padding: '13px 18px' }}>
                      {student.type === 'pending' ? (
                        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>Pending</span>
                      ) : (
                        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#DCFCE7', color: '#14532D', border: '1px solid #86EFAC' }}>Approved</span>
                      )}
                    </td>
                    <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                      {student.type === 'pending' && (
                        <button
                          onClick={() => onAssignCredentials(student as Student)}
                          style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #C79A2B, #E8B84B)', color: '#0F2D52', cursor: 'pointer', transition: 'all 150ms ease', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(199,154,43,0.35)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
                        >
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right: Quick Actions + Stats ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F2D52' }}>Quick Actions</h3>
            <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2 }}>Common admin tasks</p>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => action.tab && onNavigate(action.tab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1px solid ${action.border}`,
                  background: action.bg,
                  cursor: action.tab ? 'pointer' : 'default',
                  transition: 'all 150ms ease',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  width: '100%',
                }}
                onMouseEnter={e => { if (action.tab) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  {action.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 1 }}>{action.label}</p>
                  <p style={{ fontSize: 11.5, color: '#6B7280' }}>{action.desc}</p>
                </div>
                {action.tab && (
                  <svg style={{ marginLeft: 'auto', flexShrink: 0, color: '#9CA3AF' }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* System summary */}
        <div style={{ background: 'linear-gradient(135deg, #0F2D52 0%, #173F73 100%)', borderRadius: 18, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(199,154,43,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>System Status</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>All Systems Operational</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>RV SAT platform running normally</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total Users', value: String(approvedStudents.length + teachers.length) },
                { label: 'Schools', value: '9' },
                { label: 'Programs', value: '12+' },
                { label: 'Uptime', value: '99.9%' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 1100px) {
          .admin-overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
