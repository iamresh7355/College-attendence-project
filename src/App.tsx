/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RollCallView } from './components/RollCallView';
import { DefaultersView } from './components/DefaultersView';
import { TimetableScheduleView } from './components/TimetableScheduleView';
import { StudentPortalView } from './components/StudentPortalView';
import { ReportsView } from './components/ReportsView';
import { ManageStudentsSubjectsModal } from './components/ManageStudentsSubjectsModal';
import { 
  loadInitialData, 
  saveStudents, 
  saveSubjects, 
  saveSessions, 
  saveTimetable, 
  resetToDemoData 
} from './utils/storage';
import { Background3D } from './components/Background3D';
import { Student, Subject, ClassSession, TimetableSlot } from './types/attendance';
import { calculateStudentSummaries } from './utils/calculator';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<{
    students: Student[];
    subjects: Subject[];
    timetable: TimetableSlot[];
    sessions: ClassSession[];
  }>(() => loadInitialData());

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'rollcall' | 'defaulters' | 'timetable' | 'student-portal' | 'reports'
  >('dashboard');

  const [preselectedSubjectId, setPreselectedSubjectId] = useState<string | undefined>();
  const [preselectedTimeSlot, setPreselectedTimeSlot] = useState<string | undefined>();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate defaulter count (<75%)
  const defaulterCount = useMemo(() => {
    const summaries = calculateStudentSummaries(data.students, data.subjects, data.sessions);
    return summaries.filter(s => s.percentage < 75).length;
  }, [data.students, data.subjects, data.sessions]);

  // Handlers
  const handleSaveSession = (newSession: ClassSession) => {
    const existingIndex = data.sessions.findIndex(s => s.id === newSession.id);
    let updatedSessions: ClassSession[];

    if (existingIndex >= 0) {
      updatedSessions = [...data.sessions];
      updatedSessions[existingIndex] = newSession;
    } else {
      updatedSessions = [newSession, ...data.sessions];
    }

    setData(prev => ({ ...prev, sessions: updatedSessions }));
    saveSessions(updatedSessions);
    showToast('Attendance recorded successfully in official register!');
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = data.sessions.filter(s => s.id !== sessionId);
    setData(prev => ({ ...prev, sessions: updated }));
    saveSessions(updated);
    showToast('Attendance session removed.');
  };

  const handleUpdateStudents = (updatedStudents: Student[]) => {
    setData(prev => ({ ...prev, students: updatedStudents }));
    saveStudents(updatedStudents);
    showToast('Student roster updated.');
  };

  const handleUpdateSubjects = (updatedSubjects: Subject[]) => {
    setData(prev => ({ ...prev, subjects: updatedSubjects }));
    saveSubjects(updatedSubjects);
    showToast('Curriculum subjects updated.');
  };

  const handleUpdateTimetable = (updatedTimetable: TimetableSlot[]) => {
    setData(prev => ({ ...prev, timetable: updatedTimetable }));
    saveTimetable(updatedTimetable);
    showToast('Weekly timetable updated.');
  };

  const handleResetData = () => {
    if (confirm('Reset to standard demo data? (This will restore 30 CSE Semester 3 students, 6 subjects, timetable, and 22 class sessions)')) {
      const reset = resetToDemoData();
      setData(reset);
      showToast('Restored full Semester 3 demo data successfully.');
    }
  };

  const handleNavigateTab = (
    tab: 'dashboard' | 'rollcall' | 'defaulters' | 'timetable' | 'student-portal' | 'reports',
    extra?: { subjectId?: string; timeSlot?: string }
  ) => {
    if (extra?.subjectId) setPreselectedSubjectId(extra.subjectId);
    if (extra?.timeSlot) setPreselectedTimeSlot(extra.timeSlot);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen modern-mesh-bg subtle-grid text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white">
      {/* 3D Interactive Three.js Background */}
      <Background3D />

      {/* Ambient background glow orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-1/4 w-[350px] h-[350px] bg-violet-600/8 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-indigo-400 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenManageModal={() => setIsManageModalOpen(true)}
        onResetData={handleResetData}
        defaulterCount={defaulterCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardView
            students={data.students}
            subjects={data.subjects}
            sessions={data.sessions}
            timetable={data.timetable}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'rollcall' && (
          <RollCallView
            students={data.students}
            subjects={data.subjects}
            sessions={data.sessions}
            onSaveSession={handleSaveSession}
            preselectedSubjectId={preselectedSubjectId}
            preselectedTimeSlot={preselectedTimeSlot}
          />
        )}

        {activeTab === 'defaulters' && (
          <DefaultersView
            students={data.students}
            subjects={data.subjects}
            sessions={data.sessions}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableScheduleView
            timetable={data.timetable}
            subjects={data.subjects}
            onTakeAttendanceForSlot={(subId, time) => {
              handleNavigateTab('rollcall', { subjectId: subId, timeSlot: time });
            }}
            onUpdateTimetable={handleUpdateTimetable}
          />
        )}

        {activeTab === 'student-portal' && (
          <StudentPortalView
            students={data.students}
            subjects={data.subjects}
            sessions={data.sessions}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            students={data.students}
            subjects={data.subjects}
            sessions={data.sessions}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </main>

      {/* Footer with Creator Credit */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md py-6 text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">AttendSphere ERP</span>
            <span>•</span>
            <span>College Attendance & Academic Compliance</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
            <span className="text-slate-400">Designed & Created by</span>
            <span className="font-bold text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text">
              Amresh Chaubey
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>UGC & AICTE 75% Criteria Compliant</span>
            <span>•</span>
            <span className="text-indigo-400 font-medium">B.Tech Semester 3 (Sec A)</span>
          </div>
        </div>
      </footer>

      {/* Roster & Curriculum Management Modal */}
      <ManageStudentsSubjectsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        students={data.students}
        subjects={data.subjects}
        onUpdateStudents={handleUpdateStudents}
        onUpdateSubjects={handleUpdateSubjects}
      />
    </div>
  );
}
