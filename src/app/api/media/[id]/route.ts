import {storage} from '@/lib/storage';
import {z} from 'zod';
import {configured,serviceDb} from '@/lib/supabase';
import {identity} from '@/lib/auth';
import {localLetterById,prayerFile} from '@/lib/local-db';
import {readFile} from 'node:fs/promises';
export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const unavailable=()=>new Response('File unavailable / 文件暫未能提供',{status:404,headers:{'Cache-Control':'no-store'}});if(!z.uuid().safeParse(id).success)return unavailable();
 if(!configured()){const letter=localLetterById(id);if(!letter)return unavailable();try{const bytes=await readFile(prayerFile(letter.filename));const download=new URL(req.url).searchParams.has('download');return new Response(bytes,{headers:{'Content-Type':'application/pdf','Content-Length':String(bytes.length),'Content-Disposition':`${download?'attachment':'inline'}; filename*=UTF-8''${encodeURIComponent(letter.original_name)}`,'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});}catch{return unavailable();}}
 try{const db=serviceDb();const {data:file}=await db.from('media_items').select('*').eq('id',id).single();if(!file)return unavailable();const actor=await identity();let allowed=actor?.role==='editor'||actor?.role==='super_admin';
 if(!allowed&&file.scan_status==='clean'){
 const {data:resources}=await db.from('public_resources').select('id').eq('media_id',id).limit(1);allowed=!!resources?.length;
 if(!allowed){const {data:entries}=await db.from('content_entries').select('data,is_private').eq('status','published').is('deleted_at',null).lte('published_at',new Date().toISOString());allowed=!!entries?.some(e=>Object.entries(e.data).some(([key,value])=>key.endsWith('_id')&&value===id&&(key==='image_id'||!e.is_private||!!actor)));}}
 if(!allowed)return unavailable();const download=new URL(req.url).searchParams.has('download');if(process.env.STORAGE_DRIVER==='filesystem'){const bytes=await storage.read(file);return new Response(bytes as BodyInit,{headers:{'Content-Type':file.mime_type,'Content-Length':String(bytes.length),'Content-Disposition':`${download?'attachment':'inline'}; filename*=UTF-8''${encodeURIComponent(file.original_name)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}const url=await storage.signedUrl(file,download?file.original_name:undefined);return new Response(null,{status:307,headers:{Location:url,'Cache-Control':'private, no-store'}});
 }catch{return unavailable();}}
