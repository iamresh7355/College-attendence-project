import React, { useState, useMemo, useEffect } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  ShieldAlert, 
  Search, 
  Save, 
  Sparkles, 
  CheckCheck, 
  XCircle, 
  BookOpen, 
  Calendar, 
  Layers,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Student, Subject, ClassSession, AttendanceStatus, AttendanceEntry } from '../types/attendance';
import { calculateStudentSummaries } from '../utils/calculator';

interface RollCallViewProps {
  students: Student[];
  subjects: Subject[];
  sessions: ClassSession[];
  onSaveSession: (session: ClassSession) => void;
  preselectedSubjectId?: string;
  preselectedTimeSlot?: string;
}

export const RollCallView: React.FC<RollCallViewProps> = ({
  students,
  subjects,
  sessions,
  onSaveSession,
  preselectedSubjectId,
  preselectedTimeSlot,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    preselectedSubjectId || (subjects[0]?.id ?? '')
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    preselectedTimeSlot || '09:00 - 10:00 AM'
  );
  const [topicCovered, setTopicCovered] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [expandedRemarksId, setExpandedRemarksId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Active session status map studentId -> { status, remarks }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});

  // Check if session for this subject, date, and timeslot already exists
  const existingSession = useMemo(() => {
    return sessions.find(
      s => s.subjectId === selectedSubjectId && s.date === selectedDate && s.timeSlot === selectedTimeSlot
    );
  }, [sessions, selectedSubjectId, selectedDate, selectedTimeSlot]);

  // Load existing records if found, or default all students to 'present' for fast marking
  useEffect(() => {
    const newMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};

    if (existingSession) {
      existingSession.records.forEach(r => {
        newMap[r.studentId] = {
          status: r.status,
          remarks: r.remarks || '',
        };
      });
      // Fill any new students not in existing records
      students.forEach(st => {
        if (!newMap[st.id]) {
          newMap[st.id] = { status: 'present', remarks: '' };
        }
      });
      if (existingSession.topicCovered) {
        setTopicCovered(existingSession.topicCovered);
      }
    } else {
      // Default fast initialization: all Present
      students.forEach(st => {
        newMap[st.id] = { status: 'present', remarks: '' };
      });
    }

    setAttendanceMap(newMap);
  }, [existingSession, students, selectedSubjectId, selectedDate, selectedTimeSlot]);

  // Compute cumulative student summaries to show current % beside student name
  const studentSummaries = useMemo(() => {
    return calculateStudentSummaries(students, subjects, sessions);
  }, [students, subjects, sessions]);

  const summaryMap = useMemo(() => {
    const map = new Map<string, (typeof studentSummaries)[0]>();
    studentSummaries.forEach(s => map.set(s.student.id, s));
    return map;
  }, [studentSummaries]);

  // Handle single student status change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  // Bulk actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const newMap = { ...attendanceMap };
    students.forEach(st => {
      newMap[st.id] = {
        status,
        remarks: newMap[st.id]?.remarks || '',
      };
    });
    setAttendanceMap(newMap);
  };

  // Real-time roll call stats
  const stats = useMemo(() => {
    let p = 0, a = 0, l = 0, e = 0;
    Object.values(attendanceMap).forEach(val => {
      if (val.status === 'present') p++;
      else if (val.status === 'absent') a++;
      else if (val.status === 'late') l++;
      else if (val.status === 'excused') e++;
    });
    const total = students.length;
    const effectiveAttended = p + l + e;
    const percentage = total > 0 ? Math.round((effectiveAttended / total) * 1000) / 10 : 0;

    return { p, a, l, e, total, percentage };
  }, [attendanceMap, students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const matchQuery = 
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchQuery) return false;

      if (statusFilter !== 'all') {
        const current = attendanceMap[st.id]?.status;
        return current === statusFilter;
      }

      return true;
    });
  }, [students, searchQuery, statusFilter, attendanceMap]);

  // Save session
  const handleSave = () => {
    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    const records: AttendanceEntry[] = students.map(st => ({
      studentId: st.id,
      status: attendanceMap[st.id]?.status || 'present',
      remarks: attendanceMap[st.id]?.remarks || undefined,
    }));

    const newSession: ClassSession = {
      id: existingSession ? existingSession.id : `sess-${selectedDate}-${selectedSubjectId}-${Date.now()}`,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      subjectId: selectedSubjectId,
      department: 'Computer Science',
      semester: 3,
      section: 'A',
      topicCovered: topicCovered || `Regular Lecture on ${selectedSubject?.name || 'Subject'}`,
      records,
      markedAt: new Date().toISOString(),
      markedBy: selectedSubject?.facultyName || 'Faculty',
    };

    onSaveSession(newSession);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Session Metadata Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xl font-bold text-white tracking-tight">
                Daily Roll Call & Attendance Register
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {existingSession ? (
                <span className="text-amber-400 font-medium flex items-center gap-1.5 inline-flex">
                  <AlertCircle className="w-4 h-4" /> Editing previously marked session for this time slot
                </span>
              ) : (
                'Select lecture parameters and quickly record student presence for this period'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg ${
                savedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>Attendance Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{existingSession ? 'Update Attendance' : 'Save Attendance'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Subject / Paper
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.code}: {sub.name}
                </option>
              ))}
            </select>
            {selectedSubject && (
              <span className="text-xs text-slate-400 mt-1 block truncate">
                Faculty: <span className="text-slate-300 font-medium">{selectedSubject.facultyName}</span>
              </span>
            )}
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Session Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <span className="text-xs text-slate-400 mt-1 block">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Time Slot / Period */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Lecture Time Slot
            </label>
            <select
              value={selectedTimeSlot}
              onChange={e => setSelectedTimeSlot(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="09:00 - 10:00 AM">Period 1: 09:00 - 10:00 AM</option>
              <option value="10:00 - 11:00 AM">Period 2: 10:00 - 11:00 AM</option>
              <option value="11:15 - 12:15 PM">Period 3: 11:15 - 12:15 PM</option>
              <option value="01:00 - 02:00 PM">Period 4: 01:00 - 02:00 PM</option>
              <option value="02:00 - 03:00 PM">Period 5: 02:00 - 03:00 PM</option>
              <option value="01:00 - 03:00 PM">Lab Session: 01:00 - 03:00 PM</option>
            </select>
            <span className="text-xs text-slate-400 mt-1 block">
              Room: LH-301 (CSE Wing)
            </span>
          </div>

          {/* Topic Covered */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Topic Covered (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Memory Management & Paging"
              value={topicCovered}
              onChange={e => setTopicCovered(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <span className="text-xs text-slate-400 mt-1 block truncate">
              Recorded into department syllabus log
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Session Stats & Quick Actions Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-xs text-slate-400">Total:</span>
            <span className="text-sm font-bold text-white">{stats.total}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs">Present:</span>
            <span className="text-sm font-bold">{stats.p}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="text-xs">Absent:</span>
            <span className="text-sm font-bold">{stats.a}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs">Late:</span>
            <span className="text-sm font-bold">{stats.l}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-xs">Excused/OD:</span>
            <span className="text-sm font-bold">{stats.e}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-300">
            <span className="text-xs">Session Rate:</span>
            <span className="text-sm font-extrabold">{stats.percentage}%</span>
          </div>
        </div>

        {/* Quick Bulk Marking Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => handleMarkAll('present')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Present
          </button>

          <button
            onClick={() => handleMarkAll('absent')}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <XCircle className="w-3.5 h-3.5" /> Mark All Absent
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Roll No (e.g. 21CS005) or Name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setStatusFilter('present')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'present' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Present ({stats.p})
          </button>
          <button
            onClick={() => setStatusFilter('absent')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'absent' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Absent ({stats.a})
          </button>
          <button
            onClick={() => setStatusFilter('late')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'late' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Late ({stats.l})
          </button>
          <button
            onClick={() => setStatusFilter('excused')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'excused' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Excused ({stats.e})
          </button>
        </div>
      </div>

      {/* Students Roll Call Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-850 overflow-hidden shadow-lg">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-base font-semibold">No students match your filter or search criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the search or filter.</p>
          </div>
        ) : (
          filteredStudents.map(student => {
            const current = attendanceMap[student.id]?.status || 'present';
            const remarks = attendanceMap[student.id]?.remarks || '';
            const summary = summaryMap.get(student.id);
            const cumulativePct = summary ? summary.percentage : 100;
            const isDefaulter = cumulativePct < 75;
            const isSevere = cumulativePct < 65;

            return (
              <div
                key={student.id}
                className={`p-4 transition hover:bg-slate-850/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  current === 'absent' ? 'bg-rose-950/10' : ''
                }`}
              >
                {/* Student Info */}
                <div className="flex items-center gap-3.5 min-w-[240px]">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-sm text-slate-300 shrink-0">
                    {student.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {student.rollNo}
                      </span>
                      <h3 className="font-semibold text-sm text-white">{student.name}</h3>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
                        Total Attended: {summary ? `${summary.attendedClasses}/${summary.totalClasses}` : '0/0'}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.2 rounded ${
                          isSevere
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isDefaulter
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {cumulativePct}% {isDefaulter && '(Shortage)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Buttons & Remarks */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Present Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition ${
                      current === 'present'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  {/* Absent Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition ${
                      current === 'absent'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>

                  {/* Late Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition ${
                      current === 'late'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Late</span>
                  </button>

                  {/* Excused Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'excused')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition ${
                      current === 'excused'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                    title="On Duty (OD) / Medical leave approved by Proctor"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>OD / Leave</span>
                  </button>

                  {/* Remarks Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedRemarksId(expandedRemarksId === student.id ? null : student.id)}
                    className={`p-1.5 rounded-xl border text-xs transition ${
                      remarks
                        ? 'bg-indigo-900/40 border-indigo-700 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Add note/reason for this student"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remarks Input if Expanded */}
                {expandedRemarksId === student.id && (
                  <div className="w-full pt-2">
                    <input
                      type="text"
                      placeholder="Add note e.g. Submitted medical certificate, Late due to bus delay..."
                      value={remarks}
                      onChange={e => handleRemarkChange(student.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating or Bottom Save Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span>
            Marked <strong>{stats.total}</strong> students • <strong>{stats.p}</strong> Present, <strong>{stats.a}</strong> Absent
          </span>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-lg ${
            savedSuccess
              ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          {savedSuccess ? (
            <>
              <CheckCheck className="w-4 h-4" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{existingSession ? 'Update Attendance' : 'Save Attendance Session'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
