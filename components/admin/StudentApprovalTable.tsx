'use client';

import { useState } from 'react';

interface SelectedSchool { schoolName: string; programName: string; }
interface Student {
  id: string; name: string; email: string; phone?: string;
  selectedSchools: SelectedSchool[]; createdAt: string;
}
interface Props {
  students: Student[];
  onApprove: (studentId: string) => Promise<void>;
  onReject: (studentId: string) => Promise<void>;
}

export default function StudentApprovalTable({ students, onApprove, onReject }: Props) {
  const [loadingStates, setLoadingStates] = useState<Record<string, 'approve' | 'reject' | null>>({});

  const handleApprove = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: 'approve' }));
    try { await onApprove(id); }
    catch (err) { console.error('Failed to approve student:', err); }
    finally { setLoadingStates(prev => ({ ...prev, [id]: null })); }
  };

  const handleReject = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: 'reject' }));
    try { await onReject(id); }
    catch (err) { console.error('Failed to reject student:', err); }
    finally { setLoadingStates(prev => ({ ...prev, [id]: null })); }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (students.length === 0) {
    return (
      <div className="table-container flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#EAF2FB' }}>
          <svg className="w-8 h-8" style={{ color: '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ color: '#0F2D52' }}>No pending applications</h3>
        <p className="text-sm" style={{ color: '#6B7280' }}>All applications have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((student) => {
        const ls = loadingStates[student.id];
        return (
          <div key={student.id} className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid #EEF2F7', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
            <div className="px-6 py-5 flex items-start justify-between gap-6">
              {/* Student info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                    style={{ background: '#FDF6E3', color: '#92400E' }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#0F2D52' }}>{student.name}</h4>
                    <p className="text-sm" style={{ color: '#6B7280' }}>{student.email}</p>
                    {student.phone && <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{student.phone}</p>}
                  </div>
                </div>

                {/* Programs */}
                <div className="pt-4" style={{ borderTop: '1px solid #EEF2F7' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
                    Selected Programs ({student.selectedSchools.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.selectedSchools.map((s, i) => (
                      <span key={i} className="badge badge-navy" style={{ fontSize: '12px' }}>
                        {s.schoolName} · {s.programName}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-xs" style={{ color: '#9CA3AF' }}>Applied {fmt(student.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5 flex-shrink-0">
                <button onClick={() => handleApprove(student.id)} disabled={ls !== null}
                  className="btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
                  {ls === 'approve' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Approving…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </>
                  )}
                </button>
                <button onClick={() => handleReject(student.id)} disabled={ls !== null}
                  className="btn-danger" style={{ padding: '9px 20px', fontSize: '13px' }}>
                  {ls === 'reject' ? 'Rejecting…' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
