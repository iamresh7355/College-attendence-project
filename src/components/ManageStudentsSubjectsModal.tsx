import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Plus, 
  Trash2, 
  X, 
  Upload, 
  Check, 
  UserPlus, 
  FolderPlus,
  FileText
} from 'lucide-react';
import { Student, Subject } from '../types/attendance';

interface ManageStudentsSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  subjects: Subject[];
  onUpdateStudents: (updated: Student[]) => void;
  onUpdateSubjects: (updated: Subject[]) => void;
}

export const ManageStudentsSubjectsModal: React.FC<ManageStudentsSubjectsModalProps> = ({
  isOpen,
  onClose,
  students,
  subjects,
  onUpdateStudents,
  onUpdateSubjects,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'subjects' | 'bulk'>('students');

  // New Student State
  const [newRollNo, setNewRollNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newSemester, setNewSemester] = useState(3);
  const [newSection, setNewSection] = useState('A');

  // New Subject State
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubFaculty, setNewSubFaculty] = useState('');
  const [newSubCredits, setNewSubCredits] = useState(4);

  // Bulk Import State
  const [bulkText, setBulkText] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');

  if (!isOpen) return null;

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRollNo || !newName) return;

    const student: Student = {
      id: `st-${Date.now()}`,
      rollNo: newRollNo.trim().toUpperCase(),
      regNo: `REG${Date.now().toString().slice(-6)}`,
      name: newName.trim(),
      email: newEmail.trim() || `${newRollNo.toLowerCase()}@college.edu`,
      phone: newPhone.trim() || undefined,
      parentPhone: newParentPhone.trim() || undefined,
      department: 'Computer Science',
      semester: Number(newSemester),
      section: newSection,
      gender: 'M',
    };

    onUpdateStudents([...students, student]);
    setNewRollNo('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewParentPhone('');
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to remove this student?')) {
      onUpdateStudents(students.filter(s => s.id !== id));
    }
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode || !newSubName) return;

    const subject: Subject = {
      id: `sub-${Date.now()}`,
      code: newSubCode.trim().toUpperCase(),
      name: newSubName.trim(),
      facultyName: newSubFaculty.trim() || 'Assigned Faculty',
      credits: Number(newSubCredits),
    };

    onUpdateSubjects([...subjects, subject]);
    setNewSubCode('');
    setNewSubName('');
    setNewSubFaculty('');
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Are you sure you want to remove this subject?')) {
      onUpdateSubjects(subjects.filter(s => s.id !== id));
    }
  };

  // Bulk Import Parser
  const handleBulkImport = () => {
    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    const added: Student[] = [];

    lines.forEach((line, idx) => {
      // Formats supported: "21CS035, Rahul Verma" or "Rahul Verma" or "21CS035\tRahul Verma"
      let roll = '';
      let name = '';

      if (line.includes(',')) {
        const parts = line.split(',');
        roll = parts[0].trim();
        name = parts[1].trim();
      } else if (line.includes('\t')) {
        const parts = line.split('\t');
        roll = parts[0].trim();
        name = parts[1].trim();
      } else {
        name = line.trim();
        roll = `21CS0${students.length + idx + 1}`;
      }

      if (name) {
        added.push({
          id: `st-bulk-${Date.now()}-${idx}`,
          rollNo: roll.toUpperCase(),
          regNo: `REG${Date.now().toString().slice(-6)}${idx}`,
          name,
          email: `${roll.toLowerCase()}@college.edu`,
          department: 'Computer Science',
          semester: 3,
          section: 'A',
        });
      }
    });

    if (added.length > 0) {
      onUpdateStudents([...students, ...added]);
      setBulkMessage(`Successfully imported ${added.length} students!`);
      setBulkText('');
      setTimeout(() => setBulkMessage(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Roster & Academic Curriculum Management
              </h2>
              <p className="text-xs text-slate-400">
                Manage enrolled students, curriculum papers, and quick bulk imports.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-2.5 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`pb-2.5 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'subjects'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Subjects / Papers ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className={`pb-2.5 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'bulk'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk CSV Import</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-sm">
          {/* TAB 1: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Add Student Form */}
              <form onSubmit={handleAddStudent} className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-indigo-400" /> Enroll New Student
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Roll Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 21CS031"
                      value={newRollNo}
                      onChange={e => setNewRollNo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Full Student Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Priyanshu Sharma"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="student@college.edu"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Student Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765..."
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Parent Phone (for Notice)</label>
                    <input
                      type="tel"
                      placeholder="+91 98765..."
                      value={newParentPhone}
                      onChange={e => setNewParentPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Roster</span>
                  </button>
                </div>
              </form>

              {/* Students List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400">Current Student List ({students.length})</h4>
                <div className="divide-y divide-slate-800 bg-slate-850/50 rounded-2xl border border-slate-800 max-h-72 overflow-y-auto">
                  {students.map(st => (
                    <div key={st.id} className="p-3 flex items-center justify-between hover:bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-indigo-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {st.rollNo}
                        </span>
                        <div>
                          <span className="font-semibold text-white text-xs block">{st.name}</span>
                          <span className="text-[11px] text-slate-400">{st.department} • Sem {st.semester}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteStudent(st.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              {/* Add Subject Form */}
              <form onSubmit={handleAddSubject} className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-indigo-400" /> Add Subject / Lab Course
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Paper Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. CS-607"
                      value={newSubCode}
                      onChange={e => setNewSubCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Course Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Cloud Computing & DevOps"
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Credits</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={newSubCredits}
                      onChange={e => setNewSubCredits(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Course Instructor / Faculty Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Harish Chandra"
                    value={newSubFaculty}
                    onChange={e => setNewSubFaculty(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Subject</span>
                  </button>
                </div>
              </form>

              {/* Subjects List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400">Registered Subjects ({subjects.length})</h4>
                <div className="divide-y divide-slate-800 bg-slate-850/50 rounded-2xl border border-slate-800">
                  {subjects.map(sub => (
                    <div key={sub.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                            {sub.code}
                          </span>
                          <span className="font-semibold text-white text-xs">{sub.name}</span>
                          <span className="text-[11px] text-indigo-400">({sub.credits} Credits)</span>
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 block">Instructor: {sub.facultyName}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteSubject(sub.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BULK IMPORT */}
          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-200">
                <p className="font-bold">Paste multiple students at once:</p>
                <p className="text-indigo-300/80 mt-1">
                  Format: <code>RollNo, Student Name</code> (one per line) or just paste a list of student names.
                </p>
                <p className="text-slate-400 text-[11px] mt-1 font-mono">
                  Example:<br />
                  21CS031, Priyanshu Sharma<br />
                  21CS032, Neha Kapoor<br />
                  21CS033, Varun Dhawan
                </p>
              </div>

              <textarea
                rows={8}
                placeholder="Paste roll numbers and names here..."
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {bulkMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" /> {bulkMessage}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={!bulkText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Students</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
