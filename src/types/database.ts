export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  class_period?: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  class_periods: number[];
  submission_type: SubmissionType;
  rubric?: string;
  mc_options?: McOption[];
  form_fields?: FormFieldDef[];
  created_by: string;
  created_at: string;
  status: 'active' | 'draft' | 'archived';
}

export type SubmissionType = 'written' | 'multiple_choice' | 'file_upload' | 'form';

export interface McOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface FormFieldDef {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date';
  required: boolean;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  selected_option?: string;
  file_url?: string;
  form_data?: Record<string, string>;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
  graded_by?: 'ai' | 'teacher';
  teacher_override?: boolean;
}

export const CLASS_PERIODS = [1, 5, 6, 13, 14] as const;
