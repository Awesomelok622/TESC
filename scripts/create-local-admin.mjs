import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {randomUUID,randomBytes,scryptSync} from 'node:crypto';
for(const file of ['.env.local','.env']){try{process.loadEnvFile(file);}catch(e){if(e.code!=='ENOENT')throw e;}}
const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD,displayName=process.env.ADMIN_DISPLAY_NAME||'TESC Admin';
if(!email||!password||password.length<12)throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in the environment.');
const root=resolve(process.env.LOCAL_DATA_DIR||join(process.cwd(),'data'));mkdirSync(root,{recursive:true});const db=new DatabaseSync(join(root,'tesc.sqlite'));
db.exec(`create table if not exists users(id text primary key,email text not null unique,display_name text not null,password_hash text not null,role text not null check(role in ('member','super_admin')),created_at text not null,last_seen_at text);`);
const existing=db.prepare('select id from users where role=? limit 1').get('super_admin');if(existing)throw new Error('A local administrator already exists.');
const salt=randomBytes(16).toString('hex'),hash=`scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`;
db.prepare('insert into users(id,email,display_name,password_hash,role,created_at) values(?,?,?,?,?,?)').run(randomUUID(),email,displayName,hash,'super_admin',new Date().toISOString());
db.close();console.log(`Local administrator created: ${email}`);
