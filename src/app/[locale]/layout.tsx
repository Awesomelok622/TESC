import {notFound} from 'next/navigation';
import Link from 'next/link';
import {localeSchema,type Locale,translation} from '@/lib/domain';
import {dict,routeNames} from '@/lib/i18n';
import {entry,mediaUrl} from '@/lib/content';
import {Header} from '@/components/header';
import {LocaleDocument} from '@/components/locale-document';
export const dynamic='force-dynamic';
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const p=await params;if(!localeSchema.safeParse(p.locale).success)notFound();const locale=p.locale as Locale,d=dict(locale);const settings=await entry('settings','site');return <div lang={locale}><LocaleDocument locale={locale}/><a className="skip-link" href="#main">{d.skip}</a><Header locale={locale} logo={mediaUrl(settings?.data.logo_dark_id)} resourceLabel={translation(settings?.data.resource_label,locale).text}/>{children}<footer className="footer"><div className="wrap footer-grid"><div>{settings?.data.logo_light_id?<img className="footer-brand-image" src={mediaUrl(settings.data.logo_light_id)} alt="TESC"/>:<span className="footer-logo">TESC</span>}<p>{d.rights}</p><small>Theological Education Service Corps Ltd.</small></div><div className="footer-nav">{routeNames.map(r=><Link key={r} href={`/${locale}/${r}`}>{d[r]}</Link>)}</div><div><p className="eyebrow">PRAYER · EDUCATION · SERVICE</p><Link href={`/${locale}/contact`} className="text-link">{d.contactUs} ↗</Link></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} TESC</span><Link href="/admin">{locale==='en'?'Administration':'管理員登入'}</Link></div></footer></div>}
