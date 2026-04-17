'use client';

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
  questions?: { id: string }[];
}

interface ExamListTableProps {
  exams: Exam[];
  onManageQuestions: (examId: string) => void;
  onPublishExam: (examId: string) => void;
  onStopExam: (examId: string) => void;
  onDeleteExam: (examId: string) => void;
  onViewResults: (examId: string) => void;
}

export default function ExamListTable({ exams, onManageQuestions, onPublishExam, onStopExam, onDeleteExam, onViewResults }: ExamListTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; color: string }> = {
      SCHEDULED: { bg: '#D1FAE5', color: '#065F46' },
      ONGOING: { bg: '#E8F0FE', color: '#1A2D5A' },
      COMPLETED: { bg: '#F3F4F6', color: '#666666' },
      CANCELLED: { bg: '#E8F0FE', color: '#1A2D5A' },
    };

    const style = statusStyles[status] || { bg: '#F3F4F6', color: '#666666' };

    return (
      <span
        className="px-2 py-1 inline-flex text-xs font-medium rounded-full"
        style={{ background: style.bg, color: style.color }}
      >
        {status}
      </span>
    );
  };

  if (exams.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
        <p className="text-sm" style={{ color: '#666666' }}>No exams scheduled yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <div key={exam.id} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E5E5', padding: '0.875rem 1rem' }}>
          <div className="flex items-start justify-between gap-6">
            {/* Exam Info */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium mb-1" style={{ color: '#1A2D5A' }}>{exam.title}</h4>
                  <p className="text-xs" style={{ color: '#666666' }}>{exam.program.name}</p>
                </div>
                {getStatusBadge(exam.status)}
              </div>

              {/* Description */}
              {exam.description && (
                <p className="text-xs mb-3" style={{ color: '#666666' }}>{exam.description}</p>
              )}

              {/* Details Row */}
              <div className="flex flex-wrap gap-4 pt-3" style={{ borderTop: '1px solid #E5E5E5' }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="2" y="3" width="12" height="10" rx="1.5"/>
                    <path d="M6 1v2M10 1v2M2 6h12" strokeLinecap="round"/>
                  </svg>
                  {formatDate(exam.examDate)} at {formatTime(exam.examDate)}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="8" cy="8" r="6"/>
                    <path d="M8 4v4l3 2" strokeLinecap="round"/>
                  </svg>
                  {exam.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M8 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {exam.totalMarks} marks
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="2" y="3" width="12" height="10" rx="1.5"/>
                    <path d="M5 7h6M5 10h4" strokeLinecap="round"/>
                  </svg>
                  {exam.questions?.length || 0} questions
                </div>
                <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full" style={exam.mode === 'ONLINE' ? { background: '#E8F0FE', color: '#1A2D5A' } : { background: '#F3F4F6', color: '#666666' }}>
                  {exam.mode === 'ONLINE' ? (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="2" y="3" width="12" height="8" rx="1"/>
                        <path d="M6 14h4M8 11v3" strokeLinecap="round"/>
                      </svg>
                      Online
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M8 14s-5-4-5-8a5 5 0 0110 0c0 4-5 8-5 8z"/>
                        <circle cx="8" cy="6" r="2"/>
                      </svg>
                      Offline
                    </>
                  )}
                </div>
                {exam.venue && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M8 14s-5-4-5-8a5 5 0 0110 0c0 4-5 8-5 8z"/>
                      <circle cx="8" cy="6" r="2"/>
                    </svg>
                    {exam.venue}
                  </div>
                )}
              </div>

              {/* Created By */}
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs" style={{ color: '#999999' }}>
                  Created by {exam.createdBy.name}
                </div>
                <div className="flex gap-2">
                  {exam.mode === 'ONLINE' && exam.status === 'SCHEDULED' && (
                    <button
                      onClick={() => onPublishExam(exam.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-90"
                      style={{ background: '#D1FAE5', color: '#065F46' }}
                    >
                      Publish Exam
                    </button>
                  )}
                  {exam.mode === 'ONLINE' && exam.status === 'ONGOING' && (
                    <button
                      onClick={() => onStopExam(exam.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-90"
                      style={{ background: '#E8F0FE', color: '#1A2D5A' }}
                    >
                      Stop Exam
                    </button>
                  )}
                  <button
                    onClick={() => onViewResults(exam.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-90"
                    style={{ background: '#D1FAE5', color: '#065F46' }}
                  >
                    View Results
                  </button>
                  <button
                    onClick={() => onManageQuestions(exam.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-90"
                    style={{ background: '#E8F0FE', color: '#1A2D5A' }}
                  >
                    Manage Questions
                  </button>
                  <button
                    onClick={() => onDeleteExam(exam.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-90"
                    style={{ background: '#E8F0FE', color: '#1A2D5A' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
