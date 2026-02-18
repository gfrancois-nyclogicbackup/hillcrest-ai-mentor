import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Assignment, Submission } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { BookOpen, Loader2 } from 'lucide-react';

export default function StudentAssignments() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [loading, setLoading] = useState(true);

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
      const subMap: Record<string, Submission> = {};
      subs?.forEach((s: any) => { subMap[s.assignment_id] = s as Submission; });
      setSubmissions(subMap);
      setLoading(false);
    };
    load();
  }, [profile]);

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground">Period {profile?.class_period}</p>
      </div>

      {assignments.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No assignments yet</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map(a => {
            const sub = submissions[a.id];
            const isGraded = sub?.grade != null;
            return (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{a.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{a.description?.slice(0, 100)}</p>
                  </div>
                  <Badge variant={isGraded ? 'default' : sub ? 'secondary' : 'outline'}>
                    {isGraded ? `${sub.grade}%` : sub ? 'Submitted' : 'Pending'}
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Due {format(new Date(a.due_date), 'MMM d, yyyy')} · <span className="capitalize">{a.submission_type.replace('_', ' ')}</span>
                  </div>
                  <Button size="sm" variant={sub ? 'outline' : 'default'} onClick={() => navigate(`/submit/${a.id}`)}>
                    {sub ? 'View' : 'Submit'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
