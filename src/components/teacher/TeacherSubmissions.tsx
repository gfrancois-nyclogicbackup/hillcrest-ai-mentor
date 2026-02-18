import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function TeacherSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('submissions')
        .select('*, assignments(title, submission_type), user_profiles:student_id(full_name, class_period)')
        .order('submitted_at', { ascending: false });
      setSubmissions(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === 'all' ? submissions
    : filter === 'graded' ? submissions.filter(s => s.grade != null)
    : submissions.filter(s => s.grade == null);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">View all student submissions</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              No submissions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.user_profiles?.full_name || '—'}</TableCell>
                    <TableCell>{s.assignments?.title || '—'}</TableCell>
                    <TableCell><Badge variant="secondary">P{s.user_profiles?.class_period}</Badge></TableCell>
                    <TableCell>{format(new Date(s.submitted_at), 'MMM d, h:mm a')}</TableCell>
                    <TableCell>
                      {s.grade != null ? (
                        <Badge>{s.grade}%</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
