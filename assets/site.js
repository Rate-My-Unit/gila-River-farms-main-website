(function(){
"use strict";
const $=s=>document.querySelector(s);
const OFFICE="(520) 315-3965";
const esc=t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- menu ---------- */
const nav=$("#nav"),menuBtn=$("#menuBtn");
function closeMenus(){document.querySelectorAll(".has-sub.open").forEach(li=>{li.classList.remove("open");li.querySelector(".parent").setAttribute("aria-expanded","false")})}
function setMenu(o){
  if(o)document.documentElement.style.setProperty("--navtop",document.querySelector("header").getBoundingClientRect().bottom+"px");
  nav.classList.toggle("open",o);menuBtn.setAttribute("aria-expanded",o);
  document.documentElement.classList.toggle("menu-open",o);
  if(o)nav.scrollTop=0;
}
document.addEventListener("click",e=>{
  const par=e.target.closest(".parent");
  if(par){const li=par.parentElement,o=!li.classList.contains("open");closeMenus();li.classList.toggle("open",o);par.setAttribute("aria-expanded",o);return}
  if(!e.target.closest("nav"))closeMenus();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeMenus();setMenu(false)}});
menuBtn.addEventListener("click",()=>setMenu(!nav.classList.contains("open")));
addEventListener("resize",()=>{if(innerWidth>1080&&nav.classList.contains("open"))setMenu(false)});

/* ---------- copy buttons ---------- */
document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",()=>{const done=()=>{b.textContent="Copied";setTimeout(()=>b.textContent="Copy",1600)};const v=b.dataset.copy;if(navigator.clipboard){navigator.clipboard.writeText(v).then(done,()=>{const r=document.createRange();r.selectNodeContents(b.previousElementSibling);const s=getSelection();s.removeAllRanges();s.addRange(r)})}}));

/* ---------- jobs ---------- */
const jobs=[
  ["Irrigation Crew","Now hiring","Set water, maintain ditches and gates, and keep fields on schedule through the irrigation season."]
];
const jobsEl=$("#jobs");
if(jobsEl)jobsEl.innerHTML=jobs.map(([t,ty,d])=>`<li><div><h3>${esc(t)}<span class="type">${esc(ty)}</span></h3><p>${esc(d)}</p></div><a class="btn ghost" href="/job-application/?position=${encodeURIComponent(t)}">Apply</a></li>`).join("");

/* ---------- crops ---------- */
const M=["J","F","M","A","M","J","J","A","S","O","N","D"];
const now=new Date().getMonth();
const ICONS={"Alfalfa": "<svg viewBox=\"0 0 32 32\"><path d=\"M16 29V9M16 20l-6-5M16 15l6-4\" stroke=\"#3E7D3A\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"9\" cy=\"14\" rx=\"3.4\" ry=\"2.2\" fill=\"#5FA04E\" transform=\"rotate(-30 9 14)\"/><ellipse cx=\"23\" cy=\"10\" rx=\"3.4\" ry=\"2.2\" fill=\"#5FA04E\" transform=\"rotate(25 23 10)\"/><ellipse cx=\"13\" cy=\"24\" rx=\"3\" ry=\"2\" fill=\"#5FA04E\" transform=\"rotate(-20 13 24)\"/><circle cx=\"16\" cy=\"6\" r=\"2.6\" fill=\"#8A5BB5\"/><circle cx=\"13.5\" cy=\"7.5\" r=\"2\" fill=\"#A47AD0\"/><circle cx=\"18.5\" cy=\"7.5\" r=\"2\" fill=\"#A47AD0\"/></svg>", "Cotton": "<svg viewBox=\"0 0 32 32\"><path d=\"M16 30v-8\" stroke=\"#6B4E33\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M8 22l8-4 8 4-3 3H11z\" fill=\"#7A5A3A\"/><circle cx=\"11\" cy=\"14\" r=\"5\" fill=\"#FFFFFF\" stroke=\"#CFC9BC\"/><circle cx=\"21\" cy=\"14\" r=\"5\" fill=\"#FFFFFF\" stroke=\"#CFC9BC\"/><circle cx=\"16\" cy=\"10\" r=\"5.5\" fill=\"#FFFFFF\" stroke=\"#CFC9BC\"/><circle cx=\"16\" cy=\"17\" r=\"4.5\" fill=\"#FFFFFF\" stroke=\"#CFC9BC\"/></svg>", "Corn": "<svg viewBox=\"0 0 32 32\"><ellipse cx=\"16\" cy=\"13\" rx=\"5.5\" ry=\"10\" fill=\"#E8B931\"/><path d=\"M12 7h8M11 11h10M11 15h10M12 19h8M16 4v18\" stroke=\"#C99A1B\" stroke-width=\"1.2\"/><path d=\"M16 30c-5-2-9-7-9-14 3 3 6 7 9 14zM16 30c5-2 9-7 9-14-3 3-6 7-9 14z\" fill=\"#5FA04E\"/></svg>", "Oranges": "<svg viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"18\" r=\"10\" fill=\"#F28C1E\"/><circle cx=\"12\" cy=\"14\" r=\"2\" fill=\"#F7B05B\"/><path d=\"M16 8V5\" stroke=\"#6B4E33\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M17 6c3-3 7-3 8-1-2 3-6 3-8 1z\" fill=\"#4E9A3E\"/></svg>", "Grapefruit": "<svg viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"12\" fill=\"#F3B26B\"/><circle cx=\"16\" cy=\"16\" r=\"9.5\" fill=\"#E8606A\"/><g stroke=\"#F9D5C8\" stroke-width=\"1.3\"><path d=\"M16 6.5v19M6.5 16h19M9.3 9.3l13.4 13.4M22.7 9.3L9.3 22.7\"/></g><circle cx=\"16\" cy=\"16\" r=\"1.6\" fill=\"#F9D5C8\"/></svg>", "Lemons": "<svg viewBox=\"0 0 32 32\"><path d=\"M5 18c0-6 5-10 11-10s11 4 11 10-5 9-11 9S5 24 5 18z\" fill=\"#F5D33D\"/><path d=\"M5 18l-2 1M27 18l2-1\" stroke=\"#E2BC1F\" stroke-width=\"2.4\" stroke-linecap=\"round\"/><ellipse cx=\"12\" cy=\"14\" rx=\"2.4\" ry=\"1.4\" fill=\"#FBE68A\"/><path d=\"M17 8c2-4 6-5 8-3-2 3-5 4-8 3z\" fill=\"#4E9A3E\"/></svg>", "Olives": "<svg viewBox=\"0 0 32 32\"><path d=\"M4 8c8 1 14 5 18 14\" stroke=\"#6B4E33\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"9\" cy=\"5.5\" rx=\"4\" ry=\"1.6\" fill=\"#7E9A4E\" transform=\"rotate(15 9 5.5)\"/><ellipse cx=\"19\" cy=\"11\" rx=\"4.2\" ry=\"1.6\" fill=\"#7E9A4E\" transform=\"rotate(40 19 11)\"/><ellipse cx=\"11\" cy=\"16\" rx=\"3.6\" ry=\"4.6\" fill=\"#5B6B2E\"/><ellipse cx=\"20\" cy=\"24\" rx=\"3.6\" ry=\"4.6\" fill=\"#2F3A1E\"/><ellipse cx=\"10\" cy=\"14.5\" rx=\"1\" ry=\"1.4\" fill=\"#93A85E\"/><ellipse cx=\"19\" cy=\"22.5\" rx=\"1\" ry=\"1.4\" fill=\"#58663D\"/></svg>"};
const crops=[
  {n:"Alfalfa",t:"Hay · 4,038.1 acres",h:[3,4,5,6,7,8,9,10],d:"The farm’s largest crop by acreage. Cut and baled through the growing season and sold as Horse Hay and Cow Hay."},
  {n:"Upland Cotton",i:"Cotton",t:"1,081 acres",h:[9,10,11],d:"Gila River Farms began as a cotton raising operation, and cotton is still one of the farm’s primary crops."},
  {n:"Corn",t:"1,024.8 acres",h:[6,7,8],d:"A summer crop grown in rotation with the farm’s alfalfa fields."},
  {n:"Olives",t:"355.9 acres",h:[8,9,10],d:"Olive trees harvested in the fall and pressed into the farm’s Extra Virgin Olive Oil."},
  {n:"Lemons",t:"Citrus",h:[9,10,11,0,1,2],d:"Part of the farm’s 257 acres of citrus."},
  {n:"Navels",i:"Oranges",t:"Citrus",h:[10,11,0,1],d:"Sweet navel oranges from the farm’s citrus groves."},
  {n:"Minneolas",i:"Oranges",t:"Citrus",h:[0,1,2],d:"Juicy Minneola tangelos, a cross between a grapefruit and a tangerine."},
  {n:"Grapefruit",t:"Citrus · including Ruby Red",h:[11,0,1,2,3,4],d:"Grapefruit and Ruby Red grapefruit grown in the farm’s citrus groves."}
];
const MN=["January","February","March","April","May","June","July","August","September","October","November","December"];

const cropsEl=document.getElementById("crops");if(cropsEl)cropsEl.innerHTML=crops.map(c=>`
  <article class="crop">
    <div class="tx"><div class="nmrow"><span class="ico" aria-hidden="true">${ICONS[c.i||c.n]}</span><div><span class="var">${c.t}</span><h3>${c.n}</h3></div></div><p>${c.d}</p></div>
    <div class="strip" role="img" aria-label="${c.n} harvest: ${c.h.map(i=>MN[i]).join(", ")}">${M.map((m,i)=>`<span class="${c.h.includes(i)?"on":""} ${i===now?"now":""}"><i></i>${m}</span>`).join("")}</div>
  </article>`).join("");

/* ---------- forms ---------- */
function labelOf(el,form){
  if(el.id){const l=form.querySelector('label[for="'+el.id+'"]');if(l)return l.textContent.replace(/\*/g,"").trim()}
  const f=el.closest(".field");const q=f&&(f.querySelector(".q")||f.querySelector("p"));
  return q?q.textContent.replace(/\*/g,"").trim():(el.name||el.id||"Field");
}
function collect(form){
  const out=[];
  form.querySelectorAll("input,select,textarea").forEach(el=>{
    if(el.name==="company"||el.type==="submit"||el.type==="button"||el.type==="file")return;
    if(el.type==="radio"){if(el.checked)out.push([labelOf(el,form),el.value]);return}
    if(el.type==="checkbox"){
      if(!el.checked)return;
      const opt=el.closest("label")?el.closest("label").textContent.trim():"Yes";
      const f=el.closest(".field"),q=f&&f.querySelector(".q");
      if(f&&f.classList.contains("agree")){const p=f.querySelector("p");out.push([(p?p.textContent.replace(/\*/g,"").trim().slice(0,90)+"…":"Agreement"),"I agree"]);return}
      out.push([q?q.textContent.replace(/\*/g,"").trim():"Checked",opt]);return;
    }
    const v=(el.value||"").trim();if(!v)return;
    out.push([labelOf(el,form),v]);
  });
  return out;
}
function addHoneypot(f){if(f.querySelector('[name="company"]'))return;const i=document.createElement("input");i.name="company";i.tabIndex=-1;i.autocomplete="off";i.setAttribute("aria-hidden","true");i.style.cssText="position:absolute;left:-9999px;width:1px;height:1px;opacity:0";f.appendChild(i)}
async function sendForm(name,form){
  const hp=form.querySelector('[name="company"]');
  const r=await fetch("/api/submit/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({form:name,page:location.pathname,fields:collect(form),company:hp?hp.value:""})});
  if(!r.ok)throw new Error("HTTP "+r.status);
}
function showMsg(form,msg,isErr){let out=form.querySelector(".sent");if(!out){out=document.createElement("p");out.className="sent";out.setAttribute("role","status");form.appendChild(out)}out.textContent=msg;out.classList.toggle("err",!!isErr);out.hidden=false}
function showErr(form,msg){showMsg(form,msg,true)}
function formName(f){if(f.dataset.form)return f.dataset.form;const h=document.querySelector("main h1");return (h?h.textContent.trim():"Website")+" form"}
document.querySelectorAll("form").forEach(addHoneypot);
document.querySelectorAll("form[data-msg]").forEach(f=>f.addEventListener("submit",async e=>{
  e.preventDefault();
  if(!f.checkValidity()){f.reportValidity();return}
  const btn=f.querySelector('[type="submit"]'),old=btn&&btn.textContent;if(btn){btn.disabled=true;btn.textContent="Sending…"}
  try{await sendForm(formName(f),f);showMsg(f,f.dataset.msg,false);f.querySelectorAll("input:not([name=company]),textarea").forEach(x=>x.value="")}
  catch(err){showErr(f,"We couldn’t send this right now. Please try again, or call the office at "+OFFICE+".")}
  finally{if(btn){btn.disabled=false;btn.textContent=old}}
}));

/* hay request form */
const fHay=$("#fHay");if(fHay)fHay.innerHTML="<option>Horse Hay</option><option>Cow Hay</option>";
const hayForm=$("#hayForm");
if(hayForm){
  const setErr=(id,box,bad)=>{document.getElementById(id).hidden=!bad;document.getElementById(box).classList.toggle("bad",bad)};
  hayForm.addEventListener("submit",async e=>{
    e.preventDefault();
    const name=$("#fName").value.trim(),digits=$("#fPhone").value.replace(/\D/g,"");
    setErr("eName","fbName",!name);setErr("ePhone","fbPhone",digits.length<10);
    if(!name||digits.length<10)return;
    const btn=hayForm.querySelector('[type="submit"]'),old=btn.textContent;btn.disabled=true;btn.textContent="Sending…";
    try{await sendForm("Hay request",hayForm);showMsg(hayForm,`Thanks, ${name}. We'll call you back to confirm your hay order.`,false);hayForm.reset()}
    catch(err){showErr(hayForm,"We couldn’t send your request right now. Please call the office at "+OFFICE+".")}
    finally{btn.disabled=false;btn.textContent=old}
  });
}

/* employment application */
if(document.getElementById("appForm")){
const appForm=document.getElementById("appForm"),appSteps=[...appForm.querySelectorAll(".step")];let appCur=0;
function appShow(i){
  appCur=i;appSteps.forEach((st,k)=>st.hidden=k!==i);
  document.getElementById("appBar").style.width=((i+1)/appSteps.length*100)+"%";
  document.getElementById("appCount").textContent=`Step ${i+1} of ${appSteps.length}: ${appSteps[i].dataset.title}`;
  document.getElementById("appBack").hidden=i===0;
  const last=i===appSteps.length-1;document.getElementById("appNext").hidden=last;document.getElementById("appSubmit").hidden=!last;
}
function appValid(){for(const el of appSteps[appCur].querySelectorAll("input,select,textarea")){if(!el.checkValidity()){el.reportValidity();el.focus();return false}}return true}
function appTop(){appForm.scrollIntoView({block:"start",behavior:"smooth"})}
document.getElementById("appNext").addEventListener("click",()=>{if(appValid()){appShow(appCur+1);appTop()}});
document.getElementById("appBack").addEventListener("click",()=>{appShow(appCur-1);appTop()});
appForm.addEventListener("submit",async e=>{e.preventDefault();if(!appValid())return;
  const btn=document.getElementById("appSubmit"),old=btn.textContent;btn.disabled=true;btn.textContent="Sending…";
  try{await sendForm("Employment application",appForm);appForm.hidden=true;document.getElementById("appDone").hidden=false;appForm.reset();appShow(0)}
  catch(err){showErr(appForm,"We couldn’t send your application right now. Please try again, or call the office at "+OFFICE+".")}
  finally{btn.disabled=false;btn.textContent=old}});
document.getElementById("appAgain").addEventListener("click",()=>{appForm.hidden=false;document.getElementById("appDone").hidden=true;appShow(0);appTop()});
appShow(0);

  const pos=new URLSearchParams(location.search).get("position");if(pos)document.getElementById("aPos").value=pos;
}

/* ---------- homepage ---------- */
const statsEl=document.getElementById("stats");let counted=false;
function runCount(){
  if(counted)return;counted=true;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const nums=statsEl.querySelectorAll("[data-to]"),t0=performance.now(),D=1800;
  const fmt=(v,d)=>v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
  (function frame(t){const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);
    nums.forEach(n=>n.textContent=fmt(+n.dataset.to*e,+n.dataset.dec));
    if(k<1)requestAnimationFrame(frame)})(t0);
}
function checkStats(){if(counted||!statsEl)return;if(statsEl.getBoundingClientRect().top<innerHeight*.85)runCount()}
addEventListener("scroll",checkStats,{passive:true});addEventListener("resize",checkStats);
if(statsEl)checkStats();
(function(){
  const ss=document.getElementById("slideshow");if(!ss)return;
  const slides=[...ss.querySelectorAll(".slide")],dots=ss.querySelector(".ss-dots");let i=0,timer;
  slides.forEach((_,k)=>{const b=document.createElement("button");b.type="button";b.setAttribute("role","tab");b.setAttribute("aria-label","Photo "+(k+1));b.addEventListener("click",()=>{show(k);restart()});dots.appendChild(b)});
  function show(k){i=(k+slides.length)%slides.length;slides.forEach((sl,n)=>{sl.classList.toggle("is-on",n===i);sl.setAttribute("aria-hidden",n!==i)});[...dots.children].forEach((d,n)=>d.setAttribute("aria-selected",n===i))}
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function restart(){clearInterval(timer);if(slides.length>1)timer=setInterval(()=>show(i+1),2500)}
  ss.querySelector(".ss-prev").addEventListener("click",()=>{show(i-1);restart()});
  ss.querySelector(".ss-next").addEventListener("click",()=>{show(i+1);restart()});
  ss.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse")clearInterval(timer)});ss.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")restart()});document.addEventListener("visibilitychange",()=>{if(!document.hidden)restart()});
  let x0=null;ss.addEventListener("touchstart",e=>{x0=e.touches[0].clientX},{passive:true});
  ss.addEventListener("touchend",e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){show(i+(dx<0?1:-1));restart()}x0=null});
  show(0);restart();
})();
/* BACK START */
(function(){
  const PARENT={mission:"home",staff:"home",history:"home",donation:"home","donation-policy":"donation",jobs:"home",apply:"jobs",
    hay:"home","horse-hay":"hay","cow-hay":"hay","olive-oil":"hay",grow:"home",contact:"home",privacy:"home",account:"home",cart:"hay",checkout:"cart"};
  const LABEL={home:"Home",hay:"Hay",donation:"Request a Donation",jobs:"Available Jobs",cart:"Cart"};
  const PATHS={home:"/",hay:"/hay/",donation:"/donate/",jobs:"/available-jobs/",cart:"/cart/"};
  const live=!!window.GRF_LIVE;
  document.querySelectorAll(".page").forEach(pg=>{
    const id=pg.id.replace(/^p-/,"");if(id==="home"||id==="404"||pg.querySelector(".back-btn"))return;
    const to=PARENT[id]||"home";
    const row=document.createElement("div");row.className="back-row"+(pg.classList.contains("wrap")?"":" wrap");
    row.innerHTML=`<a class="back-btn" href="${live?PATHS[to]:"#"+to}"${live?"":` data-go="${to}"`}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>Back to ${LABEL[to]}</a>`;
    pg.insertBefore(row,pg.firstChild);
  });
})();
/* BACK END */

