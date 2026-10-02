import 'server-only';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,existsSync,copyFileSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {randomUUID,scryptSync,randomBytes,randomInt,timingSafeEqual,createHash} from 'node:crypto';
import {type Entry,i18n} from './domain';

const root=resolve(process.env.LOCAL_DATA_DIR||join(process.cwd(),'data'));
let connection:DatabaseSync|undefined;
export function localDb(){
 if(connection)return connection;
 mkdirSync(root,{recursive:true});
 const db=new DatabaseSync(join(root,'tesc.sqlite'));
 db.exec(`pragma journal_mode=WAL; pragma foreign_keys=ON;
 create table if not exists users(id text primary key,email text not null unique,display_name text not null,password_hash text not null,role text not null check(role in ('member','super_admin')),created_at text not null,last_seen_at text);
 create table if not exists sessions(token_hash text primary key,user_id text not null references users(id) on delete cascade,expires_at text not null);
 create table if not exists login_attempts(email text primary key,hits integer not null,reset_at text not null);
 create table if not exists local_meta(key text primary key,value text not null);
 create table if not exists prayer_letters(id text primary key,slug text not null unique,author text not null,title text not null,published_at text not null,filename text not null,original_name text not null,file_size integer not null,is_private integer not null default 0,created_at text not null);`);
 // Existing accounts predate email confirmation and remain usable.
 const columns=db.prepare('pragma table_info(users)').all() as {name:string}[];
 if(!columns.some(column=>column.name==='email_verified_at')){
  db.exec('alter table users add column email_verified_at text');
  db.exec('update users set email_verified_at=created_at');
 }
 db.exec('create table if not exists email_verifications(token_hash text primary key,user_id text not null unique references users(id) on delete cascade,expires_at text not null,sent_at text not null,attempts integer not null default 0)');
 const verificationColumns=db.prepare('pragma table_info(email_verifications)').all() as {name:string}[];
 if(!verificationColumns.some(column=>column.name==='attempts'))db.exec('alter table email_verifications add column attempts integer not null default 0');
 db.prepare('update prayer_letters set is_private=0 where is_private<>0').run();
 const seedDir=resolve(process.cwd(),'seed','prayer');
 const destination=join(root,'prayer');mkdirSync(destination,{recursive:true});
 if(!db.prepare("select value from local_meta where key='prayer_seeded'").get()){
 for(let month=1;month<=9;month++){
  const code=`2026${String(month).padStart(2,'0')}`;
  const originalName=`暉牧代禱信${code}.pdf`;
  const source=join(seedDir,originalName);
  if(!existsSync(source))continue;
  const filename=`hui-${code}.pdf`,target=join(destination,filename);
  if(!existsSync(target))copyFileSync(source,target);
  const size=statSync(target).size;
  db.prepare('insert or ignore into prayer_letters(id,slug,author,title,published_at,filename,original_name,file_size,is_private,created_at) values(?,?,?,?,?,?,?,?,0,?)')
   .run(randomUUID(),`hui-${code}`,'暉牧',`暉牧代禱信 · ${code.slice(0,4)}年${Number(code.slice(4))}月`,`${code.slice(0,4)}-${code.slice(4)}-01T00:00:00+08:00`,filename,originalName,size,new Date().toISOString());
 }
 db.prepare("insert into local_meta(key,value) values('prayer_seeded','1')").run();
 }
 connection=db;return db;
}
export type LocalUser={id:string;email:string;display_name:string;role:'member'|'super_admin';created_at:string;last_seen_at:string|null;email_verified_at:string|null};
export function localUser(id:string){return localDb().prepare('select id,email,display_name,role,created_at,last_seen_at,email_verified_at from users where id=?').get(id) as LocalUser|undefined;}
export function localUserCount(){return (localDb().prepare('select count(*) as n from users').get() as {n:number}).n;}
export function localUsers(){return localDb().prepare('select id,email,display_name,role,created_at,last_seen_at,email_verified_at from users order by created_at desc').all() as LocalUser[];}
export function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return `scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`;}
export function checkPassword(password:string,stored:string){const [,salt,hex]=stored.split(':');if(!salt||!hex)return false;const expected=Buffer.from(hex,'hex');const actual=scryptSync(password,salt,expected.length);return expected.length===actual.length&&timingSafeEqual(expected,actual);}
export function createLocalUser(email:string,name:string,password:string,role:'member'|'super_admin'='member',verified=true){
 const id=randomUUID(),now=new Date().toISOString();localDb().prepare('insert into users(id,email,display_name,password_hash,role,created_at,email_verified_at) values(?,?,?,?,?,?,?)').run(id,email.toLowerCase(),name,hashPassword(password),role,now,verified?now:null);return localUser(id)!;
}
export function deleteUnverifiedLocalUser(id:string){localDb().prepare("delete from users where id=? and email_verified_at is null and role='member'").run(id);}
export function newEmailVerificationCode(){return String(randomInt(100000,1_000_000));}
export function saveEmailVerification(id:string,code:string){const now=new Date().toISOString();localDb().prepare('insert into email_verifications(token_hash,user_id,expires_at,sent_at,attempts) values(?,?,?,?,0) on conflict(user_id) do update set token_hash=excluded.token_hash,expires_at=excluded.expires_at,sent_at=excluded.sent_at,attempts=0').run(hashPassword(code),id,new Date(Date.now()+10*60_000).toISOString(),now);}
export function pendingVerification(email:string){const row=localDb().prepare("select u.id,v.sent_at from users u left join email_verifications v on v.user_id=u.id where u.email=? and u.role='member' and u.email_verified_at is null").get(email.toLowerCase()) as {id:string;sent_at:string|null}|undefined;return row;}
export function verifyLocalEmail(email:string,code:string){const db=localDb(),row=db.prepare("select u.id,v.token_hash,v.expires_at,v.attempts from users u join email_verifications v on v.user_id=u.id where u.email=? and u.role='member' and u.email_verified_at is null").get(email.toLowerCase()) as {id:string;token_hash:string;expires_at:string;attempts:number}|undefined;if(!row||row.expires_at<=new Date().toISOString()||row.attempts>=5)return false;const valid=checkPassword(code,row.token_hash);if(!valid){db.prepare('update email_verifications set attempts=attempts+1 where user_id=?').run(row.id);return false;}db.exec('begin immediate');try{db.prepare('update users set email_verified_at=? where id=? and email_verified_at is null').run(new Date().toISOString(),row.id);db.prepare('delete from email_verifications where user_id=?').run(row.id);db.exec('commit');return true;}catch(e){db.exec('rollback');throw e;}}
export function localAuthenticate(email:string,password:string){const db=localDb(),key=email.toLowerCase();const now=new Date();const attempt=db.prepare('select hits,reset_at from login_attempts where email=?').get(key) as {hits:number;reset_at:string}|undefined;
 if(attempt&&attempt.hits>=10&&attempt.reset_at>now.toISOString())return null;
 const row=db.prepare('select id,password_hash,email_verified_at from users where email=?').get(key) as {id:string;password_hash:string;email_verified_at:string|null}|undefined;
 const valid=row&&checkPassword(password,row.password_hash);if(!valid){db.prepare('insert into login_attempts(email,hits,reset_at) values(?,1,?) on conflict(email) do update set hits=case when reset_at<? then 1 else hits+1 end,reset_at=case when reset_at<? then excluded.reset_at else reset_at end').run(key,new Date(now.getTime()+15*60_000).toISOString(),now.toISOString(),now.toISOString());return null;}
 if(!row.email_verified_at)return null;
 db.prepare('delete from login_attempts where email=?').run(key);db.prepare('update users set last_seen_at=? where id=?').run(now.toISOString(),row.id);return localUser(row.id)!;
}
export function tokenHash(token:string){return createHash('sha256').update(token).digest('hex');}
export function createLocalSession(id:string){const token=randomBytes(32).toString('base64url');localDb().prepare('insert into sessions(token_hash,user_id,expires_at) values(?,?,?)').run(tokenHash(token),id,new Date(Date.now()+30*86400_000).toISOString());return token;}
export function userForToken(token:string){const row=localDb().prepare('select user_id from sessions where token_hash=? and expires_at>?').get(tokenHash(token),new Date().toISOString()) as {user_id:string}|undefined;return row?localUser(row.user_id):undefined;}
export function deleteLocalSession(token:string){localDb().prepare('delete from sessions where token_hash=?').run(tokenHash(token));}
type LetterRow={id:string;slug:string;author:string;title:string;published_at:string;filename:string;original_name:string;file_size:number;is_private:number;created_at:string};
export function localLetters(){return localDb().prepare('select * from prayer_letters order by published_at desc,created_at desc').all() as LetterRow[];}
export function localLetter(slug:string){return localDb().prepare('select * from prayer_letters where slug=?').get(slug) as LetterRow|undefined;}
export function localLetterById(id:string){return localDb().prepare('select * from prayer_letters where id=?').get(id) as LetterRow|undefined;}
export function localEntry(row:LetterRow,full=false):Entry{const seeded=row.slug.startsWith('hui-2026');const month=seeded?`${row.slug.slice(-6,-2)}年${Number(row.slug.slice(-2))}月`:undefined;return {id:row.id,kind:'prayer',slug:row.slug,title:i18n(row.title,seeded?`Pastor Fai Prayer Letter · ${row.slug.slice(-6)}`:row.title,seeded?`暉牧代祷信 · ${row.slug.slice(-6)}`:row.title),description:i18n('暉牧每月代禱信。', 'Monthly prayer letter from Pastor Fai.','暉牧每月代祷信。'),body:i18n('','',''),data:{author:row.author==='JOYCE LOK'?'JOYCE LOK':'暉牧',timeline_date:month,...(full?{pdf_id:row.id}:{})},status:'published',published_at:row.published_at,display_order:0,featured:false,is_demo:false,is_private:false};}
export function prayerFile(name:string){return join(root,'prayer',name);}
