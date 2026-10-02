-- All demonstration records are drafts. Run explicitly after migrations.
insert into public.content_entries(kind,slug,title,description,body,data,status,is_demo,display_order) values
('settings','site','{"zh-Hant":"神學教育服務團","zh-Hans":"神学教育服务团","en":"Theological Education Service Corps Ltd."}','{}','{}','{"auto_publish_public_uploads":false}','draft',true,0),
('ministry','demo-ministry','{"zh-Hant":"DEMO / 神學教育","zh-Hans":"DEMO / 神学教育","en":"DEMO / Theological education"}','{"zh-Hant":"[待輸入正式內容]","zh-Hans":"[待输入正式内容]","en":"[Awaiting official content]"}','{}','{}','draft',true,0),
('prayer','demo-prayer','{"zh-Hant":"DEMO / 代禱信","zh-Hans":"DEMO / 代祷信","en":"DEMO / Prayer letter"}','{}','{}','{"author":"暉牧"}','draft',true,0),
('course','demo-course','{"zh-Hant":"DEMO / 課程","zh-Hans":"DEMO / 课程","en":"DEMO / Course"}','{}','{}','{}','draft',true,0),
('person','fai','{"zh-Hant":"Fai","zh-Hans":"Fai","en":"Fai"}','{}','{}','{"person_group":"staff"}','draft',true,0),
('person','lok','{"zh-Hant":"Lok","zh-Hans":"Lok","en":"Lok"}','{}','{}','{"person_group":"staff"}','draft',true,1),
('person','yin','{"zh-Hant":"Yin","zh-Hans":"Yin","en":"Yin"}','{}','{}','{"person_group":"staff"}','draft',true,2),
('donation','default','{"zh-Hant":"[待輸入奉獻方式]","zh-Hans":"[待输入奉献方式]","en":"[Awaiting donation instructions]"}','{}','{}','{}','draft',true,0)
on conflict(kind,slug) do nothing;
insert into public.content_entries(kind,slug,title,description,data,is_demo,display_order)
select 'person','board-'||n,'{"zh-Hant":"[待輸入正式內容]","zh-Hans":"[待输入正式内容]","en":"[Awaiting official content]"}'::jsonb,'{}'::jsonb,'{"person_group":"board"}'::jsonb,true,n from generate_series(1,4) n on conflict(kind,slug) do nothing;
-- No fake resource/file: scripts/seed-resource.mjs uploads an explicitly labelled demo PDF as pending.
