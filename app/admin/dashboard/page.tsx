'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PendingCredentialsTable from '@/components/admin/PendingCredentialsTable';
import TeacherListTable from '@/components/admin/TeacherListTable';
import ApprovedStudentsTable from '@/components/admin/ApprovedStudentsTable';

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

interface ApprovedStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  selectedSchools: SelectedSchool[];
  createdAt: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedSchool: string;
  status: string;
  createdAt: string;
}

type TabType = 'pending' | 'approved' | 'teachers';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [students, setStudents] = useState<Student[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<ApprovedStudent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Check if first login - redirect to change password
      if (session?.user?.isFirstLogin) {
        router.push('/change-password');
        return;
      }
      
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchStudents();
    fetchApprovedStudents();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/students');
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      setTeachers(data.teachers);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const fetchApprovedStudents = async () => {
    try {
      const response = await fetch('/api/admin/approved-students');
      
      if (!response.ok) {
        throw new Error('Failed to fetch approved students');
      }

      const data = await response.json();
      setApprovedStudents(data.students);
    } catch (err) {
      console.error('Error fetching approved students:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (studentId: string) => {
    // This function is no longer used - credentials are assigned via modal
    console.log('Old approval system - deprecated');
  };

  const handleReject = async (studentId: string) => {
    // This function is no longer used - credentials are assigned via modal
    console.log('Old rejection system - deprecated');
  };

  const handleCredentialsAssigned = () => {
    // Refresh the pending students list after credentials are assigned
    fetchStudents();
    fetchApprovedStudents();
    showToast('Credentials assigned and account activated successfully', 'success');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchStudents}
            className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen grid overflow-hidden" style={{ gridTemplateColumns: '240px 1fr', background: 'var(--bg-main)' }}>
      {/* Sidebar - Navy Background */}
      <div className="sidebar flex flex-col h-screen overflow-hidden">
        {/* Logo/Brand */}
        <div className="p-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-on-dark)' }}>RV University</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Admin Portal</p>
        </div>

        {/* Profile Header */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'var(--gold-primary)', color: 'var(--navy-primary)' }}>
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-on-dark)' }}>{session?.user?.name}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Administrator</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex flex-col gap-2 flex-1 overflow-auto">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('pending'); }}
            className={`sidebar-item ${activeTab === 'pending' ? 'sidebar-item-active' : ''}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 2v16M2 10h16" strokeLinecap="round"/>
            </svg>
            <span>Pending Credentials</span>
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('approved'); }}
            className={`sidebar-item ${activeTab === 'approved' ? 'sidebar-item-active' : ''}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 10l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="10" r="8"/>
            </svg>
            <span>Approved Students</span>
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('teachers'); }}
            className={`sidebar-item ${activeTab === 'teachers' ? 'sidebar-item-active' : ''}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="7" r="4"/>
              <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" strokeLinecap="round"/>
            </svg>
            <span>Teachers</span>
          </a>
        </nav>

        {/* Sign Out */}
        <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => router.push('/api/auth/signout')}
            className="w-full sidebar-item justify-center"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M7 16l-4-4m0 0l4-4m-4 4h12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white px-8 py-6 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--gray-200)' }}>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--navy-primary)' }}>
              {activeTab === 'pending' && 'Pending Credentials'}
              {activeTab === 'approved' && 'Approved Students'}
              {activeTab === 'teachers' && 'Teachers'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'pending' && 'Assign login credentials to new registrations'}
              {activeTab === 'approved' && 'View all approved students'}
              {activeTab === 'teachers' && 'Manage teaching staff'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'pending' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6">
                <div className="card-stat">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Pending Review</div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{students.length}</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Applications awaiting approval</div>
                </div>
                <div className="card-stat">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Total Students</div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{approvedStudents.length}</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Approved students</div>
                </div>
                <div className="card-stat">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Total Teachers</div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{teachers.length}</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Active teaching staff</div>
                </div>
              </div>

              {/* Applications */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--navy-primary)' }}>New Registrations</h2>
                <PendingCredentialsTable
                  students={students}
                  onCredentialsAssigned={handleCredentialsAssigned}
                />
              </div>
            </div>
          )}

          {activeTab === 'approved' && (
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="card-stat max-w-sm">
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Total Approved</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{approvedStudents.length}</div>
                <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Students with approved status</div>
              </div>

              {/* Approved Students */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--navy-primary)' }}>Approved Students</h2>
                <ApprovedStudentsTable students={approvedStudents} />
              </div>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="card-stat max-w-sm">
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Total Teachers</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{teachers.length}</div>
                <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Active teaching staff</div>
              </div>

              {/* Teachers List */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--navy-primary)' }}>All Teachers</h2>
                <TeacherListTable teachers={teachers} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-success text-white'
                : 'bg-error text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
