'use client';

import { useEffect, useState } from 'react';

interface StudentAttempt {
  id: string;
  student: { name: string; email: string };
  submittedAt: string | null;
  score: number | null;
  totalMarks: number;
}

interface ExamResultsData {
  exam: { title: string; totalMarks: number; duration: number; mode: string; status: string };
  attempts: StudentAttempt[];
  stats: { totalAttempts: number; averageScore: number; highestScore: number; lowestScore: number };
}

interface Props { examId: string; onError: (message: string) => void; }

export default function ExamResults({ examId, onError }: Props) {
  const [data, setData] = useState<ExamResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResults(); }, [examId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/exams/${examId}/results`);
      if (!res.ok) throw new Error('Failed to fetch exam results');
      setData(await res.json());
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d: string | null) => {
    if (!d) return 'Not submitted';
    return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const scoreStyle = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct >= 80) return { badge: 'badge-success', color: '#14532D' };
    if (pct >= 60) return { badge: 'badge-warning', color: '#92400E' };
    return { badge: 'badge-error', color: '#991B1B' };
  };

  if (loading) {
    return (
      <div className="table-container flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#0F2D52', borderTopColor: 'transparent' }} />
        <p className="mt-3 text-sm" style={{ color: '#6B7280' }}>Loading results…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="table-container flex flex-col items-center justify-center py-20">
        <p className="text-sm" style={{ color: '#6B7280' }}>No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam info banner */}
      <div className="bg-white rounded-2xl px-6 py-5 flex items-center justify-between flex-wrap gap-4"
        style={{ border: '1px solid #EEF2F7', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
        <div>
          <h3 className="font-semibold text-base" style={{ color: '#0F2D52' }}>{data.exam.title}</h3>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {[
              { icon: '⭐', text: `${data.exam.totalMarks} marks` },
              { icon: '⏱', text: `${data.exam.duration} min` },
            ].map(({ icon, text }) => (
              <span key={text} className="text-sm" style={{ color: '#6B7280' }}>{icon} {text}</span>
            ))}
            <span className={`badge ${data.exam.mode === 'ONLINE' ? 'badge-info' : 'badge-navy'}`}>
              {data.exam.mode}
            </span>
            <span className="badge badge-success">{data.exam.status}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempts', value: data.stats.totalAttempts, accent: '#0F2D52', bg: '#EAF2FB' },
          { label: 'Average Score', value: `${data.stats.averageScore.toFixed(1)} / ${data.exam.totalMarks}`, accent: '#C79A2B', bg: '#FDF6E3' },
          { label: 'Highest Score', value: `${data.stats.highestScore} / ${data.exam.totalMarks}`, accent: '#16A34A', bg: '#DCFCE7' },
          { label: 'Lowest Score', value: `${data.stats.lowestScore} / ${data.exam.totalMarks}`, accent: '#DC2626', bg: '#FEE2E2' },
        ].map(({ label, value, accent, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #EEF2F7', borderTop: `4px solid ${accent}`, boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>{label}</p>
            <p className="text-xl font-bold" style={{ color: accent }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Attempts table */}
      {data.attempts.length === 0 ? (
        <div className="table-container flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#EAF2FB' }}>
            <svg className="w-8 h-8" style={{ color: '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: '#0F2D52' }}>No attempts yet</h3>
          <p className="text-sm" style={{ color: '#6B7280' }}>Students haven't attempted this exam yet</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF2F7' }}>
            <div>
              <h3 className="font-semibold" style={{ color: '#0F2D52' }}>Student Attempts</h3>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{data.attempts.length} submission{data.attempts.length !== 1 ? 's' : ''}</p>
            </div>
            <span className="badge badge-navy">{data.attempts.length} Total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Score</th>
                  <th style={{ textAlign: 'right' }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((attempt) => {
                  const pct = attempt.score !== null
                    ? ((attempt.score / attempt.totalMarks) * 100).toFixed(1)
                    : null;
                  const style = attempt.score !== null ? scoreStyle(attempt.score, attempt.totalMarks) : null;

                  return (
                    <tr key={attempt.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: '#EAF2FB', color: '#0F2D52' }}>
                            {attempt.student.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-sm" style={{ color: '#0F2D52' }}>{attempt.student.name}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm" style={{ color: '#6B7280' }}>{attempt.student.email}</span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm" style={{ color: '#6B7280' }}>{fmtDate(attempt.submittedAt)}</span>
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        {attempt.score !== null ? (
                          <span className={`badge ${style!.badge}`}>
                            {attempt.score} / {attempt.totalMarks}
                          </span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        {pct !== null ? (
                          <span className="text-sm font-semibold" style={{ color: style!.color }}>{pct}%</span>
                        ) : (
                          <span className="text-sm" style={{ color: '#9CA3AF' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
