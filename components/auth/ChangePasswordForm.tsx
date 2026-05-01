'use client';

import { useState } from 'react';

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter (A-Z)');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter (a-z)');
    if (!/[0-9]/.test(password)) errors.push('one number (0-9)');
    if (!/[@#$%&*!]/.test(password)) errors.push('one special character (@#$%&*!)');
    return errors;
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const validationErrors = validatePassword(formData.newPassword);
      if (validationErrors.length > 0) {
        newErrors.newPassword = `Password must contain ${validationErrors.join(', ')}`;
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      console.log('[Form] Submitting password change...');
      
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      console.log('[Form] Response status:', response.status);
      console.log('[Form] Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[Form] Non-JSON response received');
        const text = await response.text();
        console.error('[Form] Response text (first 500 chars):', text.substring(0, 500));
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const data = await response.json();
      console.log('[Form] Response data:', data);

      if (response.ok && data.success) {
        // Success!
        console.log('[Form] Password changed successfully, redirecting to login...');
        setIsSuccess(true);
        
        // Redirect to signout which will then redirect to login
        setTimeout(() => {
          window.location.href = '/api/auth/signout?callbackUrl=/login';
        }, 1500);
      } else {
        // Server returned an error
        setErrors({ 
          general: data.message || 'Failed to change password. Please try again.' 
        });
      }
    } catch (error) {
      console.error('[Form] Error:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => show ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success Alert */}
      {isSuccess && (
        <div className="flex items-start gap-3 p-4 rounded-xl text-sm"
          style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46' }}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold mb-1">Success!</p>
            <p>Password changed successfully! Redirecting to login...</p>
          </div>
        </div>
      )}
      
      {/* General Error Alert */}
      {errors.general && (
        <div className="flex items-start gap-3 p-4 rounded-xl text-sm"
          style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B' }}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold mb-1">Error</p>
            <p>{errors.general}</p>
          </div>
        </div>
      )}

      {/* Password Requirements Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl text-sm"
        style={{ background: '#DBEAFE', border: '1px solid #93C5FD', color: '#1E40AF' }}>
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="font-semibold mb-1">Password Requirements</p>
          <ul className="text-xs space-y-1">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter (A-Z)</li>
            <li>• One lowercase letter (a-z)</li>
            <li>• One number (0-9)</li>
            <li>• One special character (@#$%&*!)</li>
          </ul>
        </div>
      </div>

      {/* New Password Field */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
          New Password
        </label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            disabled={isLoading || isSuccess}
            className="input-field"
            style={{ 
              paddingRight: '44px', 
              borderColor: errors.newPassword ? '#DC2626' : undefined,
              width: '100%'
            }}
            autoComplete="new-password"
          />
          <button 
            type="button" 
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
            style={{ color: '#9CA3AF', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            disabled={isLoading || isSuccess}
          >
            <EyeIcon show={showNew} />
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors.newPassword}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            disabled={isLoading || isSuccess}
            className="input-field"
            style={{ 
              paddingRight: '44px', 
              borderColor: errors.confirmPassword ? '#DC2626' : undefined,
              width: '100%'
            }}
            autoComplete="new-password"
          />
          <button 
            type="button" 
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
            style={{ color: '#9CA3AF', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            disabled={isLoading || isSuccess}
          >
            <EyeIcon show={showConfirm} />
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isLoading || isSuccess} 
        className="btn-primary w-full justify-center"
        style={{ 
          padding: '14px 18px', 
          fontSize: '15px', 
          marginTop: '8px',
          opacity: (isLoading || isSuccess) ? 0.7 : 1,
          cursor: (isLoading || isSuccess) ? 'not-allowed' : 'pointer'
        }}
      >
        {isSuccess ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Success! Redirecting...
          </span>
        ) : isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Changing Password...
          </span>
        ) : 'Change Password'}
      </button>
    </form>
  );
}
