import {type Entry} from './domain';
import plan from './digitisation-plan.json';

export function officialDigitisationEntries():Entry[]{
 const items=[{kind:'project' as const,...plan.project},...plan.sections.map(section=>({kind:'project_section' as const,...section}))];
 return items.map((item,index)=>({
  id:`00000000-0000-4000-8000-${String(100+index).padStart(12,'0')}`,
  kind:item.kind,slug:item.slug,title:item.title,description:item.description,body:item.body,
  data:{},status:'published' as const,published_at:'2026-07-31T00:00:00Z',
  display_order:index,featured:false,is_demo:false,is_private:false
 }));
}
