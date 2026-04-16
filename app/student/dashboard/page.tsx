'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SchoolProgramList from '@/components/student/SchoolProgramList';

interface SelectedSchool {
  schoolName: string;
  programName: string;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'STUDENT') {
        router.push('/');
      } else if (session?.user?.status !== 'APPROVED') {
        router.push('/login');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Parse selectedSchools from session
  const selectedSchools: SelectedSchool[] = 
    typeof session.user.selectedSchools === 'string'
      ? JSON.parse(session.user.selectedSchools)
      : session.user.selectedSchools || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Student Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 font-medium">
                    Welcome, <span className="text-green-600">{session.user.name}</span>!
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                  <svg
                    className="mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Application Approved
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Selected Programs</h2>
          <p className="text-gray-600 text-lg">
            You have registered for entrance examinations in the following schools and programs.
          </p>
        </div>

        <SchoolProgramList selectedSchools={selectedSchools} />

        <div className="mt-10 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Next Steps</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start group">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                1
              </span>
              <span className="ml-4 text-gray-700 text-lg group-hover:text-gray-900 transition-colors">
                Check your email regularly for exam schedule notifications
              </span>
            </li>
            <li className="flex items-start group">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                2
              </span>
              <span className="ml-4 text-gray-700 text-lg group-hover:text-gray-900 transition-colors">
                Prepare all required documents (ID proof, certificates, etc.)
              </span>
            </li>
            <li className="flex items-start group">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                3
              </span>
              <span className="ml-4 text-gray-700 text-lg group-hover:text-gray-900 transition-colors">
                Review the syllabus and exam pattern for your selected programs
              </span>
            </li>
            <li className="flex items-start group">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                4
              </span>
              <span className="ml-4 text-gray-700 text-lg group-hover:text-gray-900 transition-colors">
                Keep your contact information up to date
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
