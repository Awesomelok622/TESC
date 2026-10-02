import Link from 'next/link';
import {ArrowUpRight,BookOpen,FileText,Globe2,KeyRound,LayoutDashboard,UsersRound} from 'lucide-react';
import {localEntry,localLetters,localUsers,type LocalUser} from '@/lib/local-db';
import {type Locale,translation} from '@/lib/domain';
import {adminText} from '@/lib/admin-i18n';
import {logout} from '@/app/admin/actions';
import {LocalPrayerUpload,LocalPrayerAction} from './local-prayer-controls';

export type LocalAdminModule='dashboard'|'prayer'|'users'|'site'|'account';
const navItems=[
 {key:'dashboard',icon:LayoutDashboard,path:'/admin'},
 {key:'prayer',icon:FileText,path:'/admin/prayer'},
 {key:'users',icon:UsersRound,path:'/admin/users'},
 {key:'site',icon:Globe2,path:'/admin/site'},
 {key:'account',icon:KeyRound,path:'/admin/account'}
] as const;
const languages=[{code:'zh-Hant',label:'繁'},{code:'zh-Hans',label:'简'},{code:'en',label:'EN'}] as const;
const formatDate=(value:string|null|undefined,locale:Locale)=>value?new Intl.DateTimeFormat(locale==='en'?'en-GB':locale==='zh-Hans'?'zh-CN':'zh-HK',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'short',day:'numeric'}).format(new Date(value)):'—';
const memberName=(user:LocalUser)=>user.display_name||user.email;

