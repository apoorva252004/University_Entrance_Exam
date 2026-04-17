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

  useEffect(() => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#1A1A2E' }}>
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
          className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E2E5ED', color: '#1A1A2E', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#1A1A2E' }}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your.email@example.com"
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E2E5ED', color: '#1A1A2E', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#1A1A2E' }}>
          Phone Number <span style={{ color: '#9DA5B4' }}>(Optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="1234567890"
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E2E5ED', color: '#1A1A2E', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#1A1A2E' }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Minimum 8 characters"
          minLength={8}
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E2E5ED', color: '#1A1A2E', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#1A1A2E' }}>
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
          className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{ border: '1px solid #E2E5ED', color: '#1A1A2E', background: '#FFFFFF' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A2E' }}>
          Select Programs <span style={{ color: '#9DA5B4' }}>(Optional)</span>
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg p-3" style={{ border: '1px solid #E2E5ED', background: '#FFFFFF' }}>
          {schools.map((school) => (
            <div key={school.id} className="rounded-lg overflow-hidden" style={{ border: '1px solid #E2E5ED' }}>
              <button
                type="button"
                onClick={() => setExpandedSchool(expandedSchool === school.id ? null : school.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                style={{ background: '#F5F6FA' }}
              >
                <span className="font-medium text-sm" style={{ color: '#1B2B5E' }}>{school.name}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${expandedSchool === school.id ? "rotate-180" : ""}`}
                  style={{ color: '#C8922A' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedSchool === school.id && (
                <div className="p-2 space-y-1">
                  {school.programs.map((program) => {
                    const isSelected = selectedPrograms.some(
                      (sp) => sp.schoolId === school.id && sp.programId === program.id
                    );
                    return (
                      <label
                        key={program.id}
                        className="flex items-center p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProgram(school, program)}
                          className="h-4 w-4 rounded"
                          style={{ accentColor: '#C8922A' }}
                        />
                        <span className="ml-3 text-sm" style={{ color: '#5A6270' }}>{program.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        {selectedPrograms.length > 0 && (
          <p className="mt-2 text-xs font-medium" style={{ color: '#C8922A' }}>
            {selectedPrograms.length} program(s) selected
          </p>
        )}
      </div>

      {error && (
        <div className="text-sm rounded-lg p-3" style={{ 
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
        className="w-full py-3 px-4 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{
          background: '#1B2B5E',
          boxShadow: '0 1px 2px rgba(27, 43, 94, 0.1)'
        }}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
