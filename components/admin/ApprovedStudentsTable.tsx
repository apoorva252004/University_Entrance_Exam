'use client';

interface SelectedSchool {
  schoolName: string;
  programName: string;
}

interface ApprovedStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  selectedSchools: SelectedSchool[];
  createdAt: string;
}

interface ApprovedStudentsTableProps {
  students: ApprovedStudent[];
}

export default function ApprovedStudentsTable({ students }: ApprovedStudentsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
        <p className="text-sm" style={{ color: '#666666' }}>No approved students yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student) => (
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
                Approved on {formatDate(student.createdAt)}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: '#E8F0FE', color: '#1A2D5A' }}>
                ✓ Approved
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
