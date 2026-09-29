import {storage} from '@/lib/storage';
import {randomUUID} from 'node:crypto';
import {submissionSchema,validateFile,i18n} from '@/lib/domain';
import {apiError,ApiError} from '@/lib/auth';
import {limitedForm,publicGuard,captcha,maxPublicBytes,scan} from '@/lib/security';
import {serviceDb} from '@/lib/supabase';
export async function POST(req:Request){try{await publicGuard(req,'resource',Math.max(0,Number(req.headers.get('content-length'))||maxPublicBytes()));const form=await limitedForm(req,maxPublicBytes()+16000);await captcha(form,'resource');const parsed=submissionSchema.safeParse({...Object.fromEntries(form),agreement:form.get('agreement')==='on'});if(!parsed.success)throw new ApiError(400,'請檢查文件資料及分享同意聲明。');const file=form.get('file');if(!(file instanceof File))throw new ApiError(400,'請選擇 PDF 文件。');const bytes=new Uint8Array(await file.arrayBuffer());let checked;try{checked=validateFile(file.name,file.type,bytes,maxPublicBytes(),true);}catch{throw new ApiError(400,'只接受符合大小限制的有效 PDF 文件。');}
 const db=serviceDb();const id=randomUUID(),path=`submissions/${id}.pdf`;const scanStatus=await scan(bytes,file.type);if(scanStatus==='infected')throw new ApiError(400,'此文件未能通過安全檢查。');
 await storage.put({bucket:'admin-media',path},bytes,file.type);
 const {error:mediaError}=await db.from('media_items').insert({id,original_name:checked.name,path,bucket:'admin-media',mime_type:file.type,file_size:file.size,scan_status:scanStatus,category:'community'});if(mediaError){await storage.remove({bucket:'admin-media',path});throw mediaError;}
 const p=parsed.data;const title=i18n('','',''),description=i18n('','','');title[p.locale]=p.title;description[p.locale]=p.description;
 const {error}=await db.from('community_resources').insert({title,description,category:p.category,media_id:id,file_size:file.size,mime_type:file.type,contributor_name:p.contributor_name,contributor_email:p.contributor_email,scan_status:scanStatus,status:'pending',published:false});
 if(error){await db.from('media_items').delete().eq('id',id);await storage.remove({bucket:'admin-media',path});throw error;}
 return Response.json({ok:true},{status:201});}catch(e){return apiError(e);}}
