import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  BookOpen, 
  Calendar, 
  Calculator,
  ChevronRight,
  User,
  Coffee,
  HelpCircle
} from 'lucide-react';
import { Student, Subject, ClassSession } from '../types/attendance';
import { calculateStudentSummaries, calculateBunkStats } from '../utils/calculator';

interface StudentPortalViewProps {
  students: Student[];
  subjects: Subject[];
  sessions: ClassSession[];
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  students,
  subjects,
  sessions,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [targetGoal, setTargetGoal] = useState<number>(75);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // What-If Simulator state
  const [simUpcomingClasses, setSimUpcomingClasses] = useState<number>(10);
  const [simWillAttend, setSimWillAttend] = useState<number>(8);

  const summaries = useMemo(() => {
    return calculateStudentSummaries(students, subjects, sessions);
  }, [students, subjects, sessions]);

  const currentSummary = useMemo(() => {
    return summaries.find(s => s.student.id === selectedStudentId) || summaries[0];
  }, [summaries, selectedStudentId]);

  // Bunk prediction for overall
  const overallBunkStats = useMemo(() => {
    if (!currentSummary) return null;
    return calculateBunkStats(currentSummary.attendedClasses, currentSummary.totalClasses, targetGoal);
  }, [currentSummary, targetGoal]);

  // Filter student dropdown by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(
      s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // What-If simulated percentage calculation
  const simulatedStats = useMemo(() => {
    if (!currentSummary) return { newPct: 0, delta: 0 };
    const newTotal = currentSummary.totalClasses + simUpcomingClasses;
    const newAttended = currentSummary.attendedClasses + Math.min(simWillAttend, simUpcomingClasses);
    const newPct = newTotal > 0 ? Math.round((newAttended / newTotal) * 1000) / 10 : 0;
    const delta = Math.round((newPct - currentSummary.percentage) * 10) / 10;
    return { newPct, delta };
  }, [currentSummary, simUpcomingClasses, simWillAttend]);

  // Recent attendance history for this student
  const studentHistory = useMemo(() => {
    if (!currentSummary) return [];
    const list: {
      session: ClassSession;
      subject?: Subject;
      status: string;
      remarks?: string;
    }[] = [];

    // Sort sessions by date descending
    const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

    sorted.forEach(sess => {
      const record = sess.records.find(r => r.studentId === currentSummary.student.id);
      if (record) {
        list.push({
          session: sess,
          subject: subjects.find(s => s.id === sess.subjectId),
          status: record.status,
          remarks: record.remarks,
        });
      }
    });

    return list.slice(0, 15);
  }, [sessions, currentSummary, subjects]);

  if (!currentSummary) {
    return <div className="text-slate-400 py-12 text-center">No student data available.</div>;
  }

  const { student, attendedClasses, totalClasses, percentage, isDefaulter, isSevereDefaulter, subjectWise } = currentSummary;

