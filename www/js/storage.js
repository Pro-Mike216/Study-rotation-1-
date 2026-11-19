(function(g){const R=g.Rot=g.Rot||{};R.KEY='rotation.state.v1';
R.migrate=s=>{if(s&&s.schema===1&&s.settings){s.settings.studyDays=[0,1,2,3,4,5,6];s.schema=2;}return s;};
R.validate=s=>{try{if(!s||s.schema!==2||!Array.isArray(s.courses)||!Array.isArray(s.sessions)||typeof s.seq!=='number'||typeof s.cseq!=='number')return false;
 const D=/^\d{4}-\d\d-\d\d$/,cid=new Set(),sid=new Set(),per={};
 for(const c of s.courses){if(typeof c.id!=='string'||typeof c.name!=='string'||typeof c.active!=='boolean'||cid.has(c.id))return false;cid.add(c.id);}
 if(!s.courses.some(c=>c.active)||!cid.has(s.nextCourseId))return false;
 for(const x of s.sessions){if(typeof x.id!=='string'||sid.has(x.id)||!cid.has(x.courseId)||!['pending','done','void'].includes(x.status)||!D.test(x.origDate)||!(x.curDate===null||D.test(x.curDate))||typeof x.courseName!=='string'||typeof x.seq!=='number'||typeof x.carried!=='number'||(x.status==='done'&&!x.doneAt))return false;
  sid.add(x.id);if(x.curDate&&x.status!=='void'&&(per[x.curDate]=(per[x.curDate]||0)+1)>2)return false;}
 if(!s.settings||!['auto','light','dark'].includes(s.settings.theme)||!Array.isArray(s.settings.studyDays)||!s.settings.studyDays.length||!s.settings.studyDays.every(n=>Number.isInteger(n)&&n>=0&&n<=6))return false;return true;}catch(e){return false;}};
R.exportJson=s=>JSON.stringify(s,null,2);
R.importJson=t=>{let s;try{s=R.migrate(JSON.parse(t));}catch(e){return{ok:false,error:'File is not valid JSON.'};}return R.validate(s)?{ok:true,state:s}:{ok:false,error:'Backup failed validation. Your data was not changed.'};};
R.save=s=>{try{localStorage.setItem(R.KEY,JSON.stringify(s));return true;}catch(e){return false;}};
// Corrupt stored data is copied aside, never overwritten silently.
R.load=()=>{const raw=localStorage.getItem(R.KEY);if(!raw)return{state:R.defaultState()};
 try{const s=R.migrate(JSON.parse(raw));if(R.validate(s))return{state:s};}catch(e){}
 localStorage.setItem(R.KEY+'.corrupt.'+Date.now(),raw);return{state:R.defaultState(),warn:'Saved data was unreadable. A copy was kept in browser storage.'};};
})(globalThis);
