'use client';

import { useState } from 'react';

interface Program {
  id: string;
  name: string;
}

interface CreateExamFormProps {
  programs: Program[];
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function CreateExamForm({ programs, onSuccess, onError }: CreateExamFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    examDate: '',
    examTime: '',
    duration: '',
    totalMarks: '',
    programId: '',
    mode: 'OFFLINE',
    venue: '',
    instructions: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.examDate || !formData.examTime || !formData.duration || !formData.totalMarks || !formData.programId) {
      onError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const examDateTime = new Date(`${formData.examDate}T${formData.examTime}`).toISOString();

      const response = await fetch('/api/teacher/exams', {
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create exam');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        examDate: '',
        examTime: '',
        duration: '',
        totalMarks: '',
        programId: '',
        mode: 'OFFLINE',
        venue: '',
        instructions: '',
      });

      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e0dfd8' }}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
            Exam Title <span style={{ color: '#B91C1C' }}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Mid-Term Examination 2026"
            className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the exam"
            rows={3}
            className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
          />
        </div>

        {/* Program */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
            Program <span style={{ color: '#B91C1C' }}>*</span>
          </label>
          <select
            name="programId"
            value={formData.programId}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
            required
          >
            <option value="">Select a program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Mode */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
            Exam Mode <span style={{ color: '#B91C1C' }}>*</span>
          </label>
          <select
            name="mode"
            value={formData.mode}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
            required
          >
            <option value="OFFLINE">Offline (Physical Venue)</option>
            <option value="ONLINE">Online (Virtual)</option>
          </select>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
              Exam Date <span style={{ color: '#B91C1C' }}>*</span>
            </label>
            <input
              type="date"
              name="examDate"
              value={formData.examDate}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
              Exam Time <span style={{ color: '#B91C1C' }}>*</span>
            </label>
            <input
              type="time"
              name="examTime"
              value={formData.examTime}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
              required
            />
          </div>
        </div>

        {/* Duration and Total Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
              Duration (minutes) <span style={{ color: '#B91C1C' }}>*</span>
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 180"
              min="1"
              className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
              Total Marks <span style={{ color: '#B91C1C' }}>*</span>
            </label>
            <input
              type="number"
              name="totalMarks"
              value={formData.totalMarks}
              onChange={handleChange}
              placeholder="e.g., 100"
              min="1"
              className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
              required
            />
          </div>
        </div>

        {/* Venue - Only show for offline exams */}
        {formData.mode === 'OFFLINE' && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
              Venue
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g., Main Auditorium, Block A"
              className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
            />
          </div>
        )}

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a18' }}>
            Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Special instructions for students"
            rows={4}
            className="w-full px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ border: '1px solid #e0dfd8', color: '#1a1a18' }}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ background: '#0F6E56' }}
          >
            {loading ? 'Creating...' : 'Create Exam'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                examDate: '',
                examTime: '',
                duration: '',
                totalMarks: '',
                programId: '',
                mode: 'OFFLINE',
                venue: '',
                instructions: '',
              });
            }}
            className="px-6 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ color: '#6b6b67', border: '1px solid #c8c7c0' }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
