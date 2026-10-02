import Link from 'next/link';
import {ArrowUpRight,ArrowRight} from 'lucide-react';
import {entries,mediaUrl} from '@/lib/content';
import {type Locale,translation} from '@/lib/domain';
import {dict,monthDate} from '@/lib/i18n';
import {seo} from '@/lib/seo';
import {SectionTitle,EntryCard,Translated,TeamTeaser} from '@/components/public';
import {HeroGallery} from '@/components/hero-gallery';
import {aboutDescription} from '@/lib/official-about';

const copy=(locale:Locale,hant:string,hans:string,en:string)=>locale==='en'?en:locale==='zh-Hans'?hans:hant;
const copy3=(locale:Locale,value:readonly [string,string,string])=>copy(locale,value[0],value[1],value[2]);
const sampleCourses=[
 {file:'poster-001.jpg',title:['基督教倫理學','基督教伦理学','Christian Ethics'],summary:['從基督信仰思考倫理判斷與生活實踐。','从基督信仰思考伦理判断与生活实践。','Christian ethical discernment and everyday practice.']},
 {file:'poster-002.jpg',title:['健康教會','健康教会','Healthy Church'],summary:['探討健康教會的特質及地方教會的實踐。','探讨健康教会的特质及地方教会的实践。','The marks of a healthy church and local practice.']},
 {file:'poster-003.jpg',title:['舊約歷史','旧约历史','Old Testament History'],summary:['認識舊約歷史脈絡，深化經文閱讀。','认识旧约历史脉络，深化经文阅读。','The historical setting of the Old Testament.']}
] as const;

export async function generateMetadata({params}:{params:Promise<{locale:Locale}>}){return seo((await params).locale);}

export default async function Home({params}:{params:Promise<{locale:Locale}>}){
 const {locale}=await params,d=dict(locale);
 const all=await entries();
 const settings=all.find(e=>e.kind==='settings'&&e.slug==='site');
 const courses=all.filter(e=>e.kind==='course');
 const prayers=all.filter(e=>e.kind==='prayer').sort((a,b)=>Date.parse(b.published_at||'')-Date.parse(a.published_at||'')).slice(0,3);
 const project=all.find(e=>e.kind==='project'&&e.slug==='first-stage-plan');
 const donation=all.find(e=>e.kind==='donation'&&e.slug==='default');
 const about=all.find(e=>e.kind==='page'&&e.slug==='who-we-are');
 const aboutTeaser=!settings?.is_demo&&translation(settings?.description,locale).text?settings?.description:translation(about?.description,locale).text?about?.description:aboutDescription;
 return <main id="main">
  <section className="hero wrap"><div className="hero-copy"><p className="eyebrow"><span className="gold-line"/>THEOLOGICAL EDUCATION SERVICE CORPS</p><h1>{locale==='en'?<>Theological education.<br/><em>A heart for service.</em></>:<>{locale==='zh-Hant'?'神學教育':'神学教育'}<br/><em>服侍同行</em></>}</h1><p className="hero-org">{d.rights}</p><p className="hero-mission">{translation(settings?.data.mission,locale).text||d.mission}</p><div className="hero-actions"><Link className="button" href={`/${locale}/about`}>{d.about}<ArrowUpRight size={18}/></Link><Link className="text-link" href={`/${locale}/ministries`}>{d.ministries}<ArrowRight size={18}/></Link></div><div className="hero-foot"><span>FAITH</span><i/><span>LEARNING</span><i/><span>SERVICE</span></div></div><HeroGallery cover={mediaUrl(settings?.data.image_id)} locale={locale}/></section>
  <section className="intro-band"><div className="wrap intro-grid"><p className="eyebrow">ABOUT TESC<br/><span>神學教育服務團</span></p><div><h2>{d.aboutIntro}</h2><p className="muted"><Translated value={aboutTeaser} locale={locale}/></p></div><Link href={`/${locale}/about`} aria-label={d.about} className="circle-link"><ArrowUpRight/></Link></div></section>
  <section className="section wrap"><SectionTitle n="01" en="COURSES & POSTERS" title={d.courses} href={`/${locale}/ministries`} label={d.learn}/>{courses.length?<div className="cards three">{courses.slice(0,3).map(course=><EntryCard key={course.id} item={course} locale={locale} base={`/${locale}/courses`}/>)}</div>:<div className="cards three course-teaser-grid">{sampleCourses.map(course=>{const title=copy3(locale,course.title);return <article className="entry-card" key={course.file}><Link href={`/${locale}/ministries#posters`}><img loading="lazy" src={`/images/${course.file}`} alt={title}/></Link><div><h3>{title}</h3><p>{copy3(locale,course.summary)}</p><Link className="text-link" href={`/${locale}/ministries#posters`}>{d.learn}<ArrowRight size={16}/></Link></div></article>})}</div>}</section>
  <TeamTeaser people={all.filter(e=>e.kind==='person'&&['leung','fai'].includes(e.slug))} locale={locale}/>
  <section className="archive-feature"><div className="wrap archive-grid"><div className="archive-visual archive-text-card"><div><strong>6,000</strong><span>{copy(locale,'第一階段計劃藏書','第一阶段计划藏书','BOOKS IN THE STAGE ONE PLAN')}</span></div></div><div><p className="eyebrow">02 / PRESERVING OUR HERITAGE</p><h2>{d.archiveIntro}</h2><h3>{d.digitalisation}</h3><p><Translated value={project?.description} locale={locale}/></p><Link href={`/${locale}/digitalisation`} className="button light">{d.learn}<ArrowUpRight size={18}/></Link></div></div></section>
  <section className="section wrap home-prayer"><SectionTitle n="03" en="LETTERS & PRAYER" title={d.prayerIntro} href={`/${locale}/prayer`} label={d.prayer}/><p className="home-section-intro">{copy(locale,'閱覽最近的代禱信，了解同工的近況與代禱需要。','阅读最近的代祷信，了解同工的近况与代祷需要。','Read the latest letters for updates and prayer needs from our coworkers.')}</p>{prayers.length?<div className="home-prayer-grid">{prayers.map(letter=><Link className="home-prayer-card" key={letter.id} href={`/${locale}/prayer/${letter.slug}`}><span className="home-prayer-card-date">{letter.published_at&&monthDate(letter.published_at,locale)}</span><h3><Translated value={letter.title} locale={locale}/></h3><p><Translated value={letter.description} locale={locale}/></p><span className="home-prayer-card-action">{d.read}<ArrowUpRight size={17}/></span></Link>)}</div>:<Link className="home-prayer-empty" href={`/${locale}/prayer`}>{d.prayer}<ArrowUpRight size={18}/></Link>}</section>
  <section className="partner wrap"><p className="eyebrow">WALK WITH US</p><h2>{d.partner}</h2><p className="partner-lead"><Translated value={donation?.description} locale={locale}/></p><div className="partner-methods"><span>{copy(locale,'支票','支票','Cheque')}</span><span>{copy(locale,'銀行入數','银行存款','Bank deposit')}</span><span>{copy(locale,'轉數快 FPS','转数快 FPS','FPS')}</span></div><p className="partner-note">{copy(locale,'你的支持幫助我們推動神學課程、支援宣教工場，並保存中國教會史文獻。','你的支持帮助我们推动神学课程、支援宣教工场，并保存中国教会史文献。','Your support helps develop theology courses, serve mission fields and preserve Chinese church history documents.')}</p><Link className="text-link" href={`/${locale}/contact#giving`}>{d.giving}<ArrowUpRight size={20}/></Link></section>
 </main>;
}
