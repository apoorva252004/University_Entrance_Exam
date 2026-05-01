interface Props {
  totalStudents: number;
  totalTeachers: number;
  activeExams: number;
  pendingRequests: number;
}

interface KpiDef {
  label: string;
  value: number;
  description: string;
  trend: string;
  trendUp: boolean;
  accentColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

export default function AdminKpiCards({ totalStudents, totalTeachers, activeExams, pendingRequests }: Props) {
  const cards: KpiDef[] = [
    {
      label: 'Total Students',
      value: totalStudents,
      description: 'Approved accounts',
      trend: '+12% this month',
      trendUp: true,
      accentColor: '#0F2D52',
      iconBg: '#EAF2FB',
      iconColor: '#0F2D52',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Teachers',
      value: totalTeachers,
      description: 'Active teaching staff',
      trend: 'Across 9 schools',
      trendUp: true,
      accentColor: '#173F73',
      iconBg: '#DBEAFE',
      iconColor: '#1E40AF',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Active Exams',
      value: activeExams,
      description: 'Currently published',
      trend: 'Live now',
      trendUp: true,
      accentColor: '#16A34A',
      iconBg: '#DCFCE7',
      iconColor: '#14532D',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Pending Requests',
      value: pendingRequests,
      description: 'Awaiting credentials',
      trend: pendingRequests > 0 ? 'Action required' : 'All clear',
      trendUp: pendingRequests === 0,
      accentColor: pendingRequests > 0 ? '#D97706' : '#16A34A',
      iconBg: pendingRequests > 0 ? '#FEF3C7' : '#DCFCE7',
      iconColor: pendingRequests > 0 ? '#92400E' : '#14532D',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: '#fff',
            borderRadius: 18,
            padding: '22px 24px',
            border: '1px solid #EEF2F7',
            borderTop: `4px solid ${card.accentColor}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            transition: 'transform 200ms ease, box-shadow 200ms ease',
            cursor: 'default',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#6B7280', letterSpacing: '0.01em' }}>{card.label}</span>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.iconColor, flexShrink: 0 }}>
              {card.icon}
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F2D52', lineHeight: 1, marginBottom: 8, letterSpacing: '-1px' }}>
            {card.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>{card.description}</p>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: card.trendUp ? '#16A34A' : '#D97706', background: card.trendUp ? '#DCFCE7' : '#FEF3C7', padding: '2px 8px', borderRadius: 100, whiteSpace: 'nowrap' }}>
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
