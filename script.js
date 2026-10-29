/* Theme, mobile menu, progress bar, language preference. Content is pre-rendered per language (EN at /, FA at /fa/). */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* language: remember an explicit choice; first-time Persian browsers on the English page are sent to /fa/ */
$('#langBtn')?.addEventListener('click',e=>store.set('siteLang',e.currentTarget.dataset.setLang||''));
(function(){
  const url=document.documentElement.dataset.faUrl;
  if(!url||store.get('siteLang'))return;
  if(new URLSearchParams(location.search).has('lang'))return;
  if((navigator.language||'').toLowerCase().startsWith('fa'))location.replace(url+location.hash);
})();

/* theme */
const mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function applyTheme(dark){document.body.classList.toggle('dark',dark);$$('meta[name="theme-color"]').forEach(m=>m.content=dark?'#0c1110':'#17201d');$('#themeBtn')?.setAttribute('aria-pressed',String(dark))}
const savedTheme=store.get('siteTheme');
applyTheme(savedTheme?savedTheme==='dark':!!(mq&&mq.matches));
$('#themeBtn')?.addEventListener('click',()=>{const d=!document.body.classList.contains('dark');applyTheme(d);store.set('siteTheme',d?'dark':'light')});

/* mobile menu */
const nav=$('#nav'),menuBtn=$('#menuBtn');
function setMenu(open){if(!nav||!menuBtn)return;nav.classList.toggle('open',open);menuBtn.setAttribute('aria-expanded',String(open))}
menuBtn?.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
$$('#nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){setMenu(false);menuBtn.focus()}});
document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&!e.target.closest('header'))setMenu(false)});

/* scroll progress */
const bar=$('.progress');
if(bar)addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?scrollY/h*100:0)+'%'},{passive:true});
