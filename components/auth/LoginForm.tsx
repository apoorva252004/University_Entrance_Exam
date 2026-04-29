'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'

interface LoginFormProps {
  callbackUrl?: string
}

export default function LoginForm({ callbackUrl = '/' }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Handle specific error codes from NextAuth
        if (result.error === 'PENDING_APPROVAL') {
          setError('Your application is under review. You will be notified via email once your account is approved and credentials are assigned.')
        } else if (result.error === 'APPLICATION_REJECTED') {
          setError('Your application has been rejected. Please contact admissions@rvu.edu.in for more information.')
        } else {
          setError('Invalid username or password')
        }
      } else if (result?.ok) {
        // Successful login - redirect to callback URL
        window.location.href = callbackUrl
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          placeholder="Enter your username"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#1F3A68] focus:ring-4 focus:ring-[#1F3A68]/10 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          placeholder="Enter your password"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#1F3A68] focus:ring-4 focus:ring-[#1F3A68]/10 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
        />
      </div>

      {error && (
        <div className={`border-2 rounded-lg p-4 ${
          error.includes('under review') 
            ? 'bg-blue-50 border-blue-200' 
            : error.includes('rejected')
            ? 'bg-red-50 border-red-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            {error.includes('under review') ? (
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`text-sm font-medium ${
              error.includes('under review') ? 'text-blue-800' : 'text-red-800'
            }`}>{error}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#1F3A68] hover:bg-[#2A4A7C] active:bg-[#152A4A] text-white font-semibold py-3.5 px-6 rounded-lg text-base transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 shadow-sm hover:shadow-md"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}
