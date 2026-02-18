import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment, CLASS_PERIODS, SubmissionType } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TeacherAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submissionType, setSubmissionType] = useState<SubmissionType>('written');
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [rubric, setRubric] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
    setAssignments((data || []) as Assignment[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setDueDate(''); setSubmissionType('written');
    setSelectedPeriods([]); setRubric(''); setEditingId(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      title, description, due_date: dueDate, submission_type: submissionType,
      class_periods: selectedPeriods, rubric: rubric || null,
      created_by: user.id, status: 'active' as const,
    };

    if (editingId) {
      const { error } = await supabase.from('assignments').update(payload).eq('id', editingId);
      if (error) toast.error('Update failed');
      else toast.success('Assignment updated');
    } else {
      const { error } = await supabase.from('assignments').insert(payload);
      if (error) toast.error('Creation failed');
      else toast.success('Assignment created');
    }
    setSaving(false);
    setDialogOpen(false);
    resetForm();
    load();
  };

  const handleEdit = (a: Assignment) => {
    setTitle(a.title); setDescription(a.description); setDueDate(a.due_date.split('T')[0]);
    setSubmissionType(a.submission_type); setSelectedPeriods(a.class_periods);
    setRubric(a.rubric || ''); setEditingId(a.id); setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else { toast.success('Deleted'); load(); }
  };

  const togglePeriod = (p: number) => {
    setSelectedPeriods(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Create and manage assignments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Assignment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Submission Type</Label>
                <Select value={submissionType} onValueChange={v => setSubmissionType(v as SubmissionType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="written">Written Response</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="file_upload">File Upload</SelectItem>
                    <SelectItem value="form">Form-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class Periods</Label>
                <div className="flex flex-wrap gap-3">
                  {CLASS_PERIODS.map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={selectedPeriods.includes(p)} onCheckedChange={() => togglePeriod(p)} />
                      <span className="text-sm">Period {p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rubric / Criteria (for AI grading)</Label>
                <Textarea rows={3} value={rubric} onChange={e => setRubric(e.target.value)} placeholder="Describe grading criteria..." />
              </div>
              <Button onClick={handleSave} disabled={saving || !title || !dueDate || selectedPeriods.length === 0} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Update' : 'Create'} Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No assignments created yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => {
            const periods = typeof a.class_periods === 'string' ? JSON.parse(a.class_periods as any) : a.class_periods;
            return (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due {format(new Date(a.due_date), 'MMM d, yyyy')} · <span className="capitalize">{a.submission_type.replace('_', ' ')}</span>
                    </p>
                    <div className="flex gap-1">
                      {(periods || []).map((p: number) => (
                        <Badge key={p} variant="secondary" className="text-xs">P{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
