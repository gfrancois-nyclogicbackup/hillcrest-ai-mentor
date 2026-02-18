import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment, Submission } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Loader2, Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function SubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [writtenContent, setWrittenContent] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const load = async () => {
      const { data: a } = await supabase.from('assignments').select('*').eq('id', id).single();
      if (a) {
        // Parse JSON fields
        const parsed: Assignment = {
          ...a,
          class_periods: typeof a.class_periods === 'string' ? JSON.parse(a.class_periods) : a.class_periods,
          mc_options: a.mc_options ? (typeof a.mc_options === 'string' ? JSON.parse(a.mc_options) : a.mc_options) : undefined,
          form_fields: a.form_fields ? (typeof a.form_fields === 'string' ? JSON.parse(a.form_fields) : a.form_fields) : undefined,
        };
        setAssignment(parsed);
      }
      const { data: s } = await supabase.from('submissions').select('*').eq('assignment_id', id).eq('student_id', user.id).single();
      if (s) setExistingSubmission(s as Submission);
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleSubmit = async () => {
    if (!assignment || !user) return;
    setSubmitting(true);

    let content: string | null = null;
    let fileUrl: string | undefined;

    if (assignment.submission_type === 'written') {
      content = writtenContent;
    } else if (assignment.submission_type === 'multiple_choice') {
      content = selectedOption;
    } else if (assignment.submission_type === 'file_upload' && file) {
      const path = `submissions/${user.id}/${assignment.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from('submissions').upload(path, file);
      if (uploadError) { toast.error('Upload failed'); setSubmitting(false); return; }
      const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(path);
      fileUrl = urlData.publicUrl;
      content = file.name;
    } else if (assignment.submission_type === 'form') {
      content = JSON.stringify(formData);
    }

    const { error } = await supabase.from('submissions').insert({
      assignment_id: assignment.id,
      student_id: user.id,
      content,
      file_url: fileUrl ?? null,
      form_data: assignment.submission_type === 'form' ? formData : null,
      selected_option: assignment.submission_type === 'multiple_choice' ? selectedOption : null,
    });

    if (error) toast.error('Submission failed');
    else {
      toast.success('Submitted successfully!');
      navigate('/assignments');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!assignment) return <div className="p-8 text-center text-muted-foreground">Assignment not found</div>;

  const isGraded = existingSubmission?.grade != null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription className="mt-1">{assignment.description}</CardDescription>
            </div>
            <Badge variant={existingSubmission ? (isGraded ? 'default' : 'secondary') : 'outline'}>
              {isGraded ? `Graded: ${existingSubmission.grade}%` : existingSubmission ? 'Submitted' : 'Pending'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')} · Type: <span className="capitalize">{assignment.submission_type.replace('_', ' ')}</span>
          </p>
        </CardHeader>
      </Card>

      {existingSubmission && isGraded && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg">Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary mb-2">{existingSubmission.grade}%</p>
            <p className="text-sm whitespace-pre-wrap">{existingSubmission.feedback || 'No feedback provided.'}</p>
          </CardContent>
        </Card>
      )}

      {!existingSubmission && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignment.submission_type === 'written' && (
              <div className="space-y-2">
                <Label>Written Response</Label>
                <Textarea
                  rows={8}
                  value={writtenContent}
                  onChange={e => setWrittenContent(e.target.value)}
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {assignment.submission_type === 'multiple_choice' && assignment.mc_options && (
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3">
                {assignment.mc_options.map(opt => (
                  <div key={opt.id} className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                    <RadioGroupItem value={opt.id} id={opt.id} />
                    <Label htmlFor={opt.id} className="cursor-pointer flex-1">{opt.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {assignment.submission_type === 'file_upload' && (
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="flex items-center gap-4">
                  <Input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
                </div>
              </div>
            )}

            {assignment.submission_type === 'form' && assignment.form_fields && (
              <div className="space-y-4">
                {assignment.form_fields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label>{field.label}{field.required && ' *'}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        value={formData[field.id] || ''}
                        onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                        required={field.required}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Assignment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
