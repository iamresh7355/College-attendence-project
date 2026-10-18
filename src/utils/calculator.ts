import { Student, Subject, ClassSession, StudentAttendanceSummary } from '../types/attendance';

export function calculateStudentSummaries(
  students: Student[],
  subjects: Subject[],
  sessions: ClassSession[],
  filterSubjectId?: string
): StudentAttendanceSummary[] {
  const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));

  return students.map(student => {
    let totalClasses = 0;
    let attendedClasses = 0;
    let absentClasses = 0;
    let lateClasses = 0;
    let excusedClasses = 0;

    const subjectWise: StudentAttendanceSummary['subjectWise'] = {};

    // Initialize subjectWise map
    subjects.forEach(sub => {
      subjectWise[sub.id] = {
        subject: sub,
        total: 0,
        attended: 0,
        percentage: 0,
      };
    });

    sessions.forEach(session => {
      if (filterSubjectId && session.subjectId !== filterSubjectId) {
        return;
      }

      const record = session.records.find(r => r.studentId === student.id);
      if (!record) return;

      const subId = session.subjectId;
      if (!subjectWise[subId] && subjectMap.has(subId)) {
        subjectWise[subId] = {
          subject: subjectMap.get(subId)!,
          total: 0,
          attended: 0,
          percentage: 0,
        };
      }

      totalClasses++;
      if (subjectWise[subId]) {
        subjectWise[subId].total++;
      }

      switch (record.status) {
        case 'present':
          attendedClasses++;
          if (subjectWise[subId]) subjectWise[subId].attended++;
          break;
        case 'late':
          // Late counts as attended in general college roll calls, but tracked
          attendedClasses++;
          lateClasses++;
          if (subjectWise[subId]) subjectWise[subId].attended++;
          break;
        case 'excused':
          // Excused/Medical duty leave is marked excused
          excusedClasses++;
          attendedClasses++; // Duty leave counts towards attendance
          if (subjectWise[subId]) subjectWise[subId].attended++;
          break;
        case 'absent':
        default:
          absentClasses++;
          break;
      }
    });

    // Compute subject percentages
    Object.keys(subjectWise).forEach(subId => {
      const data = subjectWise[subId];
      data.percentage = data.total > 0 ? Math.round((data.attended / data.total) * 1000) / 10 : 100;
    });

    const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 1000) / 10 : 100;

    return {
      student,
      totalClasses,
      attendedClasses,
      absentClasses,
      lateClasses,
      excusedClasses,
      percentage,
      isDefaulter: percentage < 75,
      isSevereDefaulter: percentage < 65,
      subjectWise,
    };
  });
}

/**
 * Calculates how many classes a student can bunk or needs to attend
 * to maintain or reach a given target percentage (default: 75%)
 */
export function calculateBunkStats(attended: number, total: number, targetPercentage = 75) {
  if (total === 0) {
    return {
      canBunk: 0,
      mustAttend: 0,
      currentPercentage: 100,
      status: 'safe',
      message: 'No classes conducted yet.',
    };
  }

  const currentPercentage = Math.round((attended / total) * 1000) / 10;
  const target = targetPercentage / 100;

  if (currentPercentage >= targetPercentage) {
    // Current is above target: how many consecutive classes can they skip?
    // attended / (total + x) >= target => attended >= target * (total + x)
    // x <= (attended / target) - total
    const canBunk = Math.max(0, Math.floor((attended / target) - total));
    return {
      canBunk,
      mustAttend: 0,
      currentPercentage,
      status: canBunk > 0 ? 'safe' : 'borderline',
      message: canBunk > 0
        ? `You can safely miss the next ${canBunk} class${canBunk === 1 ? '' : 'es'} without dropping below ${targetPercentage}%.`
        : `You are exactly on track! Do not miss any upcoming class.`,
    };
  } else {
    // Current is below target: how many consecutive classes must they attend?
    // (attended + x) / (total + x) >= target => attended + x >= target * total + target * x
    // x * (1 - target) >= target * total - attended
    // x >= (target * total - attended) / (1 - target)
    const mustAttend = Math.ceil((target * total - attended) / (1 - target));
    return {
      canBunk: 0,
      mustAttend: Math.max(1, mustAttend),
      currentPercentage,
      status: currentPercentage < 65 ? 'critical' : 'warning',
      message: `You must attend the next ${mustAttend} consecutive class${mustAttend === 1 ? '' : 'es'} to reach ${targetPercentage}%.`,
    };
  }
}

/**
 * Export summary data as CSV formatted string
 */
export function generateAttendanceCSV(summaries: StudentAttendanceSummary[], subjects: Subject[]): string {
  const header = [
    'Roll Number',
    'Registration No',
    'Student Name',
    'Department',
    'Semester',
    'Total Classes',
    'Attended Classes',
    'Absent Classes',
    'Late Classes',
    'Medical/Excused',
    'Overall Percentage (%)',
    'Status',
    ...subjects.map(s => `${s.code} - ${s.name} (%)`),
  ];

  const rows = summaries.map(s => {
    const statusText = s.isSevereDefaulter
      ? 'CRITICAL DEFAULTER (<65%)'
      : s.isDefaulter
      ? 'DEFAULTER (<75%)'
      : 'ELIGIBLE (>=75%)';

    const subjectScores = subjects.map(sub => {
      const subData = s.subjectWise[sub.id];
      return subData ? `${subData.percentage}% (${subData.attended}/${subData.total})` : 'N/A';
    });

    return [
      `"${s.student.rollNo}"`,
      `"${s.student.regNo || ''}"`,
      `"${s.student.name}"`,
      `"${s.student.department}"`,
      `"Sem ${s.student.semester}"`,
      s.totalClasses,
      s.attendedClasses,
      s.absentClasses,
      s.lateClasses,
      s.excusedClasses,
      `${s.percentage}%`,
      `"${statusText}"`,
      ...subjectScores.map(val => `"${val}"`),
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
}

/**
 * Generates an official WhatsApp / SMS notification text for a student/parent
 */
export function generateDefaulterNotice(summary: StudentAttendanceSummary): string {
  const student = summary.student;
  const status = summary.isSevereDefaulter ? 'URGENT DEBARMENT NOTICE' : 'ATTENDANCE SHORTAGE NOTICE';

  return `*${status} - DEPARTMENT OF ${student.department.toUpperCase()}*
----------------------------------------
Dear Parent / Student,

This is an official notice regarding the attendance shortage of:
*Student Name:* ${student.name}
*Roll No:* ${student.rollNo}
*Semester:* ${student.semester} - Sec ${student.section}

*Attendance Record:*
- Total Lectures Held: ${summary.totalClasses}
- Lectures Attended: ${summary.attendedClasses}
- Lectures Absent: ${summary.absentClasses}
- *Current Attendance:* ${summary.percentage}%
- *Minimum Required:* 75.0%

${summary.percentage < 65 
  ? '⚠️ *CRITICAL ALERT:* The student attendance is below 65%. As per University & AICTE regulations, students below 75% without authorized medical condonation are liable to be DEBARRED from appearing in End-Semester Examinations.' 
  : '⚠️ *WARNING:* Attendance is below the mandatory 75% threshold. Please ensure regular attendance in all upcoming classes to avoid debarment.'}

Please contact the Faculty Proctor / HOD immediately.
- Head of Department (HOD)
`;
}
