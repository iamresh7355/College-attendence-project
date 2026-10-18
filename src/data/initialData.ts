import { Student, Subject, TimetableSlot, ClassSession } from '../types/attendance';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-cs301',
    code: 'CS-301',
    name: 'Data Structures & Algorithms',
    facultyName: 'Dr. Anand Verma',
    credits: 4,
    color: '#3b82f6', // blue
  },
  {
    id: 'sub-cs302',
    code: 'CS-302',
    name: 'Object-Oriented Programming (Java & C++)',
    facultyName: 'Prof. Sunita Sharma',
    credits: 4,
    color: '#10b981', // emerald
  },
  {
    id: 'sub-cs303',
    code: 'CS-303',
    name: 'Digital Logic & Computer Organization',
    facultyName: 'Dr. Rajesh Kulkarni',
    credits: 3,
    color: '#8b5cf6', // purple
  },
  {
    id: 'sub-cs304',
    code: 'CS-304',
    name: 'Discrete Mathematics & Graph Theory',
    facultyName: 'Dr. Priya Nambiar',
    credits: 4,
    color: '#f59e0b', // amber
  },
  {
    id: 'sub-cs305',
    code: 'CS-305',
    name: 'Principles of Operating Systems',
    facultyName: 'Prof. Vikram Singh',
    credits: 3,
    color: '#06b6d4', // cyan
  },
  {
    id: 'sub-cs306',
    code: 'CS-306',
    name: 'Data Structures & Algorithms Lab',
    facultyName: 'Er. Meenakshi Iyer',
    credits: 2,
    color: '#ec4899', // pink
  },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 'st-01', rollNo: '23CS001', regNo: 'REG2023001', name: 'Aarav Patel', email: 'aarav.patel@college.edu', phone: '+91 98765 43210', parentPhone: '+91 98765 00001', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-02', rollNo: '23CS002', regNo: 'REG2023002', name: 'Aditi Sharma', email: 'aditi.s@college.edu', phone: '+91 98765 43211', parentPhone: '+91 98765 00002', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-03', rollNo: '23CS003', regNo: 'REG2023003', name: 'Akash Gupta', email: 'akash.g@college.edu', phone: '+91 98765 43212', parentPhone: '+91 98765 00003', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-04', rollNo: '23CS004', regNo: 'REG2023004', name: 'Ananya Deshmukh', email: 'ananya.d@college.edu', phone: '+91 98765 43213', parentPhone: '+91 98765 00004', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-05', rollNo: '23CS005', regNo: 'REG2023005', name: 'Aniket Mukherjee', email: 'aniket.m@college.edu', phone: '+91 98765 43214', parentPhone: '+91 98765 00005', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-06', rollNo: '23CS006', regNo: 'REG2023006', name: 'Anushka Reddy', email: 'anushka.r@college.edu', phone: '+91 98765 43215', parentPhone: '+91 98765 00006', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-07', rollNo: '23CS007', regNo: 'REG2023007', name: 'Ayush Sen', email: 'ayush.sen@college.edu', phone: '+91 98765 43216', parentPhone: '+91 98765 00007', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-08', rollNo: '23CS008', regNo: 'REG2023008', name: 'Bhavya Joshi', email: 'bhavya.j@college.edu', phone: '+91 98765 43217', parentPhone: '+91 98765 00008', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-09', rollNo: '23CS009', regNo: 'REG2023009', name: 'Chaitanya Rao', email: 'chaitanya.r@college.edu', phone: '+91 98765 43218', parentPhone: '+91 98765 00009', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-10', rollNo: '23CS010', regNo: 'REG2023010', name: 'Deepak Choudhary', email: 'deepak.c@college.edu', phone: '+91 98765 43219', parentPhone: '+91 98765 00010', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-11', rollNo: '23CS011', regNo: 'REG2023011', name: 'Diya Nair', email: 'diya.n@college.edu', phone: '+91 98765 43220', parentPhone: '+91 98765 00011', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-12', rollNo: '23CS012', regNo: 'REG2023012', name: 'Gaurav Khatri', email: 'gaurav.k@college.edu', phone: '+91 98765 43221', parentPhone: '+91 98765 00012', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-13', rollNo: '23CS013', regNo: 'REG2023013', name: 'Harshit Saxena', email: 'harshit.s@college.edu', phone: '+91 98765 43222', parentPhone: '+91 98765 00013', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-14', rollNo: '23CS014', regNo: 'REG2023014', name: 'Isha Mehra', email: 'isha.m@college.edu', phone: '+91 98765 43223', parentPhone: '+91 98765 00014', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-15', rollNo: '23CS015', regNo: 'REG2023015', name: 'Karan Malhotra', email: 'karan.m@college.edu', phone: '+91 98765 43224', parentPhone: '+91 98765 00015', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-16', rollNo: '23CS016', regNo: 'REG2023016', name: 'Kavya Pillai', email: 'kavya.p@college.edu', phone: '+91 98765 43225', parentPhone: '+91 98765 00016', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-17', rollNo: '23CS017', regNo: 'REG2023017', name: 'Manish Tiwari', email: 'manish.t@college.edu', phone: '+91 98765 43226', parentPhone: '+91 98765 00017', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-18', rollNo: '23CS018', regNo: 'REG2023018', name: 'Megha Agarwal', email: 'megha.a@college.edu', phone: '+91 98765 43227', parentPhone: '+91 98765 00018', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-19', rollNo: '23CS019', regNo: 'REG2023019', name: 'Nikhil Chauhan', email: 'nikhil.c@college.edu', phone: '+91 98765 43228', parentPhone: '+91 98765 00019', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-20', rollNo: '23CS020', regNo: 'REG2023020', name: 'Pooja Bhatt', email: 'pooja.b@college.edu', phone: '+91 98765 43229', parentPhone: '+91 98765 00020', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-21', rollNo: '23CS021', regNo: 'REG2023021', name: 'Pranav Kulkarni', email: 'pranav.k@college.edu', phone: '+91 98765 43230', parentPhone: '+91 98765 00021', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-22', rollNo: '23CS022', regNo: 'REG2023022', name: 'Priya Sundaram', email: 'priya.s@college.edu', phone: '+91 98765 43231', parentPhone: '+91 98765 00022', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-23', rollNo: '23CS023', regNo: 'REG2023023', name: 'Rahul Varma', email: 'rahul.v@college.edu', phone: '+91 98765 43232', parentPhone: '+91 98765 00023', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-24', rollNo: '23CS024', regNo: 'REG2023024', name: 'Riya Singhania', email: 'riya.s@college.edu', phone: '+91 98765 43233', parentPhone: '+91 98765 00024', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-25', rollNo: '23CS025', regNo: 'REG2023025', name: 'Rohan Banerjee', email: 'rohan.b@college.edu', phone: '+91 98765 43234', parentPhone: '+91 98765 00025', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-26', rollNo: '23CS026', regNo: 'REG2023026', name: 'Sakshi Jadhav', email: 'sakshi.j@college.edu', phone: '+91 98765 43235', parentPhone: '+91 98765 00026', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-27', rollNo: '23CS027', regNo: 'REG2023027', name: 'Sameer Khan', email: 'sameer.k@college.edu', phone: '+91 98765 43236', parentPhone: '+91 98765 00027', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-28', rollNo: '23CS028', regNo: 'REG2023028', name: 'Sanya Mirza', email: 'sanya.m@college.edu', phone: '+91 98765 43237', parentPhone: '+91 98765 00028', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
  { id: 'st-29', rollNo: '23CS029', regNo: 'REG2023029', name: 'Siddharth Roy', email: 'siddharth.r@college.edu', phone: '+91 98765 43238', parentPhone: '+91 98765 00029', department: 'Computer Science', semester: 3, section: 'A', gender: 'M' },
  { id: 'st-30', rollNo: '23CS030', regNo: 'REG2023030', name: 'Tanvi Shinde', email: 'tanvi.s@college.edu', phone: '+91 98765 43239', parentPhone: '+91 98765 00030', department: 'Computer Science', semester: 3, section: 'A', gender: 'F' },
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // Monday
  { id: 'tt-m1', day: 'Monday', period: 1, time: '09:00 - 10:00 AM', subjectId: 'sub-cs301', room: 'LH-201' },
  { id: 'tt-m2', day: 'Monday', period: 2, time: '10:00 - 11:00 AM', subjectId: 'sub-cs302', room: 'LH-201' },
  { id: 'tt-m3', day: 'Monday', period: 3, time: '11:15 - 12:15 PM', subjectId: 'sub-cs304', room: 'LH-201' },
  { id: 'tt-m4', day: 'Monday', period: 4, time: '01:00 - 03:00 PM', subjectId: 'sub-cs306', room: 'DSA Lab 2' },

  // Tuesday
  { id: 'tt-t1', day: 'Tuesday', period: 1, time: '09:00 - 10:00 AM', subjectId: 'sub-cs303', room: 'LH-201' },
  { id: 'tt-t2', day: 'Tuesday', period: 2, time: '10:00 - 11:00 AM', subjectId: 'sub-cs305', room: 'LH-201' },
  { id: 'tt-t3', day: 'Tuesday', period: 3, time: '11:15 - 12:15 PM', subjectId: 'sub-cs301', room: 'LH-201' },
  { id: 'tt-t4', day: 'Tuesday', period: 4, time: '02:00 - 03:00 PM', subjectId: 'sub-cs302', room: 'LH-201' },

  // Wednesday
  { id: 'tt-w1', day: 'Wednesday', period: 1, time: '09:00 - 10:00 AM', subjectId: 'sub-cs304', room: 'LH-201' },
  { id: 'tt-w2', day: 'Wednesday', period: 2, time: '10:00 - 11:00 AM', subjectId: 'sub-cs303', room: 'LH-201' },
  { id: 'tt-w3', day: 'Wednesday', period: 3, time: '11:15 - 12:15 PM', subjectId: 'sub-cs302', room: 'LH-201' },
  { id: 'tt-w4', day: 'Wednesday', period: 4, time: '01:00 - 02:00 PM', subjectId: 'sub-cs305', room: 'LH-201' },

  // Thursday
  { id: 'tt-th1', day: 'Thursday', period: 1, time: '09:00 - 10:00 AM', subjectId: 'sub-cs301', room: 'LH-201' },
  { id: 'tt-th2', day: 'Thursday', period: 2, time: '10:00 - 11:00 AM', subjectId: 'sub-cs304', room: 'LH-201' },
  { id: 'tt-th3', day: 'Thursday', period: 3, time: '11:15 - 12:15 PM', subjectId: 'sub-cs305', room: 'LH-201' },
  { id: 'tt-th4', day: 'Thursday', period: 4, time: '01:00 - 03:00 PM', subjectId: 'sub-cs306', room: 'DSA Lab 2' },

  // Friday
  { id: 'tt-f1', day: 'Friday', period: 1, time: '09:00 - 10:00 AM', subjectId: 'sub-cs303', room: 'LH-201' },
  { id: 'tt-f2', day: 'Friday', period: 2, time: '10:00 - 11:00 AM', subjectId: 'sub-cs302', room: 'LH-201' },
  { id: 'tt-f3', day: 'Friday', period: 3, time: '11:15 - 12:15 PM', subjectId: 'sub-cs301', room: 'LH-201' },
  { id: 'tt-f4', day: 'Friday', period: 4, time: '02:00 - 03:00 PM', subjectId: 'sub-cs304', room: 'LH-201' },

  // Saturday
  { id: 'tt-s1', day: 'Saturday', period: 1, time: '09:30 - 10:30 AM', subjectId: 'sub-cs305', room: 'LH-201' },
  { id: 'tt-s2', day: 'Saturday', period: 2, time: '10:30 - 11:30 AM', subjectId: 'sub-cs303', room: 'LH-201' },
];

