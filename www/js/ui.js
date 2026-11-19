(function(){const R=Rot;let S,tm;const $=q=>document.querySelector(q);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(k,o)=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString(undefined,o||{weekday:'short',month:'short',day:'numeric'});};
const LONG={weekday:'long',month:'long',day:'numeric'},DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],PAGES=['today','upcoming','history','settings'];
const page=()=>PAGES.find(r=>location.hash==='#/'+r)||'today';
function ensure(){const t=R.dayKey();if(S.lastDay!==t){R.reconcile(S,t);R.save(S);}return t;}
function commit(){R.save(S);render();}
function toast(h){const t=$('#toast');t.innerHTML=h;t.hidden=false;clearTimeout(tm);tm=setTimeout(()=>t.hidden=true,8000);}
const st=(s,date)=>s.status==='done'?['ok','Completed']:s.origDate!==date?['carry','Carried over']:['pend','Pending'];
const pill=a=>`<span class="pill ${a[0]}">${a[1]}</span>`;
const head=(t,sub)=>`<header><div><h1>${t}</h1><p>${sub}</p></div><button class=btn data-act=theme>Theme</button></header>`;
function card(x,t){const s=x.s,d=s.status==='done';return`<label class="card glass ${d?'done':''}"><input type=checkbox data-act=tog data-id="${s.id}" ${d?'checked':''}><span class=ring></span><span class=ct><h3>${esc(s.courseName)}</h3><small>Session ${s.origNo} · planned ${fmt(s.origDate)}</small></span>${pill(st(s,t))}</label>`;}
const V={
today(t,p){const live=p[0].date===t,sl=p[0].slots.filter(x=>x.s),dn=sl.filter(x=>x.s.status==='done').length,k=R.stats(S,t);
 return head(fmt(t,LONG),live?`${dn} of 2 done`:'Rest day')+(live?sl.map(x=>card(x,t)).join(''):`<div class="glass pad"><h3>Rest day</h3><small>Next study day: ${fmt(p[0].date)}</small></div>`)
 +`<div class="stats glass">${[['Completed',k.done],['Scheduled',k.total],['Done',k.pct+'%'],['Outstanding',k.outstanding],['Carried',k.carry]].map(([l,v])=>`<div><b>${v}</b><small>${l}</small></div>`).join('')}</div>
 <details class="glass pad"><summary>Completions by course</summary>${k.per.map(c=>`<div class=li><span>${esc(c.name)}</span><b>${c.count}</b></div>`).join('')}</details>`;},
upcoming(t,p){return head('Upcoming','Projected, assuming each day’s sessions get done')+p.map((d,i)=>`<details class="glass day" ${i<2?'open':''}><summary><b>${fmt(d.date)}</b>${d.date===t?'<span class="pill pend">Today</span>':''}</summary>${d.slots.map(x=>x.proj?`<div class=li><span>${esc(x.courseName)}</span><small>Upcoming</small></div>`:`<div class=li><span>${esc(x.s.courseName)}<small>Session ${x.s.origNo} · planned ${fmt(x.s.origDate)}</small></span>${pill(st(x.s,d.date))}</div>`).join('')}</details>`).join('');},
history(){const g={};S.sessions.slice().sort((a,b)=>b.seq-a.seq).forEach(x=>(g[x.origDate]=g[x.origDate]||[]).push(x));
 return head('History',S.sessions.length+' sessions')+(Object.keys(g).sort().reverse().map(k=>`<h2>Planned ${fmt(k)}</h2><div class="glass list">${g[k].map(x=>`<div class=li><span>${esc(x.courseName)}<small>#${x.origNo} · now ${x.curDate?fmt(x.curDate):'queued'} · ${x.status}${x.doneAt?' · '+new Date(x.doneAt).toLocaleString():''}${x.carried?' · carried '+x.carried+'×':''}</small></span>${x.status==='done'?`<button class=btn data-act=rev data-id="${x.id}">Reverse</button>`:''}</div>`).join('')}</div>`).join('')||'<div class="glass pad"><small>Sessions appear here as they are scheduled.</small></div>');},
settings(){const a=S.courses.filter(c=>c.active),th=S.settings.theme;
 return head('Settings','')+`<h2>Courses</h2><div class="glass list">${a.map((c,i)=>`<div class=li><input data-act=ren data-id="${c.id}" value="${esc(c.name)}" aria-label="Course name"><button class=btn data-act=mv data-dir=-1 data-id="${c.id}" ${i?'':'disabled'}>↑</button><button class=btn data-act=mv data-dir=1 data-id="${c.id}" ${i<a.length-1?'':'disabled'}>↓</button><button class=btn data-act=rm data-id="${c.id}" ${a.length>1?'':'disabled'}>Remove</button></div>`).join('')}<div class=li><input id=nc placeholder="New course" aria-label="New course"><button class="btn pri" data-act=add>Add</button></div></div>
 <h2>Study days</h2><div class="glass pad chips">${DAYS.map((n,i)=>{const on=S.settings.studyDays.includes(i);return`<label class="chip ${on?'on':''}"><input type=checkbox data-act=sd data-day=${i} ${on?'checked':''}>${n}</label>`;}).join('')}</div>
 <h2>Theme</h2><div class="glass seg">${['auto','light','dark'].map(v=>`<button data-act=th data-v=${v} class="${th===v?'on':''}">${v}</button>`).join('')}</div>
 <h2>Backup</h2><div class="glass list"><div class=li><button class=btn data-act=export>Export JSON</button><label class=btn>Import JSON<input type=file accept=".json,application/json" data-act=imp hidden></label></div></div><p id=msg></p>`;}};
function render(){const t=ensure(),pg=page();document.documentElement.dataset.theme=S.settings.theme;
 $('#app').innerHTML=V[pg](t,R.plan(S,t,5));
 document.querySelectorAll('.tabs a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#/'+pg));}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.tagName==='INPUT')return;const a=b.dataset.act,id=b.dataset.id,t=ensure();
 if(a==='theme'){S.settings.theme={auto:'light',light:'dark',dark:'auto'}[S.settings.theme];commit();}
 else if(a==='th'){S.settings.theme=b.dataset.v;commit();}
 else if(a==='undo'){R.setDone(S,id,false,null,t);$('#toast').hidden=true;commit();}
 else if(a==='rev'){if(R.setDone(S,id,false,null,t))commit();}
 else if(a==='mv'){if(R.moveCourse(S,id,+b.dataset.dir))commit();}
 else if(a==='rm'){if(confirm('Remove this course from future scheduling? Past records are kept.')&&R.removeCourse(S,id,t))commit();}
 else if(a==='add'){if(R.addCourse(S,$('#nc').value))commit();}
 else if(a==='export'){const name='study-rotation-'+t+'.json',blob=new Blob([R.exportJson(S)],{type:'application/json'}),file=new File([blob],name,{type:'application/json'});
  if(matchMedia('(pointer:coarse)').matches&&navigator.canShare&&navigator.canShare({files:[file]}))navigator.share({files:[file]}).catch(()=>{});
  else{const u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=name;l.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}}});
