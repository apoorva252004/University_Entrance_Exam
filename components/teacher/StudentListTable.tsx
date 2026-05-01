'use client';

import { useState, useMemo } from 'react';

interface Student { id: string; name: string; email: string; programForSchool: string; status: string; }
interface Props { students: Student[]; assignedSchool: string; }

type SortField = 'name' | 'email' | 'status';
type SortDir = 'asc' | 'desc';

export default function StudentListTable({ students, assignedSchool }: Props) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...students]
      .filter(s => !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortField].toLowerCase();
        const bv = b[sortField].toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [students, sortField, sortDir, search]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      APPROVED: 'badge-success',
      PENDING: 'badge-warning',
      REJECTED: 'badge-error',
    };
    return <span className={`badge ${map[status] ?? 'badge-info'}`}>{status}</span>;
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      style={{ color: sortField === field ? '#0F2D52' : '#D1D5DB' }}>
      {sortField === field && sortDir === 'asc'
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        : sortField === field
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />}
    </svg>
  );

  if (students.length === 0) {
    return (
      <div className="table-container flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#EAF2FB' }}>
          <svg className="w-8 h-8" style={{ color: '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ color: '#0F2D52' }}>No students enrolled</h3>
        <p className="text-sm" style={{ color: '#6B7280' }}>Students assigned to {assignedSchool} will appear here</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid #EEF2F7' }}>
        <div>
          <h3 className="font-semibold" style={{ color: '#0F2D52' }}>Enrolled Students</h3>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{assignedSchool} · {filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search students…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px', width: '220px', padding: '9px 12px 9px 36px' }}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>
                <button onClick={() => handleSort('name')} className="flex items-center gap-1.5" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Student <SortIcon field="name" />
                </button>
              </th>
              <th>
                <button onClick={() => handleSort('email')} className="flex items-center gap-1.5" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email <SortIcon field="email" />
                </button>
              </th>
              <th>Program</th>
              <th>
                <button onClick={() => handleSort('status')} className="flex items-center gap-1.5" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status <SortIcon field="status" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: '#FDF6E3', color: '#92400E' }}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold" style={{ color: '#0F2D52' }}>{student.name}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className="text-sm" style={{ color: '#6B7280' }}>{student.email}</span>
                </td>
                <td className="table-cell">
                  <span className="badge badge-navy">{student.programForSchool}</span>
                </td>
                <td className="table-cell">{statusBadge(student.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
