interface StatCardProps {
  label: string;
  value: number | string;
  description?: string;
  accent?: 'navy' | 'gold' | 'success' | 'info';
  icon?: React.ReactNode;
}

const accentMap = {
  navy:    { bar: '#0F2D52', iconBg: '#EAF2FB', iconColor: '#0F2D52' },
  gold:    { bar: '#C79A2B', iconBg: '#FDF6E3', iconColor: '#92400E' },
  success: { bar: '#16A34A', iconBg: '#DCFCE7', iconColor: '#14532D' },
  info:    { bar: '#2563EB', iconBg: '#DBEAFE', iconColor: '#1E40AF' },
};

export default function StatCard({ label, value, description, accent = 'navy', icon }: StatCardProps) {
  const colors = accentMap[accent];

  return (
    <div
      className="bg-white rounded-2xl p-6 flex flex-col gap-3"
      style={{
        border: '1px solid #EEF2F7',
        boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
        borderTop: `4px solid ${colors.bar}`,
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold" style={{ color: '#6B7280' }}>{label}</span>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: colors.iconBg, color: colors.iconColor }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="font-bold" style={{ fontSize: '2rem', color: '#0F2D52', lineHeight: 1 }}>
        {value}
      </div>
      {description && (
        <p className="text-xs" style={{ color: '#9CA3AF' }}>{description}</p>
      )}
    </div>
  );
}
