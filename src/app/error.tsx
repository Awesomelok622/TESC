'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="standalone-state"><p className="eyebrow">TESC</p><h1>暫時未能載入內容</h1><p>Content is temporarily unavailable. Please try again.</p><button className="button" onClick={reset}>重試 / Try again</button></main>}
