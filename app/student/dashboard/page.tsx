'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentTopBar from '@/components/student/StudentTopBar';
import StudentStatCards from '@/components/student/StudentStatCards';
import SchoolProgramList from '@/components/student/SchoolProgramList';
import StudentExamList from '@/components/student/StudentExamList';

interface SelectedSchool { schoolName: string; programName: string; }
interface Exam {
  id: string; title: string; description: string | null; examDate: string;
  duration: number; totalMarks: number; status: string; mode: string; venue: string | null;
  program: { id: string; name: string };
  school: { id: string; name: string };
  _count: { questions: number };
  attempts: { id: string; submittedAt: Date | null }[];
}

type TabType = 'dashboard' | 'programs' | 'exams';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [exams, setExams] = useState<Exam[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      if (session?.user?.isFirstLogin) { router.push('/change-password'); return; }
      if (session?.user?.role !== 'STUDENT') { router.push('/'); return; }
      if (session?.user?.status !== 'APPROVED') { router.push('/login'); return; }
      fetchExams();
    }
  }, [status, session, router]);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/student/exams');
      if (res.ok) { const data = await res.json(); setExams(data.exams); }
    } catch (err) { console.error(err); }
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #0F2D52', borderTopColor: 'transparent', animation: 'spin 700ms linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 12, fontSize: 14, color: '#6B7280' }}>Loading your dashboard…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session?.user) return null;

  const selectedSchools: SelectedSchool[] =
    typeof session.user.selectedSchools === 'string'
      ? JSON.parse(session.user.selectedSchools)
      : session.user.selectedSchools || [];

  const completedExams = exams.filter(e => e.attempts?.length > 0).length;
  const upcomingExams = exams.filter(e => !e.attempts?.length);
  const firstName = session.user.name?.split(' ')[0] ?? 'Student';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <StudentSidebar
        userName={session.user.name ?? ''}
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab as TabType); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar */}
        <StudentTopBar
          firstName={firstName}
          userName={session.user.name ?? ''}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', paddingBottom: '48px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

            {/* ── Dashboard overview tab ── */}
            {activeTab === 'dashboard' && (
              <div>
                {/* Welcome banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #0F2D52 0%, #173F73 60%, #0D2645 100%)',
                  borderRadius: '20px',
                  padding: '32px 36px',
                  marginBottom: '28px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Decorative orb */}
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,154,43,0.2), transparent)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: -60, left: '40%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04), transparent)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(199,154,43,0.18)', border: '1px solid rgba(199,154,43,0.3)', marginBottom: 14 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C79A2B' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#C79A2B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Student Portal</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 8, lineHeight: 1.2 }}>
                      Welcome back, {firstName} 👋
                    </h1>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 480 }}>
                      Track your applications, upcoming exams, and academic progress — all in one place.
                    </p>
                  </div>
                </div>

                {/* Stat cards */}
                <StudentStatCards
                  programsCount={selectedSchools.length}
                  examsCount={exams.length}
                  completedCount={completedExams}
                />

                {/* Quick sections */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 28 }}>
                  {/* Recent programs */}
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F2D52' }}>My Programs</h3>
                        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{selectedSchools.length} program{selectedSchools.length !== 1 ? 's' : ''} applied</p>
                      </div>
                      <button onClick={() => setActiveTab('programs')} style={{ fontSize: 12, fontWeight: 600, color: '#C79A2B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
                        View all →
                      </button>
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      {selectedSchools.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No programs applied yet</p>
                      ) : (
                        selectedSchools.slice(0, 3).map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 10, marginBottom: 4 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0F2D52, #173F73)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#C79A2B' }}>{i + 1}</span>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.programName}</p>
                              <p style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.schoolName}</p>
                            </div>
                            <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#FDF6E3', color: '#92400E', border: '1px solid #FDE68A' }}>Applied</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Upcoming exams */}
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F2D52' }}>Upcoming Exams</h3>
                        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{upcomingExams.length} exam{upcomingExams.length !== 1 ? 's' : ''} pending</p>
                      </div>
                      <button onClick={() => setActiveTab('exams')} style={{ fontSize: 12, fontWeight: 600, color: '#C79A2B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
                        View all →
                      </button>
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      {upcomingExams.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No upcoming exams</p>
                      ) : (
                        upcomingExams.slice(0, 3).map((exam) => {
                          const isLive = exam.status === 'ONGOING' || exam.status === 'PUBLISHED';
                          return (
                            <div key={exam.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 10, marginBottom: 4 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: isLive ? '#DCFCE7' : '#EAF2FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="16" height="16" fill="none" stroke={isLive ? '#16A34A' : '#0F2D52'} strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exam.title}</p>
                                <p style={{ fontSize: 11, color: '#9CA3AF' }}>{exam.duration} min · {exam.totalMarks} marks</p>
                              </div>
                              {isLive && (
                                <button
                                  onClick={() => router.push(`/student/exam/${exam.id}`)}
                                  style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 100, background: '#0F2D52', color: '#fff', border: 'none', cursor: 'pointer' }}
                                >
                                  Start
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Programs tab ── */}
            {activeTab === 'programs' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F2D52', letterSpacing: '-0.3px' }}>My Programs</h2>
                  <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Programs you have applied to across RV University schools</p>
                </div>
                <SchoolProgramList selectedSchools={selectedSchools} />
              </div>
            )}

            {/* ── Exams tab ── */}
            {activeTab === 'exams' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F2D52', letterSpacing: '-0.3px' }}>My Exams</h2>
                  <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>View and attempt your scheduled examinations</p>
                </div>
                <StudentExamList exams={exams} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
