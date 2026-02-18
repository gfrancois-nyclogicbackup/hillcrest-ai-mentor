import { useAuth } from '@/contexts/AuthContext';
import StudentAssignments from '@/components/student/StudentAssignments';
import TeacherAssignments from '@/components/teacher/TeacherAssignments';

export default function AssignmentsPage() {
  const { role } = useAuth();
  return role === 'teacher' ? <TeacherAssignments /> : <StudentAssignments />;
}
