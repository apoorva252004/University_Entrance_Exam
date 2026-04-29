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
    const statusMap: Record<string, string> = {
      APPROVED: 'badge-success',
      PENDING: 'badge-warning',
      REJECTED: 'badge-error',
    };

    const badgeClass = statusMap[status] || 'badge-info';

    return (
      <span className={`badge ${badgeClass}`}>
        {status}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span style={{ color: 'var(--text-secondary)' }}>⇅</span>;
    }
    return <span style={{ color: 'var(--navy-primary)' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (students.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No students enrolled yet</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden" style={{ padding: 0 }}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--gray-200)' }}>
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
                style={{ color: 'var(--text-secondary)' }}
              >
                <div className="flex items-center gap-2">
                  <span>Student</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('email')}
                style={{ color: 'var(--text-secondary)' }}
              >
                <div className="flex items-center gap-2">
                  <span>Email</span>
                  <SortIcon field="email" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Program
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
                style={{ color: 'var(--text-secondary)' }}
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
              <tr key={student.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: idx < sortedStudents.length - 1 ? '1px solid var(--gray-200)' : 'none' }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'var(--gold-primary)', color: 'var(--navy-primary)' }}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--navy-primary)' }}>{student.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{student.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: 'var(--navy-primary)' }}>{student.programForSchool}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
