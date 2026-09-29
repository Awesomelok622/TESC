import {createClient} from '@supabase/supabase-js';
for(const file of ['.env.local','.env']){try{process.loadEnvFile(file);}catch(e){if(e.code!=='ENOENT')throw e;}}
const {NEXT_PUBLIC_SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key,ADMIN_EMAIL:email,ADMIN_DISPLAY_NAME:name,NEXT_PUBLIC_SITE_URL:site}=process.env;
if(!url||!key||!email||!site)throw new Error('Set Supabase service credentials, ADMIN_EMAIL and NEXT_PUBLIC_SITE_URL in your local environment.');
const db=createClient(url,key,{auth:{persistSession:false}});
const {data:existing,error:checkError}=await db.from('profiles').select('id').eq('role','super_admin').limit(1);
if(checkError)throw new Error('Apply migrations before creating an administrator.');
if(existing.length)throw new Error('A super admin already exists. Use the authenticated role management screen for additional administrators.');
const {data,error}=await db.auth.admin.inviteUserByEmail(email,{redirectTo:`${site}/auth/confirm`});
if(error)throw new Error('Invitation failed. Check the email, SMTP configuration and Supabase Auth logs.');
const {error:profileError}=await db.from('profiles').insert({id:data.user.id,role:'super_admin',display_name:name||''});
if(profileError)throw new Error(`User invitation created but profile creation failed. Securely add its ID to profiles after resolving the migration error. User ID: ${data.user.id}`);
console.log('Administrator invited. Follow the email link to choose a password. No password was generated or stored in source.');
