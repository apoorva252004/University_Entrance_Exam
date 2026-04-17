'use client';

import { useEffect, useState } from 'react';

interface StudentAttempt {
  id: string;
  student: {
    name: string;
    email: string;
  };
  submittedAt: string | null;
  score: number | null;
  totalMarks: number;
}

interface ExamResultsData {
  exam: {
    title: string;
    totalMarks: number;
    duration: number;
    mode: string;
    status: string;
  };
  attempts: StudentAttempt[];
  stats: {
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
}

interface ExamResultsProps {
  examId: string;
  onError: (message: string) => void;
}

export default function ExamResults({ examId, onError }: ExamResultsProps) {
  const [data, setData] = useState<ExamResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/exams/${examId}/results`);

      if (!response.ok) {
        throw new Error('Failed to fetch exam results');
      }

      const resultData = await response.json();
      setData(resultData);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not submitted';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return '#0F6E56';
    if (percentage >= 60) return '#BA7517';
    return '#B91C1C';
  };

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#533490' }}></div>
        <p className="mt-3 text-sm" style={{ color: '#6b6b67' }}>Loading results...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
        <p className="text-sm" style={{ color: '#6b6b67' }}>No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Exam Info Card */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e0dfd8' }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: '#1a1a18' }}>{data.exam.title}</h3>
        <div className="flex items-center gap-6 text-xs" style={{ color: '#6b6b67' }}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M8 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {data.exam.totalMarks} Marks
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 4v4l3 2" strokeLinecap="round"/>
            </svg>
            {data.exam.duration} Minutes
          </div>
          <div className="px-2 py-1 rounded-full text-xs" style={data.exam.mode === 'ONLINE' ? { background: '#EEEDFE', color: '#533490' } : { background: '#f4f4f0', color: '#6b6b67' }}>
            {data.exam.mode}
          </div>
          <div className="px-2 py-1 rounded-full text-xs" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
            {data.exam.status}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e0dfd8' }}>
          <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#9b9b96' }}>Total Attempts</div>
          <div className="text-2xl font-semibold" style={{ color: '#1a1a18' }}>{data.stats.totalAttempts}</div>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e0dfd8' }}>
          <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#9b9b96' }}>Average Score</div>
          <div className="text-2xl font-semibold" style={{ color: '#1a1a18' }}>
            {data.stats.averageScore.toFixed(1)}
            <span className="text-sm font-normal" style={{ color: '#6b6b67' }}> / {data.exam.totalMarks}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e0dfd8' }}>
          <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#9b9b96' }}>Highest Score</div>
          <div className="text-2xl font-semibold" style={{ color: '#0F6E56' }}>
            {data.stats.highestScore}
            <span className="text-sm font-normal" style={{ color: '#6b6b67' }}> / {data.exam.totalMarks}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e0dfd8' }}>
          <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#9b9b96' }}>Lowest Score</div>
          <div className="text-2xl font-semibold" style={{ color: '#B91C1C' }}>
            {data.stats.lowestScore}
            <span className="text-sm font-normal" style={{ color: '#6b6b67' }}> / {data.exam.totalMarks}</span>
          </div>
        </div>
      </div>

      {/* Student Attempts Table */}
      <div>
        <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#9b9b96' }}>
          Student Attempts ({data.attempts.length})
        </div>
        {data.attempts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
            <p className="text-sm" style={{ color: '#6b6b67' }}>No students have attempted this exam yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e0dfd8' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #e0dfd8', background: '#f4f4f0' }}>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#6b6b67' }}>Student Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#6b6b67' }}>Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#6b6b67' }}>Submitted At</th>
                  <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: '#6b6b67' }}>Score</th>
                  <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: '#6b6b67' }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((attempt) => {
                  const percentage = attempt.score !== null ? ((attempt.score / attempt.totalMarks) * 100).toFixed(1) : 'N/A';
                  return (
                    <tr key={attempt.id} style={{ borderBottom: '1px solid #e0dfd8' }}>
                      <td className="px-4 py-3 text-sm" style={{ color: '#1a1a18' }}>{attempt.student.name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#6b6b67' }}>{attempt.student.email}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#6b6b67' }}>{formatDate(attempt.submittedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium" style={{ color: attempt.score !== null ? getScoreColor(attempt.score, attempt.totalMarks) : '#6b6b67' }}>
                          {attempt.score !== null ? attempt.score : 'Pending'} / {attempt.totalMarks}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium" style={{ color: attempt.score !== null ? getScoreColor(attempt.score, attempt.totalMarks) : '#6b6b67' }}>
                          {percentage !== 'N/A' ? `${percentage}%` : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
