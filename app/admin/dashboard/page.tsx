'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StudentApprovalTable from '@/components/admin/StudentApprovalTable';
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
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
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
    console.log('Admin dashboard handleApprove called:', studentId);
    try {
      console.log('Making API call to approve...');
      const response = await fetch('/api/admin/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'approve' }),
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve student');
      }

      // Remove student from list
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showToast('Student approved successfully', 'success');
      // Refresh approved students list
      fetchApprovedStudents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve student';
      showToast(errorMessage, 'error');
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (studentId: string) => {
    console.log('Admin dashboard handleReject called:', studentId);
    try {
      console.log('Making API call to reject...');
      const response = await fetch('/api/admin/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'reject' }),
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject student');
      }

      // Remove student from list
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showToast('Student rejected', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject student';
      showToast(errorMessage, 'error');
      console.error('Reject error:', err);
    }
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
    <div className="h-screen grid overflow-hidden" style={{ gridTemplateColumns: '180px 1fr', background: '#F5F5F5' }}>
      {/* Sidebar */}
      <div className="bg-white flex flex-col h-screen overflow-hidden" style={{ borderRight: '1px solid #E5E5E5' }}>
        {/* Profile Header */}
        <div className="p-2.5 flex-shrink-0" style={{ borderBottom: '1px solid #E5E5E5' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2" style={{ background: '#E8F0FE', color: '#1A2D5A' }}>
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-xs font-medium mb-1" style={{ color: '#1A2D5A' }}>{session?.user?.name}</div>
          <div className="text-xs px-2 py-0.5 rounded-full inline-block" style={{ background: '#E8F0FE', color: '#1A2D5A' }}>
            ✓ Admin
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-1.5 flex flex-col gap-0.5 flex-1 overflow-auto">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('pending'); }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs" 
            style={activeTab === 'pending' ? { background: '#E8F0FE', color: '#1A2D5A', fontWeight: 500 } : { color: '#666666' }}
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
            </svg>
            Pending
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('approved'); }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs" 
            style={activeTab === 'approved' ? { background: '#E8F0FE', color: '#1A2D5A', fontWeight: 500 } : { color: '#666666' }}
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M5 8l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="6"/>
            </svg>
            Approved
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('teachers'); }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs" 
            style={activeTab === 'teachers' ? { background: '#E8F0FE', color: '#1A2D5A', fontWeight: 500 } : { color: '#666666' }}
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="8" cy="5" r="3"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round"/>
            </svg>
            Teachers
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #E5E5E5' }}>
          <h1 className="text-sm font-semibold" style={{ color: '#1A2D5A' }}>
            {activeTab === 'pending' && 'Pending Approvals'}
            {activeTab === 'approved' && 'Approved Students'}
            {activeTab === 'teachers' && 'Teachers'}
          </h1>
          <button
            onClick={() => router.push('/api/auth/signout')}
            className="text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors" 
            style={{ color: '#666666', border: '1px solid #E5E5E5' }}
          >
            Sign out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {activeTab === 'pending' && (
            <>
              {/* Stats Card */}
              <div className="bg-white rounded-lg p-2.5" style={{ border: '1px solid #E5E5E5' }}>
                <div className="text-xs font-medium mb-1" style={{ color: '#666666' }}>PENDING REVIEW</div>
                <div className="text-xl font-bold" style={{ color: '#1A2D5A' }}>{students.length}</div>
              </div>

              {/* Students Table */}
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: '#666666' }}>APPLICATIONS</div>
                <StudentApprovalTable
                  students={students}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            </>
          )}

          {activeTab === 'approved' && (
            <>
              {/* Stats Card */}
              <div className="bg-white rounded-lg p-2.5" style={{ border: '1px solid #E5E5E5' }}>
                <div className="text-xs font-medium mb-1" style={{ color: '#666666' }}>TOTAL APPROVED</div>
                <div className="text-xl font-bold" style={{ color: '#1A2D5A' }}>{approvedStudents.length}</div>
              </div>

              {/* Approved Students Table */}
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: '#666666' }}>APPROVED STUDENTS</div>
                <ApprovedStudentsTable students={approvedStudents} />
              </div>
            </>
          )}

          {activeTab === 'teachers' && (
            <>
              {/* Stats Card */}
              <div className="bg-white rounded-lg p-2.5" style={{ border: '1px solid #E5E5E5' }}>
                <div className="text-xs font-medium mb-1" style={{ color: '#666666' }}>TOTAL TEACHERS</div>
                <div className="text-xl font-bold" style={{ color: '#1A2D5A' }}>{teachers.length}</div>
              </div>

              {/* Teachers Table */}
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: '#666666' }}>ALL TEACHERS</div>
                <TeacherListTable teachers={teachers} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-3 py-2 rounded-lg shadow-lg text-xs ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
