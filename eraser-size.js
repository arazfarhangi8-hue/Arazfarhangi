(()=>{
  const eraserBtn=document.querySelector('[data-tool="eraser"]');
  const canvas=document.querySelector('#board');
  const ctx=canvas?.getContext('2d');
  if(!eraserBtn||!canvas||!ctx)return;
  let eraserSize=22,erasing=false,lastPoint=null;
  const wrap=document.createElement('div');
  wrap.className='eraser-size-wrap';
  wrap.innerHTML='<button type="button" id="eraserSizeBtn" class="eraser-size-btn">📏 اندازه پاک‌کن</button>';
  eraserBtn.insertAdjacentElement('afterend',wrap);
  const modal=document.createElement('div');
  modal.id='eraserSizeModal';
  modal.className='eraser-size-modal hidden';
  modal.innerHTML='<div class="eraser-size-card"><button type="button" id="closeEraserSize" class="close">×</button><h3>اندازه پاک‌کن</h3><p id="eraserSizeValue">اندازه: 22 پیکسل</p><input id="eraserSizeRange" type="range" min="5" max="80" value="22" step="1"><div class="eraser-size-labels"><span>خیلی کوچک</span><span>متوسط</span><span>خیلی بزرگ</span></div><button type="button" id="saveEraserSize" class="primary">اعمال اندازه</button></div>';
  document.body.appendChild(modal);
  const range=modal.querySelector('#eraserSizeRange'),value=modal.querySelector('#eraserSizeValue');
  const updateLabel=()=>value.textContent=`اندازه: ${range.value} پیکسل`;
  const open=()=>{range.value=eraserSize;updateLabel();modal.classList.remove('hidden');};
  const close=()=>modal.classList.add('hidden');
  document.querySelector('#eraserSizeBtn').onclick=open;
  modal.querySelector('#closeEraserSize').onclick=close;
  modal.querySelector('#saveEraserSize').onclick=()=>{eraserSize=Number(range.value);updateLabel();close();updateCursor();};
  range.oninput=updateLabel;
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  const isEraserActive=()=>!!document.querySelector('.tool[data-tool="eraser"].active');
  const isUnlocked=()=>{const b=document.querySelector('#lockBoard');return !!b&&!b.classList.contains('locked');};
  const getPoint=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
  function updateCursor(){const s=Math.max(10,Math.min(60,eraserSize));canvas.style.cursor=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${s+8}' height='${s+8}'%3E%3Ccircle cx='${(s+8)/2}' cy='${(s+8)/2}' r='${s/2}' fill='white' fill-opacity='.15' stroke='%23607386' stroke-width='2'/%3E%3C/svg%3E") ${(s+8)/2} ${(s+8)/2}, auto`;}
  function beginErase(e){if(!isEraserActive()||!isUnlocked())return;e.preventDefault();e.stopImmediatePropagation();if(typeof window.pushHistory==='function')window.pushHistory();erasing=true;lastPoint=getPoint(e);canvas.setPointerCapture?.(e.pointerId);ctx.save();ctx.globalCompositeOperation='source-over';ctx.fillStyle='#fff';ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.arc(lastPoint.x,lastPoint.y,eraserSize/2,0,Math.PI*2);ctx.fill();ctx.restore();}
  function moveErase(e){if(!erasing)return;e.preventDefault();e.stopImmediatePropagation();const p=getPoint(e);ctx.save();ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#fff';ctx.lineWidth=eraserSize;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(lastPoint.x,lastPoint.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();lastPoint=p;}
  function endErase(e){if(!erasing)return;e.preventDefault();e.stopImmediatePropagation();erasing=false;lastPoint=null;try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}if(typeof window.updateHistoryUI==='function')window.updateHistoryUI();}
  canvas.addEventListener('pointerdown',beginErase,true);
  canvas.addEventListener('pointermove',moveErase,true);
  canvas.addEventListener('pointerup',endErase,true);
  canvas.addEventListener('pointercancel',endErase,true);
  document.addEventListener('click',e=>{if(e.target.closest('[data-tool="eraser"]'))setTimeout(()=>{if(isEraserActive())updateCursor();},0);});
  const style=document.createElement('style');
  style.textContent=`.eraser-size-wrap{margin:0 0 6px}.eraser-size-btn{width:100%;font-family:inherit;border:1px solid var(--line);border-radius:11px;padding:8px 10px;background:#fff;color:var(--ink);cursor:pointer}.eraser-size-btn:hover{background:#f7fbff}.eraser-size-modal{position:fixed;inset:0;background:rgba(12,35,56,.46);display:grid;place-items:center;z-index:50;padding:20px}.eraser-size-modal.hidden{display:none}.eraser-size-card{position:relative;width:min(430px,100%);background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);border-radius:22px;padding:28px}.eraser-size-card h3{margin:0 0 8px;font-size:23px}.eraser-size-card p{margin:0 0 18px;color:var(--muted);font-weight:700}#eraserSizeRange{width:100%;accent-color:var(--primary);cursor:pointer}.eraser-size-labels{display:flex;justify-content:space-between;color:var(--muted);font-size:12px;margin:5px 0 18px}#saveEraserSize{width:100%}`;
  document.head.appendChild(style);
})();
