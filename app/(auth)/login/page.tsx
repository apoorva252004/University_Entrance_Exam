import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export const revalidate = 0;

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Navy */}
      <div style={{ width: '50%', backgroundColor: '#1B2B5E', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image 
            src="/RVU_logo-removebg-preview.png" 
            alt="RV University Logo" 
            width={50} 
            height={50}
            style={{ objectFit: 'contain' }}
            priority
          />
          <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>RV University</h3>
        </div>

        {/* Main Content */}
        <div>
          <h1 style={{ fontSize: '3.75rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            Entrance<br />Examination<br />Portal
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '3rem', lineHeight: '1.6', maxWidth: '28rem' }}>
            Your gateway to programs at RV University. Sign in to access your application and admit card.
          </p>

          {/* Feature Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#C8922A', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Applications open for 2025–26</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#C8922A', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>12+ undergraduate programs</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#C8922A', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Results published within 48 hrs</span>
            </div>
          </div>
        </div>

        <div></div>
      </div>

      {/* Right Side - Form */}
      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', backgroundColor: '#F5F6FA' }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', border: '1px solid #E2E5ED' }}>
            {/* Badge */}
            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: '#f3e8ff', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9333ea' }}>
                Candidate Login
              </span>
            </div>

            {/* Heading */}
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1B2B5E' }}>
              Sign in to continue
            </h2>
            <p style={{ fontSize: '0.875rem', marginBottom: '2rem', color: '#5A6270' }}>
              Use your registered email address
            </p>

            <LoginForm />

            {/* Footer */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #E2E5ED' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#5A6270' }}>
                Don't have an account?{' '}
                <a href="/signup" style={{ fontWeight: '600', color: '#a855f7', textDecoration: 'none' }}>
                  Create one
                </a>
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9DA5B4' }}>
                Need help?{' '}
                <a href="mailto:admissions@rvu.edu.in" style={{ color: '#a855f7', textDecoration: 'none' }}>
                  admissions@rvu.edu.in
                </a>
              </p>
            </div>

            {/* Security Badge */}
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9DA5B4' }}>
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
