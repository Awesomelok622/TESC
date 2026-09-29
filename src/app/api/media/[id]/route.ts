import {storage} from '@/lib/storage';
import {z} from 'zod';
import {configured,serviceDb} from '@/lib/supabase';
import {identity} from '@/lib/auth';
export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const unavailable=()=>new Response('File unavailable / 文件暫未能提供',{status:404,headers:{'Cache-Control':'no-store'}});if(!z.uuid().safeParse(id).success||!configured())return unavailable();
 try{const db=serviceDb();const {data:file}=await db.from('media_items').select('*').eq('id',id).single();if(!file)return unavailable();const actor=await identity();let allowed=!!actor;
 if(!allowed&&file.scan_status==='clean'){
 const {data:resources}=await db.from('public_resources').select('id').eq('media_id',id).limit(1);allowed=!!resources?.length;
 if(!allowed){const {data:entries}=await db.from('content_entries').select('data').eq('status','published').is('deleted_at',null).lte('published_at',new Date().toISOString());allowed=!!entries?.some(e=>Object.entries(e.data).some(([key,value])=>key.endsWith('_id')&&value===id));}}
 if(!allowed)return unavailable();const download=new URL(req.url).searchParams.has('download');const url=await storage.signedUrl(file,download?file.original_name:undefined);return new Response(null,{status:307,headers:{Location:url,'Cache-Control':'private, no-store'}});
 }catch{return unavailable();}}
