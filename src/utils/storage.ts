import { Student, Subject, ClassSession, TimetableSlot } from '../types/attendance';
import { INITIAL_STUDENTS, INITIAL_SUBJECTS, INITIAL_TIMETABLE, generateInitialSessions } from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'attendsphere_students_v2_sem3',
  SUBJECTS: 'attendsphere_subjects_v2_sem3',
  SESSIONS: 'attendsphere_sessions_v2_sem3',
  TIMETABLE: 'attendsphere_timetable_v2_sem3',
  TARGET_CRITERIA: 'attendsphere_target_criteria_v2_sem3',
};

export function loadInitialData() {
  let students: Student[] = INITIAL_STUDENTS;
  let subjects: Subject[] = INITIAL_SUBJECTS;
  let timetable: TimetableSlot[] = INITIAL_TIMETABLE;
  let sessions: ClassSession[] = [];

  try {
    const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (storedStudents) students = JSON.parse(storedStudents);

    const storedSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (storedSubjects) subjects = JSON.parse(storedSubjects);

    const storedTimetable = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
    if (storedTimetable) timetable = JSON.parse(storedTimetable);

    const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (storedSessions) {
      sessions = JSON.parse(storedSessions);
    } else {
      sessions = generateInitialSessions();
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
  } catch (err) {
    console.error('Failed to load from localStorage, using defaults', err);
    sessions = generateInitialSessions();
  }

  return { students, subjects, timetable, sessions };
}

export function saveStudents(students: Student[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error(e);
  }
}

export function saveSubjects(subjects: Subject[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error(e);
  }
}

export function saveSessions(sessions: ClassSession[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error(e);
  }
}

export function saveTimetable(timetable: TimetableSlot[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  } catch (e) {
    console.error(e);
  }
}

export function resetToDemoData() {
  const initialSessions = generateInitialSessions();
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
  localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(INITIAL_TIMETABLE));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initialSessions));

  return {
    students: INITIAL_STUDENTS,
    subjects: INITIAL_SUBJECTS,
    timetable: INITIAL_TIMETABLE,
    sessions: initialSessions,
  };
}
