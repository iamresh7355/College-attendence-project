import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Phone, 
  Mail, 
  Share2, 
  Filter, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';
import { Student, Subject, ClassSession } from '../types/attendance';
import { calculateStudentSummaries, calculateBunkStats, generateDefaulterNotice, generateAttendanceCSV } from '../utils/calculator';

interface DefaultersViewProps {
  students: Student[];
  subjects: Subject[];
  sessions: ClassSession[];
}

export const DefaultersView: React.FC<DefaultersViewProps> = ({
  students,
  subjects,
  sessions,
}) => {
  const [criteria, setCriteria] = useState<number>(75);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(65);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'severe' | 'moderate' | 'eligible'>('all');
  const [selectedNoticeStudent, setSelectedNoticeStudent] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // All student summaries
  const summaries = useMemo(() => {
    return calculateStudentSummaries(students, subjects, sessions);
  }, [students, subjects, sessions]);

  // Filter & categorize based on chosen criteria
  const categorized = useMemo(() => {
    const severe: typeof summaries = [];
    const moderate: typeof summaries = [];
    const eligible: typeof summaries = [];

    summaries.forEach(s => {
      if (s.percentage < criticalThreshold) {
        severe.push(s);
      } else if (s.percentage < criteria) {
        moderate.push(s);
      } else {
        eligible.push(s);
      }
    });

    return { severe, moderate, eligible, totalDefaulters: severe.length + moderate.length };
  }, [summaries, criteria, criticalThreshold]);

  // Search & filter
  const displayedStudents = useMemo(() => {
    return summaries.filter(s => {
      const matchesSearch = 
        s.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (severityFilter === 'severe') return s.percentage < criticalThreshold;
      if (severityFilter === 'moderate') return s.percentage >= criticalThreshold && s.percentage < criteria;
      if (severityFilter === 'eligible') return s.percentage >= criteria;

      return true;
    }).sort((a, b) => a.percentage - b.percentage);
  }, [summaries, searchQuery, severityFilter, criticalThreshold, criteria]);

  // Copy notice to clipboard
  const handleCopyNotice = (summary: any) => {
    const notice = generateDefaulterNotice(summary);
    navigator.clipboard.writeText(notice);
    setCopiedId(summary.student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // CSV download
  const handleDownloadCSV = () => {
    const csv = generateAttendanceCSV(summaries, subjects);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Defaulter_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                University 75% Attendance Compliance & Defaulter List
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Automated debarment risk evaluation under UGC & University technical guidelines. Generate formal notices and parent intimations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Print Formal Notice</span>
            </button>
          </div>
        </div>

        {/* Threshold Settings & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {/* Minimum Criteria Adjuster */}
          <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Mandatory Minimum Target
            </label>
            <div className="flex items-center gap-2">
              <select
                value={criteria}
                onChange={e => setCriteria(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={75}>75% (AICTE/UGC Standard)</option>
                <option value={80}>80% (Strict Autonomous)</option>
                <option value={85}>85% (Honors Requirement)</option>
                <option value={70}>70% (Special Condonation)</option>
              </select>
            </div>
            <span className="text-[11px] text-slate-500 mt-1.5 block">
              Students below this will be flagged as defaulters
            </span>
          </div>

          {/* Severe Debarment Card */}
          <div 
            onClick={() => setSeverityFilter('severe')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              severityFilter === 'severe'
                ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/20'
                : 'bg-rose-950/20 border-rose-900/40 hover:border-rose-800/80'
            }`}
          >
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Severe Debarred (&lt;{criticalThreshold}%)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-300">{categorized.severe.length}</span>
              <span className="text-xs text-rose-400/80">Students</span>
            </div>
            <span className="text-[11px] text-rose-300/70 mt-1 block">
              High risk of exam hall ticket cancellation
            </span>
          </div>

          {/* Moderate Shortage Card */}
          <div 
            onClick={() => setSeverityFilter('moderate')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              severityFilter === 'moderate'
                ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-amber-950/20 border-amber-900/40 hover:border-amber-800/80'
            }`}
          >
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Shortage Warning ({criticalThreshold}% - {criteria}%)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-300">{categorized.moderate.length}</span>
              <span className="text-xs text-amber-400/80">Students</span>
            </div>
            <span className="text-[11px] text-amber-300/70 mt-1 block">
              Can recover with consecutive attendance
            </span>
          </div>

          {/* Eligible Students Card */}
          <div 
            onClick={() => setSeverityFilter('eligible')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              severityFilter === 'eligible'
                ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-800/80'
            }`}
          >
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Fully Eligible (&gt;={criteria}%)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-300">{categorized.eligible.length}</span>
              <span className="text-xs text-emerald-400/80">Students</span>
            </div>
            <span className="text-[11px] text-emerald-300/70 mt-1 block">
              Clear for end-term university examinations
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or roll number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              severityFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Students ({summaries.length})
          </button>
          <button
            onClick={() => setSeverityFilter('severe')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              severityFilter === 'severe' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Severe &lt;{criticalThreshold}% ({categorized.severe.length})
          </button>
          <button
            onClick={() => setSeverityFilter('moderate')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              severityFilter === 'moderate' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Warning &lt;{criteria}% ({categorized.moderate.length})
          </button>
          <button
            onClick={() => setSeverityFilter('eligible')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              severityFilter === 'eligible' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Eligible ({categorized.eligible.length})
          </button>
        </div>
      </div>

      {/* Defaulter Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-850 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4 text-center">Attended / Total</th>
                <th className="py-3.5 px-4 text-center">Attendance %</th>
                <th className="py-3.5 px-4 text-center">Debarment Status</th>
                <th className="py-3.5 px-4 text-center">Required to Reach {criteria}%</th>
                <th className="py-3.5 px-4 text-right">Actions / Notice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No students match the current filter.
                  </td>
                </tr>
              ) : (
                displayedStudents.map(s => {
                  const bunkStats = calculateBunkStats(s.attendedClasses, s.totalClasses, criteria);
                  const isSevere = s.percentage < criticalThreshold;
                  const isModerate = s.percentage < criteria && !isSevere;

                  return (
                    <tr
                      key={s.student.id}
                      className={`hover:bg-slate-850/60 transition ${
                        isSevere ? 'bg-rose-950/10' : isModerate ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Roll No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {s.student.rollNo}
                      </td>

                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{s.student.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                          {s.student.parentPhone && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Phone className="w-3 h-3 text-slate-500" /> Parent: {s.student.parentPhone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Attended / Total */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-bold text-white">{s.attendedClasses}</span>
                        <span className="text-slate-500"> / {s.totalClasses}</span>
                      </td>

                      {/* Percentage */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                            isSevere
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : isModerate
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {s.percentage}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isSevere ? (
                          <span className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" /> Severe Defaulter
                          </span>
                        ) : isModerate ? (
                          <span className="text-xs font-semibold text-amber-400 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Shortage Notice
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Eligible
                          </span>
                        )}
                      </td>

                      {/* Required classes */}
                      <td className="py-3.5 px-4 text-center text-xs">
                        {bunkStats.mustAttend > 0 ? (
                          <span className="font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Must attend next {bunkStats.mustAttend} classes
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">
                            Can miss {bunkStats.canBunk} classes safely
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyNotice(s)}
                            className={`p-2 rounded-lg text-xs font-semibold transition border ${
                              copiedId === s.student.id
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                            title="Copy Official WhatsApp/SMS Notice to send to parent or student"
                          >
                            {copiedId === s.student.id ? (
                              <Check className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => setSelectedNoticeStudent(s)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                          >
                            View Notice
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notice Preview Modal */}
      {selectedNoticeStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedNoticeStudent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Official Attendance Shortage Notice
                </h3>
                <p className="text-xs text-slate-400">
                  Ready to copy and transmit via WhatsApp, SMS, or Email
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {generateDefaulterNotice(selectedNoticeStudent)}
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedNoticeStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCopyNotice(selectedNoticeStudent);
                  setTimeout(() => setSelectedNoticeStudent(null), 1000);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition"
              >
                <Copy className="w-4 h-4" />
                Copy Notice Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
