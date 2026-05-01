'use client';

import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

/* ─────────────────────────────────────────────────────────
   Stat pill used in the bottom stats row
───────────────────────────────────────────────────────── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          marginTop: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Premium feature card on the left panel
───────────────────────────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 18px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'rgba(199,154,43,0.18)',
          border: '1px solid rgba(199,154,43,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#C79A2B',
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '2px',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main login content
───────────────────────────────────────────────────────── */
function LoginContent() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 10000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: '#F0F4F8',
      }}
    >
      {/* ══════════════════════════════════════════════════
          LEFT PANEL  60%
      ══════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'none',
          flexDirection: 'column',
          width: '60%',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #0A1F3C 0%, #0F2D52 35%, #173F73 70%, #0D2645 100%)',
        }}
        className="lg-flex"
      >
        {/* ── Geometric background shapes ── */}
        {/* Large blurred orb top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-80px',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at center, rgba(199,154,43,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Medium orb bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-60px',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at center, rgba(23,63,115,0.6) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />
        {/* Diagonal accent line */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '-40px',
            width: '2px',
            height: '40%',
            background:
              'linear-gradient(to bottom, transparent, rgba(199,154,43,0.4), transparent)',
            transform: 'rotate(15deg)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Content wrapper ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '40px 52px',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Image
                src="/mcv23476_rvu-logo.png"
                alt="RV University"
                width={28}
                height={28}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <div>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '-0.2px',
                }}
              >
                RV University
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.04em',
                }}
              >
                Bengaluru, India
              </div>
            </div>
          </div>

          {/* Hero content — vertically centered */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '20px', paddingBottom: '20px' }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 14px',
                borderRadius: '100px',
                background: 'rgba(199,154,43,0.15)',
                border: '1px solid rgba(199,154,43,0.35)',
                marginBottom: '28px',
                width: 'fit-content',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#C79A2B',
                  boxShadow: '0 0 6px rgba(199,154,43,0.8)',
                }}
              />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#C79A2B',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                RV Scholastic Aptitude Test
              </span>
            </div>

            {/* Main heading */}
            <h1
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 3rem)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.1,
                letterSpacing: '-1px',
                marginBottom: '20px',
              }}
            >
              Shape Your Future
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #C79A2B, #E8B84B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                at RV University
              </span>
            </h1>

            {/* Subheading */}
            <p
              style={{
                fontSize: '0.975rem',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.75,
                maxWidth: '380px',
                marginBottom: '36px',
              }}
            >
              Apply, take exams, and access results through one seamless digital platform built for tomorrow's leaders.
            </p>

            {/* Feature cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
              <FeatureCard
                icon={
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
                title="12+ Programs"
                desc="Undergraduate programs across 9 schools of excellence"
              />
              <FeatureCard
                icon={
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Fast Results"
                desc="Exam results published within 48 hours of completion"
              />
              <FeatureCard
                icon={
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                title="Secure Exams"
                desc="Enterprise-grade security for every examination session"
              />
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0',
              paddingTop: '28px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <StatPill value="95%" label="Placement Support" />
            <div
              style={{
                width: '1px',
                height: '32px',
                background: 'rgba(255,255,255,0.12)',
                margin: '0 28px',
              }}
            />
            <StatPill value="9" label="Schools" />
            <div
              style={{
                width: '1px',
                height: '32px',
                background: 'rgba(255,255,255,0.12)',
                margin: '0 28px',
              }}
            />
            <StatPill value="1000+" label="Applicants" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT PANEL  40%
      ══════════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          background: '#F0F4F8',
          minHeight: '100vh',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Mobile logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '28px',
            }}
            className="mobile-logo"
          >
            <Image
              src="/mcv23476_rvu-logo.png"
              alt="RV University"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
            <span
              style={{ fontWeight: 700, fontSize: '1rem', color: '#0F2D52' }}
            >
              RV University
            </span>
          </div>

          {/* ── Login Card ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: '24px',
              padding: '40px',
              boxShadow:
                '0 0 0 1px rgba(15,45,82,0.06), 0 8px 16px rgba(15,45,82,0.06), 0 32px 64px rgba(15,45,82,0.10)',
            }}
          >
            {/* Success banner */}
            {showSuccess && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  marginBottom: '24px',
                  animation: 'slideDown 300ms ease',
                }}
              >
                <svg
                  style={{ color: '#16A34A', flexShrink: 0, marginTop: '1px' }}
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#14532D',
                      marginBottom: '2px',
                    }}
                  >
                    Registration Successful!
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#166534', lineHeight: 1.5 }}>
                    Your account is under review. You'll be notified once approved.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#16A34A',
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Card header */}
            <div style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: '1.625rem',
                  fontWeight: 800,
                  color: '#0F2D52',
                  letterSpacing: '-0.5px',
                  marginBottom: '6px',
                  lineHeight: 1.2,
                }}
              >
                Welcome back
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.5 }}>
                Sign in to your RV SAT portal
              </p>
            </div>

            {/* Form */}
            <LoginForm />

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '24px 0',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Create account CTA */}
            <Link
              href="/signup"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: '1.5px solid #E5E7EB',
                background: '#fff',
                color: '#0F2D52',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#0F2D52';
                (e.currentTarget as HTMLAnchorElement).style.background = '#F8FAFC';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E5E7EB';
                (e.currentTarget as HTMLAnchorElement).style.background = '#fff';
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create an Account
            </Link>

            {/* Footer */}
            <p
              style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#9CA3AF',
                marginTop: '20px',
              }}
            >
              Need help?{' '}
              <a
                href="mailto:admissions@rvu.edu.in"
                style={{ color: '#C79A2B', fontWeight: 600, textDecoration: 'none' }}
              >
                admissions@rvu.edu.in
              </a>
            </p>
          </div>

          {/* Below card note */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.72rem',
              color: '#9CA3AF',
              marginTop: '20px',
            }}
          >
            © {new Date().getFullYear()} RV University. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Responsive styles injected via style tag ── */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Show left panel on large screens */
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
          .mobile-logo { display: none !important; }
        }

        /* Mobile: full width right panel */
        @media (max-width: 1023px) {
          .lg-flex { display: none !important; }
          .mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F0F4F8',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '3px solid #0F2D52',
              borderTopColor: 'transparent',
              animation: 'spin 700ms linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
