'use client'

import { useState, FormEvent, useEffect } from 'react'
import { signIn } from 'next-auth/react'

interface LoginFormProps {
  callbackUrl?: string
}

export default function LoginForm({ callbackUrl = '/' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'PENDING_APPROVAL') {
          setError('Your account is pending admin approval.');
        } else if (result.error === 'APPLICATION_REJECTED') {
          setError('Your application has been rejected.');
        } else {
          setError('Invalid email or password.');
        }
      } else if (result?.ok) {
        window.location.href = callbackUrl
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1A2D5A' }}>
            Email Address
          </label>
          <input
            type="email"
            disabled
            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
            style={{ 
              border: '1px solid #E5E5E5',
              color: '#222222',
              background: '#FFFFFF'
            }}
            placeholder="your.email@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1A2D5A' }}>
            Password
          </label>
          <input
            type="password"
            disabled
            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
            style={{ 
              border: '1px solid #E5E5E5',
              color: '#222222',
              background: '#FFFFFF'
            }}
            placeholder="••••••••"
          />
        </div>
        <button
          type="button"
          disabled
          className="w-full py-2.5 px-4 font-semibold text-sm rounded-lg focus:outline-none disabled:opacity-50 transition-all"
          style={{
            background: '#B81C2E',
            color: '#FFFFFF'
          }}
        >
          Sign In
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#1A2D5A' }}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ 
            border: '1px solid #E5E5E5',
            color: '#222222',
            background: '#FFFFFF'
          }}
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#1A2D5A' }}>
            Password
          </label>
          <a href="#" className="text-xs font-medium hover:underline" style={{ color: '#B81C2E' }}>
            Forgot password?
          </a>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
            style={{ 
              border: '1px solid #E5E5E5',
              color: '#222222',
              background: '#FFFFFF',
              paddingRight: '2.5rem'
            }}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666666'
            }}
          >
            {showPassword ? (
              <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs rounded-lg p-3" style={{ 
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          color: '#991B1B'
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 font-semibold text-sm rounded-lg focus:outline-none disabled:opacity-50 transition-all"
        style={{
          background: '#1A2D5A',
          color: '#FFFFFF'
        }}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
