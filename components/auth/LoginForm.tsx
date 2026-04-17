'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'

interface LoginFormProps {
  callbackUrl?: string
}

export default function LoginForm({ callbackUrl = '/' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#1A1A2E' }}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ 
            border: '1px solid #E2E5ED',
            color: '#1A1A2E',
            background: '#FFFFFF'
          }}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#1A1A2E' }}>
            Password
          </label>
          <a href="#" className="text-xs font-medium hover:underline" style={{ color: '#7C3AED' }}>
            Forgot password?
          </a>
        </div>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ 
            border: '1px solid #E2E5ED',
            color: '#1A1A2E',
            background: '#FFFFFF'
          }}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="text-xs rounded-xl p-3" style={{ 
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#991B1B'
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 text-white font-semibold text-sm rounded-xl focus:outline-none disabled:opacity-50 transition-all"
        style={{
          background: '#1B2B5E'
        }}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
