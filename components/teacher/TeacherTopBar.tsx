'use client';

interface Props {
  userName: string;
  assignedSchool: string;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
}

export default function TeacherTopBar({ userName, assignedSchool, onMenuClick, actions }: Props) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const initial = userName.charAt(0).toUpperCase() || 'T';

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
      {/* Greeting */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#0F2D52', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {greeting}, Prof. {userName.split(' ')[0]} 👋
        </p>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
          {dateStr} · {assignedSchool}
        </p>
      </div>

      {/* Actions slot */}
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>{actions}</div>}

      {/* Notification */}
      <button style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 150ms ease' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#14B8A6'; (e.currentTarget as HTMLButtonElement).style.background = '#F0FDFA'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
      >
        <svg width="17" height="17" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {/* Avatar */}
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #14B8A6, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(20,184,166,0.25)', cursor: 'pointer' }}>
        {initial}
      </div>
    </div>
  );
}