  return (
    <div className="space-y-6">
      {/* Student Selector Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-cyan-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Student Attendance Portal & Bunk Planner
            </h1>
            <p className="text-xs text-slate-400">
              Check individual subject breakdowns, track attendance requirements, and simulate upcoming lectures.
            </p>
          </div>
        </div>

        {/* Search & Select Student Dropdown */}
        <div className="w-full md:w-96">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Select Student / Enter Roll No
          </label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {students.map(st => (
              <option key={st.id} value={st.id}>
                {st.rollNo} — {st.name} (Sem {st.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Profile & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student ID Card & Overall Gauge */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {student.rollNo}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-2">
                  {student.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {student.department} • Semester {student.semester} - Sec {student.section}
                </p>
              </div>

              <div className="h-14 w-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xl text-slate-200">
                {student.name.charAt(0)}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Reg No:</span>
                <span className="font-mono text-slate-300">{student.regNo || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-slate-300 truncate max-w-[180px]">{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="text-slate-300">{student.phone}</span>
                </div>
              )}
            </div>

            {/* Attendance Score Card */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-slate-800 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Attendance
              </span>

              <div className="my-2">
                <span
                  className={`text-5xl font-black tracking-tight ${
                    isSevereDefaulter
                      ? 'text-rose-400'
                      : isDefaulter
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {percentage}%
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3">
                {isSevereDefaulter ? (
                  <span className="text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Severe Debarment Risk (&lt;65%)
                  </span>
                ) : isDefaulter ? (
                  <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Attendance Shortage (&lt;75%)
                  </span>
                ) : (
                  <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Eligible for Semester Exams
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    percentage >= 75 ? 'bg-emerald-500' : percentage >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                <div>
                  <span className="block font-bold text-white">{attendedClasses}</span>
                  <span className="text-[11px]">Attended</span>
                </div>
                <div>
                  <span className="block font-bold text-white">{currentSummary.absentClasses}</span>
                  <span className="text-[11px]">Absent</span>
                </div>
                <div>
                  <span className="block font-bold text-white">{currentSummary.lateClasses}</span>
                  <span className="text-[11px]">Late</span>
                </div>
                <div>
                  <span className="block font-bold text-white">{totalClasses}</span>
                  <span className="text-[11px]">Total</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-500 text-center">
            * Attendance criteria as mandated by University technical regulations.
          </div>
        </div>

        {/* Right Column (2 Cols): The Interactive Bunk / Target Attendance Predictor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bunk Predictor Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Smart Bunk & Attendance Goal Calculator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Know exactly how many classes you can afford to skip or must attend to stay safe!
                  </p>
                </div>
              </div>

              {/* Target Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Goal:</span>
                <select
                  value={targetGoal}
                  onChange={e => setTargetGoal(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none"
                >
                  <option value={75}>75% (Minimum)</option>
                  <option value={80}>80% (Safe)</option>
                  <option value={85}>85% (High)</option>
                  <option value={90}>90% (Scholar)</option>
                </select>
              </div>
            </div>

            {/* Bunk Calculation Result Banner */}
            <div className="mt-5">
              {overallBunkStats && (
                <div
                  className={`p-5 rounded-2xl border ${
                    overallBunkStats.canBunk > 0
                      ? 'bg-emerald-950/30 border-emerald-800/60'
                      : overallBunkStats.mustAttend > 0
                      ? 'bg-rose-950/30 border-rose-800/60'
                      : 'bg-indigo-950/30 border-indigo-800/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {overallBunkStats.canBunk > 0 ? 'Safe Zone Bunk Allowance' : 'Attendance Recovery Required'}
                      </span>

                      {overallBunkStats.canBunk > 0 ? (
                        <div className="mt-1">
                          <h4 className="text-2xl font-black text-emerald-300">
                            You can bunk <span className="underline decoration-emerald-500 underline-offset-4">{overallBunkStats.canBunk}</span> more classes!
                          </h4>
                          <p className="text-xs text-emerald-400/90 mt-1">
                            {overallBunkStats.message}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <h4 className="text-2xl font-black text-rose-300">
                            Must attend next <span className="underline decoration-rose-500 underline-offset-4">{overallBunkStats.mustAttend}</span> classes straight!
                          </h4>
                          <p className="text-xs text-rose-400/90 mt-1">
                            {overallBunkStats.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 shrink-0 text-center min-w-[120px]">
                      <span className="text-[11px] text-slate-400 block">Target Threshold</span>
                      <span className="text-xl font-black text-white">{targetGoal}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* What-If Simulator Section */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  "What-If" Scenario Simulator
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-850/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Upcoming Classes Conducted:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={simUpcomingClasses}
                    onChange={e => {
                      const val = Math.max(1, Number(e.target.value));
                      setSimUpcomingClasses(val);
                      if (simWillAttend > val) setSimWillAttend(val);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Classes I Will Attend:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={simUpcomingClasses}
                    value={simWillAttend}
                    onChange={e => setSimWillAttend(Math.min(simUpcomingClasses, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white font-bold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-center">
                  <span className="text-[11px] text-slate-400 block">Projected New %</span>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-white">{simulatedStats.newPct}%</span>
                    <span
                      className={`text-xs font-bold ${
                        simulatedStats.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ({simulatedStats.delta >= 0 ? `+${simulatedStats.delta}` : simulatedStats.delta}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subject-Wise Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Subject-wise Attendance & Bunk Margin
            </h3>

            <div className="space-y-3">
              {subjects.map(sub => {
                const data = subjectWise[sub.id] || { total: 0, attended: 0, percentage: 100 };
                const subBunk = calculateBunkStats(data.attended, data.total, targetGoal);
                const isSubDefaulter = data.percentage < 75;

                return (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-2xl bg-slate-850/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {sub.code}
                        </span>
                        <h4 className="text-sm font-semibold text-white truncate">
                          {sub.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Attended: <strong className="text-slate-200">{data.attended}</strong> / {data.total} lectures • Faculty: {sub.facultyName}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-sm font-black px-2 py-0.5 rounded ${
                            isSubDefaulter ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {data.percentage}%
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {subBunk.canBunk > 0 ? (
                            <span className="text-emerald-400 font-medium">Can bunk {subBunk.canBunk}</span>
                          ) : subBunk.mustAttend > 0 ? (
                            <span className="text-rose-400 font-medium">Attend next {subBunk.mustAttend}</span>
                          ) : (
                            <span>Exact on track</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Date-wise Attendance Activity Log for this Student */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Recent Roll Call History ({student.name})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Past 15 Recorded Lectures</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-850 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Date & Period</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Topic Covered</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 rounded-r-xl">Remarks / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {studentHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No attendance sessions recorded yet for this student.
                  </td>
                </tr>
              ) : (
                studentHistory.map(({ session, subject, status, remarks }) => (
                  <tr key={session.id} className="hover:bg-slate-850/40">
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="font-semibold text-white">{session.date}</div>
                      <div className="text-slate-500">{session.timeSlot}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-xs">{subject?.code}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-xs">{subject?.name}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {session.topicCovered || 'Regular Syllabus Lecture'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          status === 'present'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : status === 'absent'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : status === 'late'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                        {status === 'absent' && <XCircle className="w-3 h-3" />}
                        {status === 'late' && <Clock className="w-3 h-3" />}
                        {status === 'excused' && <ShieldAlert className="w-3 h-3" />}
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 italic">
                      {remarks || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
