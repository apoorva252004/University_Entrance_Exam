'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

interface Question {
  id: string;
  questionText: string;
  questionType: 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'TRUE_FALSE';
  options: string | null;
  marks: number;
  order: number;
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  totalMarks: number;
  instructions: string | null;
  questions: Question[];
}

export default function ExamAttemptPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'STUDENT') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchExam();
    }
  }, [status, examId]);

  useEffect(() => {
    if (timeRemaining <= 0 || !exam) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, exam, answers, submitting]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/exam/${examId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exam');
      }

      const data = await response.json();
      setExam(data.exam);
      setTimeRemaining(data.exam.duration * 60); // Convert minutes to seconds
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const response = await fetch(`/api/student/exam/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit exam');
      }

      const data = await response.json();
      alert('Exam submitted successfully!');
      router.push('/student/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    if (!confirm('Are you sure you want to submit your exam? You cannot change your answers after submission.')) {
      return;
    }
    handleSubmit();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(key => answers[key]?.trim()).length;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f4f0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto" style={{ borderColor: '#533490' }}></div>
          <p className="mt-3 text-sm" style={{ color: '#6b6b67' }}>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f4f0' }}>
        <div className="text-center">
          <p className="text-red-600 text-sm">{error || 'Exam not found'}</p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="mt-4 px-4 py-2 text-white text-sm rounded-lg transition-colors"
            style={{ background: '#533490' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f4f4f0' }}>
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm" style={{ borderBottom: '1px solid #e0dfd8' }}>
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium" style={{ color: '#1a1a18' }}>{exam.title}</h1>
              <p className="text-xs mt-1" style={{ color: '#6b6b67' }}>
                {getAnsweredCount()} of {exam.questions.length} questions answered
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs" style={{ color: '#6b6b67' }}>Time Remaining</div>
                <div className="text-xl font-semibold" style={{ color: timeRemaining < 300 ? '#B91C1C' : '#1a1a18' }}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <button
                onClick={handleSubmitClick}
                disabled={submitting}
                className="px-5 py-2 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ background: '#0F6E56' }}
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Exam Info Card */}
        <div className="bg-white rounded-xl p-5 mb-6" style={{ border: '1px solid #e0dfd8' }}>
          <div className="flex items-center gap-6 text-sm" style={{ color: '#6b6b67' }}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="4" width="12" height="8" rx="1"/>
                <path d="M5 7h6M5 10h4" strokeLinecap="round"/>
              </svg>
              {exam.questions.length} Questions
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M8 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {exam.totalMarks} Marks
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="8" cy="8" r="6"/>
                <path d="M8 4v4l3 2" strokeLinecap="round"/>
              </svg>
              {exam.duration} Minutes
            </div>
          </div>
          {exam.instructions && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e0dfd8' }}>
              <div className="text-xs font-medium mb-2" style={{ color: '#1a1a18' }}>Instructions:</div>
              <p className="text-xs" style={{ color: '#6b6b67' }}>{exam.instructions}</p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {exam.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl p-5" style={{ border: '1px solid #e0dfd8' }}>
              {/* Question Header */}
              <div className="flex items-start gap-3 mb-4">
                <span className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0" style={{ background: '#EEEDFE', color: '#533490' }}>
                  Q{index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm mb-1" style={{ color: '#1a1a18' }}>{question.questionText}</p>
                  <p className="text-xs" style={{ color: '#6b6b67' }}>{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</p>
                </div>
              </div>

              {/* Answer Input */}
              <div className="ml-11">
                {question.questionType === 'MCQ' && question.options && (
                  <div className="space-y-2">
                    {JSON.parse(question.options).map((option: string, idx: number) => (
                      <label key={idx} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #e0dfd8' }}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-4 h-4"
                          style={{ accentColor: '#533490' }}
                        />
                        <span className="text-sm" style={{ color: '#1a1a18' }}>
                          {String.fromCharCode(65 + idx)}. {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {question.questionType === 'TRUE_FALSE' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #e0dfd8' }}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value="TRUE"
                        checked={answers[question.id] === 'TRUE'}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-4 h-4"
                        style={{ accentColor: '#533490' }}
                      />
                      <span className="text-sm" style={{ color: '#1a1a18' }}>True</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #e0dfd8' }}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value="FALSE"
                        checked={answers[question.id] === 'FALSE'}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-4 h-4"
                        style={{ accentColor: '#533490' }}
                      />
                      <span className="text-sm" style={{ color: '#1a1a18' }}>False</span>
                    </label>
                  </div>
                )}

                {question.questionType === 'SHORT_ANSWER' && (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                    style={{ border: '1px solid #e0dfd8', background: '#ffffff', color: '#1a1a18' }}
                  />
                )}

                {question.questionType === 'LONG_ANSWER' && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={5}
                    className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                    style={{ border: '1px solid #e0dfd8', background: '#ffffff', color: '#1a1a18' }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button at Bottom */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmitClick}
            disabled={submitting}
            className="px-8 py-3 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: '#0F6E56' }}
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}
