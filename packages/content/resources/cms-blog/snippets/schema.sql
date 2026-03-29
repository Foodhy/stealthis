create table authors (
  id bigint primary key generated always as identity,
  email text not null unique,
  full_name text not null,
  bio text,
  created_at timestamptz not null default now()
);

create table posts (
  id bigint primary key generated always as identity,
  author_id bigint not null references authors(id),
  slug text not null unique,
  title text not null,
  excerpt text,
  body_md text not null,
  status text not null check (status in ('draft','review','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tags (
  id bigint primary key generated always as identity,
  slug text not null unique,
  label text not null
);

create table post_tags (
  post_id bigint not null references posts(id) on delete cascade,
  tag_id bigint not null references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table media_assets (
  id bigint primary key generated always as identity,
  author_id bigint not null references authors(id),
  url text not null,
  kind text not null check (kind in ('image','video','file')),
  alt_text text,
  created_at timestamptz not null default now()
);

create table post_media (
  post_id bigint not null references posts(id) on delete cascade,
  media_id bigint not null references media_assets(id) on delete cascade,
  role text not null check (role in ('cover','inline','attachment')),
  primary key (post_id, media_id)
);

create index idx_posts_status_published_at on posts(status, published_at desc);
create index idx_posts_author_created_at on posts(author_id, created_at desc);
