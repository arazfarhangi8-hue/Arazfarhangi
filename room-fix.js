// اصلاح ارتباط تصویر، صدا، شمارش و سقف ۴۸ دانش‌آموز
(function(){
  const MAX_STUDENTS=48;

  function playRemoteVideos(){
    document.querySelectorAll('#videos video').forEach(function(v){
      if(v.id!=='local-video') v.muted=false;
      v.autoplay=true;
      v.playsInline=true;
      v.play().catch(function(){});
    });
  }

  function studentIds(){
    if(typeof connections==='undefined') return [];
    return [...connections.keys()].filter(function(id){return typeof peer==='undefined'||id!==peer?.id;});
  }

  function fixStudentCount(){
    if(typeof role==='undefined'||role!=='host')return;
    const n=studentIds().length;
    const sc=document.querySelector('#studentCount');
    const sb=document.querySelector('#studentCountBottom');
    if(sc)sc.textContent='تعداد دانش‌آموزان: '+Math.min(n,MAX_STUDENTS);
    if(sb)sb.textContent='تعداد دانش‌آموزان: '+Math.min(n,MAX_STUDENTS);
  }

  function roomIsFull(){return typeof role!=='undefined'&&role==='host'&&studentIds().length>=MAX_STUDENTS;}

  function guardJoin(){
    if(typeof role==='undefined'||role!=='host'||typeof connections==='undefined')return;
    connections.forEach(function(c,id){
      if(studentIds().length>MAX_STUDENTS&&c&&c.open){
        try{c.send({type:'roomFull',message:'ظرفیت کلاس تکمیل است. حداکثر ۴۸ دانش‌آموز می‌توانند وارد شوند.'});}catch(e){}
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

  document.addEventListener('click',function(){playRemoteVideos();});
  document.addEventListener('touchstart',function(){playRemoteVideos();},{passive:true});
  setInterval(function(){fixStudentCount();ensureCalls();guardJoin();},700);
})();
