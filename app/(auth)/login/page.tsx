'use client';

import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccessMessage(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#FFFFFF' }}>
      {/* Left Side - Navy */}
      <div style={{ width: '50%', backgroundColor: '#1A2D5A', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Image 
            src="/mcv23476_rvu-logo.png" 
            alt="RV University Logo" 
            width={48} 
            height={48}
            style={{ objectFit: 'contain' }}
            priority
          />
          <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>RV University</h3>
        </div>

        {/* Main Content */}
        <div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-0.5px' }}>
            RV SAT
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', lineHeight: '1.7', maxWidth: '30rem', fontWeight: '400' }}>
            Your gateway to excellence. Sign in to access your application, exam schedule, and results.
          </p>

          {/* Feature Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#E5A020', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>12+ undergraduate programs</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#E5A020', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>Results within 48 hours</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#E5A020', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>Secure & reliable platform</span>
            </div>
          </div>
        </div>

        <div></div>
      </div>

      {/* Right Side - Form */}
      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', backgroundColor: '#F5F5F5' }}>
        <div style={{ width: '100%', maxWidth: '26rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            {/* Success Message */}
            {showSuccessMessage && (
              <div style={{ 
                backgroundColor: '#D1FAE5', 
                border: '2px solid #10B981', 
                borderRadius: '8px', 
                padding: '1rem', 
                marginBottom: '1.5rem',
                animation: 'slideDown 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                  <svg 
                    style={{ width: '1.25rem', height: '1.25rem', color: '#065F46', flexShrink: 0, marginTop: '0.125rem' }} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#065F46', marginBottom: '0.25rem' }}>
                      Registration Successful!
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#047857', lineHeight: '1.5' }}>
                      Your account has been created. An admin will review and approve your application. You will receive a notification once approved. Please check back later to sign in.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#065F46', 
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Heading */}
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1A2D5A', letterSpacing: '-0.5px' }}>
              Sign In
            </h2>
            <p style={{ fontSize: '0.875rem', marginBottom: '2rem', color: '#666666', fontWeight: '400' }}>
              Enter your credentials to access your account
            </p>

            <LoginForm />

            {/* Footer */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #E5E5E5' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666666' }}>
                Don't have an account?{' '}
                <a href="/signup" style={{ fontWeight: '600', color: '#B81C2E', textDecoration: 'none' }}>
                  Register here
                </a>
              </p>
              <p style={{ fontSize: '0.75rem', color: '#999999' }}>
                Need assistance?{' '}
                <a href="mailto:admissions@rvu.edu.in" style={{ color: '#B81C2E', textDecoration: 'none', fontWeight: '500' }}>
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
