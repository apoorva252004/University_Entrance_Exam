'use client';

import { useRouter } from 'next/navigation';

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

interface StudentExamListProps {
  exams: Exam[];
}

export default function StudentExamList({ exams }: StudentExamListProps) {
  const router = useRouter();

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

  const getStatusBadge = (status: string, isAttempted: boolean) => {
    if (isAttempted) {
      return (
        <span
          className="px-2 py-0.5 inline-flex text-xs font-medium rounded-full"
          style={{ background: '#D1FAE5', color: '#065F46' }}
        >
          Attempted
        </span>
      );
    }

    const statusStyles: Record<string, { bg: string; color: string }> = {
      SCHEDULED: { bg: '#D1FAE5', color: '#065F46' },
      ONGOING: { bg: '#E8F0FE', color: '#1A2D5A' },
      COMPLETED: { bg: '#F3F4F6', color: '#666666' },
      CANCELLED: { bg: '#E8F0FE', color: '#1A2D5A' },
    };

    const style = statusStyles[status] || { bg: '#F3F4F6', color: '#666666' };

    return (
      <span
        className="px-2 py-0.5 inline-flex text-xs font-medium rounded-full"
        style={{ background: style.bg, color: style.color }}
      >
        {status}
      </span>
    );
  };

  if (exams.length === 0) {
    return (
      <div className="text-center py-4 bg-white rounded-lg" style={{ border: '1px solid #E5E5E5' }}>
        <p className="text-xs" style={{ color: '#666666' }}>No upcoming exams</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {exams.map((exam) => {
        const isAttempted = exam.attempts && exam.attempts.length > 0;
        
        return (
        <div key={exam.id} className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #E5E5E5', padding: '0.625rem 0.875rem' }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-xs font-medium mb-0.5" style={{ color: '#1A2D5A' }}>{exam.title}</h4>
              <p className="text-xs" style={{ color: '#666666' }}>{exam.school.name} • {exam.program.name}</p>
            </div>
            {getStatusBadge(exam.status, isAttempted)}
          </div>

          {/* Description */}
          {exam.description && (
            <p className="text-xs mb-2" style={{ color: '#666666' }}>{exam.description}</p>
          )}

          {/* Details Row */}
          <div className="flex flex-wrap gap-2 pt-2 text-xs" style={{ borderTop: '1px solid #E5E5E5', color: '#666666' }}>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="3" width="12" height="10" rx="1.5"/>
                <path d="M6 1v2M10 1v2M2 6h12" strokeLinecap="round"/>
              </svg>
              {formatDate(exam.examDate)}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="8" cy="8" r="6"/>
                <path d="M8 4v4l3 2" strokeLinecap="round"/>
              </svg>
              {exam.duration}m
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M8 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {exam.totalMarks}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="4" width="12" height="8" rx="1"/>
                <path d="M5 7h6M5 10h4" strokeLinecap="round"/>
              </svg>
              {exam._count.questions}Q
            </div>
          </div>

          {/* Mode-specific message */}
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid #E5E5E5' }}>
            {isAttempted ? (
              <div className="flex items-start gap-1.5 text-xs px-2 py-1.5 rounded-lg" style={{ background: '#D1FAE5', color: '#065F46' }}>
                <svg className="w-3 h-3 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M13 4L6 11 3 8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Attempted</span>
              </div>
            ) : exam.mode === 'ONLINE' ? (
              <button
                onClick={() => router.push(`/student/exam/${exam.id}`)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-90 inline-flex items-center gap-1.5"
                style={{ background: '#E8F0FE', color: '#1A2D5A' }}
                disabled={exam.status !== 'ONGOING'}
              >
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M6 4l6 4-6 4V4z" fill="currentColor"/>
                </svg>
                {exam.status === 'ONGOING' ? 'Attempt' : 'Not Available'}
              </button>
            ) : (
              <div className="flex items-start gap-1.5 text-xs px-2 py-1.5 rounded-lg" style={{ background: '#FEF3C7', color: '#92400E' }}>
                <svg className="w-3 h-3 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="8" cy="8" r="6"/>
                  <path d="M8 5v3M8 11h.01" strokeLinecap="round"/>
                </svg>
                <span>Offline - Details coming soon</span>
              </div>
            )}
          </div>
        </div>
      )})}
    </div>
  );
}
