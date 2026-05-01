'use client';

import { useRouter } from 'next/navigation';

interface Exam {
  id: string; title: string; description: string | null; examDate: string;
  duration: number; totalMarks: number; status: string; mode: string; venue: string | null;
  program: { id: string; name: string };
  school: { id: string; name: string };
  _count: { questions: number };
  attempts: { id: string; submittedAt: Date | null }[];
}
interface Props { exams: Exam[]; }

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  SCHEDULED: { label: 'Scheduled',  bg: '#FEF3C7', color: '#92400E', dot: '#D97706' },
  PUBLISHED:  { label: 'Available', bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  ONGOING:    { label: 'Live Now',  bg: '#DCFCE7', color: '#14532D', dot: '#16A34A' },
  COMPLETED:  { label: 'Completed', bg: '#EAF2FB', color: '#0F2D52', dot: '#0F2D52' },
  CANCELLED:  { label: 'Cancelled', bg: '#FEE2E2', color: '#991B1B', dot: '#DC2626' },
};

export default function StudentExamList({ exams }: Props) {
  const router = useRouter();

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (exams.length === 0) {
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F2D52', marginBottom: 6 }}>No exams scheduled</h3>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Your upcoming exams will appear here once published</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {exams.map((exam) => {
        const isAttempted = exam.attempts?.length > 0;
        const cfg = STATUS_CONFIG[exam.status] ?? { label: exam.status, bg: '#EAF2FB', color: '#0F2D52', dot: '#0F2D52' };
        const canAttempt = exam.mode === 'ONLINE' && (exam.status === 'ONGOING' || exam.status === 'PUBLISHED') && !isAttempted;
        const isLive = exam.status === 'ONGOING';

        return (
          <div
            key={exam.id}
            style={{
              background: '#fff',
              borderRadius: 18,
              border: `1px solid ${isLive ? '#86EFAC' : '#EEF2F7'}`,
              boxShadow: isLive ? '0 4px 20px rgba(22,163,74,0.10)' : '0 4px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = isLive ? '0 12px 32px rgba(22,163,74,0.15)' : '0 12px 32px rgba(0,0,0,0.09)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = isLive ? '0 4px 20px rgba(22,163,74,0.10)' : '0 4px 20px rgba(0,0,0,0.05)';
            }}
          >
            {/* Live banner */}
            {isLive && !isAttempted && (
              <div style={{ background: 'linear-gradient(90deg, #16A34A, #15803D)', padding: '8px 22px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>EXAM IS LIVE — Attempt now before time runs out</span>
              </div>
            )}

            <div style={{ padding: '20px 22px' }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F2D52', letterSpacing: '-0.2px' }}>{exam.title}</h4>
                    {/* Status badge */}
                    {isAttempted ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#DCFCE7', color: '#14532D', border: '1px solid #86EFAC' }}>
                        ✓ Submitted
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: cfg.bg, color: cfg.color }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: exam.mode === 'ONLINE' ? '#DBEAFE' : '#EAF2FB', color: exam.mode === 'ONLINE' ? '#1E40AF' : '#0F2D52' }}>
                      {exam.mode === 'ONLINE' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280' }}>
                    {exam.school.name} · {exam.program.name}
                  </p>
                  {exam.description && (
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4, lineHeight: 1.5 }}>{exam.description}</p>
                  )}
                </div>
              </div>

              {/* Meta chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px 14px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #EEF2F7', marginBottom: 16 }}>
                {[
                  {
                    icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                    text: `${fmtDate(exam.examDate)} at ${fmtTime(exam.examDate)}`,
                  },
                  {
                    icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                    text: `${exam.duration} min`,
                  },
                  {
                    icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                    text: `${exam.totalMarks} marks`,
                  },
                  {
                    icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
                    text: `${exam._count.questions} questions`,
                  },
                ].map(({ icon, text }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}>
                    <span style={{ color: '#9CA3AF' }}>{icon}</span>
                    {text}
                  </div>
                ))}
              </div>

              {/* Action */}
              {isAttempted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#16A34A' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Exam submitted successfully
                </div>
              ) : canAttempt ? (
                <button
                  onClick={() => router.push(`/student/exam/${exam.id}`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '11px 24px',
                    borderRadius: 12,
                    border: 'none',
                    background: isLive
                      ? 'linear-gradient(135deg, #16A34A, #15803D)'
                      : 'linear-gradient(135deg, #0F2D52, #173F73)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: isLive
                      ? '0 4px 14px rgba(22,163,74,0.35)'
                      : '0 4px 14px rgba(15,45,82,0.30)',
                    transition: 'all 200ms ease',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = isLive
                      ? '0 8px 24px rgba(22,163,74,0.45)'
                      : '0 8px 24px rgba(15,45,82,0.40)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = isLive
                      ? '0 4px 14px rgba(22,163,74,0.35)'
                      : '0 4px 14px rgba(15,45,82,0.30)';
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isLive ? 'Start Exam Now' : 'Attempt Exam'}
                </button>
              ) : exam.mode === 'OFFLINE' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#D97706' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Offline exam — venue details coming soon
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9CA3AF' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Not yet available
                </div>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
