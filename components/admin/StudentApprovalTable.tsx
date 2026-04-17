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
      <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
        <p className="text-sm" style={{ color: '#6b6b67' }}>No pending applications</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student) => {
        const loadingState = loadingStates[student.id];
        
        return (
          <div key={student.id} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E5E5', padding: '1rem 1.25rem' }}>
            <div className="flex items-start justify-between gap-6">
              {/* Student Info */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: '#E8F0FE', color: '#1A2D5A' }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: '#1A2D5A' }}>{student.name}</h4>
                    <p className="text-xs mt-0.5" style={{ color: '#666666' }}>{student.email}</p>
                    {student.phone && (
                      <p className="text-xs mt-0.5" style={{ color: '#666666' }}>{student.phone}</p>
                    )}
                  </div>
                </div>

                {/* Selected Programs */}
                <div className="pt-3" style={{ borderTop: '1px solid #E5E5E5' }}>
                  <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#999999' }}>
                    Selected Programs ({student.selectedSchools.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.selectedSchools.map((selection, idx) => (
                      <div key={idx} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: '#E8F0FE', color: '#1A2D5A' }}>
                        <span className="font-medium">{selection.schoolName}</span>
                        <span className="mx-1.5">·</span>
                        <span>{selection.programName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="mt-2 text-xs" style={{ color: '#999999' }}>
                  Applied {formatDate(student.createdAt)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <div
                  onClick={() => {
                    console.log('=== APPROVE CLICKED ===');
                    handleApprove(student.id);
                  }}
                  className={`px-5 py-2 text-white text-xs font-medium rounded-lg text-center cursor-pointer select-none transition-all ${loadingState !== null ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                  style={{ background: '#1A2D5A' }}
                >
                  {loadingState === 'approve' ? 'Approving...' : 'Approve'}
                </div>
                <div
                  onClick={() => {
                    console.log('=== REJECT CLICKED ===');
                    handleReject(student.id);
                  }}
                  className={`px-5 py-2 text-xs font-medium rounded-lg text-center cursor-pointer select-none transition-all ${loadingState !== null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  style={{ color: '#666666', border: '1px solid #E5E5E5' }}
                >
                  {loadingState === 'reject' ? 'Rejecting...' : 'Reject'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
