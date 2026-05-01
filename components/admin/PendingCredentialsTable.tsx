'use client';

import { useState } from 'react';

interface SelectedSchool { schoolName: string; programName: string; }
interface Student {
  id: string; name: string; email: string; phone?: string;
  selectedSchools: SelectedSchool[]; createdAt: string;
}
interface Props { students: Student[]; onCredentialsAssigned: () => void; }

export default function PendingCredentialsTable({ students, onCredentialsAssigned }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignedCredentials, setAssignedCredentials] = useState<{
    username: string; password: string; studentName: string;
    studentEmail: string; studentPhone?: string;
  } | null>(null);

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    setUsername(student.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''));
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
    for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(pass);
  };

  const handleAssignCredentials = async () => {
    if (!selectedStudent) return;
    if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/assign-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedStudent.id, username, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign credentials');

      setAssignedCredentials({
        username, password,
        studentName: selectedStudent.name,
        studentEmail: selectedStudent.email,
        studentPhone: selectedStudent.phone,
      });
      closeModal();
      setShowSuccessModal(true);
      onCredentialsAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign credentials');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  if (students.length === 0) {
    return (
      <div className="table-container flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#EAF2FB' }}>
          <svg className="w-8 h-8" style={{ color: '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ color: '#0F2D52' }}>All caught up!</h3>
        <p className="text-sm" style={{ color: '#6B7280' }}>No pending credential assignments</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-container">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF2F7' }}>
          <div>
            <h3 className="font-semibold" style={{ color: '#0F2D52' }}>New Registrations</h3>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{students.length} student{students.length !== 1 ? 's' : ''} awaiting credentials</p>
          </div>
          <span className="badge badge-warning">{students.length} Pending</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>Programs</th>
                <th>Registered</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: '#EAF2FB', color: '#0F2D52' }}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold" style={{ color: '#0F2D52' }}>{student.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm" style={{ color: '#374151' }}>{student.email}</div>
                    {student.phone && <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{student.phone}</div>}
                  </td>
                  <td className="table-cell">
                    <span className="badge badge-navy">{student.selectedSchools.length} program{student.selectedSchools.length !== 1 ? 's' : ''}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm" style={{ color: '#6B7280' }}>
                      {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="badge badge-warning">Pending</span>
                  </td>
                  <td className="table-cell" style={{ textAlign: 'right' }}>
                    <button onClick={() => openModal(student)} className="btn-accent" style={{ padding: '8px 16px', fontSize: '13px' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="px-7 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF2F7' }}>
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#0F2D52' }}>Assign Credentials</h3>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Create login access for this student</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: '#F3F4F6', color: '#6B7280' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-7 py-5 space-y-5">
              {/* Student info */}
              <div className="p-4 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #EEF2F7' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    style={{ background: '#EAF2FB', color: '#0F2D52' }}>
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#0F2D52' }}>{selectedStudent.name}</div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>{selectedStudent.email}</div>
                    {selectedStudent.phone && <div className="text-xs" style={{ color: '#9CA3AF' }}>{selectedStudent.phone}</div>}
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Username <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={loading}
                  className="input-field"
                />
                <p className="mt-1.5 text-xs" style={{ color: '#9CA3AF' }}>Min 3 characters, lowercase letters and numbers</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Password <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={loading}
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={generateRandomPassword} disabled={loading}
                    className="btn-ghost" style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    Generate
                  </button>
                </div>
                <p className="mt-1.5 text-xs" style={{ color: '#9CA3AF' }}>Minimum 8 characters</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Role <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="input-field"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ background: '#FEE2E2', color: '#991B1B' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            <div className="px-7 py-5 flex gap-3 justify-end" style={{ borderTop: '1px solid #EEF2F7' }}>
              <button onClick={closeModal} disabled={loading} className="btn-ghost">Cancel</button>
              <button onClick={handleAssignCredentials} disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Assigning…
                  </>
                ) : 'Assign & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && assignedCredentials && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="px-7 py-5" style={{ borderBottom: '1px solid #EEF2F7' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#DCFCE7' }}>
                  <svg className="w-6 h-6" style={{ color: '#16A34A' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#0F2D52' }}>Credentials Assigned!</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Account has been activated successfully</p>
                </div>
              </div>
            </div>

            <div className="px-7 py-5 space-y-4">
              <div className="p-4 rounded-xl" style={{ background: '#DBEAFE', border: '1px solid #93C5FD' }}>
                <p className="text-sm font-semibold" style={{ color: '#1E40AF' }}>Reminder</p>
                <p className="text-xs mt-1" style={{ color: '#1D4ED8' }}>
                  Please share these credentials with the student via email or phone.
                </p>
              </div>

              {/* Contact */}
              <div className="p-4 rounded-xl space-y-2" style={{ background: '#F8FAFC', border: '1px solid #EEF2F7' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Student Contact</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#0F2D52' }}>{assignedCredentials.studentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#6B7280' }}>{assignedCredentials.studentEmail}</span>
                  <button onClick={() => copy(assignedCredentials.studentEmail)}
                    className="text-xs font-medium" style={{ color: '#2563EB' }}>Copy</button>
                </div>
                {assignedCredentials.studentPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#6B7280' }}>{assignedCredentials.studentPhone}</span>
                    <button onClick={() => copy(assignedCredentials.studentPhone!)}
                      className="text-xs font-medium" style={{ color: '#2563EB' }}>Copy</button>
                  </div>
                )}
              </div>

              {/* Credentials */}
              <div className="p-4 rounded-xl space-y-3" style={{ background: '#FDF6E3', border: '1px solid #FDE68A' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#92400E' }}>Login Credentials</p>
                {[
                  { label: 'Username', value: assignedCredentials.username },
                  { label: 'Password', value: assignedCredentials.password },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#78350F' }}>{label}</p>
                    <div className="flex items-center gap-2">
                      <input type="text" value={value} readOnly
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                        style={{ background: '#fff', border: '1px solid #FDE68A', color: '#374151' }} />
                      <button onClick={() => copy(value)} className="btn-ghost" style={{ padding: '8px 12px', fontSize: '12px' }}>
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-7 py-5 flex justify-end" style={{ borderTop: '1px solid #EEF2F7' }}>
              <button onClick={() => { setShowSuccessModal(false); setAssignedCredentials(null); }}
                className="btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
