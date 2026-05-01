'use client';

import { useEffect, useState, useCallback } from 'react';
import BulkQuestionUpload from './BulkQuestionUpload';

interface Question {
  id: string;
  questionText: string;
  questionType: 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'TRUE_FALSE';
  options: string | null;
  correctAnswer: string | null;
  marks: number;
  order: number;
}

interface Props {
  examId: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  MCQ: 'Multiple Choice',
  TRUE_FALSE: 'True / False',
  SHORT_ANSWER: 'Short Answer',
  LONG_ANSWER: 'Long Answer',
};

const TYPE_BADGE: Record<string, string> = {
  MCQ: 'badge-navy',
  TRUE_FALSE: 'badge-info',
  SHORT_ANSWER: 'badge-gold',
  LONG_ANSWER: 'badge-warning',
};

export default function QuestionManager({ examId, onSuccess, onError }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'MCQ' as Question['questionType'],
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
  });

  useEffect(() => { fetchQuestions(); }, [examId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/exams/${examId}/questions`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {
        questionText: formData.questionText,
        questionType: formData.questionType,
        marks: formData.marks,
        order: editingQuestion ? editingQuestion.order : questions.length + 1,
      };
      if (formData.questionType === 'MCQ') {
        payload.options = JSON.stringify(formData.options.filter(o => o.trim()));
        payload.correctAnswer = formData.correctAnswer;
      } else if (formData.questionType === 'TRUE_FALSE') {
        payload.correctAnswer = formData.correctAnswer;
      }

      const url = editingQuestion
        ? `/api/teacher/exams/${examId}/questions/${editingQuestion.id}`
        : `/api/teacher/exams/${examId}/questions`;

      const res = await fetch(url, {
        method: editingQuestion ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save question');

      onSuccess(editingQuestion ? 'Question updated successfully' : 'Question added successfully');
      resetForm();
      fetchQuestions();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save question');
    }
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormData({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options ? JSON.parse(q.options) : ['', '', '', ''],
      correctAnswer: q.correctAnswer || '',
      marks: q.marks,
    });
    setShowForm(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      const res = await fetch(`/api/teacher/exams/${examId}/questions/${questionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete question');
      onSuccess('Question deleted successfully');
      fetchQuestions();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  const resetForm = () => {
    setFormData({ questionText: '', questionType: 'MCQ', options: ['', '', '', ''], correctAnswer: '', marks: 1 });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const handleOptionChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const opts = [...prev.options];
      opts[index] = value;
      return { ...prev, options: opts };
    });
  }, []);

  const handleFormDataChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  if (loading) {
    return (
      <div className="table-container flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#0F2D52', borderTopColor: 'transparent' }} />
        <p className="mt-3 text-sm" style={{ color: '#6B7280' }}>Loading questions…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header card with stats + actions */}
      <div className="bg-white rounded-2xl px-6 py-5 flex items-center justify-between"
        style={{ border: '1px solid #EEF2F7', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>Questions</p>
          <p className="text-3xl font-bold" style={{ color: '#0F2D52' }}>{questions.length}</p>
        </div>
        {!showForm && (
          <div className="flex gap-3">
            <button onClick={() => setShowBulkUpload(true)} className="btn-accent">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Bulk Upload
            </button>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>
        )}
      </div>

      {/* Question Form */}
      {showForm && (
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #EEF2F7', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid #EEF2F7', background: '#F8FAFC' }}>
            <h3 className="font-semibold" style={{ color: '#0F2D52' }}>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>
            <button onClick={resetForm} className="btn-ghost" style={{ padding: '7px 14px', fontSize: '13px' }}>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Question text */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                Question Text <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                value={formData.questionText}
                onChange={e => handleFormDataChange('questionText', e.target.value)}
                required rows={3} placeholder="Enter your question here…"
                className="input-field" style={{ resize: 'vertical' }}
              />
            </div>

            {/* Type + Marks */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Question Type <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={formData.questionType}
                  onChange={e => setFormData(prev => ({ 
                    ...prev, 
                    questionType: e.target.value as Question['questionType'], 
                    options: ['', '', '', ''], 
                    correctAnswer: '' 
                  }))}
                  required className="input-field"
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                  <option value="LONG_ANSWER">Long Answer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Marks <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input type="number" value={formData.marks} min="1" required
                  onChange={e => handleFormDataChange('marks', parseInt(e.target.value))}
                  className="input-field" />
              </div>
            </div>

            {/* MCQ options */}
            {formData.questionType === 'MCQ' && (
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#374151' }}>
                  Options <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="space-y-2.5">
                  {formData.options.map((option, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                        <input type="radio" name="correctAnswer"
                          checked={formData.correctAnswer === option && option !== ''}
                          onChange={() => option && handleFormDataChange('correctAnswer', option)}
                          style={{ accentColor: '#0F2D52', width: '16px', height: '16px' }} />
                        <span className="text-xs font-bold" style={{ color: '#6B7280' }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                      </label>
                      <input type="text" value={option} required
                        onChange={e => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="input-field flex-1" style={{ padding: '10px 14px' }} />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs" style={{ color: '#9CA3AF' }}>
                  Click the radio button next to the correct answer
                </p>
              </div>
            )}

            {/* True/False */}
            {formData.questionType === 'TRUE_FALSE' && (
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#374151' }}>
                  Correct Answer <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="flex gap-4">
                  {['TRUE', 'FALSE'].map(val => (
                    <label key={val} className="flex items-center gap-2.5 px-5 py-3 rounded-xl cursor-pointer transition-colors"
                      style={{
                        border: `1.5px solid ${formData.correctAnswer === val ? '#0F2D52' : '#E5E7EB'}`,
                        background: formData.correctAnswer === val ? '#EAF2FB' : '#fff',
                      }}>
                      <input type="radio" name="trueFalse" value={val} required
                        checked={formData.correctAnswer === val}
                        onChange={e => handleFormDataChange('correctAnswer', e.target.value)}
                        style={{ accentColor: '#0F2D52', width: '16px', height: '16px' }} />
                      <span className="text-sm font-semibold" style={{ color: '#0F2D52' }}>{val}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid #EEF2F7' }} />

            <button type="submit" className="btn-primary">
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </button>
          </form>
        </div>
      )}

      {/* Questions list */}
      {questions.length === 0 && !showForm ? (
        <div className="table-container flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#EAF2FB' }}>
            <svg className="w-8 h-8" style={{ color: '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: '#0F2D52' }}>No questions yet</h3>
          <p className="text-sm" style={{ color: '#6B7280' }}>Add questions manually or use bulk upload</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const opts = q.options ? JSON.parse(q.options) as string[] : [];
            return (
              <div key={q.id} className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #EEF2F7', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <div className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    {/* Number badge */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: '#EAF2FB', color: '#0F2D52' }}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-2" style={{ color: '#111827' }}>{q.questionText}</p>

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className={`badge ${TYPE_BADGE[q.questionType] ?? 'badge-navy'}`} style={{ fontSize: '11px' }}>
                          {TYPE_LABELS[q.questionType]}
                        </span>
                        <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                          {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                        </span>
                      </div>

                      {/* MCQ options */}
                      {opts.length > 0 && (
                        <div className="space-y-1.5">
                          {opts.map((opt, i) => {
                            const isCorrect = opt === q.correctAnswer;
                            return (
                              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm"
                                style={{
                                  background: isCorrect ? '#DCFCE7' : '#F8FAFC',
                                  border: `1px solid ${isCorrect ? '#86EFAC' : '#EEF2F7'}`,
                                  color: isCorrect ? '#14532D' : '#374151',
                                }}>
                                <span className="font-bold text-xs" style={{ color: isCorrect ? '#16A34A' : '#9CA3AF' }}>
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span>{opt}</span>
                                {isCorrect && (
                                  <svg className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: '#16A34A' }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.questionType === 'TRUE_FALSE' && q.correctAnswer && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                          style={{ background: '#DCFCE7', color: '#14532D' }}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Correct: {q.correctAnswer}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleEdit(q)} className="btn-secondary" style={{ padding: '7px 14px', fontSize: '12px' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="btn-danger" style={{ padding: '7px 14px', fontSize: '12px' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkQuestionUpload
          examId={examId}
          onUploadComplete={() => { fetchQuestions(); onSuccess('Questions uploaded successfully'); }}
          onClose={() => setShowBulkUpload(false)}
        />
      )}
    </div>
  );
}
