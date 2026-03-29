-- 1) Latest published posts with author
select
  p.slug,
  p.title,
  a.full_name as author,
  p.published_at
from posts p
join authors a on a.id = p.author_id
where p.status = 'published'
order by p.published_at desc
limit 20;

-- 2) Post count by tag
select
  t.slug,
  t.label,
  count(pt.post_id) as post_count
from tags t
left join post_tags pt on pt.tag_id = t.id
group by t.id
order by post_count desc, t.slug;

-- 3) Assets attached to published posts
select
  p.slug,
  m.url,
  pm.role
from post_media pm
join posts p on p.id = pm.post_id
join media_assets m on m.id = pm.media_id
where p.status = 'published';
