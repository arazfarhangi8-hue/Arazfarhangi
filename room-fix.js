// اصلاح ارتباط تصویر، صدا و شمارش دانش‌آموزان
(function(){
  function playRemoteVideos(){
    document.querySelectorAll('#videos video').forEach(function(v){
      if(v.id!=='local-video') v.muted=false;
      v.autoplay=true;
      v.playsInline=true;
      v.play().catch(function(){});
    });
  }

  function fixStudentCount(){
    if(typeof role==='undefined'||role!=='host'||typeof connections==='undefined')return;
    const ids=[...connections.keys()].filter(function(id){return typeof peer==='undefined'||id!==peer?.id;});
    const n=ids.length;
    const sc=document.querySelector('#studentCount');
    const sb=document.querySelector('#studentCountBottom');
    if(sc)sc.textContent='تعداد دانش‌آموزان: '+n;
    if(sb)sb.textContent='تعداد دانش‌آموزان: '+n;
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
  setInterval(function(){fixStudentCount();ensureCalls();},700);
})();
