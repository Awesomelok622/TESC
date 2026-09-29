import {jsonBody} from '@/lib/request';
import {storage} from '@/lib/storage';
import {randomUUID} from 'node:crypto';
import {requireAdmin,sameOrigin,apiError,ApiError} from '@/lib/auth';
import {serviceDb} from '@/lib/supabase';
import {validateFile} from '@/lib/domain';
import {limitedForm,scan} from '@/lib/security';
export async function GET(){try{const {db}=await requireAdmin();const {data,error}=await db.from('media_items').select('*').order('created_at',{ascending:false});if(error)throw error;return Response.json(data);}catch(e){return apiError(e);}}
export async function POST(req:Request){try{sameOrigin(req);const actor=await requireAdmin();const max=Math.min(250,Number(process.env.MAX_ADMIN_UPLOAD_MB)||250)*1024*1024;const form=await limitedForm(req,max+16000);const file=form.get('file');if(!(file instanceof File))throw new ApiError(400,'請選擇檔案。');const bytes=new Uint8Array(await file.arrayBuffer());let checked;try{checked=validateFile(file.name,file.type,bytes,max);}catch{throw new ApiError(400,'檔案格式或大小不符。');}
 const db=serviceDb();const id=randomUUID(),path=`media/${id}.${checked.extension}`;const scanStatus=await scan(bytes,file.type);
 if(scanStatus==='infected')throw new ApiError(400,'檔案未通過安全檢查。');
 await storage.put({bucket:'admin-media',path},bytes,file.type);
 const {data,error}=await db.from('media_items').insert({id,path,original_name:checked.name,bucket:'admin-media',mime_type:file.type,file_size:file.size,scan_status:scanStatus,category:String(form.get('category')||'').slice(0,100),created_by:actor.id}).select().single();if(error){await storage.remove({bucket:'admin-media',path});throw error;}return Response.json(data,{status:201});}catch(e){return apiError(e);}}
export async function PATCH(req:Request){try{sameOrigin(req);const actor=await requireAdmin();const {id,action}=await jsonBody(req);const db=serviceDb();const {data:item}=await db.from('media_items').select('*').eq('id',id).single();if(!item)throw new ApiError(404,'檔案不存在。');
 if(action==='verify-clean'){if(actor.role!=='super_admin')throw new ApiError(403,'需要主管理員確認。');await db.from('audit_events').insert({actor_id:actor.id,entity:'media_items',entity_id:id,action:'EXTERNAL_SCAN_ATTESTED'});const {error}=await db.from('media_items').update({scan_status:'clean'}).eq('id',id);if(error)throw error;await db.from('community_resources').update({scan_status:'clean'}).eq('media_id',id);}
 else if(action==='rescan'){const bytes=await storage.read(item);const status=await scan(bytes,item.mime_type);await db.from('media_items').update({scan_status:status}).eq('id',id);await db.from('community_resources').update({scan_status:status,status:'pending',published:false}).eq('media_id',id);}
 else throw new ApiError(400,'未知操作。');return Response.json({ok:true});}catch(e){return apiError(e);}}
export async function DELETE(req:Request){try{sameOrigin(req);await requireAdmin();const {id}=await jsonBody(req);const db=serviceDb();const {data:item}=await db.from('media_items').select('*').eq('id',id).single();if(!item)throw new ApiError(404,'檔案不存在。');const {data:entries}=await db.from('content_entries').select('data').is('deleted_at',null);if(entries?.some(e=>JSON.stringify(e.data).includes(String(id))))throw new ApiError(409,'此檔案仍被內容使用，請先更換內容的檔案。');const {error}=await db.from('media_items').delete().eq('id',id);if(error)throw new ApiError(409,'此檔案仍被資源使用。');await storage.remove(item);return Response.json({ok:true});}catch(e){return apiError(e);}}
