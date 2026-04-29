'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SchoolProgramList from '@/components/student/SchoolProgramList';
import StudentExamList from '@/components/student/StudentExamList';

interface SelectedSchool {
  schoolName: string;
  programName: string;
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  examDate: string;
  duration: number;
  totalMarks: number;
  status: string;
  mode: string;
  venue: string | null;
  program: {
    id: string;
    name: string;
  };
  school: {
    id: string;
    name: string;
  };
  _count: {
    questions: number;
  };
  attempts: {
    id: string;
    submittedAt: Date | null;
  }[];
}

type TabType = 'programs' | 'exams';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('programs');
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Check if first login - redirect to change password
      if (session?.user?.isFirstLogin) {
        router.push('/change-password');
        return;
      }
      
      if (session?.user?.role !== 'STUDENT') {
        router.push('/');
      } else if (session?.user?.status !== 'APPROVED') {
        router.push('/login');
      } else {
        // Fetch exams when authenticated
        fetchExams();
      }
    }
  }, [status, session, router]);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/student/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Parse selectedSchools from session
  const selectedSchools: SelectedSchool[] = 
    typeof session.user.selectedSchools === 'string'
      ? JSON.parse(session.user.selectedSchools)
      : session.user.selectedSchools || [];

  return (
    <div className="h-screen grid overflow-hidden" style={{ gridTemplateColumns: '240px 1fr', background: 'var(--bg-main)' }}>
      {/* Sidebar - Navy Background */}
      <div className="sidebar flex flex-col h-screen overflow-hidden">
        {/* Logo/Brand */}
        <div className="p-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-on-dark)' }}>RV University</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Student Portal</p>
        </div>

        {/* Profile Header */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'var(--gold-primary)', color: 'var(--navy-primary)' }}>
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-on-dark)' }}>{session.user.name}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Student</div>
            </div>
          </div>
          <div className="badge badge-success mt-3">
            Approved
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex flex-col gap-2 flex-1 overflow-auto">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('programs'); }}
            className={`sidebar-item ${activeTab === 'programs' ? 'sidebar-item-active' : ''}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor"/>
              <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.3"/>
              <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.3"/>
              <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.3"/>
            </svg>
            <span>Programs</span>
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('exams'); }}
            className={`sidebar-item ${activeTab === 'exams' ? 'sidebar-item-active' : ''}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="14" height="12" rx="2"/>
              <path d="M6 8h8M6 12h5" strokeLinecap="round"/>
            </svg>
            <span>Exams</span>
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
              {activeTab === 'programs' ? 'Your Programs' : 'My Exams'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'programs' ? 'Programs you have applied to' : 'View and take your scheduled exams'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'programs' ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6">
                <div className="card-stat">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Programs Applied</div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{selectedSchools.length}</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Total programs</div>
                </div>
                <div className="card-stat">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Exams Scheduled</div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{exams.length}</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Upcoming exams</div>
                </div>
                <div className="card-stat">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Results Available</div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>0</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Completed exams</div>
                </div>
              </div>

              {/* Programs Section */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--navy-primary)' }}>Selected Programs</h2>
                <SchoolProgramList selectedSchools={selectedSchools} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="card-stat max-w-sm">
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Upcoming Exams</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{exams.length}</div>
                <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Scheduled exams</div>
              </div>

              {/* Exams List */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--navy-primary)' }}>Scheduled Exams</h2>
                <StudentExamList exams={exams} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
