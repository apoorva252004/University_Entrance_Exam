'use client';

import { useEffect, useState } from 'react';

interface Question {
  id: string;
  questionText: string;
  questionType: 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'TRUE_FALSE';
  options: string | null;
  correctAnswer: string | null;
  marks: number;
  order: number;
}

interface QuestionManagerProps {
  examId: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function QuestionManager({ examId, onSuccess, onError }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'MCQ' as Question['questionType'],
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
  });

  useEffect(() => {
    fetchQuestions();
  }, [examId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/exams/${examId}/questions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
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
      const payload: any = {
        questionText: formData.questionText,
        questionType: formData.questionType,
        marks: formData.marks,
        order: editingQuestion ? editingQuestion.order : questions.length + 1,
      };

      if (formData.questionType === 'MCQ') {
        payload.options = JSON.stringify(formData.options.filter(opt => opt.trim()));
        payload.correctAnswer = formData.correctAnswer;
      } else if (formData.questionType === 'TRUE_FALSE') {
        payload.correctAnswer = formData.correctAnswer;
      }

      const url = editingQuestion
        ? `/api/teacher/exams/${examId}/questions/${editingQuestion.id}`
        : `/api/teacher/exams/${examId}/questions`;
      
      const method = editingQuestion ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save question');
      }

      onSuccess(editingQuestion ? 'Question updated successfully' : 'Question added successfully');
      resetForm();
      fetchQuestions();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save question');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options ? JSON.parse(question.options) : ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      marks: question.marks,
    });
    setShowForm(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/teacher/exams/${examId}/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      onSuccess('Question deleted successfully');
      fetchQuestions();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      questionType: 'MCQ',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#533490' }}></div>
        <p className="mt-3 text-sm" style={{ color: '#6b6b67' }}>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e0dfd8' }}>
        <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#9b9b96' }}>Total Questions</div>
        <div className="text-3xl font-semibold" style={{ color: '#1a1a18' }}>{questions.length}</div>
      </div>

      {/* Add Question Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:opacity-90"
          style={{ background: '#EEEDFE', color: '#533490' }}
        >
          + Add New Question
        </button>
      )}

      {/* Question Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e0dfd8' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#1a1a18' }}>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>
            <button
              onClick={resetForm}
              className="text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ color: '#6b6b67', border: '1px solid #c8c7c0' }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#6b6b67' }}>
                Question Text *
              </label>
              <textarea
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                style={{ border: '1px solid #e0dfd8', background: '#ffffff', color: '#1a1a18', focusRing: '#533490' }}
                placeholder="Enter your question here..."
              />
            </div>

            {/* Question Type and Marks */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#6b6b67' }}>
                  Question Type *
                </label>
                <select
                  value={formData.questionType}
                  onChange={(e) => setFormData({ ...formData, questionType: e.target.value as Question['questionType'], options: ['', '', '', ''], correctAnswer: '' })}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                  style={{ border: '1px solid #e0dfd8', background: '#ffffff', color: '#1a1a18' }}
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                  <option value="LONG_ANSWER">Long Answer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#6b6b67' }}>
                  Marks *
                </label>
                <input
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                  style={{ border: '1px solid #e0dfd8', background: '#ffffff', color: '#1a1a18' }}
                />
              </div>
            </div>

            {/* MCQ Options */}
            {formData.questionType === 'MCQ' && (
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#6b6b67' }}>
                  Options *
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === option}
                        onChange={() => setFormData({ ...formData, correctAnswer: option })}
                        className="w-4 h-4"
                        style={{ accentColor: '#533490' }}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                        style={{ border: '1px solid #e0dfd8', background: '#ffffff', color: '#1a1a18' }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: '#9b9b96' }}>Select the correct answer by clicking the radio button</p>
              </div>
            )}

            {/* True/False Options */}
            {formData.questionType === 'TRUE_FALSE' && (
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#6b6b67' }}>
                  Correct Answer *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="trueFalse"
                      value="TRUE"
                      checked={formData.correctAnswer === 'TRUE'}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      required
                      className="w-4 h-4"
                      style={{ accentColor: '#533490' }}
                    />
                    <span className="text-sm" style={{ color: '#1a1a18' }}>True</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="trueFalse"
                      value="FALSE"
                      checked={formData.correctAnswer === 'FALSE'}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      required
                      className="w-4 h-4"
                      style={{ accentColor: '#533490' }}
                    />
                    <span className="text-sm" style={{ color: '#1a1a18' }}>False</span>
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ background: '#533490', color: '#ffffff' }}
            >
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </button>
          </form>
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white rounded-xl" style={{ border: '1px solid #e0dfd8' }}>
          <p className="text-sm" style={{ color: '#6b6b67' }}>No questions added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl p-5" style={{ border: '1px solid #e0dfd8' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0" style={{ background: '#f4f4f0', color: '#6b6b67' }}>
                      Q{index + 1}
                    </span>
                    <p className="text-sm flex-1" style={{ color: '#1a1a18' }}>{question.questionText}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#6b6b67' }}>
                    <span className="px-2 py-1 rounded-full" style={{ background: '#EEEDFE', color: '#533490' }}>
                      {question.questionType.replace('_', ' ')}
                    </span>
                    <span>{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</span>
                  </div>

                  {question.options && (
                    <div className="mt-3 space-y-1">
                      {JSON.parse(question.options).map((option: string, idx: number) => (
                        <div key={idx} className="text-xs flex items-center gap-2" style={{ color: '#6b6b67' }}>
                          <span className={option === question.correctAnswer ? 'font-medium' : ''} style={option === question.correctAnswer ? { color: '#085041' } : {}}>
                            {String.fromCharCode(65 + idx)}. {option}
                            {option === question.correctAnswer && ' ✓'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.questionType === 'TRUE_FALSE' && (
                    <div className="mt-2 text-xs" style={{ color: '#085041' }}>
                      Correct Answer: {question.correctAnswer}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(question)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
                    style={{ background: '#EEEDFE', color: '#533490' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
                    style={{ background: '#FFDDD8', color: '#B91C1C' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
