import SignupForm from '@/components/auth/SignupForm';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 0;

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Apply to Multiple Schools',
    desc: 'One application covers all 9 schools and 25+ programs',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Track Application Status',
    desc: 'Real-time updates on your admission progress',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Fast Confirmation',
    desc: 'Instant account creation with same-day review',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Secure Admission Process',
    desc: 'Enterprise-grade security for your personal data',
  },
];

export default function SignupPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: '#F0F4F8',
      }}
    >
      {/* ══════════════════════════════════════════════════
          LEFT PANEL  50%
      ══════════════════════════════════════════════════ */}
      <div
        className="signup-left-panel"
        style={{
          width: '50%',
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #080F1E 0%, #0F2D52 35%, #173F73 70%, #0D2645 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 52px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Decorative layers */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,154,43,0.14), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(23,63,115,0.5), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '45%', left: '60%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,154,43,0.08), transparent 70%)', pointerEvents: 'none' }} />
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        {/* Diagonal accent */}
        <div style={{ position: 'absolute', top: '25%', right: '-30px', width: '2px', height: '35%', background: 'linear-gradient(to bottom, transparent, rgba(199,154,43,0.35), transparent)', transform: 'rotate(12deg)', pointerEvents: 'none' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src="/mcv23476_rvu-logo.png" alt="RV University" width={28} height={28} style={{ objectFit: 'contain' }} priority />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.2px' }}>RV University</div>
              <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.7rem', marginTop: 1 }}>Bengaluru, India</div>
            </div>
          </div>

          {/* Hero */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 24, paddingBottom: 24 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, background: 'rgba(199,154,43,0.15)', border: '1px solid rgba(199,154,43,0.32)', marginBottom: 24, width: 'fit-content' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C79A2B', boxShadow: '0 0 6px rgba(199,154,43,0.8)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C79A2B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Admissions Open 2025
              </span>
            </div>

            {/* Heading */}
            <h1 style={{ fontSize: 'clamp(1.9rem, 3vw, 2.75rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.8px', marginBottom: 18 }}>
              Begin Your<br />
              <span style={{ background: 'linear-gradient(90deg, #C79A2B, #E8B84B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Academic Journey
              </span>
            </h1>

            {/* Subheading */}
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, maxWidth: '380px', marginBottom: 36 }}>
              Apply for entrance exams across multiple schools and programs through one seamless platform.
            </p>

            {/* Feature cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: '400px' }}>
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(199,154,43,0.16)', border: '1px solid rgba(199,154,43,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C79A2B', flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{f.title}</div>
                    <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { value: '9', label: 'Schools' },
              { value: '25+', label: 'Programs' },
              { value: '1000+', label: 'Applicants' },
            ].map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)', margin: '0 24px' }} />}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.5px' }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT PANEL  50%
      ══════════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '32px 24px',
          overflowY: 'auto',
          background: '#F0F4F8',
        }}
      >
        <div style={{ width: '100%', maxWidth: '520px', paddingTop: 8, paddingBottom: 32 }}>
          {/* Mobile logo */}
          <div className="signup-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Image src="/mcv23476_rvu-logo.png" alt="RV University" width={32} height={32} style={{ objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0F2D52' }}>RV University</span>
          </div>

          {/* Card */}
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: '36px 36px 32px',
              boxShadow: '0 0 0 1px rgba(15,45,82,0.06), 0 8px 16px rgba(15,45,82,0.06), 0 32px 64px rgba(15,45,82,0.10)',
            }}
          >
            {/* Card header */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F2D52', letterSpacing: '-0.5px', marginBottom: 6, lineHeight: 1.2 }}>
                Create Account
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.5 }}>
                Fill in your details to begin your RV SAT application.
              </p>
            </div>

            <SignupForm />

            {/* Footer */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ fontWeight: 700, color: '#0F2D52', textDecoration: 'none' }}>
                  Sign in here
                </Link>
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 6 }}>
                Need help?{' '}
                <a href="mailto:admissions@rvu.edu.in" style={{ color: '#C79A2B', fontWeight: 600, textDecoration: 'none' }}>
                  admissions@rvu.edu.in
                </a>
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9CA3AF', marginTop: 16 }}>
            © {new Date().getFullYear()} RV University. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .signup-left-panel { display: flex !important; }
          .signup-mobile-logo { display: none !important; }
        }
        @media (max-width: 1023px) {
          .signup-left-panel { display: none !important; }
          .signup-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
