import {entries} from '@/lib/content';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const oldest=new URL(req.url).searchParams.get('sort')==='oldest';const letters=(await entries('prayer')).sort((a,b)=>(oldest?1:-1)*(Date.parse(a.published_at||'')-Date.parse(b.published_at||'')));return Response.json(letters,{headers:{'Cache-Control':'public, max-age=60'}});}catch{return Response.json({error:'代禱信暫未能載入。'},{status:503});}}
