'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TeacherSidebar, { TeacherTab } from '@/components/teacher/TeacherSidebar';
import TeacherTopBar from '@/components/teacher/TeacherTopBar';
import TeacherKpiCards from '@/components/teacher/TeacherKpiCards';
import TeacherOverview from '@/components/teacher/TeacherOverview';
import StudentListTable from '@/components/teacher/StudentListTable';
import ExamListTable from '@/components/teacher/ExamListTable';
import CreateExamForm from '@/components/teacher/CreateExamForm';
import QuestionManager from '@/components/teacher/QuestionManager';
import ExamResults from '@/components/teacher/ExamResults';

interface Student { id: string; name: string; email: string; programForSchool: string; status: string; }
interface TeacherStudentsResponse { students: Student[]; assignedSchool: string; }
interface Exam {
  id: string; title: string; description: string | null; examDate: string;
  duration: number; totalMarks: number; status: string; mode: string; venue: string | null;
  program: { id: string; name: string };
  createdBy: { name: string; email: string };
  questions?: { id: string }[];
}
interface Program { id: string; name: string; }

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  overview:           { title: 'Overview',          subtitle: 'Your teaching workspace at a glance' },
  exams:              { title: 'My Exams',           subtitle: 'Manage and monitor all your examinations' },
  'create-exam':      { title: 'Create Exam',        subtitle: 'Set up a new examination for your students' },
  students:           { title: 'Students',           subtitle: 'View students enrolled in your school' },
  'manage-questions': { title: 'Manage Questions',   subtitle: 'Add, edit, and organise exam questions' },
  'exam-results':     { title: 'Exam Results',       subtitle: 'View student performance and analytics' },
};

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');
  const [studentsData, setStudentsData] = useState<TeacherStudentsResponse | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      if (session?.user?.isFirstLogin) { router.push('/change-password'); return; }
      if (session?.user?.role !== 'TEACHER') { router.push('/'); }
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchStudents();
    fetchExams();
    fetchPrograms();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/students');
      if (!res.ok) throw new Error('Failed to fetch students');
      setStudentsData(await res.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/teacher/exams');
      if (!res.ok) throw new Error('Failed to fetch exams');
      const data = await res.json();
      setExams(data.exams);
    } catch (err) { console.error(err); }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/teacher/programs');
      if (!res.ok) throw new Error('Failed to fetch programs');
      const data = await res.json();
      setPrograms(data.programs);
    } catch (err) { console.error(err); }
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
    if (!confirm('Publish this exam? Students will be able to attempt it.')) return;
    try {
      const res = await fetch(`/api/teacher/exams/${examId}/publish`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to publish exam');
      showToast('Exam published successfully!', 'success');
      fetchExams();
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to publish exam', 'error'); }
  };

  const handleStopExam = async (examId: string) => {
    if (!confirm('Stop this exam? Students will no longer be able to attempt it.')) return;
    try {
      const res = await fetch(`/api/teacher/exams/${examId}/stop`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to stop exam');
      showToast('Exam stopped successfully!', 'success');
      fetchExams();
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to stop exam', 'error'); }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Delete this exam? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/teacher/exams/${examId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete exam');
      showToast('Exam deleted successfully!', 'success');
      fetchExams();
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to delete exam', 'error'); }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #14B8A6', borderTopColor: 'transparent', animation: 'spin 700ms linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 12, fontSize: 14, color: '#6B7280' }}>Loading your workspace…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !studentsData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#DC2626', marginBottom: 16 }}>{error ?? 'Something went wrong'}</p>
          <button onClick={fetchStudents} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const meta = PAGE_META[activeTab] ?? PAGE_META['overview'];
  const totalQuestions = exams.reduce((sum, e) => sum + (e.questions?.length ?? 0), 0);
  const pendingEvals = 0; // placeholder — could be computed from attempts without scores

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <TeacherSidebar
        userName={session?.user?.name ?? 'Teacher'}
        assignedSchool={studentsData.assignedSchool}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        examCount={exams.length}
        pendingEvals={pendingEvals}
      />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar */}
        <TeacherTopBar
          userName={session?.user?.name ?? 'Teacher'}
          assignedSchool={studentsData.assignedSchool}
          actions={
            activeTab === 'exams' ? (
              <button
                onClick={() => setActiveTab('create-exam')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg, #0F2D52, #173F73)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,45,82,0.25)', transition: 'all 150ms ease', fontFamily: 'inherit' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(15,45,82,0.35)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(15,45,82,0.25)'; }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                New Exam
              </button>
            ) : undefined
          }
        />

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', paddingBottom: '48px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: 800, color: '#0F2D52', letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 5 }}>
                {meta.title}
              </h1>
              <p style={{ fontSize: 14, color: '#6B7280' }}>{meta.subtitle}</p>
            </div>

            {/* KPI cards — always visible */}
            <div style={{ marginBottom: 28 }}>
              <TeacherKpiCards
                examsCreated={exams.length}
                questionsUploaded={totalQuestions}
                studentsAssigned={studentsData.students.length}
                pendingEvaluations={pendingEvals}
              />
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <TeacherOverview
                exams={exams}
                studentsCount={studentsData.students.length}
                onNavigate={(tab) => setActiveTab(tab as TeacherTab)}
                onManageQuestions={handleManageQuestions}
                onViewResults={handleViewResults}
                onPublishExam={handlePublishExam}
                onStopExam={handleStopExam}
                onDeleteExam={handleDeleteExam}
              />
            )}

            {activeTab === 'exams' && (
              <ExamListTable
                exams={exams}
                onManageQuestions={handleManageQuestions}
                onPublishExam={handlePublishExam}
                onStopExam={handleStopExam}
                onDeleteExam={handleDeleteExam}
                onViewResults={handleViewResults}
              />
            )}

            {activeTab === 'create-exam' && (
              <CreateExamForm
                programs={programs}
                onSuccess={handleExamCreated}
                onError={(msg) => showToast(msg, 'error')}
              />
            )}

            {activeTab === 'students' && (
              <StudentListTable
                students={studentsData.students}
                assignedSchool={studentsData.assignedSchool}
              />
            )}

            {activeTab === 'manage-questions' && selectedExamId && (
              <div>
                <button
                  onClick={() => setActiveTab('exams')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 24, fontFamily: 'inherit', transition: 'all 150ms ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0F2D52'; (e.currentTarget as HTMLButtonElement).style.color = '#0F2D52'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Back to Exams
                </button>
                <QuestionManager
                  examId={selectedExamId}
                  onSuccess={(msg) => showToast(msg, 'success')}
                  onError={(msg) => showToast(msg, 'error')}
                />
              </div>
            )}

            {activeTab === 'exam-results' && selectedExamId && (
              <div>
                <button
                  onClick={() => setActiveTab('exams')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 24, fontFamily: 'inherit', transition: 'all 150ms ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0F2D52'; (e.currentTarget as HTMLButtonElement).style.color = '#0F2D52'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Back to Exams
                </button>
                <ExamResults
                  examId={selectedExamId}
                  onError={(msg) => showToast(msg, 'error')}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 14, background: toast.type === 'success' ? '#16A34A' : '#DC2626', color: '#fff', fontSize: 14, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', animation: 'slideDown 250ms ease', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {toast.type === 'success' ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
