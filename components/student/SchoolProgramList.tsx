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
      <div className="text-center py-4 bg-white rounded-lg" style={{ border: '1px solid #E5E5E5' }}>
        <p className="text-xs" style={{ color: '#666666' }}>No schools selected</p>
      </div>
    );
  }

  const badgeColors = [
    { bg: '#E8F0FE', text: '#1A2D5A' },
    { bg: '#D1FAE5', text: '#065F46' }
  ];
  
  const pillColors = [
    { bg: '#E8F0FE', text: '#1A2D5A' },
    { bg: '#D1FAE5', text: '#065F46' }
  ];

  return (
    <div className="space-y-2">
      {schoolNames.map((schoolName, index) => (
        <div key={schoolName} className="bg-white rounded-lg" style={{ border: '1px solid #E5E5E5', padding: '0.625rem 0.875rem' }}>
          {/* School Header */}
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium flex-shrink-0"
              style={{ background: badgeColors[index % 2].bg, color: badgeColors[index % 2].text }}
            >
              {index + 1}
            </span>
            <h3 className="text-xs font-medium" style={{ color: '#1A2D5A' }}>{schoolName}</h3>
          </div>

          {/* Programs Row */}
          <div className="flex items-center justify-between gap-2 pt-2" style={{ borderTop: '1px solid #E5E5E5' }}>
            <div className="flex gap-1.5 flex-wrap">
              {groupedBySchool[schoolName].map((program, idx) => (
                <span 
                  key={idx} 
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: pillColors[index % 2].bg, color: pillColors[index % 2].text }}
                >
                  {program}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: '#FEF3C7', color: '#92400E' }}>
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#D97706' }}></span>
              <span className="whitespace-nowrap">Coming soon</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
