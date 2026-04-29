'use client';

import { useState, useRef, ChangeEvent } from 'react';

interface QuestionRow {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  marks?: number;
}

interface ValidationError {
  row: number;
  errors: string[];
}

interface BulkQuestionUploadProps {
  examId: string;
  onUploadComplete: () => void;
  onClose: () => void;
}

export default function BulkQuestionUpload({ examId, onUploadComplete, onClose }: BulkQuestionUploadProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = 'Question,Option A,Option B,Option C,Option D,Correct Answer,Marks\n' +
      '"What is 2+2?",2,3,4,5,C,1\n' +
      '"What is the capital of France?",London,Paris,Berlin,Madrid,B,1\n' +
      '"Which planet is known as the Red Planet?",Venus,Mars,Jupiter,Saturn,B,1';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): QuestionRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const questions: QuestionRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      // Parse CSV with proper quote handling
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      if (values.length >= 6) {
        questions.push({
          question: values[0],
          optionA: values[1],
          optionB: values[2],
          optionC: values[3],
          optionD: values[4],
          correctAnswer: values[5],
          marks: values[6] ? parseInt(values[6]) : 1,
        });
      }
    }
    
    return questions;
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedQuestions = parseCSV(text);
        
        if (parsedQuestions.length === 0) {
          setError('No valid questions found in the file');
          return;
        }
        
        setQuestions(parsedQuestions);
        setStep('preview');
        setError('');
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    setLoading(true);
    setError('');
    setValidationErrors([]);

    try {
      const response = await fetch('/api/teacher/bulk-upload-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          questions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors);
          setError(`${data.invalidCount} question(s) have errors. Please fix them and try again.`);
        } else {
          setError(data.error || 'Failed to upload questions');
        }
        return;
      }

      // Success
      setStep('success');
      setTimeout(() => {
        onUploadComplete();
        onClose();
      }, 2000);
    } catch (err) {
      setError('An error occurred while uploading questions');
    } finally {
      setLoading(false);
    }
  };

  const editQuestion = (index: number, field: keyof QuestionRow, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Bulk Upload Questions</h3>
            <p className="text-sm text-gray-600 mt-1">
              {step === 'upload' && 'Upload a CSV file with your questions'}
              {step === 'preview' && `Preview ${questions.length} question(s) before uploading`}
              {step === 'success' && 'Questions uploaded successfully!'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">CSV Format Required</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Download the template to see the correct format. Your CSV must have these columns: Question, Option A, Option B, Option C, Option D, Correct Answer, Marks
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#1F3A68] hover:bg-gray-50 transition-all cursor-pointer"
              >
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Click to upload or drag and drop</h4>
                <p className="text-sm text-gray-600">CSV files only</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-red-800">{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Validation Errors:</h4>
                  <div className="space-y-2">
                    {validationErrors.map((err) => (
                      <div key={err.row} className="text-sm text-red-800">
                        <span className="font-semibold">Row {err.row}:</span> {err.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Question</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Options</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Answer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Marks</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {questions.map((q, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{q.question}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            A: {q.optionA}<br />
                            B: {q.optionB}<br />
                            C: {q.optionC}<br />
                            D: {q.optionD}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">
                              {q.correctAnswer}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{q.marks || 1}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeQuestion(index)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-red-800">{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h3>
              <p className="text-gray-600">{questions.length} questions have been added to the exam.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end flex-shrink-0">
            {step === 'preview' && (
              <button
                onClick={() => setStep('upload')}
                disabled={loading}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {step === 'preview' && (
              <button
                onClick={handleUpload}
                disabled={loading || questions.length === 0}
                className="px-6 py-2 bg-[#1F3A68] hover:bg-[#2A4A7C] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Uploading...' : `Upload ${questions.length} Question(s)`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
