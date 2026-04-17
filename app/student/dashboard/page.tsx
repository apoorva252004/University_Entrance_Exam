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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
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
    <div className="h-screen grid overflow-hidden" style={{ gridTemplateColumns: '220px 1fr', background: '#f4f4f0' }}>
      {/* Sidebar */}
      <div className="bg-white flex flex-col h-screen overflow-hidden" style={{ borderRight: '1px solid #e0dfd8' }}>
        {/* Profile Header */}
        <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid #e0dfd8' }}>
          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm mb-2">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm font-medium text-gray-900 mb-2">{session.user.name}</div>
          <div className="text-xs px-2 py-1 rounded-full inline-block" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
            ✓ Application approved
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 flex flex-col gap-1 flex-1 overflow-auto">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('programs'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" 
            style={activeTab === 'programs' ? { background: '#EEEDFE', color: '#3C3489', fontWeight: 500 } : { color: '#6b6b67' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
            </svg>
            Dashboard
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('exams'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" 
            style={activeTab === 'exams' ? { background: '#EEEDFE', color: '#3C3489', fontWeight: 500 } : { color: '#6b6b67' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="3" width="12" height="10" rx="1.5"/>
              <path d="M5 7h6M5 10h4" strokeLinecap="round"/>
            </svg>
            My Exams
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors" style={{ color: '#6b6b67' }}>
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="8" cy="5" r="3"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round"/>
            </svg>
            My Profile
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors" style={{ color: '#6b6b67' }}>
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="3" width="12" height="10" rx="1.5"/>
              <path d="M5 7h6M5 10h4" strokeLinecap="round"/>
            </svg>
            Documents
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #e0dfd8' }}>
          <h1 className="text-lg font-medium text-gray-900">
            {activeTab === 'programs' ? 'Your programs' : 'My Exams'}
          </h1>
          <button
            onClick={() => router.push('/api/auth/signout')}
            className="text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ border: '1px solid #c8c7c0' }}
          >
            Sign out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {activeTab === 'programs' ? (
            <>
              {/* Programs Section */}
              <div>
                <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#9b9b96' }}>Selected Programs</div>
                <SchoolProgramList selectedSchools={selectedSchools} />
              </div>

              {/* Next Steps */}
              <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e0dfd8' }}>
                <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#9b9b96' }}>Next Steps</div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-sm" style={{ color: '#6b6b67' }}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium flex-shrink-0" style={{ background: '#f4f4f0', color: '#6b6b67', border: '1px solid #e0dfd8' }}>1</span>
                    <span>Check your email regularly for exam schedule notifications</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm" style={{ color: '#6b6b67' }}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium flex-shrink-0" style={{ background: '#f4f4f0', color: '#6b6b67', border: '1px solid #e0dfd8' }}>2</span>
                    <span>Prepare all required documents — ID proof, certificates, etc.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm" style={{ color: '#6b6b67' }}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium flex-shrink-0" style={{ background: '#f4f4f0', color: '#6b6b67', border: '1px solid #e0dfd8' }}>3</span>
                    <span>Review the syllabus and exam pattern for your selected programs</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm" style={{ color: '#6b6b67' }}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium flex-shrink-0" style={{ background: '#f4f4f0', color: '#6b6b67', border: '1px solid #e0dfd8' }}>4</span>
                    <span>Keep your contact information up to date</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Stats Card */}
              <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e0dfd8' }}>
                <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#9b9b96' }}>Upcoming Exams</div>
                <div className="text-3xl font-semibold" style={{ color: '#1a1a18' }}>{exams.length}</div>
              </div>

              {/* Exams List */}
              <div>
                <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#9b9b96' }}>Scheduled Exams</div>
                <StudentExamList exams={exams} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
