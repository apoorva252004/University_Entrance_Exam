'use client';

interface Teacher {
  id: string; name: string; email: string; phone: string;
  assignedSchool: string; status: string; createdAt: string;
}
interface Props { teachers: Teacher[]; }

export default function TeacherListTable({ teachers }: Props) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (teachers.length === 0) {
    return (
      <div className="table-container flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#DBEAFE' }}>
          <svg className="w-8 h-8" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ color: '#0F2D52' }}>No teachers found</h3>
        <p className="text-sm" style={{ color: '#6B7280' }}>Teachers will appear here once added</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF2F7' }}>
        <div>
          <h3 className="font-semibold" style={{ color: '#0F2D52' }}>Teaching Staff</h3>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <span className="badge badge-info">{teachers.length} Total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>Teacher</th>
              <th>Contact</th>
              <th>Assigned School</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold" style={{ color: '#0F2D52' }}>{teacher.name}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-sm" style={{ color: '#374151' }}>{teacher.email}</div>
                  {teacher.phone && <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{teacher.phone}</div>}
                </td>
                <td className="table-cell">
                  <span className="badge badge-navy">{teacher.assignedSchool}</span>
                </td>
                <td className="table-cell">
                  <span className="text-sm" style={{ color: '#6B7280' }}>{fmt(teacher.createdAt)}</span>
                </td>
                <td className="table-cell">
                  <span className="badge badge-success">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
