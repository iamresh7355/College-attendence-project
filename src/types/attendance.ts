export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: string;
  rollNo: string;
  regNo?: string;
  name: string;
  email: string;
  phone?: string;
  parentPhone?: string;
  department: string;
  semester: number;
  section: string;
  gender?: 'M' | 'F' | 'Other';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  facultyName: string;
  credits: number;
  totalClassesHeld?: number;
  color?: string;
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface ClassSession {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 - 10:00 AM"
  subjectId: string;
  department: string;
  semester: number;
  section: string;
  topicCovered?: string;
  records: AttendanceEntry[];
  markedAt: string;
  markedBy: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  time: string;
  subjectId: string;
  room: string;
}

export interface StudentAttendanceSummary {
  student: Student;
  totalClasses: number;
  attendedClasses: number; // Present + Late (counted as attended or configurable)
  absentClasses: number;
  lateClasses: number;
  excusedClasses: number;
  percentage: number;
  isDefaulter: boolean; // < 75%
  isSevereDefaulter: boolean; // < 65%
  subjectWise: {
    [subjectId: string]: {
      subject: Subject;
      total: number;
      attended: number;
      percentage: number;
    };
  };
}
