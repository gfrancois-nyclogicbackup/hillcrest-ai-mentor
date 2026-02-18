import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from '@/components/student/StudentDashboard';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';

export default function DashboardPage() {
  const { role } = useAuth();
  return role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}
