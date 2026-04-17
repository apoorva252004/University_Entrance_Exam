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
      <div className="text-center py-8 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
        <p className="text-sm" style={{ color: '#6b6b67' }}>No schools selected</p>
      </div>
    );
  }

  const badgeColors = [
    { bg: '#CECBF6', text: '#3C3489' },
    { bg: '#E1F5EE', text: '#085041' }
  ];
  
  const pillColors = [
    { bg: '#EEEDFE', text: '#533490' },
    { bg: '#E1F5EE', text: '#085041' }
  ];

  return (
    <div className="space-y-3">
      {schoolNames.map((schoolName, index) => (
        <div key={schoolName} className="bg-white rounded-xl" style={{ border: '1px solid #e0dfd8', padding: '1rem 1.25rem' }}>
          {/* School Header */}
          <div className="flex items-center gap-3 mb-3">
            <span 
              className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium flex-shrink-0"
              style={{ background: badgeColors[index % 2].bg, color: badgeColors[index % 2].text }}
            >
              {index + 1}
            </span>
            <h3 className="text-sm font-medium" style={{ color: '#1a1a18' }}>{schoolName}</h3>
          </div>

          {/* Programs Row */}
          <div className="flex items-center justify-between gap-3 pt-3" style={{ borderTop: '1px solid #e0dfd8' }}>
            <div className="flex gap-2">
              {groupedBySchool[schoolName].map((program, idx) => (
                <span 
                  key={idx} 
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: pillColors[index % 2].bg, color: pillColors[index % 2].text }}
                >
                  {program}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-lg" style={{ background: '#FAEEDA', color: '#854F0B' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#BA7517' }}></span>
              Exam schedule coming soon
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
