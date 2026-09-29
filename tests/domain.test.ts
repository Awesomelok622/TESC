import {describe,it,expect} from 'vitest';
import {visible,publicResource,hkToUtc,utcToHk,translation,i18n,validateFile,canManage,videoEmbed,contactSchema,submissionSchema,entrySchema} from '../src/lib/domain';
import {cleanHtml} from '../src/lib/sanitize';
describe('UTC scheduling',()=>{
 const letter={status:'published' as const,published_at:'2026-10-15T01:00:00.000Z'};
 it('hides scheduled prayer before time',()=>expect(visible(letter,new Date('2026-10-15T00:59:59Z'))).toBe(false));
 it('reveals letter exactly at publication time',()=>expect(visible(letter,new Date('2026-10-15T01:00:00Z'))).toBe(true));
 it('never exposes draft, archived or deleted records',()=>{for(const status of ['draft','archived'] as const)expect(visible({...letter,status},new Date('2027-01-01'))).toBe(false);expect(visible({...letter,deleted_at:'2026-01-01'},new Date('2027-01-01'))).toBe(false);});
 it('roundtrips Hong Kong schedule',()=>{expect(hkToUtc('2026-10-15T09:00')).toBe('2026-10-15T01:00:00.000Z');expect(utcToHk(letter.published_at)).toBe('2026-10-15T09:00');});
});
describe('upload validation',()=>{
 const pdf=new TextEncoder().encode('%PDF-1.7\nDemo content\n%%EOF');
 it('accepts a PDF with matching extension and MIME',()=>expect(validateFile('example.pdf','application/pdf',pdf,100,true).extension).toBe('pdf'));
 it.each(['file.html','file.exe','file.svg','file.js','file.zip','file.pdf.exe'])('rejects %s',name=>expect(()=>validateFile(name,'application/pdf',pdf,100,true)).toThrow());
 it('rejects forged MIME and file headers',()=>{expect(()=>validateFile('file.pdf','text/html',pdf,100,true)).toThrow();expect(()=>validateFile('file.pdf','application/pdf',new TextEncoder().encode('<script>x</script>'),100,true)).toThrow();});
 it('rejects empty and oversized files',()=>{expect(()=>validateFile('x.pdf','application/pdf',new Uint8Array(),100,true)).toThrow();expect(()=>validateFile('x.pdf','application/pdf',pdf,5,true)).toThrow();});
 it('sanitizes unsafe filenames without using them as storage paths',()=>expect(validateFile('../../name.pdf','application/pdf',pdf,100,true).name).not.toContain('/'));
 it('does not allow images in public PDF endpoint',()=>expect(()=>validateFile('x.png','image/png',new Uint8Array([137,80,78,71,13,10,26,10]),100,true)).toThrow());
});
describe('moderation and roles',()=>{
 it('requires all visibility conditions',()=>{expect(publicResource({status:'approved',published:true,scan_status:'clean'})).toBe(true);for(const status of ['pending','hidden','rejected'] as const)expect(publicResource({status,published:true,scan_status:'clean'})).toBe(false);expect(publicResource({status:'approved',published:false,scan_status:'clean'})).toBe(false);expect(publicResource({status:'approved',published:true,scan_status:'pending'})).toBe(false);});
 it('enforces role boundary',()=>{expect(canManage(undefined,'prayer')).toBe(false);expect(canManage('editor','prayer')).toBe(true);expect(canManage('editor','roles')).toBe(false);expect(canManage('editor','settings')).toBe(false);expect(canManage('super_admin','roles')).toBe(true);});
});
describe('input and rendering',()=>{
 it('labels fallback and keeps translations independent',()=>{const value=i18n('繁體','','简体');expect(translation(value,'en')).toEqual({text:'繁體',fallback:true,language:'zh-Hant'});expect(translation(value,'zh-Hans').text).toBe('简体');expect(translation(i18n('','English',''),'zh-Hant').text).toBe('English');});
 it('sanitizes stored XSS',()=>{const html=cleanHtml('<p onclick="x()">Hello</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src="x" onerror="x()"><iframe src="https://evil.com"></iframe>');expect(html).not.toMatch(/onclick|script|onerror|iframe|javascript:/);});
 it('allows only recognized video providers',()=>{expect(videoEmbed('youtube','https://youtu.be/abcdefghijk')).toBe('https://www.youtube-nocookie.com/embed/abcdefghijk');expect(videoEmbed('youtube','https://evil.com/watch?v=abcdefghijk')).toBeNull();expect(videoEmbed('vimeo','https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456');});
 it('requires consent and valid contact details',()=>{const good={name:'Test',email:'test@example.org',phone:'',subject:'Question',message:'A test enquiry for the team.',consent:true};expect(contactSchema.safeParse(good).success).toBe(true);expect(contactSchema.safeParse({...good,consent:false}).success).toBe(false);expect(contactSchema.safeParse({...good,email:'bad'}).success).toBe(false);});
 it('requires upload permission agreement',()=>expect(submissionSchema.safeParse({title:'test',description:'long enough',category:'general',locale:'en',contributor_name:'',contributor_email:'',agreement:false}).success).toBe(false));
 it('rejects unsafe content links',()=>expect(entrySchema.safeParse({kind:'course',slug:'course',title:i18n(''),description:i18n(''),body:i18n(''),data:{registration_url:'javascript:alert(1)'},status:'draft',published_at:null,display_order:0,featured:false}).success).toBe(false));
});
