import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CLASS_PERIODS } from '@/types/database';
import { BookOpen, Users, FileText, TrendingUp } from 'lucide-react';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ assignments: 0, students: 0, submissions: 0, avgGrade: 0 });

  useEffect(() => {
    const load = async () => {
      const [a, s, sub] = await Promise.all([
        supabase.from('assignments').select('id', { count: 'exact' }),
        supabase.from('user_profiles').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('submissions').select('grade'),
      ]);
      const graded = (sub.data || []).filter((x: any) => x.grade != null);
      const avg = graded.length ? Math.round(graded.reduce((sum: number, x: any) => sum + x.grade, 0) / graded.length) : 0;
      setStats({
        assignments: a.count || 0,
        students: s.count || 0,
        submissions: sub.data?.length || 0,
        avgGrade: avg,
      });
    };
    load();
  }, []);

  const cards = [
    { label: 'Assignments', value: stats.assignments, icon: BookOpen, color: 'text-primary' },
    { label: 'Students', value: stats.students, icon: Users, color: 'text-accent' },
    { label: 'Submissions', value: stats.submissions, icon: FileText, color: 'text-primary' },
    { label: 'Avg Grade', value: `${stats.avgGrade}%`, icon: TrendingUp, color: 'text-accent' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Overview of all classes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <c.icon className={`h-8 w-8 ${c.color}`} />
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Class Periods</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {CLASS_PERIODS.map(p => (
              <div key={p} className="rounded-xl border bg-muted/50 px-6 py-4 text-center">
                <p className="text-2xl font-bold">Period {p}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
