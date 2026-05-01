'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';

interface LoginFormProps {
  callbackUrl?: string;
}

export default function LoginForm({ callbackUrl = '/' }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      if (result?.error) {
        if (result.error === 'PENDING_APPROVAL') setError('pending');
        else if (result.error === 'APPLICATION_REJECTED') setError('rejected');
        else setError('invalid');
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch {
      setError('invalid');
    } finally {
      setIsLoading(false);
    }
  };

  const errorConfig = {
    pending: {
      bg: '#EFF6FF',
      border: '#BFDBFE',
      icon: '#3B82F6',
      text: '#1E40AF',
      message:
        'Your application is under review. You will be notified once your account is approved.',
    },
    rejected: {
      bg: '#FEF2F2',
      border: '#FECACA',
      icon: '#EF4444',
      text: '#991B1B',
      message:
        'Your application has been rejected. Contact admissions@rvu.edu.in for more information.',
    },
    invalid: {
      bg: '#FEF2F2',
      border: '#FECACA',
      icon: '#EF4444',
      text: '#991B1B',
      message: 'Invalid username or password. Please try again.',
    },
  };

  const err = error ? errorConfig[error as keyof typeof errorConfig] : null;

  /* ── Shared input wrapper style ── */
  const inputWrapperStyle = (field: 'username' | 'password'): React.CSSProperties => ({
    position: 'relative',
    borderRadius: '14px',
    border: `1.5px solid ${
      focusedField === field ? '#0F2D52' : '#E5E7EB'
    }`,
    background: focusedField === field ? '#FAFBFF' : '#F9FAFB',
    boxShadow:
      focusedField === field
        ? '0 0 0 4px rgba(15,45,82,0.08)'
        : 'none',
    transition: 'all 200ms ease',
    height: '54px',
    display: 'flex',
    alignItems: 'center',
  });

  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '100%',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '0.9375rem',
    color: '#111827',
    fontFamily: 'inherit',
    padding: '0 16px 0 44px',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: focusedField ? '#0F2D52' : '#9CA3AF',
    pointerEvents: 'none',
    transition: 'color 200ms ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '8px',
    letterSpacing: '0.01em',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* ── Username ── */}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="username" style={labelStyle}>
          Username
        </label>
        <div style={inputWrapperStyle('username')}>
          <span style={{ ...iconStyle, color: focusedField === 'username' ? '#0F2D52' : '#9CA3AF' }}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            disabled={isLoading}
            placeholder="Enter your username"
            style={inputStyle}
            autoComplete="username"
          />
        </div>
      </div>

      {/* ── Password ── */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>
            Password
          </label>
          <a
            href="#"
            onClick={e => e.preventDefault()}
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#C79A2B',
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            Forgot password?
          </a>
        </div>
        <div style={inputWrapperStyle('password')}>
          <span style={{ ...iconStyle, color: focusedField === 'password' ? '#0F2D52' : '#9CA3AF' }}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            disabled={isLoading}
            placeholder="Enter your password"
            style={{ ...inputStyle, paddingRight: '48px' }}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#0F2D52')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF')}
          >
            {showPassword ? (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Remember me ── */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          cursor: 'pointer',
          marginBottom: '20px',
          userSelect: 'none',
        }}
      >
        <div
          onClick={() => setRememberMe(!rememberMe)}
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '5px',
            border: `2px solid ${rememberMe ? '#0F2D52' : '#D1D5DB'}`,
            background: rememberMe ? '#0F2D52' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 150ms ease',
            cursor: 'pointer',
          }}
        >
          {rememberMe && (
            <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 12 12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 500 }}>
          Remember me for 30 days
        </span>
      </label>

      {/* ── Error message ── */}
      {err && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '12px',
            background: err.bg,
            border: `1px solid ${err.border}`,
            marginBottom: '16px',
            animation: 'slideDown 250ms ease',
          }}
        >
          <svg
            style={{ color: err.icon, flexShrink: 0, marginTop: '1px' }}
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: err.text, lineHeight: 1.5 }}>
            {err.message}
          </span>
        </div>
      )}

      {/* ── Sign In button ── */}
      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '14px',
          border: 'none',
          background: isLoading
            ? '#6B7280'
            : 'linear-gradient(135deg, #0F2D52 0%, #173F73 100%)',
          color: '#fff',
          fontSize: '0.9375rem',
          fontWeight: 700,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          letterSpacing: '0.01em',
          boxShadow: isLoading
            ? 'none'
            : '0 4px 14px rgba(15,45,82,0.35), 0 1px 3px rgba(15,45,82,0.2)',
          transition: 'all 200ms ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => {
          if (!isLoading) {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 8px 24px rgba(15,45,82,0.40), 0 2px 6px rgba(15,45,82,0.25)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 4px 14px rgba(15,45,82,0.35), 0 1px 3px rgba(15,45,82,0.2)';
        }}
      >
        {isLoading ? (
          <>
            <svg
              style={{ animation: 'spin 700ms linear infinite' }}
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Signing in…
          </>
        ) : (
          <>
            Sign In
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #C4C9D4; }
      `}</style>
    </form>
  );
}
