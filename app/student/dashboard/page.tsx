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
    <div className="h-screen grid overflow-hidden" style={{ gridTemplateColumns: '180px 1fr', background: '#F5F5F5' }}>
      {/* Sidebar */}
      <div className="bg-white flex flex-col h-screen overflow-hidden" style={{ borderRight: '1px solid #E5E5E5' }}>
        {/* Profile Header */}
        <div className="p-2.5 flex-shrink-0" style={{ borderBottom: '1px solid #E5E5E5' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2" style={{ background: '#E8F0FE', color: '#1A2D5A' }}>
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-xs font-medium mb-1" style={{ color: '#1A2D5A' }}>{session.user.name}</div>
          <div className="text-xs px-2 py-0.5 rounded-full inline-block" style={{ background: '#D1FAE5', color: '#065F46' }}>
            ✓ Approved
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-1.5 flex flex-col gap-0.5 flex-1 overflow-auto">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('programs'); }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs" 
            style={activeTab === 'programs' ? { background: '#E8F0FE', color: '#1A2D5A', fontWeight: 500 } : { color: '#666666' }}
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
            </svg>
            Programs
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('exams'); }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs" 
            style={activeTab === 'exams' ? { background: '#E8F0FE', color: '#1A2D5A', fontWeight: 500 } : { color: '#666666' }}
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="3" width="12" height="10" rx="1.5"/>
              <path d="M5 7h6M5 10h4" strokeLinecap="round"/>
            </svg>
            Exams
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #E5E5E5' }}>
          <h1 className="text-sm font-semibold" style={{ color: '#1A2D5A' }}>
            {activeTab === 'programs' ? 'Your Programs' : 'My Exams'}
          </h1>
          <button
            onClick={() => router.push('/api/auth/signout')}
            className="text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E5E5', color: '#666666' }}
          >
            Sign out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {activeTab === 'programs' ? (
            <>
              {/* Programs Section */}
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: '#666666' }}>SELECTED PROGRAMS</div>
                <SchoolProgramList selectedSchools={selectedSchools} />
              </div>
            </>
          ) : (
            <>
              {/* Stats Card */}
              <div className="bg-white rounded-lg p-2.5" style={{ border: '1px solid #E5E5E5' }}>
                <div className="text-xs font-medium mb-1" style={{ color: '#666666' }}>UPCOMING EXAMS</div>
                <div className="text-xl font-bold" style={{ color: '#1A2D5A' }}>{exams.length}</div>
              </div>

              {/* Exams List */}
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: '#666666' }}>SCHEDULED EXAMS</div>
                <StudentExamList exams={exams} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
