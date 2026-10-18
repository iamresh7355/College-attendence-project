import React, { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  BookOpen, 
  User, 
  Plus, 
  Trash2, 
  ClipboardCheck, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { TimetableSlot, Subject } from '../types/attendance';

interface TimetableScheduleViewProps {
  timetable: TimetableSlot[];
  subjects: Subject[];
  onTakeAttendanceForSlot: (subjectId: string, timeSlot: string) => void;
  onUpdateTimetable: (updated: TimetableSlot[]) => void;
}

export const TimetableScheduleView: React.FC<TimetableScheduleViewProps> = ({
  timetable,
  subjects,
  onTakeAttendanceForSlot,
  onUpdateTimetable,
}) => {
  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const defaultDay = currentDayIndex >= 1 && currentDayIndex <= 6 ? days[currentDayIndex - 1] : 'Monday';

  const [activeDay, setActiveDay] = useState<'All' | typeof days[number]>(defaultDay);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New slot form state
  const [newDay, setNewDay] = useState<typeof days[number]>('Monday');
  const [newPeriod, setNewPeriod] = useState<number>(1);
  const [newTime, setNewTime] = useState<string>('09:00 - 10:00 AM');
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || '');
  const [newRoom, setNewRoom] = useState<string>('LH-301');

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: TimetableSlot = {
      id: `tt-${Date.now()}`,
      day: newDay,
      period: Number(newPeriod),
      time: newTime,
      subjectId: newSubjectId,
      room: newRoom,
    };
    onUpdateTimetable([...timetable, newSlot]);
    setShowAddModal(false);
  };

  const handleDeleteSlot = (id: string) => {
    onUpdateTimetable(timetable.filter(t => t.id !== id));
  };

  const filteredSlots = activeDay === 'All' 
    ? timetable 
    : timetable.filter(t => t.day === activeDay);

  // Sort by day order then period
  const sortedSlots = [...filteredSlots].sort((a, b) => {
    const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    if (dayOrder[a.day] !== dayOrder[b.day]) {
      return dayOrder[a.day] - dayOrder[b.day];
    }
    return a.period - b.period;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Weekly Academic Schedule & Timetable
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Department of Computer Science • Click "Roll Call" on any period to record attendance instantly.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Timetable Slot</span>
        </button>
      </div>

      {/* Day Selector Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveDay('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeDay === 'All'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Full Week Grid
        </button>

        {days.map(d => {
          const isToday = days[new Date().getDay() - 1] === d;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeDay === d
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{d}</span>
              {isToday && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSlots.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            No lecture periods scheduled for {activeDay}. Click "Add Timetable Slot" to add one!
          </div>
        ) : (
          sortedSlots.map(slot => {
            const subject = subjects.find(s => s.id === slot.subjectId);

            return (
              <div
                key={slot.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />

                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      {activeDay === 'All' && `${slot.day} • `}Period {slot.period}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      <Clock className="w-3 h-3 text-amber-400" /> {slot.time}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-indigo-300 transition">
                    {subject ? subject.name : 'Unknown Lecture'}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {subject?.code || 'SUB-000'}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {subject?.facultyName || 'Faculty'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Venue: <strong className="text-slate-200">{slot.room}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onTakeAttendanceForSlot(slot.subjectId, slot.time)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Roll Call</span>
                  </button>

                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Remove slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">
              Add New Timetable Slot
            </h3>

            <form onSubmit={handleAddSlot} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Day of Week
                </label>
                <select
                  value={newDay}
                  onChange={e => setNewDay(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Period #
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={newPeriod}
                    onChange={e => setNewPeriod(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 - 10:00 AM"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <select
                  value={newSubjectId}
                  onChange={e => setNewSubjectId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save Period Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
