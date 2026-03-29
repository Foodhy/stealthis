insert into users (email, full_name, role)
values
  ('teach@academy.dev', 'Instructor Kim', 'instructor'),
  ('student1@academy.dev', 'Student One', 'student'),
  ('student2@academy.dev', 'Student Two', 'student');

insert into courses (instructor_id, slug, title, level, is_published)
values
  (1, 'sql-for-builders', 'SQL for Builders', 'beginner', true);

insert into lessons (slug, title, duration_minutes)
values
  ('intro-relational', 'Intro to Relational Modeling', 18),
  ('joins-ctes', 'Joins and CTE Basics', 24),
  ('indexing-101', 'Indexing Fundamentals', 21);

insert into course_lessons (course_id, lesson_id, position)
values
  (1, 1, 1),
  (1, 2, 2),
  (1, 3, 3);

insert into enrollments (course_id, student_id, status)
values
  (1, 2, 'active'),
  (1, 3, 'completed');

insert into lesson_progress (enrollment_id, lesson_id, completed_at, progress_percent)
values
  (1, 1, now() - interval '1 day', 100),
  (1, 2, null, 45),
  (2, 1, now() - interval '7 days', 100),
  (2, 2, now() - interval '6 days', 100),
  (2, 3, now() - interval '5 days', 100);
