'use client';

interface SelectedSchool { schoolName: string; programName: string; }
interface ApprovedStudent {
  id: string; name: string; email: string; phone: string;
  selectedSchools: SelectedSchool[]; createdAt: string;
}
interface Props { students: ApprovedStudent[]; }

export default function ApprovedStudentsTable({ students }: Props) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (students.length === 0) {
    return (
      <div className="table-container flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#EAF2FB' }}>
          <svg className="w-8 h-8" style={{ color: '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ color: '#0F2D52' }}>No approved students yet</h3>
        <p className="text-sm" style={{ color: '#6B7280' }}>Students will appear here once credentials are assigned</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF2F7' }}>
        <div>
          <h3 className="font-semibold" style={{ color: '#0F2D52' }}>Approved Students</h3>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{students.length} active student account{students.length !== 1 ? 's' : ''}</p>
        </div>
        <span className="badge badge-success">{students.length} Active</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>Student</th>
              <th>Contact</th>
              <th>Programs</th>
              <th>Approved</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: '#DCFCE7', color: '#14532D' }}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold" style={{ color: '#0F2D52' }}>{student.name}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-sm" style={{ color: '#374151' }}>{student.email}</div>
                  {student.phone && <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{student.phone}</div>}
                </td>
                <td className="table-cell">
                  <div className="flex flex-wrap gap-1.5">
                    {student.selectedSchools.slice(0, 2).map((s, i) => (
                      <span key={i} className="badge badge-navy" style={{ fontSize: '11px' }}>
                        {s.schoolName}
                      </span>
                    ))}
                    {student.selectedSchools.length > 2 && (
                      <span className="badge badge-navy" style={{ fontSize: '11px' }}>
                        +{student.selectedSchools.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  <span className="text-sm" style={{ color: '#6B7280' }}>{fmt(student.createdAt)}</span>
                </td>
                <td className="table-cell">
                  <span className="badge badge-success">Approved</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
