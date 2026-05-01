'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Program { id: string; name: string; schoolId: string; }
interface School { id: string; name: string; programs: Program[]; }
interface SelectedSchoolPrograms { [schoolId: string]: string[]; }

/* ── shared input style ── */
const inputBase: React.CSSProperties = {
  width: '100%',
  height: 52,
  padding: '0 16px',
  borderRadius: 14,
  border: '1.5px solid #E5E7EB',
  background: '#F9FAFB',
  fontSize: 14,
  color: '#111827',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
};

function Input({
  label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
        {label}{required && <span style={{ color: '#DC2626', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

function TextInput({
  type = 'text', value, onChange, placeholder, disabled, icon,
}: {
  type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; icon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? '#0F2D52' : '#9CA3AF', pointerEvents: 'none', transition: 'color 180ms ease' }}>
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={e => { setFocused(true); e.target.style.borderColor = '#0F2D52'; e.target.style.boxShadow = '0 0 0 3px rgba(15,45,82,0.09)'; e.target.style.background = '#fff'; }}
        onBlur={e => { setFocused(false); e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9FAFB'; }}
        style={{ ...inputBase, paddingLeft: icon ? 42 : 16 }}
      />
    </div>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSchoolPrograms, setSelectedSchoolPrograms] = useState<SelectedSchoolPrograms>({});
  const [schools, setSchools] = useState<School[]>([]);
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());
  const [selectorSearch, setSelectorSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string } | null>(null);

  useEffect(() => { fetchSchools(); }, []);

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/schools');
      const data = await res.json();
      if (data.schools) setSchools(data.schools);
    } catch { setError('Failed to load schools. Please refresh the page.'); }
  };

  const toggleSchool = (id: string) => {
    setExpandedSchools(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleProgram = (schoolId: string, programId: string) => {
    setSelectedSchoolPrograms(prev => {
      const next = { ...prev };
      if (!next[schoolId]) {
        next[schoolId] = [programId];
      } else if (next[schoolId].includes(programId)) {
        next[schoolId] = next[schoolId].filter(id => id !== programId);
        if (next[schoolId].length === 0) delete next[schoolId];
      } else {
        next[schoolId] = [...next[schoolId], programId];
      }
      return next;
    });
  };

  const removeProgram = (schoolId: string, programId: string) => {
    setSelectedSchoolPrograms(prev => {
      const next = { ...prev };
      next[schoolId] = (next[schoolId] || []).filter(id => id !== programId);
      if (next[schoolId].length === 0) delete next[schoolId];
      return next;
    });
  };

  const selectedCount = Object.values(selectedSchoolPrograms).reduce((t, p) => t + p.length, 0);

  /* Build flat list of selected pills */
  const selectedPills: { schoolId: string; schoolName: string; programId: string; programName: string }[] = [];
  Object.entries(selectedSchoolPrograms).forEach(([schoolId, programIds]) => {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;
    programIds.forEach(pid => {
      const prog = school.programs.find(p => p.id === pid);
      if (prog) selectedPills.push({ schoolId, schoolName: school.name, programId: pid, programName: prog.name });
    });
  });

  /* Filtered schools for accordion */
  const filteredSchools = schools.filter(school => {
    const q = selectorSearch.toLowerCase();
    if (!q) return true;
    return school.name.toLowerCase().includes(q) || school.programs.some(p => p.name.toLowerCase().includes(q));
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim()) { setError('Please enter your full name'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (selectedCount === 0) { setError('Please select at least one program'); return; }
    setLoading(true);
    try {
      const selectedSchools = Object.entries(selectedSchoolPrograms).map(([schoolId, programIds]) => ({ schoolId, programIds }));
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${firstName.trim()} ${lastName.trim()}`, email, phone, selectedSchools }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedCredentials({ username: data.username, password: data.password });
        setShowCredentialsModal(true);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch { setError('An error occurred during registration'); }
    finally { setLoading(false); }
  };

  const EyeBtn = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle}
      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', transition: 'color 150ms ease' }}
      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#0F2D52'}
      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF'}
    >
      {show ? (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* Row 1: First + Last name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input label="First Name" required>
            <TextInput value={firstName} onChange={setFirstName} placeholder="First name" disabled={loading}
              icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
          </Input>
          <Input label="Last Name" required>
            <TextInput value={lastName} onChange={setLastName} placeholder="Last name" disabled={loading} />
          </Input>
        </div>

        {/* Row 2: Email */}
        <Input label="Email Address" required>
          <TextInput type="email" value={email} onChange={setEmail} placeholder="your.email@example.com" disabled={loading}
            icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          />
        </Input>

        {/* Row 3: Phone */}
        <Input label="Phone Number" hint="Optional — used for credential delivery">
          <TextInput type="tel" value={phone} onChange={setPhone} placeholder="+91 98765 43210" disabled={loading}
            icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
          />
        </Input>

        {/* Row 4: Password + Confirm */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input label="Password" required hint="Min 8 characters">
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create password"
                disabled={loading}
                onFocus={e => { e.target.style.borderColor = '#0F2D52'; e.target.style.boxShadow = '0 0 0 3px rgba(15,45,82,0.09)'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9FAFB'; }}
                style={{ ...inputBase, paddingRight: 42 }}
              />
              <EyeBtn show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
            </div>
          </Input>
          <Input label="Confirm Password" required>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                disabled={loading}
                onFocus={e => { e.target.style.borderColor = '#0F2D52'; e.target.style.boxShadow = '0 0 0 3px rgba(15,45,82,0.09)'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9FAFB'; }}
                style={{ ...inputBase, paddingRight: 42 }}
              />
              <EyeBtn show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
            </div>
          </Input>
        </div>

        {/* Row 5: Schools & Programs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <label style={{ fontSize: 13.5, fontWeight: 600, color: '#374151' }}>
              Schools & Programs <span style={{ color: '#DC2626' }}>*</span>
            </label>
            {selectedCount > 0 && (
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#EAF2FB', color: '#0F2D52', border: '1px solid #BFDBFE' }}>
                {selectedCount} selected
              </span>
            )}
          </div>

          {/* Selected pills */}
          {selectedPills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
              {selectedPills.map(pill => (
                <div key={pill.programId} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px 5px 12px', borderRadius: 100, background: 'linear-gradient(135deg, #0F2D52, #173F73)', color: '#fff', fontSize: 12, fontWeight: 600 }}>
                  <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pill.programName}</span>
                  <button type="button" onClick={() => removeProgram(pill.schoolId, pill.programId)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0, flexShrink: 0 }}>
                    <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search schools or programs…"
              value={selectorSearch}
              onChange={e => setSelectorSearch(e.target.value)}
              style={{ ...inputBase, height: 42, paddingLeft: 36, fontSize: 13 }}
              onFocus={e => { e.target.style.borderColor = '#0F2D52'; e.target.style.boxShadow = '0 0 0 3px rgba(15,45,82,0.09)'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9FAFB'; }}
            />
          </div>

          {/* Accordion */}
          <div style={{ borderRadius: 14, border: '1.5px solid #E5E7EB', overflow: 'hidden', maxHeight: 300, overflowY: 'auto' }}>
            {filteredSchools.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>No schools match your search</div>
            ) : (
              filteredSchools.map((school, idx) => {
                const isExpanded = expandedSchools.has(school.id);
                const selectedPrograms = selectedSchoolPrograms[school.id] || [];
                const hasSelection = selectedPrograms.length > 0;
                const filteredPrograms = selectorSearch
                  ? school.programs.filter(p => p.name.toLowerCase().includes(selectorSearch.toLowerCase()) || school.name.toLowerCase().includes(selectorSearch.toLowerCase()))
                  : school.programs;

                return (
                  <div key={school.id} style={{ borderBottom: idx < filteredSchools.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    {/* School row */}
                    <button
                      type="button"
                      onClick={() => toggleSchool(school.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '13px 16px',
                        background: hasSelection ? '#F0F7FF' : '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={e => { if (!hasSelection) (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { if (!hasSelection) (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                    >
                      {/* Checkbox indicator */}
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${hasSelection ? '#0F2D52' : '#D1D5DB'}`, background: hasSelection ? '#0F2D52' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms ease' }}>
                        {hasSelection && (
                          <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F2D52', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{school.name}</div>
                        {hasSelection && (
                          <div style={{ fontSize: 11.5, color: '#2563EB', marginTop: 1 }}>
                            {selectedPrograms.length} program{selectedPrograms.length > 1 ? 's' : ''} selected
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{school.programs.length} programs</span>
                        <svg
                          width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Programs list */}
                    {isExpanded && filteredPrograms.length > 0 && (
                      <div style={{ background: '#F8FAFC', padding: '8px 16px 12px', borderTop: '1px solid #F3F4F6' }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingTop: 4 }}>
                          Available Programs
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {filteredPrograms.map(program => {
                            const isSelected = selectedPrograms.includes(program.id);
                            return (
                              <label
                                key={program.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  padding: '9px 12px',
                                  borderRadius: 10,
                                  cursor: 'pointer',
                                  background: isSelected ? '#EAF2FB' : '#fff',
                                  border: `1px solid ${isSelected ? '#BFDBFE' : '#F3F4F6'}`,
                                  transition: 'all 150ms ease',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleProgram(school.id, program.id)}
                                  style={{ width: 15, height: 15, accentColor: '#0F2D52', flexShrink: 0, cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? '#0F2D52' : '#374151' }}>
                                  {program.name}
                                </span>
                                {isSelected && (
                                  <svg style={{ marginLeft: 'auto', flexShrink: 0, color: '#0F2D52' }} width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 6 }}>
            Expand a school to select programs. You can apply to multiple programs across schools.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <svg style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} width="15" height="15" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#991B1B', lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 14,
            border: 'none',
            background: loading ? '#6B7280' : 'linear-gradient(135deg, #0F2D52 0%, #173F73 100%)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            letterSpacing: '0.01em',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(15,45,82,0.35)',
            transition: 'all 200ms ease',
            fontFamily: 'inherit',
            marginTop: 4,
          }}
          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(15,45,82,0.42)'; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? 'none' : '0 4px 14px rgba(15,45,82,0.35)'; }}
        >
          {loading ? (
            <>
              <svg style={{ animation: 'spin 700ms linear infinite' }} width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating Account…
            </>
          ) : (
            <>
              Create Account
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* ── Credentials Modal ── */}
      {showCredentialsModal && generatedCredentials && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16, animation: 'fadeIn 200ms ease' }}>
          <div style={{ background: '#fff', borderRadius: 22, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', width: '100%', maxWidth: 480, overflow: 'hidden', animation: 'slideUp 250ms ease', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #EEF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" fill="none" stroke="#16A34A" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F2D52', marginBottom: 3 }}>Registration Successful!</h3>
                  <p style={{ fontSize: 12.5, color: '#6B7280' }}>Your application has been submitted for review</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Warning */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 12, background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <svg style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} width="15" height="15" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', lineHeight: 1.5 }}>
                  Save these credentials now — they will not be shown again.
                </p>
              </div>

              {/* Credentials */}
              {[
                { label: 'Username', value: generatedCredentials.username, testId: 'generated-username' },
                { label: 'Password', value: generatedCredentials.password, testId: 'generated-password' },
              ].map(({ label, value, testId }) => (
                <div key={label}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="text"
                      value={value}
                      readOnly
                      data-testid={testId}
                      style={{ flex: 1, height: 44, padding: '0 14px', borderRadius: 11, border: '1.5px solid #E5E7EB', background: '#F8FAFC', fontSize: 14, fontFamily: 'monospace', color: '#111827', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(value)}
                      style={{ height: 44, padding: '0 16px', borderRadius: 11, border: '1.5px solid #E5E7EB', background: '#fff', fontSize: 13, fontWeight: 600, color: '#0F2D52', cursor: 'pointer', transition: 'all 150ms ease', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EAF2FB'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0F2D52'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 28px 24px' }}>
              <button
                type="button"
                onClick={() => { setShowCredentialsModal(false); router.push('/login'); }}
                style={{ width: '100%', height: 50, borderRadius: 13, border: 'none', background: 'linear-gradient(135deg, #0F2D52, #173F73)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(15,45,82,0.30)', transition: 'all 200ms ease', fontFamily: 'inherit' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(15,45,82,0.40)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(15,45,82,0.30)'; }}
              >
                Continue to Login
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: #C4C9D4; }
      `}</style>
    </>
  );
}
