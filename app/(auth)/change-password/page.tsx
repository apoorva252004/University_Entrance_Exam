import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import Image from 'next/image';

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (!session.user.isFirstLogin) {
    redirect(`/${session.user.role.toLowerCase()}/dashboard`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0F2D52 0%, #163B6D 50%, #0a2040 100%)' }}>
      {/* Decorative circles */}
      <div className="fixed -top-32 -right-32 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C79A2B, transparent)' }} />
      <div className="fixed -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C79A2B, transparent)' }} />

      <div className="w-full" style={{ maxWidth: '420px' }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Image src="/mcv23476_rvu-logo.png" alt="RV University" width={26} height={26}
              style={{ objectFit: 'contain' }} />
          </div>
          <span className="text-white font-bold text-lg">RV University</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-10"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: '#EAF2FB' }}>
            <svg className="w-7 h-7" style={{ color: '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-center font-bold mb-2" style={{ fontSize: '1.5rem', color: '#0F2D52' }}>
            Set New Password
          </h2>
          <p className="text-center text-sm mb-8" style={{ color: '#6B7280' }}>
            For your security, please change your temporary password before continuing.
          </p>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl mb-6"
            style={{ background: '#FDF6E3', border: '1px solid #FDE68A' }}>
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs" style={{ color: '#92400E' }}>
              Choose a strong password with at least 8 characters. You'll use this to sign in going forward.
            </p>
          </div>

          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
