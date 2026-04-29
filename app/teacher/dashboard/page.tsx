'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StudentListTable from '@/components/teacher/StudentListTable';
import ExamListTable from '@/components/teacher/ExamListTable';
import CreateExamForm from '@/components/teacher/CreateExamForm';
import QuestionManager from '@/components/teacher/QuestionManager';
import ExamResults from '@/components/teacher/ExamResults';

interface Student {
  id: string;
  name: string;
  email: string;
  programForSchool: string;
  status: string;
}

interface TeacherStudentsResponse {
  students: Student[];
  assignedSchool: string;
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
  createdBy: {
    name: string;
    email: string;
  };
}

interface Program {
  id: string;
  name: string;
}

type TabType = 'students' | 'exams' | 'create-exam' | 'manage-questions' | 'exam-results';

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [studentsData, setStudentsData] = useState<TeacherStudentsResponse | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
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
      
      if (session?.user?.role !== 'TEACHER') {
        router.push('/');
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchStudents();
    fetchExams();
    fetchPrograms();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/students');
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const responseData = await response.json();
      setStudentsData(responseData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/teacher/exams');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      const data = await response.json();
      setExams(data.exams);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/teacher/programs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }

      const data = await response.json();
      setPrograms(data.programs);
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  const handleExamCreated = () => {
    showToast('Exam created successfully!', 'success');
    fetchExams();
    setActiveTab('exams');
  };

  const handleManageQuestions = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('manage-questions');
  };

  const handleViewResults = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('exam-results');
  };

  const handlePublishExam = async (examId: string) => {
    if (!confirm('Are you sure you want to publish this exam? Students will be able to attempt it.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/exams/${examId}/publish`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to publish exam');
      }

      showToast('Exam published successfully!', 'success');
      fetchExams();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to publish exam', 'error');
    }
  };

  const handleStopExam = async (examId: string) => {
    if (!confirm('Are you sure you want to stop this exam? Students will no longer be able to attempt it.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/exams/${examId}/stop`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to stop exam');
      }

      showToast('Exam stopped successfully!', 'success');
      fetchExams();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to stop exam', 'error');
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone and will delete all questions and student attempts.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/exams/${examId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete exam');
      }

      showToast('Exam deleted successfully!', 'success');
      fetchExams();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete exam', 'error');
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

  if (!studentsData) {
    return null;
  }

  return (
    <div className="h-screen grid overflow-hidden" style={{ gridTemplateColumns: '240px 1fr', background: 'var(--bg-main)' }}>
      {/* Sidebar - Navy Background */}
      <div className="sidebar flex flex-col h-screen overflow-hidden">
        {/* Logo/Brand */}
        <div className="p-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-on-dark)' }}>RV University</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Teacher Portal</p>
        </div>

        {/* Profile Header */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'var(--gold-primary)', color: 'var(--navy-primary)' }}>
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-on-dark)' }}>{session?.user?.name}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Teacher</div>
            </div>
          </div>
          <div className="text-xs mt-3 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-on-dark)' }}>
            {studentsData?.assignedSchool}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex flex-col gap-2 flex-1 overflow-auto">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('students'); }}
            className={`sidebar-item ${activeTab === 'students' ? 'sidebar-item-active' : ''}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="7" r="4"/>
              <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" strokeLinecap="round"/>
            </svg>
            <span>Students</span>
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
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('create-exam'); }}
            className={`sidebar-item ${activeTab === 'create-exam' ? 'sidebar-item-active' : ''}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 4v12M4 10h12" strokeLinecap="round"/>
            </svg>
            <span>Create Exam</span>
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
              {activeTab === 'students' && 'Students'}
              {activeTab === 'exams' && 'Exams'}
              {activeTab === 'create-exam' && 'Create Exam'}
              {activeTab === 'manage-questions' && 'Manage Questions'}
              {activeTab === 'exam-results' && 'Exam Results'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'students' && 'View enrolled students'}
              {activeTab === 'exams' && 'Manage your exams'}
              {activeTab === 'create-exam' && 'Create a new exam'}
              {activeTab === 'manage-questions' && 'Add and edit questions'}
              {activeTab === 'exam-results' && 'View student results'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6">
                <div className="card-stat">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Total Students</div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{studentsData?.students.length}</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Enrolled in your school</div>
                </div>
                <div className="card-stat">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Exams Created</div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{exams.length}</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Total exams</div>
                </div>
                <div className="card-stat">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Active Exams</div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{exams.filter(e => e.status === 'PUBLISHED').length}</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Currently published</div>
                </div>
              </div>

              {/* Students Table */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--navy-primary)' }}>Enrolled Students</h2>
                <StudentListTable
                  students={studentsData?.students || []}
                  assignedSchool={studentsData?.assignedSchool || ''}
                />
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="card-stat max-w-sm">
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Total Exams</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--navy-primary)' }}>{exams.length}</div>
                <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>All exams created</div>
              </div>

              {/* Exams Table */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--navy-primary)' }}>All Exams</h2>
                <ExamListTable 
                  exams={exams} 
                  onManageQuestions={handleManageQuestions} 
                  onPublishExam={handlePublishExam} 
                  onStopExam={handleStopExam} 
                  onDeleteExam={handleDeleteExam}
                  onViewResults={handleViewResults}
                />
              </div>
            </div>
          )}

          {activeTab === 'create-exam' && (
            <CreateExamForm 
              programs={programs} 
              onSuccess={handleExamCreated}
              onError={(message) => showToast(message, 'error')}
            />
          )}

          {activeTab === 'manage-questions' && selectedExamId && (
            <div>
              <button
                onClick={() => setActiveTab('exams')}
                className="btn-secondary mb-6 flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Exams
              </button>
              <QuestionManager 
                examId={selectedExamId}
                onSuccess={(message) => showToast(message, 'success')}
                onError={(message) => showToast(message, 'error')}
              />
            </div>
          )}

          {activeTab === 'exam-results' && selectedExamId && (
            <div>
              <button
                onClick={() => setActiveTab('exams')}
                className="btn-secondary mb-6 flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Exams
              </button>
              <ExamResults 
                examId={selectedExamId}
                onError={(message) => showToast(message, 'error')}
              />
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