/* SHOP START */
(function(){
const LIVE=!!window.GRF_LIVE;
const OFFICE_PHONE="(520) 315-3965";
const CATALOG={"horse-hay":{name:"Horse Hay",price:15,sku:"HHN"},"cow-hay":{name:"Cow Hay",price:10,sku:""}};
const PATHS={cart:"/cart/",checkout:"/checkout/",account:"/account/",hay:"/hay/","horse-hay":"/horse-hay/","cow-hay":"/cow-hay/"};
const lnk=(id,text,cls)=>`<a ${cls?`class="${cls}" `:""}href="${LIVE?PATHS[id]:"#"+id}"${LIVE?"":` data-go="${id}"`}>${text}</a>`;
const q=s=>document.querySelector(s);
const e2=t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const usd=v=>"$"+(+v).toFixed(2);
let mem=[];
function cartGet(){try{const c=JSON.parse(localStorage.getItem("grf_cart")||"[]");return Array.isArray(c)?c.filter(x=>CATALOG[x.id]&&x.qty>0):[]}catch(e){return mem}}
function cartSet(c){mem=c;try{localStorage.setItem("grf_cart",JSON.stringify(c))}catch(e){}render()}
function cartAdd(id,n){const c=cartGet(),it=c.find(x=>x.id===id);if(it)it.qty=Math.min(999,it.qty+n);else c.push({id,qty:n});cartSet(c)}
const count=c=>c.reduce((n,x)=>n+x.qty,0), total=c=>c.reduce((t,x)=>t+CATALOG[x.id].price*x.qty,0);
function render(){
  const c=cartGet(),n=count(c),b=q("#cartCount");
  if(b){b.textContent=n;b.hidden=!n}
  const list=q("#cartList");
  if(list){
    list.innerHTML=c.length?c.map(x=>{const p=CATALOG[x.id];return `<div class="cart-row" data-id="${x.id}">
      <div class="cr-name">${lnk(x.id,e2(p.name))}<span class="cr-unit">${usd(p.price)} each</span></div>
      <div class="qty"><button type="button" class="qbtn" data-step="-1" aria-label="Decrease ${e2(p.name)} quantity">−</button><input type="number" min="1" max="999" value="${x.qty}" aria-label="${e2(p.name)} quantity" class="qin"><button type="button" class="qbtn" data-step="1" aria-label="Increase ${e2(p.name)} quantity">+</button></div>
      <div class="cr-total num">${usd(p.price*x.qty)}</div>
      <button type="button" class="cr-remove" aria-label="Remove ${e2(p.name)}">Remove</button></div>`}).join("")
      :`<div class="cart-empty"><h2>Your cart is empty</h2><p>Add horse hay or cow hay to get started.</p>${lnk("hay","Shop hay","btn solid")}</div>`;
    q("#cartItems").textContent=n;q("#cartTotal").textContent=usd(total(c));
    q("#cartBox").hidden=!c.length;
  }
  const sum=q("#coSummary");
  if(sum){sum.innerHTML=c.length?`<ul class="co-lines">${c.map(x=>`<li><span>${e2(CATALOG[x.id].name)} × ${x.qty}</span><span class="num">${usd(CATALOG[x.id].price*x.qty)}</span></li>`).join("")}</ul><div class="co-total"><span>Total</span><span class="num">${usd(total(c))}</span></div>`:`<p class="muted">Your cart is empty. ${lnk("hay","Shop hay","link")}</p>`;
    const sb=q("#coSubmit");if(sb)sb.disabled=!c.length;}
}
document.addEventListener("click",ev=>{
  const row=ev.target.closest(".cart-row");if(!row)return;
  const id=row.dataset.id,c=cartGet(),it=c.find(x=>x.id===id);if(!it)return;
  if(ev.target.closest(".cr-remove")){cartSet(c.filter(x=>x.id!==id));return}
  const st=ev.target.closest(".qbtn");if(st){it.qty=Math.max(1,Math.min(999,it.qty+ +st.dataset.step));cartSet(c)}
});
document.addEventListener("change",ev=>{
  if(!ev.target.matches(".qin"))return;const id=ev.target.closest(".cart-row").dataset.id,c=cartGet(),it=c.find(x=>x.id===id);
  if(it){it.qty=Math.max(1,Math.min(999,parseInt(ev.target.value,10)||1));cartSet(c)}
});
document.querySelectorAll("form.buy").forEach(f=>f.addEventListener("submit",ev=>{
  ev.preventDefault();const inp=f.querySelector("input"),n=Math.max(1,Math.min(999,parseInt(inp.value,10)||1)),p=CATALOG[f.dataset.product];
  cartAdd(f.dataset.product,n);const out=f.querySelector(".sent");
  out.innerHTML=`Added ${n} × ${e2(p.name)} to your cart. ${lnk("cart","View cart","link")}`;out.hidden=false;inp.value=1;
}));
function say(form,msg,err){const o=form.querySelector(".sent");o.innerHTML=msg;o.classList.toggle("err",!!err);o.hidden=false}
function valid(form){for(const el of form.querySelectorAll("input,select,textarea")){if(!el.checkValidity()){el.reportValidity();return false}}return true}
async function api(path,body){const r=await fetch(path,{method:body?"POST":"GET",headers:body?{"Content-Type":"application/json"}:{},credentials:"same-origin",body:body?JSON.stringify(body):undefined});let d={};try{d=await r.json()}catch(e){}return {ok:r.ok,status:r.status,data:d}}
const notLive=`Online ordering and accounts turn on when the website is live. To order now, call the office at ${OFFICE_PHONE}.`;

/* ----- checkout ----- */
const co=q("#coForm");let cfg={card:false,accounts:false},stripe=null,elements=null;
if(co){
  const pk=q("#coPickup"),today=new Date(),iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
  pk.min=iso(today);const max=new Date(today);max.setDate(max.getDate()+30);pk.max=iso(max);
  function payMode(){return (q('input[name="coPay"]:checked')||{}).value||"pickup"}
  function cents(){return Math.round(total(cartGet())*100)}
  async function setupCard(){
    if(!cfg.card||elements)return;
    if(!window.Stripe){await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://js.stripe.com/v3/";s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
    stripe=Stripe(cfg.stripePk);
    elements=stripe.elements({mode:"payment",amount:Math.max(50,cents()),currency:"usd",appearance:{theme:"stripe",variables:{colorPrimary:"#00754A",borderRadius:"10px"}}});
    elements.create("payment").mount("#payElement");
  }
  document.querySelectorAll('input[name="coPay"]').forEach(r=>r.addEventListener("change",async()=>{
    const card=payMode()==="card";q("#payElement").hidden=!card;q("#coSubmit").textContent=card?"Pay and place order":"Place order";
    if(card){try{await setupCard()}catch(e){say(co,"Card payments couldn't load. Choose Pay at pickup or call the office.",true)}}
  }));
  const origRender=render;
  render=function(){origRender();if(elements)elements.update({amount:Math.max(50,cents())})};
  if(LIVE){
    api("/api/config/").then(r=>{cfg=r.data||cfg;if(cfg.card)q("#payCardOpt").hidden=false});
    api("/api/account/").then(r=>{if(r.ok&&r.data.user){const u=r.data.user;if(!q("#coName").value)q("#coName").value=u.name||"";if(!q("#coEmail").value)q("#coEmail").value=u.email||"";if(!q("#coPhone").value)q("#coPhone").value=u.phone||""}});
    const pi=new URLSearchParams(location.search).get("payment_intent");
    if(pi)finish({payment:"card",paymentIntentId:pi});
  }
  function done(order){
    cartSet([]);q("#coWrap").hidden=true;q("#coDone").hidden=false;q("#coNumber").textContent=order.id;
    if(order.payment==="card")q("#coDoneMsg").textContent="Your payment went through and we emailed you a receipt. Remember, hay must be picked up within 24 hours of purchase.";
    else q("#coDoneMsg").textContent="Pay when you pick up. We emailed you a confirmation. Remember, hay must be picked up within 24 hours of purchase.";
    window.scrollTo(0,0);
  }
  async function finish(body){
    const r=await api("/api/checkout/",{action:"place",...body});
    if(r.ok&&r.data.order){try{sessionStorage.removeItem("grf_co")}catch(e){};done(r.data.order);return true}
    say(co,`We couldn't place your order (${e2(r.data.error||"error")}). Please call the office at ${OFFICE_PHONE}.`,true);return false;
  }
  co.addEventListener("submit",async ev=>{
    ev.preventDefault();if(!valid(co))return;
    const items=cartGet();if(!items.length)return;
    if(!LIVE){say(co,notLive,true);return}
    const customer={name:q("#coName").value.trim(),email:q("#coEmail").value.trim(),phone:q("#coPhone").value.trim(),pickupDate:pk.value,notes:q("#coNotes").value.trim(),agree:q("#coAgree").checked};
    const btn=q("#coSubmit"),old=btn.textContent;btn.disabled=true;btn.textContent="Placing order…";
    try{
      if(payMode()==="card"&&stripe&&elements){
        const sub=await elements.submit();if(sub.error){say(co,e2(sub.error.message),true);return}
        const r=await api("/api/checkout/",{action:"intent",items,customer});
        if(!r.ok){say(co,`Card payment isn't available right now (${e2(r.data.error||"error")}). Choose Pay at pickup or call ${OFFICE_PHONE}.`,true);return}
        try{sessionStorage.setItem("grf_co","1")}catch(e){}
        const {error,paymentIntent}=await stripe.confirmPayment({elements,clientSecret:r.data.clientSecret,redirect:"if_required",confirmParams:{return_url:location.origin+"/checkout/",receipt_email:customer.email}});
        if(error){say(co,e2(error.message),true);return}
        await finish({payment:"card",paymentIntentId:paymentIntent.id});
      }else{
        await finish({payment:"pickup",items,customer});
      }
    }catch(err){say(co,`Something went wrong. Please call the office at ${OFFICE_PHONE}.`,true)}
    finally{btn.disabled=false;btn.textContent=old}
  });
}

/* ----- account ----- */
const lf=q("#loginForm"),sf=q("#signupForm");
function showUser(u,orders){
  q("#acctOut").hidden=true;q("#acctIn").hidden=false;q("#acctTitle").textContent="Hi, "+(u.name||"there");q("#acctLede").textContent="Your details and order history.";
  q("#acctName").textContent=u.name||"";q("#acctEmail").textContent=u.email||"";q("#acctPhone").textContent=u.phone||"Not added";
  const box=q("#acctOrders");
  box.innerHTML=orders&&orders.length?`<div class="tbl"><table><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Payment</th><th class="r">Total</th></tr></thead><tbody>${orders.map(o=>`<tr><td class="num"><b>${e2(o.id)}</b></td><td>${e2(new Date(o.created).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}))}</td><td>${o.lines.map(l=>e2(l.name)+" × "+l.qty).join("<br>")}</td><td>${o.payment==="card"?"Paid online":"Pay at pickup"}</td><td class="r num">${usd(o.total/100)}</td></tr>`).join("")}</tbody></table></div>`
    :`<p class="muted">No orders yet. ${lnk("hay","Shop hay","link")}</p>`;
}
function showSignedOut(){q("#acctOut").hidden=false;q("#acctIn").hidden=true;q("#acctTitle").textContent="My Account";q("#acctLede").textContent="Sign in to see your orders and check out faster."}
if(lf){
  if(LIVE)api("/api/account/").then(r=>{if(r.ok&&r.data.user)showUser(r.data.user,r.data.orders);else showSignedOut()});
  lf.addEventListener("submit",async ev=>{ev.preventDefault();if(!valid(lf))return;if(!LIVE){say(lf,notLive,true);return}
    const r=await api("/api/auth/",{action:"login",email:q("#lEmail").value.trim(),password:q("#lPass").value});
    if(r.ok){const a=await api("/api/account/");showUser(a.data.user,a.data.orders);lf.reset()}
    else say(lf,r.status===401?"That email and password don't match. Try again.":r.status===503?"Accounts aren't available yet. Please call the office.":"Sign in failed. Please try again.",true)});
  sf.addEventListener("submit",async ev=>{ev.preventDefault();if(!valid(sf))return;if(!LIVE){say(sf,notLive,true);return}
    const r=await api("/api/auth/",{action:"signup",name:q("#rName").value.trim(),phone:q("#rPhone").value.trim(),email:q("#rEmail").value.trim(),password:q("#rPass").value});
    if(r.ok){const a=await api("/api/account/");showUser(a.data.user,a.data.orders);sf.reset()}
    else say(sf,r.status===409?"An account with that email already exists. Sign in instead.":r.status===503?"Accounts aren't available yet. Please call the office.":"We couldn't create your account. Check your details and try again.",true)});
  q("#logoutBtn").addEventListener("click",async()=>{await api("/api/auth/",{action:"logout"});showSignedOut()});
}
render();
addEventListener("storage",ev=>{if(ev.key==="grf_cart")render()});
})();
/* SHOP END */

/* ---------- live agricultural news ---------- */
const grid=$(".news-grid");
if(grid){
  fetch("/api/news/").then(r=>r.ok?r.json():null).then(d=>{
    if(!d||!Array.isArray(d.items)||!d.items.length)return;
    grid.innerHTML=d.items.slice(0,6).map(it=>`<a class="news-card" href="${esc(it.link)}" target="_blank" rel="noopener"><span class="news-tag">${esc(it.tag)}</span><h3>${esc(it.title)}</h3><span class="news-meta">${esc(it.source)}${it.date?" · "+esc(it.date):""}</span></a>`).join("");
    const st=document.querySelector(".news .stamp");if(st)st.textContent="Updated "+new Date(d.updated||Date.now()).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  }).catch(()=>{});
}
})();
