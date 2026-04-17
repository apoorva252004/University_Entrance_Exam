import SignupForm from '@/components/auth/SignupForm';
import Image from 'next/image';

export const revalidate = 0;

export default function SignupPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
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
            Create your account and register for entrance examination to access 12+ programs.
          </p>

          {/* Feature Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#E5A020', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>12+ undergraduate programs</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#E5A020', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>Quick & easy registration</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#E5A020', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>Secure & reliable</span>
            </div>
          </div>
        </div>

        <div></div>
      </div>

      {/* Right Side - Form */}
      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', backgroundColor: '#F5F5F5' }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            {/* Badge - REMOVED */}

            {/* Heading */}
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1A2D5A', letterSpacing: '-0.5px' }}>
              Create Account
            </h2>
            <p style={{ fontSize: '0.875rem', marginBottom: '2rem', color: '#666666', fontWeight: '400' }}>
              Register for RV SAT entrance examination
            </p>

            <SignupForm />

            {/* Footer */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #E5E5E5' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666666' }}>
                Already have an account?{' '}
                <a href="/login" style={{ fontWeight: '600', color: '#1A2D5A', textDecoration: 'none' }}>
                  Sign in
                </a>
              </p>
              <p style={{ fontSize: '0.75rem', color: '#999999' }}>
                Need assistance?{' '}
                <a href="mailto:admissions@rvu.edu.in" style={{ color: '#1A2D5A', textDecoration: 'none', fontWeight: '500' }}>
                  Contact support
                </a>
              </p>
            </div>

            {/* Security Badge */}
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#666666' }}>
              <svg style={{ width: '1rem', height: '1rem' }} viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 1a3.5 3.5 0 00-3.5 3.5V7A1.5 1.5 0 003 8.5v5A1.5 1.5 0 004.5 15h7a1.5 1.5 0 001.5-1.5v-5A1.5 1.5 0 0011.5 7V4.5A3.5 3.5 0 008 1zm2 6V4.5a2 2 0 10-4 0V7h4z" clipRule="evenodd" />
              </svg>
              <span>Secured by RV University IT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
