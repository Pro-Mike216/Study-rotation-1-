(function(g){const R=g.Rot=g.Rot||{};
R.dayKey=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
R.addDays=(k,n)=>{const [y,m,d]=k.split('-').map(Number);return R.dayKey(new Date(y,m-1,d+n));};
R.msToMidnight=(now=new Date())=>new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)-now;
R.isStudyDay=(s,k)=>{const [y,m,d]=k.split('-').map(Number);return s.settings.studyDays.includes(new Date(y,m-1,d).getDay());};
R.nextStudyDay=(s,k)=>{for(let i=0;i<8&&!R.isStudyDay(s,k);i++)k=R.addDays(k,1);return k;};
})(globalThis);
