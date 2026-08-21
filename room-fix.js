// اصلاح ارتباط تصویر، صدا، شمارش و ظرفیت کلاس
(function(){
  const BASE_STUDENTS=30;
  const EXTENDED_STUDENTS=40;
  let maxStudents=BASE_STUDENTS;

  function studentIds(){
    if(typeof connections==='undefined') return [];
    return [...connections.keys()].filter(function(id){return typeof peer==='undefined'||id!==peer?.id;});
  }

  function playRemoteVideos(){
    document.querySelectorAll('#videos video').forEach(function(v){
      if(v.id!=='local-video') v.muted=false;
      v.autoplay=true; v.playsInline=true;
      v.play().catch(function(){});
    });
  }

  function updateCount(){
    if(typeof role==='undefined'||role!=='host')return;
    const n=studentIds().length;
    const text='تعداد دانش‌آموزان: '+Math.min(n,maxStudents);
    document.querySelectorAll('#studentCount,#studentCountBottom').forEach(function(el){el.textContent=text;});
    updateCapacityButton(n);
  }

  function updateCapacityButton(n){
    if(typeof role==='undefined'||role!=='host')return;
    let b=document.getElementById('extendStudentsBtn');
    if(!b){
      b=document.createElement('button');
      b.id='extendStudentsBtn';
      b.className='btn primary';
      b.style.margin='8px';
      const target=document.querySelector('#studentsBottom')||document.querySelector('#studentCountBottom')?.parentElement;
      if(target) target.appendChild(b);
    }
    if(maxStudents===BASE_STUDENTS && n>=BASE_STUDENTS){
      b.hidden=false;
      b.textContent='👥 تا ۴۰ دانش‌آموز';
      b.onclick=function(){maxStudents=EXTENDED_STUDENTS;b.hidden=true;updateCount();};
    }else b.hidden=true;
  }

  function guardCapacity(){
    if(typeof role==='undefined'||role!=='host')return;
    connections.forEach(function(c,id){
      if(studentIds().length>maxStudents&&c&&c.open){
        try{c.send({type:'roomFull',message:'ظرفیت کلاس تکمیل است.'});}catch(e){}
        try{c.close();}catch(e){}
      }
    });
  }

  function ensureCalls(){
    if(typeof localStream==='undefined'||!localStream||typeof connections==='undefined'||typeof callPeer!=='function')return;
    connections.forEach(function(c,id){
      if(c&&c.open&&id!==peer?.id&&!calls.has(id))callPeer(id);
    });
    playRemoteVideos();
  }

  document.addEventListener('click',playRemoteVideos);
  document.addEventListener('touchstart',playRemoteVideos,{passive:true});
  setInterval(function(){updateCount();ensureCalls();guardCapacity();},700);
})();
