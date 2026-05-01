interface Props {
  examsCreated: number;
  questionsUploaded: number;
  studentsAssigned: number;
  pendingEvaluations: number;
}

export default function TeacherKpiCards({ examsCreated, questionsUploaded, studentsAssigned, pendingEvaluations }: Props) {
  const cards = [
    {
      label: 'Exams Created',
      value: examsCreated,
      desc: 'Total examinations',
      accent: '#0F2D52',
      iconBg: '#EAF2FB',
      iconColor: '#0F2D52',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    },
    {
      label: 'Questions Uploaded',
      value: questionsUploaded,
      desc: 'Across all exams',
      accent: '#14B8A6',
      iconBg: '#F0FDFA',
      iconColor: '#0D9488',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    },
    {
      label: 'Students Assigned',
      value: studentsAssigned,
      desc: 'In your school',
      accent: '#C79A2B',
      iconBg: '#FDF6E3',
      iconColor: '#92400E',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    },
    {
      label: 'Pending Evaluations',
      value: pendingEvaluations,
      desc: pendingEvaluations > 0 ? 'Needs attention' : 'All evaluated',
      accent: pendingEvaluations > 0 ? '#D97706' : '#16A34A',
      iconBg: pendingEvaluations > 0 ? '#FEF3C7' : '#DCFCE7',
      iconColor: pendingEvaluations > 0 ? '#92400E' : '#14532D',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
      {cards.map(card => (
        <div
          key={card.label}
          style={{ background: '#fff', borderRadius: 18, padding: '22px 24px', border: '1px solid #EEF2F7', borderTop: `4px solid ${card.accent}`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 200ms ease, box-shadow 200ms ease', cursor: 'default', fontFamily: "'Inter', -apple-system, sans-serif" }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#6B7280' }}>{card.label}</span>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.iconColor, flexShrink: 0 }}>
              {card.icon}
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F2D52', lineHeight: 1, marginBottom: 6, letterSpacing: '-1px' }}>{card.value}</div>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>{card.desc}</p>
        </div>
      ))}
    </div>
  );
}
