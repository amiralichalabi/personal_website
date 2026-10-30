/* Theme, mobile menu, progress bar, language preference. Content is pre-rendered per language (EN at /, FA at /fa/). */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
/* clickjacking guard (GitHub Pages cannot send frame-ancestors) */
if(window.top!==window.self){try{window.top.location.href=window.location.href}catch(e){document.documentElement.style.display='none'}}
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

/* highlight the section being read in the nav */
(function(){
  const links=$$('#nav a[href^="#"]');
  const map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
  if(!('IntersectionObserver' in window)||!map.size)return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    links.forEach(l=>l.removeAttribute('aria-current'));
    map.get(e.target.id)?.setAttribute('aria-current','true');
  }),{rootMargin:'-40% 0px -55% 0px'});
  map.forEach((a,id)=>{const el=document.getElementById(id);if(el)io.observe(el)});
})();