export function LocalAdmin({module,locale,actor,message}:{module:LocalAdminModule;locale:Locale;actor:LocalUser;message?:string}){
 const t=adminText(locale),letters=localLetters(),users=localUsers();
 const members=users.filter(user=>user.role==='member');
 const signedIn=members.filter(user=>user.last_seen_at).sort((a,b)=>Date.parse(b.last_seen_at||'')-Date.parse(a.last_seen_at||''));
 const route=(path:string)=>`${path}?lang=${locale}`;
 const notice=message==='uploaded'?t.noticeUploaded:message==='deleted'?t.noticeDeleted:message==='password'?t.noticePassword:undefined;
 const title={dashboard:t.dashboardTitle,prayer:t.prayerTitle,users:t.usersTitle,site:t.siteTitle,account:t.accountTitle}[module];
 const intro={dashboard:t.dashboardIntro,prayer:t.prayerIntro,users:t.usersIntro,site:t.siteIntro,account:t.accountIntro}[module];
 const sitePages=[
  {label:t.aboutPage,path:`/${locale}/about`,detail:'ABOUT TESC'},
  {label:t.teamPage,path:`/${locale}/team`,detail:'PEOPLE'},
  {label:t.ministryPage,path:`/${locale}/ministries`,detail:'COURSES'},
  {label:t.projectPage,path:`/${locale}/digitalisation`,detail:'ARCHIVE'},
  {label:t.prayerPage,path:`/${locale}/prayer`,detail:'LETTERS'},
  {label:t.givingPage,path:`/${locale}/contact#giving`,detail:'GIVING'}
 ];
 return <div className="local-admin">
  <header className="local-admin-header"><div className="local-admin-header-inner"><Link className="local-admin-brand" href={route('/admin')}><img src="/images/tesc-logo.png" alt="TESC"/><span><strong>TESC</strong><small>{t.portal}</small></span></Link><div className="local-admin-header-actions"><span className="local-admin-email">{actor.email}</span><nav className="local-admin-languages" aria-label="Language / 語言">{languages.map(language=><Link key={language.code} href={`${navItems.find(item=>item.key===module)?.path||'/admin'}?lang=${language.code}`} aria-current={locale===language.code?'page':undefined} hrefLang={language.code}>{language.label}</Link>)}</nav><Link className="local-admin-public" href={`/${locale}`} target="_blank">{t.publicSite}<ArrowUpRight size={15}/></Link><form action={logout}><button type="submit">{t.logout}</button></form></div></div></header>
  <nav className="local-admin-nav" aria-label={t.portal}><div className="local-admin-nav-inner">{navItems.map(item=>{const Icon=item.icon;return <Link key={item.key} href={route(item.path)} aria-current={module===item.key?'page':undefined}><Icon size={17} strokeWidth={1.8}/><span>{t[item.key]}</span></Link>})}</div></nav>
  <main className="local-admin-main"><div className="local-admin-page-heading"><div><p className="eyebrow">{t.eyebrow}</p><h1>{title}</h1><p>{intro}</p></div>{module==='dashboard'&&<Link className="button" href={route('/admin/prayer')}>{t.uploadLetter}<ArrowUpRight size={17}/></Link>}</div>
   {notice&&<p role="status" className="notice">{notice}</p>}
   {module==='dashboard'&&<>
    <div className="local-admin-stats"><Link href={route('/admin/prayer')}><FileText size={21}/><span>{t.publishedLetters}</span><strong>{letters.length}</strong><small>{t.openPrayer} ↗</small></Link><Link href={route('/admin/users')}><UsersRound size={21}/><span>{t.registeredMembers}</span><strong>{members.length}</strong><small>{t.openUsers} ↗</small></Link><Link href={route('/admin/users')}><BookOpen size={21}/><span>{t.recentSignins}</span><strong>{signedIn.length}</strong><small>{t.openUsers} ↗</small></Link></div>
    <div className="local-admin-dashboard-grid"><section className="local-admin-card"><div className="local-admin-card-heading"><div><p className="eyebrow">{t.latestActivity}</p><h2>{t.prayer}</h2></div><Link href={route('/admin/prayer')}>{t.openPrayer}<ArrowUpRight size={16}/></Link></div>{letters.length?<div className="local-admin-feed">{letters.slice(0,4).map(letter=><Link key={letter.id} href={`/${locale}/prayer/${letter.slug}`} target="_blank"><span><strong>{translation(localEntry(letter).title,locale).text}</strong><small>{letter.author} · {formatDate(letter.published_at,locale)}</small></span><ArrowUpRight size={16}/></Link>)}</div>:<p className="muted">{t.noLetters}</p>}</section><section className="local-admin-card"><div className="local-admin-card-heading"><div><p className="eyebrow">{t.latestActivity}</p><h2>{t.recentMembers}</h2></div><Link href={route('/admin/users')}>{t.openUsers}<ArrowUpRight size={16}/></Link></div>{signedIn.length?<div className="local-admin-feed">{signedIn.slice(0,4).map(user=><div key={user.id}><span><strong>{memberName(user)}</strong><small>{formatDate(user.last_seen_at,locale)}</small></span></div>)}</div>:<p className="muted">{t.noSignins}</p>}</section></div>
    <section className="local-admin-quick"><div><p className="eyebrow">{t.quickActions}</p><h2>{t.siteTitle}</h2><p>{t.siteIntro}</p></div><Link className="button secondary" href={route('/admin/site')}>{t.openSite}<ArrowUpRight size={17}/></Link></section>
   </>}
   {module==='prayer'&&<div className="local-admin-prayer-grid"><section className="local-admin-card"><div className="local-admin-card-heading"><div><p className="eyebrow">PDF / PUBLIC</p><h2>{t.uploadLetter}</h2></div></div><p className="local-admin-hint">{t.uploadHint}</p><LocalPrayerUpload locale={locale}/></section><section className="local-admin-card"><div className="local-admin-card-heading"><div><p className="eyebrow">{letters.length} {t.publishedLetters}</p><h2>{t.library}</h2></div><span className="meta">{t.newestFirst}</span></div>{letters.length?<div className="table-scroll"><table className="admin-table"><thead><tr><th>{t.title}</th><th>{t.author}</th><th>{t.date}</th><th>{t.actions}</th></tr></thead><tbody>{letters.map(letter=><tr key={letter.id}><td><strong>{translation(localEntry(letter).title,locale).text}</strong><small className="local-admin-filename">{letter.original_name}</small></td><td>{letter.author}</td><td>{formatDate(letter.published_at,locale)}</td><td><div className="local-admin-row-actions"><Link href={`/${locale}/prayer/${letter.slug}`} target="_blank">{t.view}</Link><Link href={`/api/media/${letter.id}?download=1`}>{t.download}</Link><LocalPrayerAction id={letter.id} locale={locale}/></div></td></tr>)}</tbody></table></div>:<p className="muted">{t.noLetters}</p>}</section></div>}
   {module==='users'&&<><div className="local-admin-stats"><div><UsersRound size={21}/><span>{t.totalUsers}</span><strong>{users.length}</strong></div><div><KeyRound size={21}/><span>{t.admins}</span><strong>{users.length-members.length}</strong></div><div><BookOpen size={21}/><span>{t.members}</span><strong>{members.length}</strong></div></div><section className="local-admin-card"><div className="local-admin-card-heading"><div><p className="eyebrow">{t.users}</p><h2>{t.registeredMembers}</h2></div></div><div className="table-scroll"><table className="admin-table"><thead><tr><th>{t.name}</th><th>{t.email}</th><th>{t.role}</th><th>{t.joined}</th><th>{t.lastSeen}</th></tr></thead><tbody>{users.map(user=><tr key={user.id}><td><strong>{memberName(user)}</strong></td><td>{user.email}</td><td><span className="status-badge">{user.role==='super_admin'?t.admins:t.members}</span></td><td>{formatDate(user.created_at,locale)}</td><td>{user.last_seen_at?formatDate(user.last_seen_at,locale):t.never}</td></tr>)}</tbody></table></div></section></>}
   {module==='site'&&<div className="local-admin-site-grid">{sitePages.map((page,index)=><article className="local-admin-site-card" key={page.path}><span className="eyebrow">{String(index+1).padStart(2,'0')} / {page.detail}</span><h2>{page.label}</h2><Link href={page.path} target="_blank">{t.visitPage}<ArrowUpRight size={17}/></Link></article>)}</div>}
   {module==='account'&&<div className="local-admin-account-grid"><section className="local-admin-card"><p className="eyebrow">{t.signedInAs}</p><h2>{actor.display_name}</h2><p>{actor.email}</p><p className="muted">{t.currentRole} · {t.admins}</p></section><section className="local-admin-card"><p className="eyebrow">{t.accountTitle}</p><h2>{t.changePassword}</h2><Link className="button secondary" href={route('/admin/password')}>{t.changePassword}<ArrowUpRight size={17}/></Link></section></div>}
  </main>
 </div>;
}
