import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Search, 
  Calendar, 
  BookOpen, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  X,
  FileCheck
} from 'lucide-react';
import { Student, Subject, ClassSession } from '../types/attendance';
import { calculateStudentSummaries, generateAttendanceCSV } from '../utils/calculator';

interface ReportsViewProps {
  students: Student[];
  subjects: Subject[];
  sessions: ClassSession[];
  onDeleteSession: (sessionId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  subjects,
  sessions,
  onDeleteSession,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchDate, setSearchDate] = useState<string>('');
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<ClassSession | null>(null);

  const summaries = useMemo(() => {
    return calculateStudentSummaries(students, subjects, sessions);
  }, [students, subjects, sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (selectedSubjectId !== 'all' && s.subjectId !== selectedSubjectId) return false;
      if (searchDate && s.date !== searchDate) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, selectedSubjectId, searchDate]);

  // CSV Exporter
  const handleExportSummaryCSV = () => {
    const csv = generateAttendanceCSV(summaries, subjects);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Batch_Attendance_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Matrix CSV (Date vs Student Grid)
  const handleExportMatrixCSV = () => {
    // Generate dates header
    const dates = sessions.map(s => `${s.date} (${subjects.find(sub => sub.id === s.subjectId)?.code || ''})`);
    const header = ['Roll No', 'Student Name', ...dates, 'Total Attended', 'Total Held', 'Overall %'];

    const rows = students.map(st => {
      let attended = 0;
      const statuses = sessions.map(sess => {
        const rec = sess.records.find(r => r.studentId === st.id);
        const stCode = rec ? (rec.status === 'present' ? 'P' : rec.status === 'absent' ? 'A' : rec.status === 'late' ? 'L' : 'E') : '-';
        if (stCode === 'P' || stCode === 'L' || stCode === 'E') attended++;
        return stCode;
      });

      const total = sessions.length;
      const pct = total > 0 ? `${Math.round((attended / total) * 1000) / 10}%` : '100%';

      return [`"${st.rollNo}"`, `"${st.name}"`, ...statuses.map(s => `"${s}"`), attended, total, `"${pct}"`].join(',');
    });

    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Matrix_DayWise_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Attendance Records, Daily Registers & Audits
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Department archived roll call logs, syllabus topics covered, and university compliance registers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportSummaryCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Summary CSV</span>
          </button>

          <button
            onClick={handleExportMatrixCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Export Day-by-Day attendance matrix for all students"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Matrix CSV (Day-Wise)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Filter by Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
          >
            <option value="all">All Subjects ({subjects.length})</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Filter by Specific Date
          </label>
          <input
            type="date"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          {(selectedSubjectId !== 'all' || searchDate) && (
            <button
              onClick={() => {
                setSelectedSubjectId('all');
                setSearchDate('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Past Sessions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white">
            Recorded Lecture Sessions ({filteredSessions.length})
          </span>
          <span className="text-xs text-slate-400">
            Click 'View Register' to inspect individual student statuses
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No sessions match the selected filters.
            </div>
          ) : (
            filteredSessions.map(sess => {
              const subject = subjects.find(s => s.id === sess.subjectId);
              let pCount = 0, aCount = 0;
              sess.records.forEach(r => {
                if (r.status === 'present' || r.status === 'late' || r.status === 'excused') pCount++;
                else aCount++;
              });
              const pct = sess.records.length > 0 ? Math.round((pCount / sess.records.length) * 100) : 0;

              return (
                <div
                  key={sess.id}
                  className="p-4 hover:bg-slate-850/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-center shrink-0 min-w-[65px]">
                      <span className="text-xs text-slate-400 uppercase font-mono block">
                        {new Date(sess.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black text-white block">
                        {new Date(sess.date + 'T00:00:00').getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          {subject?.code || 'SUB'}
                        </span>
                        <h3 className="font-bold text-sm text-white">{subject?.name}</h3>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 font-mono">{sess.timeSlot}</span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1">
                        Topic: <span className="text-slate-400 italic">{sess.topicCovered || 'Regular Syllabus Lecture'}</span>
                      </p>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Marked by {sess.markedBy}
                      </p>
                    </div>
                  </div>

                  {/* Right side stats & actions */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-400 font-bold">{pCount} P</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-xs text-rose-400 font-bold">{aCount} A</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {pct}% Present
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSessionForDetail(sess)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Sheet</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this recorded session?')) {
                            onDeleteSession(sess.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSessionForDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-400">
                  {subjects.find(s => s.id === selectedSessionForDetail.subjectId)?.code}
                </span>
                <h3 className="font-bold text-white text-base">
                  {subjects.find(s => s.id === selectedSessionForDetail.subjectId)?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Date: {selectedSessionForDetail.date} • {selectedSessionForDetail.timeSlot} • Faculty: {selectedSessionForDetail.markedBy}
                </p>
                {selectedSessionForDetail.topicCovered && (
                  <p className="text-xs text-indigo-300 mt-1">
                    Topic: {selectedSessionForDetail.topicCovered}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedSessionForDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-800">
              {students.map(st => {
                const rec = selectedSessionForDetail.records.find(r => r.studentId === st.id);
                const status = rec?.status || 'absent';
                const remarks = rec?.remarks;

                return (
                  <div key={st.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400 min-w-[70px]">
                        {st.rollNo}
                      </span>
                      <span className="text-sm font-semibold text-white">{st.name}</span>
                      {remarks && (
                        <span className="text-xs text-slate-500 italic">({remarks})</span>
                      )}
                    </div>

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
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSessionForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
