'use client';
import {useEffect,useState} from 'react';
import {type Locale} from '@/lib/domain';
export function HeroGallery({cover,locale}:{cover?:string;locale:Locale}){
 const images=[...(cover?[{src:cover,alt:'TESC'}]:[]),{src:'/images/courses.jpeg',alt:locale==='en'?'Theological education course poster':locale==='zh-Hans'?'神学教育课程海报':'神學教育課程海報'},{src:'/images/education-poster.jpeg',alt:locale==='en'?'Education ministry poster':locale==='zh-Hans'?'教育事工海报':'教育事工海報'}];
 const [active,setActive]=useState(0);
 useEffect(()=>{const timer=setInterval(()=>setActive(i=>(i+1)%images.length),6500);return ()=>clearInterval(timer);},[images.length]);
 return <figure className="hero-image hero-gallery"><img src={images[active].src} alt={images[active].alt} fetchPriority={active===0?'high':undefined}/><figcaption>{images[active].alt}</figcaption>{cover&&active===0&&<span className="image-caption">TESC<br/><small>THEOLOGICAL EDUCATION<br/>SERVICE CORPS</small></span>}<div className="hero-dots" aria-label="重點圖片">{images.map((image,i)=><button key={image.src} type="button" aria-label={`顯示圖片 ${i+1}`} aria-current={i===active?'true':undefined} onClick={()=>setActive(i)}/>)}</div></figure>;
}
