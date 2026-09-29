import type {MetadataRoute} from 'next';
import {locales} from '@/lib/domain';
import {entries} from '@/lib/content';
import {origin} from '@/lib/seo';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const paths=['','/about','/team','/ministries','/courses','/digitalisation','/prayer','/community','/contact'];const records=await entries();for(const item of records){const route={prayer:'prayer',ministry:'ministries',course:'courses'}[item.kind as string];if(route)paths.push(`/${route}/${item.slug}`);}return paths.flatMap(path=>locales.map(locale=>({url:`${origin()}/${locale}${path}`,alternates:{languages:Object.fromEntries(locales.map(l=>[l,`${origin()}/${l}${path}`]))}})));}
