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

interface SelectedSchoolPrograms {
  [schoolId: string]: string[]; // schoolId -> array of programIds
}

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSchoolPrograms, setSelectedSchoolPrograms] = useState<SelectedSchoolPrograms>({});
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

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

  const toggleSchool = (schoolId: string) => {
    setExpandedSchools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(schoolId)) {
        newSet.delete(schoolId);
      } else {
        newSet.add(schoolId);
      }
      return newSet;
    });
  };

  const toggleProgram = (schoolId: string, programId: string) => {
    setSelectedSchoolPrograms((prev) => {
      const newSelection = { ...prev };
      
      if (!newSelection[schoolId]) {
        // First program for this school
        newSelection[schoolId] = [programId];
      } else if (newSelection[schoolId].includes(programId)) {
        // Remove program
        newSelection[schoolId] = newSelection[schoolId].filter(id => id !== programId);
        // Remove school if no programs selected
        if (newSelection[schoolId].length === 0) {
          delete newSelection[schoolId];
        }
      } else {
        // Add program
        newSelection[schoolId] = [...newSelection[schoolId], programId];
      }
      
      return newSelection;
    });
  };

  const getSelectedCount = () => {
    return Object.values(selectedSchoolPrograms).reduce((total, programs) => total + programs.length, 0);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (getSelectedCount() === 0) {
      setError("Please select at least one program");
      return;
    }

    setLoading(true);

    try {
      // Transform selectedSchoolPrograms to the format expected by the API
      const selectedSchools = Object.entries(selectedSchoolPrograms).map(([schoolId, programIds]) => ({
        schoolId,
        programIds,
      }));

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          selectedSchools,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show credentials modal with generated username and password
        setGeneratedCredentials({
          username: data.username,
          password: data.password,
        });
        setShowCredentialsModal(true);
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
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter your full name"
          disabled={loading}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#1F3A68] focus:ring-4 focus:ring-[#1F3A68]/10 disabled:bg-gray-100 transition-all duration-200"
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#1F3A68] focus:ring-4 focus:ring-[#1F3A68]/10 disabled:bg-gray-100 transition-all duration-200"
        />
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
          Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          disabled={loading}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#1F3A68] focus:ring-4 focus:ring-[#1F3A68]/10 disabled:bg-gray-100 transition-all duration-200"
        />
        <p className="mt-1 text-xs text-gray-600">
          Admin will create your login credentials after review
        </p>
      </div>

      {/* School & Program Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Select Schools & Programs <span className="text-red-600">*</span>
        </label>
        <div className="text-xs text-gray-600 mb-3">
          {getSelectedCount() === 0 
            ? "Choose at least one program to apply" 
            : `${getSelectedCount()} program(s) selected`}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg bg-white">
          {schools.map((school) => {
            const isExpanded = expandedSchools.has(school.id);
            const selectedPrograms = selectedSchoolPrograms[school.id] || [];
            const hasSelection = selectedPrograms.length > 0;

            return (
              <div key={school.id} className="border-b border-gray-100 last:border-b-0">
                {/* School Header */}
                <button
                  type="button"
                  onClick={() => toggleSchool(school.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 text-left"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      hasSelection 
                        ? 'bg-[#1F3A68] border-[#1F3A68]' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {hasSelection && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{school.name}</div>
                      {hasSelection && (
                        <div className="text-xs text-[#1F3A68] mt-0.5">
                          {selectedPrograms.length} program{selectedPrograms.length > 1 ? 's' : ''} selected
                        </div>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Programs List */}
                {isExpanded && (
                  <div className="bg-gray-50 px-4 pb-3">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 pt-2">
                      Available Programs
                    </div>
                    <div className="space-y-2">
                      {school.programs.map((program) => {
                        const isSelected = selectedPrograms.includes(program.id);
                        
                        return (
                          <label
                            key={program.id}
                            className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition-colors duration-150"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProgram(school.id, program.id)}
                              className="h-4 w-4 text-[#1F3A68] focus:ring-[#1F3A68] border-gray-300 rounded"
                            />
                            <span className="ml-3 text-sm text-gray-900">{program.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-600">
          Click on a school to view and select programs. You can apply to multiple programs across different schools.
        </p>
      </div>

      {/* Error Message */}
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1F3A68] hover:bg-[#2A4A7C] active:bg-[#152A4A] text-white font-semibold py-3.5 px-6 rounded-lg text-base transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 shadow-sm hover:shadow-md mt-6"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Credentials Modal */}
      {showCredentialsModal && generatedCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Registration Successful!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Your login credentials have been generated. Please save them securely.
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-yellow-800">
                  Save these credentials now! They will not be shown again.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Username
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedCredentials.username}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                    data-testid="generated-username"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCredentials.username);
                    }}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedCredentials.password}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                    data-testid="generated-password"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCredentials.password);
                    }}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCredentialsModal(false);
                router.push("/login");
              }}
              className="w-full bg-[#1F3A68] hover:bg-[#2A4A7C] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
