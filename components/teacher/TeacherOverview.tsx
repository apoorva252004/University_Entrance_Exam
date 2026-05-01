'use client';

interface Exam {
  id: string; title: string; description: string | null; examDate: string;
  duration: number; totalMarks: number; status: string; mode: string; venue: string | null;
  program: { id: string; name: string };
  createdBy: { name: string; email: string };
  questions?: { id: string }[];
}

interface Props {
  exams: Exam[];
  studentsCount: number;
  onNavigate: (tab: string) => void;
  onManageQuestions: (examId: string) => void;
  onViewResults: (examId: string) => void;
  onPublishExam: (examId: string) => void;
  onStopExam: (examId: string) => void;
  onDeleteExam: (examId: string) => void;
}

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  SCHEDULED: { label: 'Scheduled', bg: '#FEF3C7', color: '#92400E', dot: '#D97706' },
  PUBLISHED:  { label: 'Published', bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  ONGOING:    { label: 'Live',      bg: '#DCFCE7', color: '#14532D', dot: '#16A34A' },
  COMPLETED:  { label: 'Completed', bg: '#EAF2FB', color: '#0F2D52', dot: '#0F2D52' },
  CANCELLED:  { label: 'Cancelled', bg: '#FEE2E2', color: '#991B1B', dot: '#DC2626' },
};

const QUICK_ACTIONS = [
  {
    label: 'Create New Exam',
    desc: 'Set up a new examination',
    tab: 'create-exam',
    color: '#0F2D52',
    bg: '#EAF2FB',
    border: '#BFDBFE',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
  },
  {
    label: 'View All Students',
    desc: 'Browse enrolled students',
    tab: 'students',
    color: '#C79A2B',
    bg: '#FDF6E3',
    border: '#FDE68A',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
  {
    label: 'Manage All Exams',
    desc: 'Edit, publish, or delete',
    tab: 'exams',
    color: '#14B8A6',
    bg: '#F0FDFA',
    border: '#99F6E4',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  },
];

export default function TeacherOverview({ exams, studentsCount, onNavigate, onManageQuestions, onViewResults, onPublishExam, onStopExam, onDeleteExam }: Props) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const recentExams = exams.slice(0, 4);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* ── Left: Recent Exams ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F2D52' }}>Recent Exams</h3>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{exams.length} exam{exams.length !== 1 ? 's' : ''} created</p>
          </div>
          <button onClick={() => onNavigate('exams')} style={{ fontSize: 12, fontWeight: 600, color: '#14B8A6', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
            View all →
          </button>
        </div>

        {exams.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EAF2FB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="24" height="24" fill="none" stroke="#0F2D52" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F2D52', marginBottom: 6 }}>No exams yet</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Create your first exam to get started</p>
            <button onClick={() => onNavigate('create-exam')} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0F2D52, #173F73)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Create Exam
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentExams.map(exam => {
              const cfg = STATUS_CFG[exam.status] ?? { label: exam.status, bg: '#EAF2FB', color: '#0F2D52', dot: '#0F2D52' };
              const isLive = exam.status === 'ONGOING';
              return (
                <div
                  key={exam.id}
                  style={{ background: '#fff', borderRadius: 16, border: `1px solid ${isLive ? '#86EFAC' : '#EEF2F7'}`, boxShadow: isLive ? '0 4px 20px rgba(22,163,74,0.10)' : '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'transform 180ms ease, box-shadow 180ms ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = isLive ? '0 12px 32px rgba(22,163,74,0.15)' : '0 12px 32px rgba(0,0,0,0.09)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = isLive ? '0 4px 20px rgba(22,163,74,0.10)' : '0 4px 20px rgba(0,0,0,0.05)'; }}
                >
                  {isLive && (
                    <div style={{ background: 'linear-gradient(90deg, #16A34A, #15803D)', padding: '6px 18px', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>LIVE NOW</span>
                    </div>
                  )}
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F2D52' }}>{exam.title}</h4>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: cfg.bg, color: cfg.color }}>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: cfg.dot }} />
                            {cfg.label}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: exam.mode === 'ONLINE' ? '#DBEAFE' : '#EAF2FB', color: exam.mode === 'ONLINE' ? '#1E40AF' : '#0F2D52' }}>
                            {exam.mode === 'ONLINE' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#6B7280' }}>{exam.program.name}</p>
                      </div>
                    </div>

                    {/* Meta chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '10px 12px', borderRadius: 10, background: '#F8FAFC', marginBottom: 12 }}>
                      {[
                        { icon: '📅', text: `${fmtDate(exam.examDate)} · ${fmtTime(exam.examDate)}` },
                        { icon: '⏱', text: `${exam.duration} min` },
                        { icon: '⭐', text: `${exam.totalMarks} marks` },
                        { icon: '📝', text: `${exam.questions?.length ?? 0} questions` },
                      ].map(({ icon, text }) => (
                        <span key={text} style={{ fontSize: 12, color: '#6B7280' }}>{icon} {text}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {exam.mode === 'ONLINE' && exam.status === 'SCHEDULED' && (
                        <button onClick={() => onPublishExam(exam.id)} style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #0F2D52, #173F73)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms ease' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
                        >Publish</button>
                      )}
                      {exam.mode === 'ONLINE' && (exam.status === 'ONGOING' || exam.status === 'PUBLISHED') && (
                        <button onClick={() => onStopExam(exam.id)} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Stop</button>
                      )}
                      <button onClick={() => onViewResults(exam.id)} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Results</button>
                      <button onClick={() => onManageQuestions(exam.id)} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid #0F2D52', background: 'transparent', color: '#0F2D52', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Questions</button>
                      <button onClick={() => onDeleteExam(exam.id)} style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: '#FEE2E2', color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: Quick Actions + School Summary ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F2D52' }}>Quick Actions</h3>
            <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2 }}>Common teaching tasks</p>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => onNavigate(action.tab)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1px solid ${action.border}`, background: action.bg, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%', transition: 'all 150ms ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  {action.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 1 }}>{action.label}</p>
                  <p style={{ fontSize: 11.5, color: '#6B7280' }}>{action.desc}</p>
                </div>
                <svg style={{ marginLeft: 'auto', flexShrink: 0, color: '#9CA3AF' }} width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* School summary card */}
        <div style={{ background: 'linear-gradient(135deg, #0F2D52 0%, #173F73 100%)', borderRadius: 18, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(20,184,166,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Your Workspace</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Students', value: String(studentsCount) },
                { label: 'Exams', value: String(exams.length) },
                { label: 'Active', value: String(exams.filter(e => e.status === 'ONGOING' || e.status === 'PUBLISHED').length) },
                { label: 'Completed', value: String(exams.filter(e => e.status === 'COMPLETED').length) },
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

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
