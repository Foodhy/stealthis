create table users (
  id bigint primary key generated always as identity,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('student','instructor','admin')),
  created_at timestamptz not null default now()
);

create table courses (
  id bigint primary key generated always as identity,
  instructor_id bigint not null references users(id),
  slug text not null unique,
  title text not null,
  level text not null check (level in ('beginner','intermediate','advanced')),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table lessons (
  id bigint primary key generated always as identity,
  slug text not null unique,
  title text not null,
  duration_minutes integer not null check (duration_minutes > 0)
);

create table course_lessons (
  course_id bigint not null references courses(id) on delete cascade,
  lesson_id bigint not null references lessons(id),
  position integer not null check (position > 0),
  primary key (course_id, lesson_id),
  unique (course_id, position)
);

create table enrollments (
  id bigint primary key generated always as identity,
  course_id bigint not null references courses(id) on delete cascade,
  student_id bigint not null references users(id) on delete cascade,
  status text not null check (status in ('active','completed','cancelled')),
  enrolled_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create table lesson_progress (
  enrollment_id bigint not null references enrollments(id) on delete cascade,
  lesson_id bigint not null references lessons(id),
  completed_at timestamptz,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  primary key (enrollment_id, lesson_id)
);

create index idx_courses_instructor on courses(instructor_id);
create index idx_enrollments_student_status on enrollments(student_id, status);