export function generateInitialSessions(): ClassSession[] {
  const sessions: ClassSession[] = [];
  const today = new Date();

  const defaulterIds = new Set(['st-05', 'st-12', 'st-17', 'st-23', 'st-27']);
  const borderlineIds = new Set(['st-09', 'st-19', 'st-29']);

  let daysBack = 1;
  let sessionsAdded = 0;

  while (sessionsAdded < 22 && daysBack < 40) {
    const d = new Date(today);
    d.setDate(today.getDate() - daysBack);
    daysBack++;

    if (d.getDay() === 0) continue;

    const dateStr = d.toISOString().split('T')[0];
    const dayNames: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const dayName = dayNames[d.getDay()];

    const daySlots = INITIAL_TIMETABLE.filter(s => s.day === dayName);

    for (const slot of daySlots) {
      if (sessionsAdded >= 22) break;

      const records = INITIAL_STUDENTS.map(student => {
        let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
        const rand = (student.rollNo.charCodeAt(student.rollNo.length - 1) * 17 + sessionsAdded * 13) % 100;

        if (defaulterIds.has(student.id)) {
          if (rand < 48) status = 'absent';
          else if (rand < 58) status = 'late';
          else status = 'present';
        } else if (borderlineIds.has(student.id)) {
          if (rand < 28) status = 'absent';
          else if (rand < 36) status = 'late';
          else status = 'present';
        } else {
          if (rand < 8) status = 'absent';
          else if (rand < 14) status = 'late';
          else if (rand < 16) status = 'excused';
          else status = 'present';
        }

        return {
          studentId: student.id,
          status,
        };
      });

      const subject = INITIAL_SUBJECTS.find(s => s.id === slot.subjectId);

      sessions.push({
        id: `sess-${dateStr}-${slot.subjectId}-${slot.period}`,
        date: dateStr,
        timeSlot: slot.time,
        subjectId: slot.subjectId,
        department: 'Computer Science',
        semester: 3,
        section: 'A',
        topicCovered: `Lecture on ${subject?.name || 'Syllabus Topic'} Unit ${((sessionsAdded % 4) + 1)}`,
        records,
        markedAt: new Date(d.setHours(10, 0, 0, 0)).toISOString(),
        markedBy: subject?.facultyName || 'Faculty',
      });

      sessionsAdded++;
    }
  }

  return sessions;
}
