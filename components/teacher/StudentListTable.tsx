'use client';

import { useState, useMemo } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  programForSchool: string;
  status: string;
}

interface StudentListTableProps {
  students: Student[];
  assignedSchool: string;
}

type SortField = 'name' | 'email' | 'status';
type SortDirection = 'asc' | 'desc';

export default function StudentListTable({ students, assignedSchool }: StudentListTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, sortField, sortDirection]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; color: string }> = {
      APPROVED: { bg: '#E1F5EE', color: '#0F6E56' },
      PENDING: { bg: '#FAEEDA', color: '#854F0B' },
      REJECTED: { bg: '#FFDDD8', color: '#B91C1C' },
    };

    const style = statusStyles[status] || { bg: '#f4f4f0', color: '#6b6b67' };

    return (
      <span
        className="px-2 py-1 inline-flex text-xs font-medium rounded-full"
        style={{ background: style.bg, color: style.color }}
      >
        {status}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
        <p className="text-sm" style={{ color: '#6b6b67' }}>No students enrolled yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e0dfd8' }}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{ background: '#f4f4f0', borderBottom: '1px solid #e0dfd8' }}>
            <tr>
              <th
                className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
                style={{ color: '#6b6b67' }}
              >
                <div className="flex items-center gap-2">
                  <span>Student</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('email')}
                style={{ color: '#6b6b67' }}
              >
                <div className="flex items-center gap-2">
                  <span>Email</span>
                  <SortIcon field="email" />
                </div>
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b67' }}>
                Program
              </th>
              <th
                className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
                style={{ color: '#6b6b67' }}
              >
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedStudents.map((student, idx) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: idx < sortedStudents.length - 1 ? '1px solid #e0dfd8' : 'none' }}>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: '#CECBF6', color: '#3C3489' }}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#1a1a18' }}>{student.name}</div>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm" style={{ color: '#6b6b67' }}>{student.email}</div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: '#1a1a18' }}>{student.programForSchool}</div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {getStatusBadge(student.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
