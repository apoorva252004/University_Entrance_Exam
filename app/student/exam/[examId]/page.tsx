'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Timer, 
  Users, 
  Award,
  AlertTriangle,
  Check,
  ArrowRight,
  LogOut,
  Settings,
  BarChart3,
  BookOpen,
  Home
} from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: string[];
  marks: number;
  order: number;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  examDate: string;
  duration: number;
  totalMarks: number;
  status: string;
  mode: string;
  questions: Question[];
  program: {
    id: string;
    name: string;
  };
  school: {
    id: string;
    name: string;
  };
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const examId = params.examId as string;
  const userName = session?.user?.name || 'Student';
  const firstName = userName.split(' ')[0];

  // Fetch exam details
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status !== 'authenticated') return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/exam/${examId}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch exam');
        }

        const data = await response.json();
        setExam(data.exam);

        // Initialize timer
        const durationInSeconds = data.exam.duration * 60;
        setTimeRemaining(durationInSeconds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, status, router]);

  // Timer effect
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev && prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitted]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Auto-save indication
    setAutoSaveStatus('saving');
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleSubmit = async () => {
    if (!exam) return;

    try {
      const response = await fetch(`/api/student/exam/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit exam');
      }

      setSubmitted(true);
      router.push('/student/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit exam');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!timeRemaining) return 'text-slate-600';
    const minutes = Math.floor(timeRemaining / 60);
    if (minutes > 30) return 'text-[#0F2D52]';
    if (minutes > 10) return 'text-[#F59E0B]';
    return 'text-[#DC2626]';
  };

  const getTimerBgColor = () => {
    if (!timeRemaining) return 'bg-slate-50';
    const minutes = Math.floor(timeRemaining / 60);
    if (minutes > 30) return 'bg-blue-50';
    if (minutes > 10) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const shouldPulse = () => {
    if (!timeRemaining) return false;
    const minutes = Math.floor(timeRemaining / 60);
    return minutes <= 10;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0F2D52] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B7280] text-lg font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Unable to Load Exam</h2>
          <p className="text-[#6B7280] mb-6">{error}</p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="w-full bg-[#0F2D52] text-white py-3 rounded-xl hover:bg-[#173F73] transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-[#6B7280] text-lg">Exam not found</p>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const remainingCount = exam.questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-[#0F2D52] to-[#173F73] flex flex-col fixed h-full z-10">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Image src="/mcv23476_rvu-logo.png" alt="RV University" width={24} height={24} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">RV University</div>
              <div className="text-white/60 text-xs">Student Portal</div>
            </div>
          </div>
        </div>

        {/* Student Profile */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C79A2B] to-[#E8B84B] rounded-full flex items-center justify-center text-[#0F2D52] font-bold text-lg">
              {firstName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">{firstName}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-xs font-medium">APPROVED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {[
              { icon: Home, label: 'Dashboard', id: 'dashboard' },
              { icon: BookOpen, label: 'My Programs', id: 'programs' },
              { icon: FileText, label: 'My Exams', id: 'exams', active: true },
              { icon: BarChart3, label: 'Results', id: 'results' },
              { icon: Settings, label: 'Settings', id: 'settings' },
            ].map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  item.active
                    ? 'bg-white/10 text-white border-l-4 border-[#C79A2B]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.active && <div className="w-2 h-2 bg-[#C79A2B] rounded-full ml-auto"></div>}
              </button>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => router.push('/api/auth/signout')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 flex">
        {/* CENTER CONTENT */}
        <div className="flex-1 p-6 pr-0">
          {/* Exam Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8 mb-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#111827] mb-2">{exam.title}</h1>
              <p className="text-[#6B7280]">{exam.description}</p>
            </div>
            
            <div className="flex gap-6">
              <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl px-4 py-3">
                <div className="w-10 h-10 bg-[#0F2D52] rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-[#6B7280]">Total Marks</div>
                  <div className="font-bold text-[#111827]">{exam.totalMarks}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl px-4 py-3">
                <div className="w-10 h-10 bg-[#173F73] rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-[#6B7280]">Duration</div>
                  <div className="font-bold text-[#111827]">{exam.duration} min</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl px-4 py-3">
                <div className="w-10 h-10 bg-[#C79A2B] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-[#6B7280]">Questions</div>
                  <div className="font-bold text-[#111827]">{exam.questions.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8 mb-6">
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#111827]">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </h2>
                <div className="text-sm font-medium text-[#6B7280]">
                  {Math.round(progress)}% Complete
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-[#F1F5F9] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#0F2D52] to-[#173F73] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#111827] leading-relaxed">
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {(Array.isArray(currentQuestion.options) ? currentQuestion.options : []).map((option, index) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerChange(currentQuestion.id, option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#0F2D52] bg-blue-50'
                        : 'border-[#E5E7EB] hover:border-[#0F2D52] hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#0F2D52] bg-[#0F2D52]' : 'border-[#E5E7EB]'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-[#111827] font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Marks Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0F2D52]" />
                <span className="text-sm font-medium text-[#0F2D52]">
                  Marks: {currentQuestion.marks}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 sticky bottom-6">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#F8FAFC] text-[#6B7280] rounded-xl hover:bg-[#E5E7EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {/* Question Navigator */}
              <div className="flex gap-2">
                {exam.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-[#0F2D52] text-white'
                        : answers[exam.questions[index].id]
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#F1F5F9] text-[#6B7280] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Next/Submit Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(exam.questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === exam.questions.length - 1}
                  className="flex items-center gap-2 px-6 py-3 bg-[#F8FAFC] text-[#6B7280] rounded-xl hover:bg-[#E5E7EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#16A34A] text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                >
                  Submit Exam
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-80 p-6">
          <div className="space-y-6">
            {/* Timer Card */}
            <div className={`bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 ${shouldPulse() ? 'animate-pulse' : ''}`}>
              <div className="text-center">
                <div className="mb-3">
                  <Clock className={`w-8 h-8 mx-auto ${getTimerColor()}`} />
                </div>
                <div className={`text-4xl font-bold mb-2 ${getTimerColor()}`}>
                  {timeRemaining !== null ? formatTime(timeRemaining) : '--:--:--'}
                </div>
                <div className="text-sm text-[#6B7280]">Time Remaining</div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
              <h3 className="font-bold text-[#111827] mb-4">Progress Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Answered</span>
                  <span className="font-semibold text-[#16A34A]">{answeredCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Remaining</span>
                  <span className="font-semibold text-[#F59E0B]">{remainingCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Total Questions</span>
                  <span className="font-semibold text-[#111827]">{exam.questions.length}</span>
                </div>
              </div>
            </div>

            {/* Question Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
              <h3 className="font-bold text-[#111827] mb-4">Question Navigator</h3>
              <div className="grid grid-cols-4 gap-2">
                {exam.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-12 h-12 rounded-xl font-semibold text-sm transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-[#0F2D52] text-white'
                        : answers[exam.questions[index].id]
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#F1F5F9] text-[#6B7280] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
              <h3 className="font-bold text-[#111827] mb-4">Instructions</h3>
              <div className="space-y-3 text-sm text-[#6B7280]">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#0F2D52] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Do not refresh the page during the exam</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#0F2D52] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Submit your exam before time expires</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#0F2D52] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Select only one answer per question</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#0F2D52] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Your answers are automatically saved</span>
                </div>
              </div>
            </div>

            {/* Auto-save Status */}
            {autoSaveStatus !== 'idle' && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-4">
                <div className="flex items-center gap-2">
                  {autoSaveStatus === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0F2D52] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-[#6B7280]">Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                      <span className="text-sm text-[#16A34A]">Answer saved</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">Submit Exam?</h3>
              <p className="text-[#6B7280]">
                Are you sure you want to submit your exam? You won't be able to make changes after submission.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-6 py-3 bg-[#F8FAFC] text-[#6B7280] rounded-xl hover:bg-[#E5E7EB] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-[#16A34A] text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}