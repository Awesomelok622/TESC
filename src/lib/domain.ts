import { z } from 'zod';
export const locales = ['zh-Hant','zh-Hans','en'] as const;
export type Locale = typeof locales[number];
export const localeSchema = z.enum(locales);
export const i18nSchema = z.object({'zh-Hant':z.string().max(120000).default(''),'zh-Hans':z.string().max(120000).default(''),en:z.string().max(120000).default('')});
export type I18n = z.infer<typeof i18nSchema>;
export const i18n = (zh:string,en='[Awaiting official content]',hans='[待输入正式内容]'):I18n => ({'zh-Hant':zh,'zh-Hans':hans,en});
export const placeholder = i18n('[待輸入正式內容]');
export function translation(value:I18n|undefined, locale:Locale) {const language=[locale,...locales].find(l=>value?.[l]?.trim())||locale;return {text:value?.[language]?.trim()||'',fallback:language!==locale,language};}
export const kinds=['page','person','ministry','video','course','course_category','project','project_section','project_document','prayer','poster','resource_category','contact','donation','settings'] as const;
export type Kind=typeof kinds[number];
export type Role='member'|'editor'|'super_admin';
export const canManage = (role:Role|undefined,kind:string) => !!role && role!=='member' && (role==='super_admin'|| !['settings','roles','users'].includes(kind));
const safeUrl=z.string().max(2000).refine(v=>!v || /^https:\/\/[^\s]+$/i.test(v), '請輸入 HTTPS 網址');
export const dataSchema=z.object({
 role:i18nSchema.optional(), biography:i18nSchema.optional(), responsibilities:i18nSchema.optional(), quote:i18nSchema.optional(),
 subtitle:i18nSchema.optional(), objectives:i18nSchema.optional(), audience:i18nSchema.optional(), lecturer:i18nSchema.optional(), format:i18nSchema.optional(), duration:i18nSchema.optional(), credits:i18nSchema.optional(), notes:i18nSchema.optional(),
 category:z.string().max(100).optional(), project_status:z.enum(['ongoing','completed']).optional(), author:z.enum(['暉牧','JOYCE LOK']).optional(), person_group:z.enum(['board','staff']).optional(),
 source_type:z.enum(['upload','youtube','vimeo']).optional(), video_url:safeUrl.optional(),
 image_id:z.uuid().nullable().optional(), video_id:z.uuid().nullable().optional(), pdf_id:z.uuid().nullable().optional(), poster_id:z.uuid().nullable().optional(), logo_light_id:z.uuid().nullable().optional(), logo_dark_id:z.uuid().nullable().optional(), qr_id:z.uuid().nullable().optional(),
 related_ids:z.array(z.uuid()).max(100).optional(), parent_id:z.uuid().nullable().optional(),
 cta_label:i18nSchema.optional(), cta_url:safeUrl.optional(), registration_url:safeUrl.optional(),
 email:z.union([z.email(),z.literal('')]).optional(), phone:z.string().max(100).optional(), whatsapp:z.string().max(100).optional(), address:i18nSchema.optional(), social_url:safeUrl.optional(),
 account_name:z.string().max(300).optional(), bank_info:z.string().max(3000).optional(), donation_url:safeUrl.optional(),
 resource_label:i18nSchema.optional(), mission:i18nSchema.optional(), seo_title:i18nSchema.optional(), seo_description:i18nSchema.optional(),
 timeline_date:z.string().max(100).optional(), statistic_value:z.string().max(100).optional(), archival_id:z.string().max(100).optional(),
 auto_publish_public_uploads:z.boolean().optional(),
}).strict();
export const entrySchema=z.object({id:z.uuid().optional(),kind:z.enum(kinds),slug:z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),title:i18nSchema,description:i18nSchema,body:i18nSchema,data:dataSchema.default({}),status:z.enum(['draft','published','archived']),published_at:z.iso.datetime({offset:true}).nullable(),display_order:z.number().int().min(0).max(100000),featured:z.boolean(),is_demo:z.boolean().default(false),is_private:z.boolean().default(false)});
export type Entry=z.infer<typeof entrySchema> & {id:string;created_at?:string;updated_at?:string;deleted_at?:string|null};
export type Resource={id:string;title:I18n;description:I18n;category:string;media_id:string;file_size:number;mime_type:string;status:'pending'|'approved'|'rejected'|'hidden';published:boolean;scan_status:'pending'|'clean'|'infected'|'error';created_at:string;contributor_name?:string;contributor_email?:string;approved_at?:string};
export type Media={id:string;original_name:string;path:string;bucket:string;mime_type:string;file_size:number;category:string;published:boolean;scan_status:string;created_at:string};
export function visible(entry:Pick<Entry,'status'|'published_at'|'deleted_at'>, now=new Date()) {return !entry.deleted_at && entry.status==='published' && !!entry.published_at && Date.parse(entry.published_at)<=now.getTime();}
export const publicResource=(r:Pick<Resource,'status'|'published'|'scan_status'>)=>r.status==='approved'&&r.published&&r.scan_status==='clean';
export function hkToUtc(value:string) {return value ? new Date(`${value}:00+08:00`).toISOString() : null;}
export function utcToHk(value:string|null) {return value ? new Date(Date.parse(value)+8*3600000).toISOString().slice(0,16):'';}
export function videoEmbed(source:string,url:string) {try {const u=new URL(url);if(source==='youtube'&&['youtube.com','www.youtube.com','youtu.be'].includes(u.hostname)){const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');return id&&/^[\w-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:null;}if(source==='vimeo'&&['vimeo.com','www.vimeo.com'].includes(u.hostname)&&/^\/\d+$/.test(u.pathname))return `https://player.vimeo.com/video${u.pathname}`;return null;}catch{return null;}}
export const contactSchema=z.object({name:z.string().trim().min(1).max(120),email:z.email().max(254),phone:z.string().max(50).default(''),subject:z.string().trim().min(1).max(200),message:z.string().trim().min(10).max(10000),consent:z.literal(true)});
export const submissionSchema=z.object({title:z.string().trim().min(2).max(200),description:z.string().trim().min(5).max(3000),category:z.string().max(100),locale:localeSchema,contributor_name:z.string().max(120),contributor_email:z.union([z.email(),z.literal('')]),agreement:z.literal(true)});
export function safeFilename(name:string){return name.normalize('NFKC').replace(/[^\p{L}\p{N}._ -]/gu,'_').replace(/^\.+/,'').slice(-160)||'file';}
export function validateFile(name:string,mime:string,bytes:Uint8Array,max:number,publicUpload=false){
 if(bytes.length===0||bytes.length>max)throw new Error('File size is not permitted');
 const ext=name.split('.').pop()?.toLowerCase();
 const pdf=new TextDecoder().decode(bytes.slice(0,5))==='%PDF-';
 const png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
 const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
 const mp4=new TextDecoder().decode(bytes.slice(4,8))==='ftyp';
 const valid=ext==='pdf'&&mime==='application/pdf'&&pdf || !publicUpload&&(ext==='png'&&mime==='image/png'&&png || ['jpg','jpeg'].includes(ext||'')&&mime==='image/jpeg'&&jpg || ext==='webp'&&mime==='image/webp'&&webp || ext==='mp4'&&mime==='video/mp4'&&mp4);
 if(!valid)throw new Error('File type, extension, or signature is not permitted');
 return {name:safeFilename(name),extension:ext!};
}
