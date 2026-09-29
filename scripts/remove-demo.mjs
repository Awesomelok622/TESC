import {createClient} from '@supabase/supabase-js';
for(const file of ['.env.local','.env']){try{process.loadEnvFile(file);}catch(e){if(e.code!=='ENOENT')throw e;}}
if(!process.argv.includes('--confirm'))throw new Error('This deletes only is_demo content and category=DEMO resources/media. Run with --confirm after reviewing.');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const {error}=await db.from('content_entries').delete().eq('is_demo',true);if(error)throw error;
const {data:media}=await db.from('media_items').select('id,bucket,path').eq('category','DEMO');
for(const m of media||[]){const {error:resourceError}=await db.from('community_resources').delete().eq('media_id',m.id).eq('category','DEMO');if(resourceError)throw resourceError;const {error:mediaError}=await db.from('media_items').delete().eq('id',m.id);if(mediaError)throw mediaError;const {error:fileError}=await db.storage.from(m.bucket).remove([m.path]);if(fileError)throw fileError;}
console.log('Demo records removed.');
