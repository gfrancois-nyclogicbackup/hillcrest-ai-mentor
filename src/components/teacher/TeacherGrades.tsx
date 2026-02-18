import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherGrades() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('submissions')
      .select('*, assignments(title, rubric), user_profiles:student_id(full_name, class_period)')
      .order('submitted_at', { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGrade = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from('submissions').update({
      grade: Number(grade),
      feedback,
      graded_at: new Date().toISOString(),
      graded_by: 'teacher',
      teacher_override: true,
    }).eq('id', selected.id);
    if (error) toast.error('Failed to save grade');
    else { toast.success('Grade saved'); setSelected(null); load(); }
    setSaving(false);
  };

  const openGrade = (sub: any) => {
    setSelected(sub);
    setGrade(sub.grade?.toString() || '');
    setFeedback(sub.feedback || '');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Grades</h1>
        <p className="text-muted-foreground">Review and override grades</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground/50" />
              No submissions to grade
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Graded By</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.user_profiles?.full_name}</TableCell>
                    <TableCell>{s.assignments?.title}</TableCell>
                    <TableCell><Badge variant="secondary">P{s.user_profiles?.class_period}</Badge></TableCell>
                    <TableCell>{s.grade != null ? `${s.grade}%` : '—'}</TableCell>
                    <TableCell>
                      {s.graded_by ? (
                        <Badge variant={s.teacher_override ? 'default' : 'secondary'} className="capitalize">{s.graded_by}</Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openGrade(s)}>
                        {s.grade != null ? 'Override' : 'Grade'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selected.user_profiles?.full_name}</p>
                <p className="text-sm text-muted-foreground">{selected.assignments?.title}</p>
              </div>
              {selected.content && (
                <div className="rounded-lg bg-muted p-3">
                  <Label className="text-xs text-muted-foreground">Student Response</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selected.content}</p>
                </div>
              )}
              {selected.assignments?.rubric && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <Label className="text-xs text-muted-foreground">Rubric</Label>
                  <p className="mt-1 text-sm">{selected.assignments.rubric}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Grade (0-100)</Label>
                <Input type="number" min={0} max={100} value={grade} onChange={e => setGrade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea rows={4} value={feedback} onChange={e => setFeedback(e.target.value)} />
              </div>
              <Button onClick={handleGrade} disabled={saving || !grade} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Grade
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
