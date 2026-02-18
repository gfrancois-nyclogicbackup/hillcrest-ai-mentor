import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Assignment } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);
  const [avgGrade, setAvgGrade] = useState<number | null>(null);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data: a } = await supabase.from('assignments').select('*').eq('status', 'active');
      const filtered = (a || []).filter((item: any) => {
        const periods = typeof item.class_periods === 'string' ? JSON.parse(item.class_periods) : item.class_periods;
        return periods?.includes(profile.class_period);
      });
      setAssignments(filtered as Assignment[]);

      const { data: subs } = await supabase.from('submissions').select('*').eq('student_id', profile.id);
      setSubmittedCount(subs?.length || 0);
      const graded = subs?.filter((s: any) => s.grade != null) || [];
      setGradedCount(graded.length);
      if (graded.length > 0) {
        setAvgGrade(Math.round(graded.reduce((sum: number, s: any) => sum + s.grade, 0) / graded.length));
      }
    };
    load();
  }, [profile]);

  const stats = [
    { label: 'Active Assignments', value: assignments.length, icon: BookOpen, color: 'text-primary' },
    { label: 'Submitted', value: submittedCount, icon: CheckCircle, color: 'text-accent' },
    { label: 'Graded', value: gradedCount, icon: Clock, color: 'text-warning' },
    { label: 'Avg Grade', value: avgGrade != null ? `${avgGrade}%` : '—', icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name}</h1>
        <p className="text-muted-foreground">Period {profile?.class_period} · Student Dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
          <CardDescription>Your latest active assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">No active assignments</p>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.description?.slice(0, 80)}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{a.submission_type.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