document.addEventListener('change',e=>{const el=e.target,a=el.dataset.act,t=ensure();
 if(a==='tog'){if(R.setDone(S,el.dataset.id,el.checked,new Date().toISOString(),t)){commit();if(el.checked)toast(`Completed <button class=btn data-act=undo data-id="${el.dataset.id}">Undo</button>`);}else render();}
 else if(a==='ren'){if(R.renameCourse(S,el.dataset.id,el.value))commit();else render();}
 else if(a==='sd'){const i=+el.dataset.day,sd=new Set(S.settings.studyDays);el.checked?sd.add(i):sd.delete(i);if(!sd.size){render();return;}S.settings.studyDays=[...sd].sort();R.reconcile(S,R.dayKey());commit();}
 else if(a==='imp'&&el.files[0]){el.files[0].text().then(txt=>{const r=R.importJson(txt);if(!r.ok){$('#msg').textContent=r.error;return;}
  if(confirm('Replace ALL current data with this backup?')){S=r.state;R.reconcile(S,R.dayKey());commit();}});}});
addEventListener('hashchange',()=>{scrollTo(0,0);const a=$('#app');a.classList.remove('in');void a.offsetWidth;a.classList.add('in');render();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
function tick(){render();setTimeout(tick,R.msToMidnight()+500);}
const L=R.load();S=L.state;if(!location.hash)history.replaceState(null,'','#/today');if(L.warn)setTimeout(()=>toast(L.warn),0);tick();
})();
