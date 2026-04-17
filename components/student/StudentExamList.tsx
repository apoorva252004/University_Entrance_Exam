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
          className="px-2 py-1 inline-flex text-xs font-medium rounded-full"
          style={{ background: '#E1F5EE', color: '#0F6E56' }}
        >
          Attempted
        </span>
      );
    }

    const statusStyles: Record<string, { bg: string; color: string }> = {
      SCHEDULED: { bg: '#E1F5EE', color: '#0F6E56' },
      ONGOING: { bg: '#EEEDFE', color: '#533490' },
      COMPLETED: { bg: '#f4f4f0', color: '#6b6b67' },
      CANCELLED: { bg: '#FFDDD8', color: '#B91C1C' },
    };

    const style = statusStyles[status] || { bg: '#f4f4f0', color: '#6b6b67' };

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
      <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
        <p className="text-sm" style={{ color: '#6b6b67' }}>No upcoming exams</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => {
        const isAttempted = exam.attempts && exam.attempts.length > 0;
        
        return (
        <div key={exam.id} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e0dfd8', padding: '1rem 1.25rem' }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: '#1a1a18' }}>{exam.title}</h4>
              <p className="text-xs" style={{ color: '#6b6b67' }}>{exam.school.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6b6b67' }}>{exam.program.name}</p>
            </div>
            {getStatusBadge(exam.status, isAttempted)}
          </div>

          {/* Description */}
          {exam.description && (
            <p className="text-xs mb-3" style={{ color: '#6b6b67' }}>{exam.description}</p>
          )}

          {/* Details Row */}
          <div className="flex flex-wrap gap-4 pt-3" style={{ borderTop: '1px solid #e0dfd8' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#6b6b67' }}>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="3" width="12" height="10" rx="1.5"/>
                <path d="M6 1v2M10 1v2M2 6h12" strokeLinecap="round"/>
              </svg>
              {formatDate(exam.examDate)} at {formatTime(exam.examDate)}
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#6b6b67' }}>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="8" cy="8" r="6"/>
                <path d="M8 4v4l3 2" strokeLinecap="round"/>
              </svg>
              {exam.duration} minutes
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#6b6b67' }}>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M8 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {exam.totalMarks} marks
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#6b6b67' }}>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="4" width="12" height="8" rx="1"/>
                <path d="M5 7h6M5 10h4" strokeLinecap="round"/>
              </svg>
              {exam._count.questions} questions
            </div>
            <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full" style={exam.mode === 'ONLINE' ? { background: '#EEEDFE', color: '#533490' } : { background: '#f4f4f0', color: '#6b6b67' }}>
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
          </div>

          {/* Mode-specific message */}
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e0dfd8' }}>
            {isAttempted ? (
              <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M13 4L6 11 3 8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>You have already attempted this exam</span>
              </div>
            ) : exam.mode === 'ONLINE' ? (
              <button
                onClick={() => router.push(`/student/exam/${exam.id}`)}
                className="text-xs px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 inline-flex items-center gap-2"
                style={{ background: '#EEEDFE', color: '#533490' }}
                disabled={exam.status !== 'ONGOING'}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M6 4l6 4-6 4V4z" fill="currentColor"/>
                </svg>
                {exam.status === 'ONGOING' ? 'Attempt Exam' : 'Not Available Yet'}
              </button>
            ) : (
              <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: '#FAEEDA', color: '#854F0B' }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="8" cy="8" r="6"/>
                  <path d="M8 5v3M8 11h.01" strokeLinecap="round"/>
                </svg>
                <span>Offline exam - Details will be mailed to you soon</span>
              </div>
            )}
          </div>
        </div>
      )})}
    </div>
  );
}
