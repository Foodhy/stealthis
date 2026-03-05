insert into authors (email, full_name, bio)
values
  ('writer@cms.dev', 'Writer One', 'Writes about engineering systems'),
  ('editor@cms.dev', 'Editor Two', 'Focus on content quality');

insert into posts (author_id, slug, title, excerpt, body_md, status, published_at)
values
  (1, 'intro-to-schema-design', 'Intro to Schema Design', 'How to model entities and constraints', '# Intro\nModel entities first.', 'published', now() - interval '2 days'),
  (2, 'draft-performance-notes', 'Draft: Performance Notes', 'Index planning basics', '# Draft\nTBD.', 'draft', null);

insert into tags (slug, label)
values
  ('database', 'Database'),
  ('sql', 'SQL'),
  ('architecture', 'Architecture');

insert into post_tags (post_id, tag_id)
values
  (1, 1),
  (1, 2),
  (2, 3);

insert into media_assets (author_id, url, kind, alt_text)
values
  (1, 'https://cdn.example.com/cover-schema.png', 'image', 'Schema cover image');

insert into post_media (post_id, media_id, role)
values
  (1, 1, 'cover');
