'use client';

import { useState, useRef, ChangeEvent } from 'react';

interface QuestionRow {
  question: string; optionA: string; optionB: string;
  optionC: string; optionD: string; correctAnswer: string; marks?: number;
}
interface ValidationError { row: number; errors: string[]; }
interface Props { examId: string; onUploadComplete: () => void; onClose: () => void; }

export default function BulkQuestionUpload({ examId, onUploadComplete, onClose }: Props) {
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csv = 'Question,Option A,Option B,Option C,Option D,Correct Answer,Marks\n' +
      '"What is 2+2?",2,3,4,5,C,1\n' +
      '"Capital of France?",London,Paris,Berlin,Madrid,B,1';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'question_template.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): QuestionRow[] => {
    const lines = text.split('\n').filter(l => l.trim());
    const result: QuestionRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let cur = ''; let inQ = false;
      for (const ch of lines[i]) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
        else { cur += ch; }
      }
      values.push(cur.trim());
      if (values.length >= 6) {
        result.push({ question: values[0], optionA: values[1], optionB: values[2], optionC: values[3], optionD: values[4], correctAnswer: values[5], marks: values[6] ? parseInt(values[6]) : 1 });
      }
    }
    return result;
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseCSV(e.target?.result as string);
        if (parsed.length === 0) { setError('No valid questions found in the file'); return; }
        setQuestions(parsed); setStep('preview'); setError('');
      } catch { setError('Failed to parse CSV file. Please check the format.'); }
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) processFile(file);
    else setError('Please upload a CSV file');
  };

  const handleUpload = async () => {
    setLoading(true); setError(''); setValidationErrors([]);
    try {
      const res = await fetch('/api/teacher/bulk-upload-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.validationErrors) { setValidationErrors(data.validationErrors); setError(`${data.invalidCount} question(s) have errors.`); }
        else setError(data.error || 'Failed to upload questions');
        return;
      }
      setStep('success');
      setTimeout(() => { onUploadComplete(); onClose(); }, 2000);
    } catch { setError('An error occurred while uploading questions'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col"
        style={{ width: '100%', maxWidth: '860px', maxHeight: '90vh', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>
        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid #EEF2F7', background: '#F8FAFC' }}>
          <div>
            <h3 className="font-bold text-lg" style={{ color: '#0F2D52' }}>Bulk Upload Questions</h3>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              {step === 'upload' && 'Upload a CSV file with your questions'}
              {step === 'preview' && `Review ${questions.length} question(s) before uploading`}
              {step === 'success' && 'Questions uploaded successfully!'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#F3F4F6', color: '#6B7280' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-7">
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Template info */}
              <div className="flex items-start gap-4 p-5 rounded-xl"
                style={{ background: '#DBEAFE', border: '1px solid #93C5FD' }}>
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2563EB' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#1E40AF' }}>CSV Format Required</p>
                  <p className="text-xs mb-3" style={{ color: '#1D4ED8' }}>
                    Columns: Question, Option A, Option B, Option C, Option D, Correct Answer (A/B/C/D), Marks
                  </p>
                  <button onClick={downloadTemplate} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Template
                  </button>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center py-16 rounded-2xl cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragOver ? '#0F2D52' : '#D1D5DB'}`,
                  background: dragOver ? '#EAF2FB' : '#F8FAFC',
                }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: dragOver ? '#0F2D52' : '#EAF2FB' }}>
                  <svg className="w-8 h-8" style={{ color: dragOver ? '#fff' : '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-base font-semibold mb-1" style={{ color: '#0F2D52' }}>
                  Click to upload or drag & drop
                </p>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>CSV files only</p>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl text-sm"
                  style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {validationErrors.length > 0 && (
                <div className="p-4 rounded-xl" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#991B1B' }}>Validation Errors</p>
                  {validationErrors.map(e => (
                    <p key={e.row} className="text-xs" style={{ color: '#DC2626' }}>
                      <strong>Row {e.row}:</strong> {e.errors.join(', ')}
                    </p>
                  ))}
                </div>
              )}

              <div className="table-container">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="table-header">
                      <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th>Options</th>
                        <th>Answer</th>
                        <th>Marks</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q, i) => (
                        <tr key={i} className="table-row">
                          <td className="table-cell">
                            <span className="badge badge-navy">{i + 1}</span>
                          </td>
                          <td className="table-cell" style={{ maxWidth: '240px' }}>
                            <p className="text-sm truncate" style={{ color: '#111827' }}>{q.question}</p>
                          </td>
                          <td className="table-cell">
                            <div className="text-xs space-y-0.5" style={{ color: '#6B7280' }}>
                              <div>A: {q.optionA}</div>
                              <div>B: {q.optionB}</div>
                              <div>C: {q.optionC}</div>
                              <div>D: {q.optionD}</div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="badge badge-success">{q.correctAnswer}</span>
                          </td>
                          <td className="table-cell">
                            <span className="text-sm" style={{ color: '#374151' }}>{q.marks ?? 1}</span>
                          </td>
                          <td className="table-cell" style={{ textAlign: 'right' }}>
                            <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                              className="btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
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
                <div className="flex items-center gap-3 p-4 rounded-xl text-sm"
                  style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                style={{ background: '#DCFCE7' }}>
                <svg className="w-10 h-10" style={{ color: '#16A34A' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#0F2D52' }}>Upload Successful!</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {questions.length} question{questions.length !== 1 ? 's' : ''} added to the exam.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="px-7 py-5 flex gap-3 justify-end flex-shrink-0"
            style={{ borderTop: '1px solid #EEF2F7' }}>
            {step === 'preview' && (
              <button onClick={() => setStep('upload')} disabled={loading} className="btn-ghost">
                Back
              </button>
            )}
            <button onClick={onClose} disabled={loading} className="btn-ghost">Cancel</button>
            {step === 'preview' && (
              <button onClick={handleUpload} disabled={loading || questions.length === 0} className="btn-primary">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading…
                  </>
                ) : `Upload ${questions.length} Question${questions.length !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
