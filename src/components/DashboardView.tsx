import React, { useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  CalendarDays, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Sparkles,
  ChevronRight,
  ClipboardCheck,
  ShieldAlert
} from 'lucide-react';
import { Student, Subject, ClassSession, TimetableSlot } from '../types/attendance';
import { calculateStudentSummaries } from '../utils/calculator';

interface DashboardViewProps {
  students: Student[];
  subjects: Subject[];
  sessions: ClassSession[];
  timetable: TimetableSlot[];
  onNavigateTab: (tab: 'dashboard' | 'rollcall' | 'defaulters' | 'timetable' | 'student-portal' | 'reports', extra?: { subjectId?: string; timeSlot?: string }) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  subjects,
  sessions,
  timetable,
  onNavigateTab,
}) => {
  // Summaries
  const summaries = useMemo(() => {
    return calculateStudentSummaries(students, subjects, sessions);
  }, [students, subjects, sessions]);

  // Overall attendance calculation
  const overallMetrics = useMemo(() => {
    if (summaries.length === 0) return { avg: 0, defaulters: 0, severeDefaulters: 0, safe: 0 };
    
    let totalPct = 0;
    let defaulters = 0;
    let severeDefaulters = 0;

    summaries.forEach(s => {
      totalPct += s.percentage;
      if (s.isSevereDefaulter) severeDefaulters++;
      else if (s.isDefaulter) defaulters++;
    });

    const avg = Math.round((totalPct / summaries.length) * 10) / 10;
    const totalDefaulters = defaulters + severeDefaulters;
    const safe = summaries.length - totalDefaulters;

    return { avg, defaulters: totalDefaulters, severeDefaulters, safe };
  }, [summaries]);

  // Subject-wise stats
  const subjectStats = useMemo(() => {
    return subjects.map(sub => {
      let subTotalSessions = 0;
      let totalStudentAttendances = 0;
      let totalPossibleAttendances = 0;

      sessions.forEach(sess => {
        if (sess.subjectId === sub.id) {
          subTotalSessions++;
          sess.records.forEach(r => {
            totalPossibleAttendances++;
            if (r.status === 'present' || r.status === 'late' || r.status === 'excused') {
              totalStudentAttendances++;
            }
          });
        }
      });

      const avgPercentage = totalPossibleAttendances > 0 
        ? Math.round((totalStudentAttendances / totalPossibleAttendances) * 1000) / 10
        : 100;

      return {
        subject: sub,
        sessionsCount: subTotalSessions,
        avgPercentage,
      };
    });
  }, [subjects, sessions]);

  // Today's classes from Timetable
  const todaysClasses = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
    const todayName = dayNames[new Date().getDay()];
    const todayStr = new Date().toISOString().split('T')[0];

    const slots = timetable.filter(t => t.day === todayName);
    
    return slots.map(slot => {
      const sub = subjects.find(s => s.id === slot.subjectId);
      const sessionToday = sessions.find(
        s => s.subjectId === slot.subjectId && s.date === todayStr && s.timeSlot === slot.time
      );

      return {
        slot,
        subject: sub,
        sessionToday,
        isMarked: !!sessionToday,
      };
    });
  }, [timetable, subjects, sessions]);

  // Recent 4 Defaulters
  const topDefaulters = useMemo(() => {
    return [...summaries]
      .filter(s => s.isDefaulter)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5);
  }, [summaries]);

  // Top Achievers (>90%)
  const topAchievers = useMemo(() => {
    return [...summaries]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [summaries]);

  return (
    <div className="space-y-6">
      {/* College Department Header & Quick Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Department of Computer Science & Engineering
            </span>
            <span className="text-xs text-slate-400">Class: B.Tech Semester 3 • Sec A</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Created by Amresh Chaubey
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Attendance Analytics & Academic Control
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time lecture tracking, university mandatory 75% criteria monitoring, and instant roll-call register.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('rollcall')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Take Roll Call</span>
          </button>

          <button
            onClick={() => onNavigateTab('defaulters')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Defaulter List ({overallMetrics.defaulters})</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Attendance Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Batch Attendance
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{overallMetrics.avg}%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              Target: 75%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${overallMetrics.avg >= 75 ? 'bg-indigo-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, overallMetrics.avg)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {overallMetrics.safe} of {students.length} students currently eligible
          </p>
        </div>

        {/* Shortage & Defaulters */}
        <div 
          onClick={() => onNavigateTab('defaulters')}
          className="bg-slate-900 border border-slate-800 hover:border-rose-800/80 rounded-2xl p-5 shadow-lg cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Shortage (&lt;75%)
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{overallMetrics.defaulters}</span>
            <span className="text-xs text-slate-400">Students</span>
          </div>
          <p className="text-xs text-rose-400/90 mt-3 font-medium flex items-center gap-1">
            <span>{overallMetrics.severeDefaulters} in Critical Zone (&lt;65%)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Enrolled Students */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{students.length}</span>
            <span className="text-xs text-slate-400">Roster Total</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Registered with University Roll Numbers
          </p>
        </div>

        {/* Total Lectures Conducted */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Lectures Held
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{sessions.length}</span>
            <span className="text-xs text-slate-400">Sessions</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Across {subjects.length} semester subjects & labs
          </p>
        </div>
      </div>

      {/* Today's Timetable Lecture Quick Access */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Today's Scheduled Lectures
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('timetable')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
          >
            Full Weekly Timetable <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaysClasses.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-sm">
            No scheduled classes for today on the timetable (or it is a weekend/holiday).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {todaysClasses.map(({ slot, subject, sessionToday, isMarked }) => (
              <div
                key={slot.id}
                className={`p-4 rounded-xl border transition ${
                  isMarked
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">{slot.time}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono">
                    {slot.room}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white truncate" title={subject?.name}>
                  {subject?.name || 'Class'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  {subject?.facultyName}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {isMarked ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Marked
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending Roll Call
                    </div>
                  )}

                  <button
                    onClick={() => onNavigateTab('rollcall', { subjectId: slot.subjectId, timeSlot: slot.time })}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                      isMarked
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isMarked ? 'Edit' : 'Take Attendance'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Layout: Subject Performance & Defaulter Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Attendance Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Subject-wise Attendance Distribution
            </h2>
            <span className="text-xs text-slate-400">Total 6 subjects</span>
          </div>

          <div className="space-y-4">
            {subjectStats.map(({ subject, sessionsCount, avgPercentage }) => (
              <div
                key={subject.id}
                className="p-3.5 rounded-xl bg-slate-850/50 border border-slate-800/80 hover:border-slate-750 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {subject.code}
                      </span>
                      <span className="text-sm font-semibold text-white truncate max-w-sm">
                        {subject.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {subject.facultyName} • {sessionsCount} classes conducted
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-sm font-bold text-white">
                      {avgPercentage}%
                    </span>
                    <button
                      onClick={() => onNavigateTab('rollcall', { subjectId: subject.id })}
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition"
                    >
                      Take Call
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      avgPercentage >= 75 ? 'bg-indigo-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, avgPercentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Defaulters Watchlist (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Defaulters Watchlist (&lt;75%)
              </h2>
              <button
                onClick={() => onNavigateTab('defaulters')}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                View All
              </button>
            </div>

            {topDefaulters.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                🎉 Excellent! No students are currently below 75% attendance.
              </div>
            ) : (
              <div className="space-y-3">
                {topDefaulters.map(d => (
                  <div
                    key={d.student.id}
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-300">
                          {d.student.rollNo}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">
                          {d.student.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Attended: {d.attendedClasses}/{d.totalClasses} classes
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {d.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('defaulters')}
              className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Generate Official Debarment Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
