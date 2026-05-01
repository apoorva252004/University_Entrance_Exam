'use client';

interface Props {
  firstName: string;
  userName: string;
  onMenuClick: () => void;
}

export default function StudentTopBar({ firstName, userName, onMenuClick }: Props) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const initial = userName.charAt(0).toUpperCase() || 'S';

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
    }}>
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="topbar-menu-btn"
        style={{
          display: 'none',
          width: 36,
          height: 36,
          borderRadius: 10,
          border: '1.5px solid #E5E7EB',
          background: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Greeting */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#0F2D52', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {greeting}, {firstName} 👋
        </p>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{dateStr}</p>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Notification bell */}
        <button style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          border: '1.5px solid #E5E7EB',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 150ms ease',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0F2D52'; (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
        >
          <svg width="17" height="17" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Dot indicator */}
          <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#C79A2B', border: '1.5px solid #fff' }} />
        </button>

        {/* Avatar */}
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0F2D52, #173F73)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 14,
          color: '#C79A2B',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(15,45,82,0.2)',
          cursor: 'pointer',
        }}>
          {initial}
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .topbar-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
