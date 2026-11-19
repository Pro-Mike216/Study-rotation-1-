(function(g){const R=g.Rot=g.Rot||{};const PER=2;
const NAMES=['Discrete Mathematics','Operating Systems','Security Management','Web Programming','Embedded Systems','Digital Systems','Software Engineering','Database and Relational Model','Object-Oriented Analysis, Design and Implementation'];
R.defaultState=()=>({schema:2,settings:{theme:'auto',studyDays:[0,1,2,3,4,5,6]},courses:NAMES.map((n,i)=>({id:'c'+(i+1),name:n,active:true})),cseq:9,nextCourseId:'c1',seq:0,sessions:[],lastDay:null});
// Pointer into the circular course order. Returns the next ACTIVE course and advances the pointer.
function take(s){const n=s.courses.length;let i=s.courses.findIndex(c=>c.id===s.nextCourseId);if(i<0)i=0;
 for(let k=0;k<n;k++){const c=s.courses[(i+k)%n];if(c.active){let j=(i+k+1)%n;while(!s.courses[j].active)j=(j+1)%n;s.nextCourseId=s.courses[j].id;return c;}}return null;}
// Fill today's two slots: done-today sessions stay; pending sessions (oldest first = carryovers) take the open slots; only then new sessions are drawn from the queue.
R.reconcile=(s,today)=>{
 if(!R.isStudyDay(s,today)){s.lastDay=today;return s;}
 const open=Math.max(0,PER-s.sessions.filter(x=>x.status==='done'&&x.curDate===today).length);
 const pend=s.sessions.filter(x=>x.status==='pending').sort((a,b)=>a.seq-b.seq);
 pend.forEach((x,i)=>{if(i<open){if(x.curDate!==today){if(x.origDate!==today)x.carried++;x.curDate=today;}}else x.curDate=null;});
 for(let i=pend.length;i<open;i++){const c=take(s);if(!c)break;
  s.sessions.push({id:'s'+(++s.seq),seq:s.seq,courseId:c.id,courseName:c.name,origNo:s.sessions.filter(x=>x.origDate===today).length+1,origDate:today,curDate:today,status:'pending',doneAt:null,carried:0});}
 s.lastDay=today;return s;};
// Idempotent: returns false (no change) on duplicate completion/undo.
R.setDone=(s,id,done,iso,today)=>{const x=s.sessions.find(q=>q.id===id);if(!x||x.status==='void')return false;
 if(done){if(x.status==='done')return false;x.status='done';x.doneAt=iso;}else{if(x.status!=='done')return false;x.status='pending';x.doneAt=null;}
 R.reconcile(s,today);return true;};
// Read-only projection: assumes each day's sessions get done, so later days show queued overflow then new queue draws.
R.plan=(s,today,n=5)=>{const t={courses:s.courses,nextCourseId:s.nextCourseId};
 const dn=s.sessions.filter(x=>x.status==='done'&&x.curDate===today);
 const q=s.sessions.filter(x=>x.status==='pending').sort((a,b)=>a.seq-b.seq);const out=[];let date=R.nextStudyDay(s,today);
 for(let d=0;d<n;d++){const first=date===today,slots=first?dn.map(x=>({s:x})):[];
  while(slots.length<PER){if(q.length)slots.push({s:q.shift()});else{const c=take(t);if(!c)break;slots.push({proj:true,courseId:c.id,courseName:c.name});}}
  if(first)slots.sort((a,b)=>(a.s?a.s.seq:1e9)-(b.s?b.s.seq:1e9));
  out.push({date,slots});date=R.nextStudyDay(s,R.addDays(date,1));}return out;};
R.stats=(s,today)=>{const a=s.sessions.filter(x=>x.status!=='void'),dn=a.filter(x=>x.status==='done');
 return{done:dn.length,total:a.length,pct:a.length?Math.round(100*dn.length/a.length):0,outstanding:a.length-dn.length,
  carry:a.filter(x=>x.status==='pending'&&(x.curDate!==x.origDate||x.curDate<today)).length,
  per:s.courses.map(c=>({name:c.name,count:dn.filter(x=>x.courseId===c.id).length})).filter(p=>p.count||s.courses.find(c=>c.name===p.name).active)};};
})(globalThis);
