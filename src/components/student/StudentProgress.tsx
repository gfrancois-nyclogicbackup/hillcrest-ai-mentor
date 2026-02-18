import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Submission } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function StudentProgress() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data } = await supabase
        .from('submissions')
        .select('*, assignments(title)')
        .eq('student_id', profile.id)
        .not('grade', 'is', null)
        .order('graded_at', { ascending: true });
      setSubmissions((data || []) as any);
      setLoading(false);
    };
    load();
  }, [profile]);

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const graded = submissions.filter(s => s.grade != null);
  const avgGrade = graded.length ? Math.round(graded.reduce((s, x) => s + (x.grade || 0), 0) / graded.length) : 0;
  const chartData = graded.map((s: any) => ({
    name: s.assignments?.title?.slice(0, 15) || 'Assignment',
    grade: s.grade,
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Track your performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6 text-center">
          <p className="text-4xl font-bold text-primary">{avgGrade}%</p>
          <p className="text-sm text-muted-foreground">Average Grade</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-4xl font-bold">{graded.length}</p>
          <p className="text-sm text-muted-foreground">Graded Assignments</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-4xl font-bold">{submissions.length}</p>
          <p className="text-sm text-muted-foreground">Total Submissions</p>
        </CardContent></Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Grade Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="grade" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {graded.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          No graded assignments yet
        </CardContent></Card>
      )}
    </div>
  );
}
