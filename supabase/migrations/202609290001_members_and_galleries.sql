-- Member access and public teasers for private content.
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('member','editor','super_admin'));
alter table public.profiles add column last_seen_at timestamptz;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as
$$select exists(select 1 from profiles where id=auth.uid() and role in ('editor','super_admin'))$$;
create function public.has_member_access() returns boolean language sql stable security definer set search_path=public as
$$select exists(select 1 from profiles where id=auth.uid() and role in ('member','editor','super_admin'))$$;

alter table public.content_entries add column is_private boolean not null default false;
alter table public.content_entries drop constraint content_entries_kind_check;
alter table public.content_entries add constraint content_entries_kind_check check(kind in ('page','person','ministry','video','course','course_category','project','project_section','project_document','prayer','poster','resource_category','contact','donation','settings'));

drop policy content_read on public.content_entries;
create policy content_read on public.content_entries for select to anon,authenticated using
 ((deleted_at is null and status='published' and published_at<=now() and (not is_private or public.has_member_access())) or public.is_admin());

-- The view intentionally exposes no private body or attachment IDs. It also powers
-- public listings where the private item title and description remain visible.
create view public.public_content_entries with (security_barrier=true) as
select id,kind,slug,title,description,
 case when is_private then '{}'::jsonb else body end as body,
 case when is_private then jsonb_build_object('image_id',data->'image_id','category',data->'category','project_status',data->'project_status','author',data->'author') else data end as data,
 status,published_at,display_order,featured,is_demo,is_private,created_at,updated_at,deleted_at
from public.content_entries
where deleted_at is null and status='published' and published_at<=now();
grant select on public.public_content_entries to anon,authenticated;

-- Read-only, named projections of the existing CMS schema for integrations.
create view public.team_members with (security_barrier=true) as
select id,slug,title,description,data->'role' as role,data->'biography' as biography,
 data->>'image_id' as image_id,display_order from public.public_content_entries where kind='person';
create view public.book_projects with (security_barrier=true) as
select id,slug,title,description,data->>'category' as category,data->>'project_status' as project_status,
 data->>'image_id' as image_id,published_at,is_private from public.public_content_entries where kind in ('project','project_document');
create view public.prayer_letters with (security_barrier=true) as
select id,slug,title,description,data->>'author' as author,published_at,is_private
from public.public_content_entries where kind='prayer';
grant select on public.team_members,public.book_projects,public.prayer_letters to anon,authenticated;

create function public.touch_profile() returns void language sql security definer set search_path=public as
$$update profiles set last_seen_at=now() where id=auth.uid()$$;
revoke all on function public.touch_profile() from public,anon;
grant execute on function public.touch_profile() to authenticated;

-- Supplied TESC biographies; Joyce's unpublished biography stays clearly marked.
insert into public.content_entries(kind,slug,title,description,body,data,status,published_at,display_order)
values
 ('person','leung','{"zh-Hant":"梁家麟博士","en":"Dr. Leung"}','{}','{}','{"person_group":"board","role":{"zh-Hant":"創辦人","en":"Founder"},"biography":{"zh-Hant":"香港建道神學院榮休教授、榮譽院長，從事神學教育三十多年。","en":"Professor emeritus at Alliance Bible Seminary with over 30 years in theological education."}}','published',now(),1),
 ('person','fai','{"zh-Hant":"吳健暉牧師","en":"Fai"}','{}','{}','{"person_group":"staff","role":{"zh-Hant":"總幹事","en":"General Secretary"},"biography":{"zh-Hant":"現任意大利華人神學院延伸部主任，任教實踐神學及教會歷史。","en":"Director of extension studies at the Chinese Theological Seminary in Italy."}}','published',now(),2),
 ('person','joyce','{"zh-Hant":"Joyce","en":"Joyce"}','{}','{}','{"person_group":"staff","role":{"zh-Hant":"團隊同工","en":"Team member"},"biography":{"zh-Hant":"正式簡歷將於稍後補充。","en":"Biography forthcoming."}}','published',now(),3)
on conflict(kind,slug) do nothing;

insert into public.content_entries(kind,slug,title,description,data,status,published_at,display_order)
values('settings','site','{"zh-Hant":"神學教育服務團","en":"Theological Education Service Corps Ltd."}',
 '{"zh-Hant":"神學教育服務團創立於2022年，支援不同宣教工場的神學教育。","en":"Founded in 2022, TESC supports theological education in mission fields."}',
 '{"mission":{"zh-Hant":"透過神學教育裝備各地牧者與信徒領袖，協助他們廣傳福音、培育門徒、建立教會。","en":"Equipping pastors and church leaders through theological education."}}',
 'published',now(),0)
