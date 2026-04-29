'use client';

import { useState } from 'react';

interface SelectedSchool {
  schoolName: string;
  programName: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  selectedSchools: SelectedSchool[];
  createdAt: string;
}

interface StudentApprovalTableProps {
  students: Student[];
  onApprove: (studentId: string) => Promise<void>;
  onReject: (studentId: string) => Promise<void>;
}

export default function StudentApprovalTable({
  students,
  onApprove,
  onReject,
}: StudentApprovalTableProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, 'approve' | 'reject' | null>>({});

  console.log('StudentApprovalTable rendered with', students.length, 'students');

  const handleApprove = async (studentId: string) => {
    console.log('=== APPROVE CLICKED ===');
    console.log('Student ID:', studentId);
    alert('Approve button clicked for: ' + studentId);
    
    setLoadingStates((prev) => ({ ...prev, [studentId]: 'approve' }));
    try {
      await onApprove(studentId);
      alert('Approved successfully!');
    } catch (error) {
      console.error('Failed to approve student:', error);
      alert('Failed to approve: ' + error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [studentId]: null }));
    }
  };

  const handleReject = async (studentId: string) => {
    console.log('=== REJECT CLICKED ===');
    console.log('Student ID:', studentId);
    alert('Reject button clicked for: ' + studentId);
    
    setLoadingStates((prev) => ({ ...prev, [studentId]: 'reject' }));
    try {
      await onReject(studentId);
      alert('Rejected successfully!');
    } catch (error) {
      console.error('Failed to reject student:', error);
      alert('Failed to reject: ' + error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [studentId]: null }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (students.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No pending applications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((student) => {
        const loadingState = loadingStates[student.id];
        
        return (
          <div key={student.id} className="card">
            <div className="flex items-start justify-between gap-6">
              {/* Student Info */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold" style={{ background: 'var(--gold-primary)', color: 'var(--navy-primary)' }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold" style={{ color: 'var(--navy-primary)' }}>{student.name}</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{student.email}</p>
                    {student.phone && (
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{student.phone}</p>
                    )}
                  </div>
                </div>

                {/* Selected Programs */}
                <div className="pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Selected Programs ({student.selectedSchools.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.selectedSchools.map((selection, idx) => (
                      <div key={idx} className="badge badge-info text-sm px-4 py-2">
                        <span className="font-semibold">{selection.schoolName}</span>
                        <span className="mx-2">·</span>
                        <span>{selection.programName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Applied {formatDate(student.createdAt)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    console.log('=== APPROVE CLICKED ===');
                    handleApprove(student.id);
                  }}
                  disabled={loadingState !== null}
                  className="btn-primary"
                >
                  {loadingState === 'approve' ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => {
                    console.log('=== REJECT CLICKED ===');
                    handleReject(student.id);
                  }}
                  disabled={loadingState !== null}
                  className="btn-secondary"
                >
                  {loadingState === 'reject' ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
