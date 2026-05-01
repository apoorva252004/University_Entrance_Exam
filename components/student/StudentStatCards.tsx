interface Props {
  programsCount: number;
  examsCount: number;
  completedCount: number;
}

interface CardDef {
  label: string;
  value: number;
  description: string;
  accentColor: string;
  bgColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

export default function StudentStatCards({ programsCount, examsCount, completedCount }: Props) {
  const cards: CardDef[] = [
    {
      label: 'Programs Applied',
      value: programsCount,
      description: 'Across RV University schools',
      accentColor: '#0F2D52',
      bgColor: '#EAF2FB',
      iconBg: '#EAF2FB',
      iconColor: '#0F2D52',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: 'Exams Scheduled',
      value: examsCount,
      description: 'Upcoming examinations',
      accentColor: '#C79A2B',
      bgColor: '#FDF6E3',
      iconBg: '#FDF6E3',
      iconColor: '#92400E',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Exams Completed',
      value: completedCount,
      description: 'Successfully submitted',
      accentColor: '#16A34A',
      bgColor: '#DCFCE7',
      iconBg: '#DCFCE7',
      iconColor: '#14532D',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', letterSpacing: '0.01em' }}>
              {card.label}
            </span>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: card.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.iconColor,
              flexShrink: 0,
            }}>
              {card.icon}
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F2D52', lineHeight: 1, marginBottom: 6, letterSpacing: '-1px' }}>
            {card.value}
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>{card.description}</p>
        </div>
      ))}
    </div>
  );
}
