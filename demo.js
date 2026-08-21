const $=s=>document.querySelector(s);
let peer=null,conn=null,localStream=null,role='',remotePeerId='';
const status=t=>$('#status').textContent=t; const connState=t=>$('#connectionState').textContent=t;
function log(t,remote=false){const d=document.createElement('div');d.className='msg';d.textContent=(remote?'طرف مقابل: ':'شما: ')+t;$('#messages').appendChild(d);$('#messages').scrollTop=$('#messages').scrollHeight;}
function setupData(c){conn=c; c.on('open',()=>{connState('متصل ✅');status('اتصال برقرار شد.');}); c.on('data',data=>{if(data?.type==='chat')log(data.text,true); if(data?.type==='board'){applyBoard(data.action,false);}}); c.on('close',()=>{connState('قطع شد');status('اتصال بسته شد.');}); c.on('error',e=>{connState('خطای اتصال');status('خطا: '+(e?.message||e));});}
function connectData(id){setupData(peer.connect(id,{reliable:true,serialization:'json'}));}
$('#createBtn').onclick=()=>{
 role='host';
 if(peer)peer.destroy();
 peer=new Peer();
 peer.on('open',id=>{$('#myCode').textContent=id;remotePeerId=id;status('کد اتاق را در گوشی وارد کن.');connState('در انتظار گوشی…');});
 peer.on('connection',c=>{remotePeerId=c.peer;setupData(c);});
 peer.on('call',call=>{call.answer();call.on('stream',s=>{$('#remoteVideo').srcObject=s;$('#remoteVideo').play().catch(()=>{});status('تصویر و صدای گوشی دریافت شد ✅');});});
 peer.on('error',e=>status('خطای اتاق: '+e.type));
};
$('#joinBtn').onclick=()=>{
 const id=$('#roomInput').value.trim(); if(!id){status('کد اتاق را وارد کن.');return;}
 role='guest'; if(peer)peer.destroy(); peer=new Peer();
 peer.on('open',()=>{connectData(id);remotePeerId=id;status('در حال اتصال به کامپیوتر…');});
 peer.on('call',call=>{if(!localStream){call.answer();return;}call.answer(localStream);call.on('stream',s=>{$('#remoteVideo').srcObject=s;});});
 peer.on('error',e=>status('خطای اتصال: '+e.type));
};
$('#mediaBtn').onclick=async()=>{
 try{
  localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
  $('#remoteVideo').muted=true; $('#remoteVideo').srcObject=localStream;
  if(role==='guest'&&remotePeerId){const call=peer.call(remotePeerId,localStream);call.on('error',e=>status('خطای صدا/تصویر: '+e.message));status('دوربین و میکروفون روشن شد؛ در حال ارسال به کامپیوتر…');}
  else status('دوربین و میکروفون روشن شد.');
 }catch(e){status('اجازهٔ دوربین/میکروفون داده نشد: '+e.message);}
};
$('#sendBtn').onclick=()=>{const v=$('#chatInput').value.trim();if(!v)return;log(v);if(conn?.open)conn.send({type:'chat',text:v});$('#chatInput').value='';};
$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#sendBtn').click();});

const canvas=$('#board'),ctx=canvas.getContext('2d'),color=$('#color');let drawing=false,last=null;
function resize(){const r=canvas.getBoundingClientRect();const old=document.createElement('canvas');old.width=canvas.width;old.height=canvas.height;if(old.width&&old.height)old.getContext('2d').drawImage(canvas,0,0);canvas.width=Math.max(1,Math.round(r.width*devicePixelRatio));canvas.height=Math.max(1,Math.round(r.height*devicePixelRatio));ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,r.width,r.height);if(old.width&&old.height)ctx.drawImage(old,0,0,r.width,r.height);} resize();window.addEventListener('resize',resize);
function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function sendBoard(a){if(conn?.open)conn.send({type:'board',action:a});}
function applyBoard(a,send=true){if(!a)return;if(a.type==='clear'){ctx.save();ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);ctx.restore();}if(a.type==='stroke'){ctx.save();ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.strokeStyle=a.color;ctx.lineWidth=a.size;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x1,a.y1);ctx.lineTo(a.x2,a.y2);ctx.stroke();ctx.restore();}if(send)sendBoard(a);}
canvas.addEventListener('pointerdown',e=>{drawing=true;last=point(e);canvas.setPointerCapture?.(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drawing||!last)return;const p=point(e);applyBoard({type:'stroke',x1:last.x,y1:last.y,x2:p.x,y2:p.y,color:color.value,size:4});last=p;});
['pointerup','pointercancel'].forEach(ev=>canvas.addEventListener(ev,e=>{drawing=false;last=null;try{canvas.releasePointerCapture?.(e.pointerId)}catch(_){}}));
$('#clearBtn').onclick=()=>applyBoard({type:'clear'});
