import React from 'react';
import { 
  CheckCircle2, 
  LayoutDashboard, 
  ClipboardCheck, 
  AlertTriangle, 
  CalendarDays, 
  GraduationCap, 
  FileSpreadsheet, 
  UserPlus, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'rollcall' | 'defaulters' | 'timetable' | 'student-portal' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'rollcall' | 'defaulters' | 'timetable' | 'student-portal' | 'reports') => void;
  onOpenManageModal: () => void;
  onResetData: () => void;
  defaulterCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenManageModal,
  onResetData,
  defaulterCount,
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner / College Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AttendSphere
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  College ERP
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Created by Amresh Chaubey
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Dept. of Computer Science & Engineering • B.Tech Semester 3</span>
                <span className="sm:hidden text-cyan-400 font-medium">• By Amresh Chaubey</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Date */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentDate}</span>
            </div>

            <button
              onClick={onOpenManageModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
              title="Add or Manage Students and Subjects"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Manage</span> Roster
            </button>

            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/40 hover:bg-rose-950/40 hover:text-rose-300 text-xs font-medium text-slate-400 border border-slate-800 transition"
              title="Reset to Demo Data with 30 students and 22 class sessions"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('rollcall')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'rollcall'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Take Attendance</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
              Daily
            </span>
          </button>

          <button
            onClick={() => setActiveTab('defaulters')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap relative ${
              activeTab === 'defaulters'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>75% Criteria</span>
            {defaulterCount > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'defaulters' ? 'bg-white text-rose-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {defaulterCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'timetable'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab('student-portal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'student-portal'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>Student Portal & Bunk Calc</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Calc
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Reports & Register</span>
          </button>
        </div>
      </div>
    </header>
  );
};
