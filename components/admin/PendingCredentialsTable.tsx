'use client';

import { useState } from 'react';

interface SelectedSchool {
  schoolName: string;
  programName: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  selectedSchools: SelectedSchool[];
  createdAt: string;
}

interface PendingCredentialsTableProps {
  students: Student[];
  onCredentialsAssigned: () => void;
}

export default function PendingCredentialsTable({ students, onCredentialsAssigned }: PendingCredentialsTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignedCredentials, setAssignedCredentials] = useState<{
    username: string;
    password: string;
    studentName: string;
    studentEmail: string;
    studentPhone?: string;
  } | null>(null);

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    // Auto-generate username suggestion from email
    const suggestedUsername = student.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    setUsername(suggestedUsername);
    setPassword('');
    setRole('STUDENT');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleAssignCredentials = async () => {
    if (!selectedStudent) return;

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/assign-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedStudent.id,
          username,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign credentials');
      }

      // Store credentials for success modal
      setAssignedCredentials({
        username,
        password,
        studentName: selectedStudent.name,
        studentEmail: selectedStudent.email,
        studentPhone: selectedStudent.phone,
      });

      // Close assign modal and show success modal
      closeModal();
      setShowSuccessModal(true);
      onCredentialsAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign credentials');
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setAssignedCredentials(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Students</h3>
        <p className="text-sm text-gray-600">All students have been assigned credentials</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Programs</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{student.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {student.selectedSchools.length} program(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      Pending Credentials
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openModal(student)}
                      className="inline-flex items-center px-4 py-2 bg-[#F4B400] hover:bg-[#E5A020] text-gray-900 text-sm font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Assign Credentials
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Assign Login Credentials</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Student Information</div>
                <div className="space-y-1">
                  <div className="text-sm"><span className="font-medium">Name:</span> {selectedStudent.name}</div>
                  <div className="text-sm"><span className="font-medium">Email:</span> {selectedStudent.email}</div>
                  {selectedStudent.phone && (
                    <div className="text-sm"><span className="font-medium">Phone:</span> {selectedStudent.phone}</div>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
                  Username <span className="text-red-600">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={loading}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1F3A68] focus:ring-2 focus:ring-[#1F3A68]/10 disabled:bg-gray-100"
                />
                <p className="mt-1 text-xs text-gray-600">Minimum 3 characters, lowercase letters and numbers</p>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={loading}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1F3A68] focus:ring-2 focus:ring-[#1F3A68]/10 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Generate
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-600">Minimum 8 characters</p>
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-2">
                  Role <span className="text-red-600">*</span>
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1F3A68] focus:ring-2 focus:ring-[#1F3A68]/10 disabled:bg-gray-100"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-red-800">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={loading}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCredentials}
                disabled={loading}
                className="px-6 py-2 bg-[#1F3A68] hover:bg-[#2A4A7C] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Assigning...' : 'Assign & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && assignedCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            {/* Success Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Credentials Assigned Successfully!</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Account has been activated</p>
                </div>
              </div>
            </div>

            {/* Success Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Student Info */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Important Reminder</p>
                    <p className="text-sm text-blue-800">Please inform the student via email or phone with their login credentials.</p>
                  </div>
                </div>
              </div>

              {/* Student Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="text-sm font-semibold text-gray-700 mb-2">Student Contact Information</div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{assignedCredentials.studentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">{assignedCredentials.studentEmail}</span>
                  <button
                    onClick={() => copyToClipboard(assignedCredentials.studentEmail)}
                    className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Copy
                  </button>
                </div>
                {assignedCredentials.studentPhone && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-700">{assignedCredentials.studentPhone}</span>
                    <button
                      onClick={() => copyToClipboard(assignedCredentials.studentPhone!)}
                      className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>

              {/* Credentials */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 space-y-3">
                <div className="text-sm font-semibold text-gray-900 mb-2">Login Credentials</div>
                
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={assignedCredentials.username}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(assignedCredentials.username)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={assignedCredentials.password}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(assignedCredentials.password)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeSuccessModal}
                className="px-6 py-2 bg-[#1F3A68] hover:bg-[#2A4A7C] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
