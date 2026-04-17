"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Program {
  id: string;
  name: string;
  schoolId: string;
}

interface School {
  id: string;
  name: string;
  programs: Program[];
}

interface SelectedSchoolProgram {
  schoolId: string;
  schoolName: string;
  programId: string;
  programName: string;
}

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState<SelectedSchoolProgram[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools");
      const data = await response.json();
      if (data.schools) {
        setSchools(data.schools);
      }
    } catch (err) {
      console.error("Failed to fetch schools:", err);
      setError("Failed to load schools. Please refresh the page.");
    }
  };

  const toggleProgram = (school: School, program: Program) => {
    const exists = selectedPrograms.some(
      (sp) => sp.schoolId === school.id && sp.programId === program.id
    );

    if (exists) {
      setSelectedPrograms((prev) =>
        prev.filter((sp) => !(sp.schoolId === school.id && sp.programId === program.id))
      );
    } else {
      setSelectedPrograms((prev) => [
        ...prev,
        {
          schoolId: school.id,
          schoolName: school.name,
          programId: program.id,
          programName: program.name,
        },
      ]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const selectedSchools = selectedPrograms.map((sp) => ({
        schoolName: sp.schoolName,
        programName: sp.programName,
      }));

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || "0000000000",
          selectedSchools,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/login?registered=true");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!mounted && (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#666666', fontSize: '0.875rem' }}>
          Loading form...
        </div>
      )}
      {mounted && (
        <>
      <div>
        <label htmlFor="name" className="block text-xs font-medium mb-1" style={{ color: '#222222' }}>
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="John Doe"
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E5E5E5', color: '#222222', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium mb-1" style={{ color: '#222222' }}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your.email@gmail.com"
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E5E5E5', color: '#222222', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-medium mb-1" style={{ color: '#222222' }}>
          Phone <span style={{ color: '#666666' }}>(Optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="1234567890"
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E5E5E5', color: '#222222', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium mb-1" style={{ color: '#222222' }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Min 8 characters"
          minLength={8}
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E5E5E5', color: '#222222', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-medium mb-1" style={{ color: '#222222' }}>
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Re-enter password"
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E5E5E5', color: '#222222', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: '#222222' }}>
          Schools & Programs <span style={{ color: '#666666' }}>(Optional)</span>
        </label>
        <div className="space-y-1" style={{ border: '1px solid #E5E5E5', background: '#FFFFFF', borderRadius: '0.5rem', padding: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
          {!mounted ? (
            <div style={{ padding: '0.5rem', color: '#666666', fontSize: '0.75rem' }}>Loading schools...</div>
          ) : schools.length === 0 ? (
            <div style={{ padding: '0.5rem', color: '#666666', fontSize: '0.75rem' }}>No schools available</div>
          ) : (
            schools.map((school) => {
              const schoolPrograms = selectedPrograms.filter(sp => sp.schoolId === school.id);
              const allProgramsSelected = school.programs.length > 0 && school.programs.length === schoolPrograms.length;
              const someProgramsSelected = schoolPrograms.length > 0 && schoolPrograms.length < school.programs.length;
              
              return (
                <div key={school.id}>
                  <label
                    className="flex items-center p-1 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={allProgramsSelected}
                      onChange={() => {
                        if (allProgramsSelected) {
                          setSelectedPrograms(prev => prev.filter(sp => sp.schoolId !== school.id));
                        } else {
                          const newPrograms = school.programs.map(program => ({
                            schoolId: school.id,
                            schoolName: school.name,
                            programId: program.id,
                            programName: program.name,
                          }));
                          setSelectedPrograms(prev => [...prev.filter(sp => sp.schoolId !== school.id), ...newPrograms]);
                        }
                      }}
                      disabled={loading}
                      className="h-3 w-3 rounded"
                      style={{ accentColor: '#E5A020' }}
                      ref={(el) => {
                        if (el && mounted) {
                          el.indeterminate = someProgramsSelected;
                        }
                      }}
                    />
                    <span className="ml-2 text-xs font-medium" style={{ color: '#666666' }}>{school.name}</span>
                  </label>
                  
                  <div className="ml-5 space-y-0.5 mt-0.5">
                    {school.programs.map((program) => {
                      const isSelected = selectedPrograms.some(sp => sp.schoolId === school.id && sp.programId === program.id);
                      return (
                        <label
                          key={program.id}
                          className="flex items-center p-0.5 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedPrograms(prev => prev.filter(sp => !(sp.schoolId === school.id && sp.programId === program.id)));
                              } else {
                                setSelectedPrograms(prev => [...prev, {
                                  schoolId: school.id,
                                  schoolName: school.name,
                                  programId: program.id,
                                  programName: program.name,
                                }]);
                              }
                            }}
                            disabled={loading}
                            className="h-3 w-3 rounded"
                            style={{ accentColor: '#E5A020' }}
                          />
                          <span className="ml-2 text-xs" style={{ color: '#666666' }}>{program.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {selectedPrograms.length > 0 && (
          <p className="mt-1 text-xs" style={{ color: '#E5A020' }}>
            {new Set(selectedPrograms.map(sp => sp.schoolId)).size} school(s), {selectedPrograms.length} program(s) selected
          </p>
        )}
      </div>

      {error && (
        <div className="text-xs rounded-lg p-2" style={{ 
          background: '#FEE2E2', 
          border: '1px solid #FCA5A5',
          color: '#991B1B'
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{
          background: '#1A2D5A',
          color: '#FFFFFF',
          fontSize: '0.875rem',
          boxShadow: '0 1px 2px rgba(26, 45, 90, 0.1)'
        }}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
        </>
      )}
    </form>
  );
}
