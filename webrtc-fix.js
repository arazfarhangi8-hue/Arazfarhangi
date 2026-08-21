// WebRTC fix: one authoritative call per student, teacher initiates, guest answers after media is ready.
(function(){
  const pendingCalls=new Map();
  const originalVideoCard=window.videoCard;
  function showRemote(call,stream){
    if(typeof originalVideoCard==='function') originalVideoCard(call.peer,'تصویر '+call.peer,stream,false);
    const v=document.querySelector('#video-'+CSS.escape(call.peer)+' video');
    if(v){v.autoplay=true;v.playsInline=true;v.muted=false;v.srcObject=stream;v.play().catch(()=>{});}
  }
  window.callPeer=function(id){
    if(!window.localStream||!window.peer||id===window.peer.id)return;
    // Only the teacher starts calls. This prevents two competing PeerJS calls.
    if(window.role!=='host')return;
    if(window.calls?.has(id))return;
    const call=window.peer.call(id,window.localStream);
    if(!call)return;
    window.calls.set(id,call);
    call.on('stream',s=>showRemote(call,s));
    call.on('close',()=>{window.calls.delete(id);window.removeVideo?.(id);});
    call.on('error',()=>window.calls.delete(id));
  };
  window.answerCall=function(call){
    if(window.localStream){
      try{call.answer(window.localStream);}catch(e){return;}
      window.calls?.set(call.peer,call);
      call.on('stream',s=>showRemote(call,s));
      call.on('close',()=>{window.calls?.delete(call.peer);window.removeVideo?.(call.peer);});
      call.on('error',()=>window.calls?.delete(call.peer));
    }else{
      pendingCalls.set(call.peer,call);
    }
  };
  function answerPending(){
    if(!window.localStream)return;
    pendingCalls.forEach((call,id)=>{
      pendingCalls.delete(id);
      window.answerCall(call);
    });
  }
  async function startMedia(){
    try{
      if(!window.localStream) window.localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      if(typeof window.videoCard==='function') window.videoCard('local','تصویر من',window.localStream,true);
      const btn=document.querySelector('#mediaBtn');
      if(btn)btn.textContent='دوربین و میکروفون روشن است';
      answerPending();
      if(window.role==='host'&&window.connections) window.connections.forEach((_,id)=>window.callPeer(id));
      window.status?.('دوربین و میکروفون روشن شد.');
    }catch(e){window.status?.('اجازه دوربین/میکروفون داده نشد: '+e.message);}
  }
  const mediaBtn=document.querySelector('#mediaBtn');
  if(mediaBtn)mediaBtn.onclick=startMedia;
  // Re-answer any incoming call after media is enabled.
  setInterval(()=>{answerPending();},500);
})();
