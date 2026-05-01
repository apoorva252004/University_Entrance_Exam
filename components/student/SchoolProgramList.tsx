'use client';

interface SelectedSchool { schoolName: string; programName: string; }
interface Props { selectedSchools: SelectedSchool[]; }

const SCHOOL_COLORS = [
  { from: '#0F2D52', to: '#173F73' },
  { from: '#1a3a5c', to: '#1e4d8c' },
  { from: '#0d2540', to: '#163B6D' },
  { from: '#112244', to: '#1a3f7a' },
];

export default function SchoolProgramList({ selectedSchools }: Props) {
  const grouped = selectedSchools.reduce((acc, s) => {
    if (!acc[s.schoolName]) acc[s.schoolName] = [];
    acc[s.schoolName].push(s.programName);
    return acc;
  }, {} as Record<string, string[]>);

  const schools = Object.keys(grouped).sort();

  if (selectedSchools.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 18,
        border: '1px solid #EEF2F7',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        textAlign: 'center',
      }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: '#EAF2FB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="28" height="28" fill="none" stroke="#0F2D52" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F2D52', marginBottom: 6 }}>No programs selected</h3>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Your selected programs will appear here</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
      {schools.map((schoolName, idx) => {
        const programs = grouped[schoolName];
        const colors = SCHOOL_COLORS[idx % SCHOOL_COLORS.length];

        return (
          <div
            key={schoolName}
            style={{
              background: '#fff',
              borderRadius: 18,
              border: '1px solid #EEF2F7',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.10)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
            }}
          >
            {/* Card header */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
              padding: '20px 22px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative orb */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(199,154,43,0.15)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(199,154,43,0.2)', border: '1px solid rgba(199,154,43,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#C79A2B' }}>{idx + 1}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
                    {schoolName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C79A2B' }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                      {programs.length} program{programs.length !== 1 ? 's' : ''} applied
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Programs list */}
            <div style={{ padding: '16px 20px' }}>
              {programs.map((program, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: 12,
                    background: '#F8FAFC',
                    border: '1px solid #EEF2F7',
                    marginBottom: i < programs.length - 1 ? 8 : 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C79A2B', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {program}
                    </span>
                  </div>
                  {/* Applied badge */}
                  <span style={{
                    flexShrink: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 100,
                    background: '#FDF6E3',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    marginLeft: 8,
                  }}>
                    Applied
                  </span>
                </div>
              ))}
            </div>

            {/* Footer CTA */}
            <div style={{ padding: '0 20px 18px' }}>
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: 12,
                  border: '1.5px solid #E5E7EB',
                  background: '#F9FAFB',
                  color: '#9CA3AF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontFamily: 'inherit',
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