on conflict(kind,slug) do nothing;

insert into public.content_entries(kind,slug,title,description,body,status,published_at,display_order)
values('page','who-we-are','{"zh-Hant":"創立與使命","zh-Hans":"创立与使命","en":"Our origins and mission"}',
 '{}',
 jsonb_build_object('zh-Hant',$about$
 <p>神學教育服務團創立於2022年，最初乃為協助意大利華人神學院籌募經費而設，支援教師薪酬、學生助學金及圖書購置等需要。其後，事工逐步拓展，進一步為不同有需要的宣教工場開拓神學教育資源，包括安排全球資深講師以網絡及實體方式開辦課程，支援各地現有人才培育機構，裝備當地牧者與信徒領袖。</p>
 <p>我們深信藉着神學教育訓練各地同工，能更有效協助他們廣傳福音、培育門徒、建立教會。為持續推動有關事工，本團現時每年主要開支包括三方面：</p>
 <ol><li><strong>常費支出：</strong>用以於香港開發每年四科全新的網上課程，並差派老師於國內及國外教會服侍；</li>
 <li><strong>對外支持：</strong>當中包括資助意大利華人神學院約港幣100萬元，以支援學生助學金及其他神學教育需要；</li>
 <li><strong>中國教會史文獻數位化計劃：</strong>為中國教會史的保存、研究與教學獻上一份具體而長遠的貢獻。透過有系統地整理、掃描、編目及建立可檢索的電子文本，將珍貴的歷史書籍與研究資源保存下來，避免因紙本老化、散佚或流通困難而影響後續教學與研究使用。</li></ol>
 $about$,
 'zh-Hans',$about_hans$
 <p>神学教育服务团创立于2022年，最初是为了协助意大利华人神学院筹募经费，支持教师薪酬、学生助学金及图书购置等需要。其后，事工逐步拓展，进一步为不同有需要的宣教工场开拓神学教育资源，包括安排全球资深讲师通过线上及实体方式开办课程，支持各地现有的人才培育机构，装备当地牧者与信徒领袖。</p>
 <p>我们深信，通过神学教育培训各地同工，能更有效地帮助他们广传福音、培育门徒、建立教会。为持续推动有关事工，本团现时每年主要开支包括三个方面：</p>
 <ol><li><strong>经常性支出：</strong>用于在香港每年开发四门全新的线上课程，并差派教师到国内及海外教会服侍；</li>
 <li><strong>对外支持：</strong>其中包括资助意大利华人神学院约100万港元，以支持学生助学金及其他神学教育需要；</li>
 <li><strong>中国教会史文献数字化计划：</strong>为中国教会史的保存、研究与教学作出具体而长远的贡献。通过系统地整理、扫描、编目及建立可检索的电子文本，保存珍贵的历史书籍与研究资源，避免纸本老化、散佚或流通困难影响后续教学与研究使用。</li></ol>
 $about_hans$,
 'en',$about_en$
 <p>The Theological Education Service Corps (TESC) was founded in 2022 to raise funds for the Chinese theological seminary in Italy, initially supporting faculty salaries, student scholarships, and book purchases. Its ministry has since expanded to develop theological education resources for mission fields in need. This includes arranging experienced lecturers from around the world to teach online and in person, supporting existing local training institutions, and equipping pastors and lay leaders.</p>
 <p>We believe theological education can better equip local coworkers to share the gospel, make disciples, and build churches. To sustain this work, TESC’s main annual expenses fall into three areas:</p>
 <ol><li><strong>Operating costs:</strong> developing four new online courses each year in Hong Kong and sending teachers to serve churches in China and abroad;</li>
 <li><strong>External support:</strong> including approximately HK$1 million for the Chinese theological seminary in Italy to fund student scholarships and other theological education needs;</li>
 <li><strong>Digitisation of Chinese church history documents:</strong> making a concrete, long-term contribution to preservation, research, and teaching. By systematically organising, scanning, cataloguing, and creating searchable digital texts, the project preserves valuable historical books and research resources that might otherwise be lost to paper deterioration, dispersal, or limited circulation.</li></ol>
 $about_en$),
 'published',now(),1)
on conflict(kind,slug) do nothing;
