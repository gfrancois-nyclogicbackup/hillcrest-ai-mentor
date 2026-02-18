

# Hillcrest Scholar AI - Student Learning Platform

## Overview
A full-featured student engagement and assessment platform for NYC teachers. Students log in, view assignments by class period, submit work in multiple formats, and receive AI-powered grading and feedback. Teachers have full administrative control.

---

## 1. Authentication & Role-Based Access
- Email/password login for both students and teachers
- Role-based routing: students see the student dashboard, teachers see the admin panel
- Roles stored securely in a separate `user_roles` table (student vs teacher)
- Connect to the user's existing Supabase database for all auth and data

## 2. Student Dashboard
- After login, students see their class period and active assignments
- Assignments organized by class period (5 periods: 1, 5, 6, 13, + one more TBD)
- Each assignment shows title, description, due date, and submission status
- Clear visual indicators for pending, submitted, and graded assignments

## 3. Assignment Submission Interface
Support for all four submission types:
- **Written responses** — rich text area for typed answers
- **Multiple choice** — quiz-style questions with selectable options
- **File uploads** — document/image upload via Supabase Storage
- **Form-based** — structured forms with specific fields

Each assignment specifies which submission type(s) it accepts.

## 4. AI-Powered Grading & Feedback
- When a student submits work, an edge function sends it to the Lovable AI Gateway for grading
- AI evaluates the submission against the assignment rubric/criteria
- Returns a grade and detailed written feedback
- Results are stored in the database and displayed to the student

## 5. Student Progress & Results Dashboard
- Students can view all their graded assignments with scores and feedback
- Progress tracking showing performance trends across assignments
- Summary stats (average grade, assignments completed, etc.)

## 6. Teacher Admin Panel (Full Control)
- **View all submissions** — browse by class period, student, or assignment
- **Create & edit assignments** — set title, description, type, rubric, due date, and target period(s)
- **Override AI grades** — teachers can adjust grades and add their own feedback
- **Manage students** — view student roster by period, see individual student progress
- **Class overview** — aggregate stats per period (completion rates, average scores)

## 7. Navigation & Layout
- Sidebar navigation with role-appropriate menu items
- Student view: Dashboard, My Assignments, My Progress
- Teacher view: Dashboard, Assignments, Students, Submissions, Grades
- Responsive design for desktop and tablet use

