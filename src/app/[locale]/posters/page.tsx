import {permanentRedirect} from 'next/navigation';
import {type Locale} from '@/lib/domain';

export default async function Posters({params}:{params:Promise<{locale:Locale}>}){
 const {locale}=await params;
 permanentRedirect(`/${locale}/ministries#posters`);
}