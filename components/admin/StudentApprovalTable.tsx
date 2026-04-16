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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleApprove = async (studentId: string) => {
    setLoadingStates((prev) => ({ ...prev, [studentId]: 'approve' }));
    try {
      await onApprove(studentId);
    } catch (error) {
      console.error('Failed to approve student:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [studentId]: null }));
    }
  };

  const handleReject = async (studentId: string) => {
    setLoadingStates((prev) => ({ ...prev, [studentId]: 'reject' }));
    try {
      await onReject(studentId);
    } catch (error) {
      console.error('Failed to reject student:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [studentId]: null }));
    }
  };

  const toggleExpanded = (studentId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-900 text-xl font-semibold">All Caught Up!</p>
        <p className="text-gray-500 mt-2">No pending applications at the moment</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Pending Applications</h3>
        <p className="text-sm text-gray-600 mt-1">Review and approve student registrations</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Schools/Programs
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Applied On
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {students.map((student) => {
              const isExpanded = expandedRows.has(student.id);
              const loadingState = loadingStates[student.id];

              return (
                <tr key={student.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm">
                      <button
                        onClick={() => toggleExpanded(student.id)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                        <span>{student.selectedSchools.length} school(s)</span>
                      </button>
                      {isExpanded && (
                        <div className="mt-3 space-y-3 pl-6 border-l-2 border-blue-200">
                          {student.selectedSchools.map((selection, idx) => (
                            <div key={idx} className="bg-blue-50 rounded-lg p-3">
                              <div className="font-semibold text-gray-900 text-sm">{selection.schoolName}</div>
                              <div className="text-gray-600 text-xs mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                {selection.programName}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{formatDate(student.createdAt)}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(student.id)}
                        disabled={loadingState !== null}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        {loadingState === 'approve' ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Approving...
                          </span>
                        ) : (
                          '✓ Approve'
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(student.id)}
                        disabled={loadingState !== null}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        {loadingState === 'reject' ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Rejecting...
                          </span>
                        ) : (
                          '✕ Reject'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
