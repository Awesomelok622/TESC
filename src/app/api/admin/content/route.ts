import {jsonBody} from '@/lib/request';
import {entrySchema,kinds,videoEmbed} from '@/lib/domain';
import {requireAdmin,sameOrigin,apiError,ApiError} from '@/lib/auth';
import {cleanHtml} from '@/lib/sanitize';
export async function GET(req:Request){try{const actor=await requireAdmin();const kind=new URL(req.url).searchParams.get('kind');if(!kinds.includes(kind as typeof kinds[number]))throw new ApiError(400,'未知內容類型。');const {data,error}=await actor.db.from('content_entries').select('*').eq('kind',kind).is('deleted_at',null).order('display_order');if(error)throw error;return Response.json(data);}catch(e){return apiError(e);}}
export async function POST(req:Request){try{sameOrigin(req);if(Number(req.headers.get('content-length'))>500000)throw new ApiError(413,'內容過長。');const value=entrySchema.safeParse(await jsonBody(req));if(!value.success)throw new ApiError(400,'請檢查內容、網址及日期格式。');const p=value.data;if(p.kind==='prayer')p.is_private=false;const actor=await requireAdmin(p.kind);
 if(p.kind==='video'&&p.data.source_type&&p.data.source_type!=='upload'&&!videoEmbed(p.data.source_type,p.data.video_url||''))throw new ApiError(400,'請使用有效的 YouTube 或 Vimeo 影片網址。');
 if(p.status==='published'&&!p.published_at)throw new ApiError(400,'請設定發佈時間。');
 if(p.status==='published'){
  if(!Object.values(p.title).some(v=>v.trim()))throw new ApiError(400,'請至少輸入一個語言的標題。');
  if(p.kind==='prayer'&&!p.data.author)throw new ApiError(400,'請選擇代禱信作者。');
  if(p.kind==='video'&&(!p.data.source_type||(p.data.source_type==='upload'&&!p.data.video_id)))throw new ApiError(400,'請選擇影片來源及檔案。');
  const keys=['image_id','video_id','pdf_id','poster_id','logo_light_id','logo_dark_id','qr_id'];
  const ids=[...new Set(Object.entries(p.data).filter(([key,value])=>keys.includes(key)&&!!value).map(([,value])=>String(value)))];
  if(ids.length){const {data:linked,error}=await actor.db.from('media_items').select('id,scan_status').in('id',ids);if(error||linked?.length!==ids.length||linked.some(m=>m.scan_status!=='clean'))throw new ApiError(400,'發佈前，所有附件必須存在並完成安全檢查。');}
 }
 for(const l of ['zh-Hant','zh-Hans','en'] as const)p.body[l]=cleanHtml(p.body[l]);
 if(p.id){const {data:original}=await actor.db.from('content_entries').select('kind').eq('id',p.id).single();if(!original||original.kind!==p.kind)throw new ApiError(400,'內容類型不符。');}
 const {data,error}=await actor.db.from('content_entries').upsert({...p,updated_by:actor.id,...(!p.id?{created_by:actor.id}:{})}).select().single();if(error)throw error;return Response.json(data);
 }catch(e){return apiError(e);}}
export async function DELETE(req:Request){try{sameOrigin(req);const {id}=await jsonBody(req);const actor=await requireAdmin();const {data:item}=await actor.db.from('content_entries').select('kind').eq('id',id).single();if(!item)throw new ApiError(404,'內容不存在。');await requireAdmin(item.kind);const {error}=await actor.db.from('content_entries').update({deleted_at:new Date().toISOString(),status:'archived',updated_by:actor.id}).eq('id',id);if(error)throw error;return Response.json({ok:true});}catch(e){return apiError(e);}}
