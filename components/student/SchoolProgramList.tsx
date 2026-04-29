'use client';

interface SelectedSchool {
  schoolName: string;
  programName: string;
}

interface SchoolProgramListProps {
  selectedSchools: SelectedSchool[];
}

export default function SchoolProgramList({ selectedSchools }: SchoolProgramListProps) {
  // Group programs by school
  const groupedBySchool = selectedSchools.reduce((acc, selection) => {
    if (!acc[selection.schoolName]) {
      acc[selection.schoolName] = [];
    }
    acc[selection.schoolName].push(selection.programName);
    return acc;
  }, {} as Record<string, string[]>);

  const schoolNames = Object.keys(groupedBySchool).sort();

  if (selectedSchools.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No schools selected</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {schoolNames.map((schoolName, index) => (
        <div key={schoolName} className="card">
          {/* School Header */}
          <div className="flex items-start gap-3 mb-4">
            <div 
              className="w-10 h-10 flex items-center justify-center rounded-lg text-base font-bold flex-shrink-0"
              style={{ background: 'var(--gold-primary)', color: 'var(--navy-primary)' }}
            >
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--navy-primary)' }}>{schoolName}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{groupedBySchool[schoolName].length} program{groupedBySchool[schoolName].length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Programs List */}
          <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
            {groupedBySchool[schoolName].map((program, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--bg-main)' }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--navy-primary)' }}>
                  {program}
                </span>
                <span className="badge badge-warning text-xs">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
            <button className="btn-secondary w-full" disabled>
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
