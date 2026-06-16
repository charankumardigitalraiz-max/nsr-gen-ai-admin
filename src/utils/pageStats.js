import {
  BookOpen,
  Users,
  MessageSquare,
  Building2,
  Contact,
  ClipboardList,
  GraduationCap,
  Clock,
  UserCheck,
  Layers,
} from 'lucide-react';
import { ROUTES } from '../constants/routes';

function studentsTotal(counts) {
  return (
    (counts.studentsPlaced ?? 0) +
    (counts.studentsJobPending ?? 0) +
    (counts.studentsStudying ?? 0)
  );
}

function stat(label, value, icon, tone = 'emerald') {
  return { label, value: value ?? 0, icon, tone };
}

const PAGE_STATS = {
  [ROUTES.overview]: (c) => [
    stat('Active Courses', c.courses, BookOpen, 'emerald'),
    stat('Total Students', studentsTotal(c), Users, 'teal'),
    stat('New Enrollments', c.enrollmentsNew, ClipboardList, 'forest'),
    stat('Hiring Partners', c.partner, Building2, 'mint'),
  ],
  [ROUTES.courses]: (c) => [
    stat('Active Courses', c.courses, BookOpen, 'emerald'),
    stat('Enrollment Forms', c.enrollments, ClipboardList, 'teal'),
    stat('New Leads', c.enrollmentsNew, Clock, 'forest'),
  ],
  [ROUTES.studentsAll]: (c) => [
    stat('All Students', studentsTotal(c), Users, 'emerald'),
    stat('Placed', c.studentsPlaced, UserCheck, 'teal'),
    stat('Job Pending', c.studentsJobPending, Hourglass, 'forest'),
    stat('Studying', c.studentsStudying, GraduationCap, 'mint'),
  ],
  [ROUTES.studentsPlaced]: (c) => [
    stat('Placed Students', c.studentsPlaced, UserCheck, 'emerald'),
    stat('All Students', studentsTotal(c), Users, 'teal'),
    stat('Hiring Partners', c.partner, Building2, 'forest'),
  ],
  [ROUTES.studentsJobPending]: (c) => [
    stat('Job Pending', c.studentsJobPending, Hourglass, 'emerald'),
    stat('Placed', c.studentsPlaced, UserCheck, 'teal'),
    stat('Studying', c.studentsStudying, GraduationCap, 'forest'),
  ],
  [ROUTES.studentsStudying]: (c) => [
    stat('Studying', c.studentsStudying, GraduationCap, 'emerald'),
    stat('Job Pending', c.studentsJobPending, Hourglass, 'teal'),
    stat('Placed', c.studentsPlaced, UserCheck, 'forest'),
  ],
  [ROUTES.partners]: (c) => [
    stat('Hiring Partners', c.partner, Building2, 'emerald'),
    stat('Placed Students', c.studentsPlaced, UserCheck, 'teal'),
  ],
  [ROUTES.staff]: (c) => [
    stat('Staff Members', c.staff, Contact, 'emerald'),
  ],
  [ROUTES.recruiter]: (c) => [
    stat('Recruiter Quotes', c.recruiter, MessageSquare, 'emerald'),
    stat('Student Reviews', c.video, MessageSquare, 'teal'),
  ],
  [ROUTES.studentTestimonials]: (c) => [
    stat('Student Reviews', c.video, MessageSquare, 'emerald'),
    stat('Placed Students', c.studentsPlaced, UserCheck, 'teal'),
    stat('Recruiter Quotes', c.recruiter, MessageSquare, 'forest'),
  ],
  [ROUTES.enrollments]: (c) => [
    stat('Total Submissions', c.enrollments, ClipboardList, 'emerald'),
    stat('New / Unread', c.enrollmentsNew, Clock, 'teal'),
    stat('Active Courses', c.courses, BookOpen, 'forest'),
  ],
  [ROUTES.training]: (c) => [
    stat('Training Services', c.trainingServices, Layers, 'emerald'),
    stat('Active Courses', c.courses, BookOpen, 'teal'),
  ],
};

export function getPageStats(pathname, counts = {}) {
  const resolver = PAGE_STATS[pathname];
  if (!resolver) return null;
  return resolver(counts);
}
