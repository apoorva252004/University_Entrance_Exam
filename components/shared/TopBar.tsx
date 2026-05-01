'use client';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <div
      className="bg-white px-8 py-5 flex items-center justify-between flex-shrink-0"
      style={{ borderBottom: '1px solid #E5E7EB', minHeight: '72px' }}
    >
      <div>
        <h1 className="font-bold" style={{ fontSize: '1.5rem', color: '#0F2D52', letterSpacing: '-0.3px' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
