'use client';

import { useState, useCallback } from 'react';

interface Program { id: string; name: string; }
interface Props {
  programs: Program[];
  onSuccess: () => void;
  onError: (message: string) => void;
}

const EMPTY_FORM = {
  title: '', description: '', examDate: '', examTime: '',
  duration: '', totalMarks: '', programId: '', mode: 'OFFLINE', venue: '', instructions: '',
};

// Move Field component outside to prevent recreation on every render
const Field = ({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
      {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs" style={{ color: '#9CA3AF' }}>{hint}</p>}
  </div>
);

export default function CreateExamForm({ programs, onSuccess, onError }: Props) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  // Use useCallback to prevent function recreation on every render
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.examDate || !formData.examTime || !formData.duration || !formData.totalMarks || !formData.programId) {
      onError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const examDateTime = new Date(`${formData.examDate}T${formData.examTime}`).toISOString();
      const res = await fetch('/api/teacher/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          examDate: examDateTime,
          duration: parseInt(formData.duration),
          totalMarks: parseInt(formData.totalMarks),
          programId: formData.programId,
          mode: formData.mode,
          venue: formData.venue || null,
          instructions: formData.instructions || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create exam');
      }
      setFormData(EMPTY_FORM);
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  }, [formData, onSuccess, onError]);

  const handleReset = useCallback(() => {
    setFormData(EMPTY_FORM);
  }, []);

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #EEF2F7', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="px-8 py-5" style={{ borderBottom: '1px solid #EEF2F7', background: '#F8FAFC' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#EAF2FB' }}>
            <svg className="w-5 h-5" style={{ color: '#0F2D52' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: '#0F2D52' }}>New Examination</h3>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Fill in the details to create a new exam</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
        {/* Title */}
        <Field label="Exam Title" required>
          <input type="text" name="title" value={formData.title} onChange={handleChange}
            placeholder="e.g., Mid-Term Examination 2026" className="input-field" required />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea name="description" value={formData.description} onChange={handleChange}
            placeholder="Brief description of the exam" rows={3} className="input-field" style={{ resize: 'vertical' }} />
        </Field>

        {/* Program + Mode row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Program" required>
            <select name="programId" value={formData.programId} onChange={handleChange}
              className="input-field" required>
              <option value="">Select a program</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Exam Mode" required>
            <select name="mode" value={formData.mode} onChange={handleChange} className="input-field" required>
              <option value="OFFLINE">Offline (Physical Venue)</option>
              <option value="ONLINE">Online (Virtual)</option>
            </select>
          </Field>
        </div>

        {/* Date + Time row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Exam Date" required>
            <input type="date" name="examDate" value={formData.examDate} onChange={handleChange}
              className="input-field" required />
          </Field>
          <Field label="Exam Time" required>
            <input type="time" name="examTime" value={formData.examTime} onChange={handleChange}
              className="input-field" required />
          </Field>
        </div>

        {/* Duration + Marks row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Duration" required hint="In minutes">
            <input type="number" name="duration" value={formData.duration} onChange={handleChange}
              placeholder="e.g., 180" min="1" className="input-field" required />
          </Field>
          <Field label="Total Marks" required>
            <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleChange}
              placeholder="e.g., 100" min="1" className="input-field" required />
          </Field>
        </div>

        {/* Venue — offline only */}
        {formData.mode === 'OFFLINE' && (
          <Field label="Venue" hint="Hall, room, or building name">
            <input type="text" name="venue" value={formData.venue} onChange={handleChange}
              placeholder="e.g., Main Auditorium, Block A" className="input-field" />
          </Field>
        )}

        {/* Instructions */}
        <Field label="Instructions">
          <textarea name="instructions" value={formData.instructions} onChange={handleChange}
            placeholder="Special instructions for students (optional)" rows={4}
            className="input-field" style={{ resize: 'vertical' }} />
        </Field>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #EEF2F7' }} />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create Exam
              </>
            )}
          </button>
          <button type="button" onClick={handleReset} className="btn-ghost">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
