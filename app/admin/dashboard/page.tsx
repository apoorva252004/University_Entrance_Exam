'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminSidebar, { AdminTab } from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminKpiCards from '@/components/admin/AdminKpiCards';
import AdminOverview from '@/components/admin/AdminOverview';
import PendingCredentialsTable from '@/components/admin/PendingCredentialsTable';
import ApprovedStudentsTable from '@/components/admin/ApprovedStudentsTable';
import TeacherListTable from '@/components/admin/TeacherListTable';

interface SelectedSchool { schoolName: string; programName: string; }
interface Student {
  id: string; name: string; email: string; phone?: string;
  selectedSchools: SelectedSchool[]; createdAt: string;
}
interface ApprovedStudent {
  id: string; name: string; email: string; phone: string;
  selectedSchools: SelectedSchool[]; createdAt: string;
}
interface Teacher {
  id: string; name: string; email: string; phone: string;
  assignedSchool: string; status: string; createdAt: string;
}

const PAGE_META: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: { title: 'Admin Control Center',    subtitle: 'Manage users, programs, exams, and approvals.' },
  pending:  { title: 'Pending Credentials',     subtitle: 'Assign login credentials to new registrations.' },
  approved: { title: 'Approved Students',       subtitle: 'View all students with active accounts.' },
  teachers: { title: 'Teaching Staff',          subtitle: 'Manage teachers across all schools.' },
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<ApprovedStudent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // For triggering the assign modal from the overview table
  const [pendingTableTrigger, setPendingTableTrigger] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      if (session?.user?.isFirstLogin) { router.push('/change-password'); return; }
      if (session?.user?.role !== 'ADMIN') { router.push('/'); }
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetchStudents();
    fetchApprovedStudents();
    fetchTeachers();
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/students');
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data.students);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/admin/teachers');
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const data = await res.json();
      setTeachers(data.teachers);
    } catch (err) { console.error(err); }
  };

  const fetchApprovedStudents = async () => {
    try {
      const res = await fetch('/api/admin/approved-students');
      if (!res.ok) throw new Error('Failed to fetch approved students');
      const data = await res.json();
      setApprovedStudents(data.students);
    } catch (err) { console.error(err); }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCredentialsAssigned = () => {
    fetchStudents();
    fetchApprovedStudents();
    showToast('Credentials assigned and account activated successfully', 'success');
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #0F2D52', borderTopColor: 'transparent', animation: 'spin 700ms linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 12, fontSize: 14, color: '#6B7280' }}>Loading control center…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#DC2626', marginBottom: 16 }}>{error}</p>
          <button onClick={fetchStudents} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const meta = PAGE_META[activeTab];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <AdminSidebar
        userName={session?.user?.name ?? 'Admin'}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={students.length}
      />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar */}
        <AdminTopBar
          userName={session?.user?.name ?? 'Admin'}
          pendingCount={students.length}
        />

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', paddingBottom: '48px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', fontWeight: 800, color: '#0F2D52', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 6 }}>
                    {meta.title}
                  </h1>
                  <p style={{ fontSize: 14, color: '#6B7280' }}>{meta.subtitle}</p>
                </div>
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', flexShrink: 0, paddingTop: 4 }}>
                  <span>Admin</span>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span style={{ color: '#0F2D52', fontWeight: 600 }}>{meta.title}</span>
                </div>
              </div>
            </div>

            {/* KPI cards — always visible */}
            <div style={{ marginBottom: 28 }}>
              <AdminKpiCards
                totalStudents={approvedStudents.length}
                totalTeachers={teachers.length}
                activeExams={0}
                pendingRequests={students.length}
              />
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <AdminOverview
                pendingStudents={students}
                approvedStudents={approvedStudents}
                teachers={teachers}
                onNavigate={(tab) => setActiveTab(tab)}
                onAssignCredentials={(student) => {
                  setActiveTab('pending');
                  // Small delay so the pending tab renders, then the table handles its own modal
                  setTimeout(() => setPendingTableTrigger(t => t + 1), 100);
                }}
              />
            )}

            {activeTab === 'pending' && (
              <PendingCredentialsTable
                students={students}
                onCredentialsAssigned={handleCredentialsAssigned}
              />
            )}

            {activeTab === 'approved' && (
              <ApprovedStudentsTable students={approvedStudents} />
            )}

            {activeTab === 'teachers' && (
              <TeacherListTable teachers={teachers} />
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 20px',
            borderRadius: 14,
            background: toast.type === 'success' ? '#16A34A' : '#DC2626',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            animation: 'slideDown 250ms ease',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}>
            {toast.type === 'success' ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
