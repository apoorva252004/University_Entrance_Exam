'use client';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedSchool: string;
  status: string;
  createdAt: string;
}

interface TeacherListTableProps {
  teachers: Teacher[];
}

export default function TeacherListTable({ teachers }: TeacherListTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
        <p className="text-sm" style={{ color: '#6b6b67' }}>No teachers found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e0dfd8' }}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{ background: '#f4f4f0', borderBottom: '1px solid #e0dfd8' }}>
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b67' }}>
                Teacher
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b67' }}>
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b67' }}>
                Phone
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b67' }}>
                Assigned School
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b67' }}>
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {teachers.map((teacher, idx) => (
              <tr key={teacher.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: idx < teachers.length - 1 ? '1px solid #e0dfd8' : 'none' }}>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: '#CECBF6', color: '#3C3489' }}>
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#1a1a18' }}>{teacher.name}</div>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm" style={{ color: '#6b6b67' }}>{teacher.email}</div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm" style={{ color: '#6b6b67' }}>{teacher.phone}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium" style={{ color: '#1a1a18' }}>{teacher.assignedSchool}</div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm" style={{ color: '#6b6b67' }}>{formatDate(teacher.createdAt)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
