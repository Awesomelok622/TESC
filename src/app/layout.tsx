import type {Metadata} from 'next';
import './globals.css';
import {headers} from 'next/headers';
import {localeSchema} from '@/lib/domain';
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://tesc.org.hk'),title:'TESC｜神學教育服務團',description:'Theological Education Service Corps Ltd.｜神學教育服務團',icons:{icon:'/icon.svg'}};
export default async function RootLayout({children}:{children:React.ReactNode}){const parsed=localeSchema.safeParse((await headers()).get('x-tesc-locale'));return <html lang={parsed.success?parsed.data:'zh-Hant'}><body>{children}</body></html>}
