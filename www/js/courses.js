(function(g){const R=g.Rot=g.Rot||{};
const act=s=>s.courses.filter(c=>c.active);
R.addCourse=(s,name)=>{name=(name||'').trim();if(!name)return false;s.courses.push({id:'c'+(++s.cseq),name,active:true});return true;};
// Pending sessions follow a rename; completed ones keep the name they had.
R.renameCourse=(s,id,name)=>{name=(name||'').trim();const c=s.courses.find(x=>x.id===id);if(!c||!name)return false;c.name=name;s.sessions.forEach(x=>{if(x.courseId===id&&x.status==='pending')x.courseName=name;});return true;};
// Removed courses stay in the list as inactive (keeps queue position); their unstarted sessions become 'void'.
R.removeCourse=(s,id,today)=>{const c=s.courses.find(x=>x.id===id);if(!c||!c.active||act(s).length<2)return false;c.active=false;
 s.sessions.forEach(x=>{if(x.courseId===id&&x.status==='pending'){x.status='void';x.curDate=null;}});R.reconcile(s,today);return true;};
R.moveCourse=(s,id,dir)=>{const a=s.courses,i=a.findIndex(c=>c.id===id);let j=i+dir;while(a[j]&&!a[j].active)j+=dir;if(i<0||!a[j])return false;[a[i],a[j]]=[a[j],a[i]];return true;};
})(globalThis);
