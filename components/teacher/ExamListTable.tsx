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
  onManageQuestions: (id: string) => void;
  onPublishExam: (id: string) => void;
  onStopExam: (id: string) => void;
  onDeleteExam: (id: string) => void;
  onViewResults: (id: string) => void;
}

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  SCHEDULED: { badge: 'badge-warning', label: 'Scheduled' },
  PUBLISHED:  { badge: 'badge-info',    label: 'Published' },
  ONGOING:    { badge: 'badge-success', label: 'Ongoing' },
  COMPLETED:  { badge: 'badge-navy',    label: 'Completed' },
  CANCELLED:  { badge: 'badge-error',   label: 'Cancelled' },
};

export default function ExamListTable({ exams, onManageQuestions, onPublishExam, onStopExam, onDeleteExam, onViewResults }: Props) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (exams.length === 0) {
    return (
      <div className="table-container flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#EAF2FB' }}>
          <svg className="w-8 h-8" style={{ color: '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ color: '#0F2D52' }}>No exams yet</h3>
        <p className="text-sm" style={{ color: '#6B7280' }}>Create your first exam to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exams.map((exam) => {
        const s = STATUS_STYLES[exam.status] ?? { badge: 'badge-navy', label: exam.status };
        return (
          <div key={exam.id} className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid #EEF2F7', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
            {/* Card header */}
            <div className="px-6 py-4 flex items-start justify-between gap-4"
              style={{ borderBottom: '1px solid #F3F4F6' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-semibold text-base" style={{ color: '#0F2D52' }}>{exam.title}</h4>
                  <span className={`badge ${s.badge}`}>{s.label}</span>
                  <span className={`badge ${exam.mode === 'ONLINE' ? 'badge-info' : 'badge-navy'}`}>
                    {exam.mode === 'ONLINE' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{exam.program.name}</p>
                {exam.description && (
                  <p className="text-sm mt-1.5" style={{ color: '#9CA3AF' }}>{exam.description}</p>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="px-6 py-3 flex flex-wrap gap-5" style={{ background: '#F8FAFC', borderBottom: '1px solid #F3F4F6' }}>
              {[
                {
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                  text: `${fmtDate(exam.examDate)} · ${fmtTime(exam.examDate)}`,
                },
                {
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  text: `${exam.duration} min`,
                },
                {
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                  text: `${exam.totalMarks} marks`,
                },
                {
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
                  text: `${exam.questions?.length ?? 0} questions`,
                },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                  <span style={{ color: '#9CA3AF' }}>{icon}</span>
                  {text}
                </div>
              ))}
              {exam.venue && (
                <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                  <svg className="w-4 h-4" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {exam.venue}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-3 flex items-center justify-between gap-3">
              <span className="text-xs" style={{ color: '#9CA3AF' }}>Created by {exam.createdBy.name}</span>
              <div className="flex items-center gap-2 flex-wrap">
                {exam.mode === 'ONLINE' && exam.status === 'SCHEDULED' && (
                  <button onClick={() => onPublishExam(exam.id)} className="btn-primary" style={{ padding: '7px 14px', fontSize: '12px' }}>
                    Publish
                  </button>
                )}
                {exam.mode === 'ONLINE' && (exam.status === 'ONGOING' || exam.status === 'PUBLISHED') && (
                  <button onClick={() => onStopExam(exam.id)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: '12px' }}>
                    Stop
                  </button>
                )}
                <button onClick={() => onViewResults(exam.id)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: '12px' }}>
                  Results
                </button>
                <button onClick={() => onManageQuestions(exam.id)} className="btn-secondary" style={{ padding: '7px 14px', fontSize: '12px' }}>
                  Questions
                </button>
                <button onClick={() => onDeleteExam(exam.id)} className="btn-danger" style={{ padding: '7px 14px', fontSize: '12px' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
