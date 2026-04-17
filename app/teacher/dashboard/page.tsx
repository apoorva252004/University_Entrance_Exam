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
    } else if (status === 'authenticated' && session?.user?.role !== 'TEACHER') {
      router.push('/');
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
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
            className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
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
    <div className="h-screen grid overflow-hidden" style={{ gridTemplateColumns: '220px 1fr', background: '#f4f4f0' }}>
      {/* Sidebar */}
      <div className="bg-white flex flex-col h-screen overflow-hidden" style={{ borderRight: '1px solid #e0dfd8' }}>
        {/* Profile Header */}
        <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid #e0dfd8' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2" style={{ background: '#CECBF6', color: '#3C3489' }}>
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>{session?.user?.name}</div>
          <div className="text-xs px-2 py-1 rounded-full inline-block" style={{ background: '#EEEDFE', color: '#533490' }}>
            ✓ Teacher
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 flex flex-col gap-1 flex-1 overflow-auto">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('students'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" 
            style={activeTab === 'students' ? { background: '#EEEDFE', color: '#3C3489', fontWeight: 500 } : { color: '#6b6b67' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="8" cy="5" r="3"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round"/>
            </svg>
            Students
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
            Exams
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('create-exam'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" 
            style={activeTab === 'create-exam' ? { background: '#EEEDFE', color: '#3C3489', fontWeight: 500 } : { color: '#6b6b67' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
            </svg>
            Create Exam
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors" style={{ color: '#6b6b67' }}>
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="8" cy="8" r="3"/>
              <path d="M8 2v2M8 12v2M2 8h2M12 8h2" strokeLinecap="round"/>
            </svg>
            Settings
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #e0dfd8' }}>
          <div>
            <h1 className="text-lg font-medium" style={{ color: '#1a1a18' }}>
              {activeTab === 'students' && 'Students'}
              {activeTab === 'exams' && 'Exams'}
              {activeTab === 'create-exam' && 'Create New Exam'}
              {activeTab === 'manage-questions' && 'Manage Questions'}
              {activeTab === 'exam-results' && 'Exam Results'}
            </h1>
            <p className="text-xs mt-1" style={{ color: '#6b6b67' }}>{studentsData.assignedSchool}</p>
          </div>
          <button
            onClick={() => router.push('/api/auth/signout')}
            className="text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors" 
            style={{ color: '#6b6b67', border: '1px solid #c8c7c0' }}
          >
            Sign out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {activeTab === 'students' && (
            <>
              {/* Stats Card */}
              <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e0dfd8' }}>
                <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#9b9b96' }}>Total Students</div>
                <div className="text-3xl font-semibold" style={{ color: '#1a1a18' }}>{studentsData.students.length}</div>
              </div>

              {/* Students Table */}
              <div>
                <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#9b9b96' }}>Enrolled Students</div>
                <StudentListTable
                  students={studentsData.students}
                  assignedSchool={studentsData.assignedSchool}
                />
              </div>
            </>
          )}

          {activeTab === 'exams' && (
            <>
              {/* Stats Card */}
              <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e0dfd8' }}>
                <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#9b9b96' }}>Total Exams</div>
                <div className="text-3xl font-semibold" style={{ color: '#1a1a18' }}>{exams.length}</div>
              </div>

              {/* Exams Table */}
              <div>
                <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#9b9b96' }}>All Exams</div>
                <ExamListTable 
                  exams={exams} 
                  onManageQuestions={handleManageQuestions} 
                  onPublishExam={handlePublishExam} 
                  onStopExam={handleStopExam} 
                  onDeleteExam={handleDeleteExam}
                  onViewResults={handleViewResults}
                />
              </div>
            </>
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
                className="text-xs px-3 py-2 rounded-lg mb-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                style={{ color: '#6b6b67', border: '1px solid #c8c7c0' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
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
                className="text-xs px-3 py-2 rounded-lg mb-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                style={{ color: '#6b6b67', border: '1px solid #c8c7c0' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
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
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-sm ${
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
