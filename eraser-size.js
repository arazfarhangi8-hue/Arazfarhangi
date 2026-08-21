(()=>{
  const eraserBtn=document.querySelector('[data-tool="eraser"]');
  const canvas=document.querySelector('#board');
  if(!eraserBtn||!canvas) return;
  let eraserSize=22;
  const wrap=document.createElement('div');
  wrap.className='eraser-size-wrap';
  wrap.innerHTML='<button type="button" id="eraserSizeBtn" class="eraser-size-btn">📏 اندازه</button>';
  eraserBtn.insertAdjacentElement('afterend',wrap);

  const modal=document.createElement('div');
  modal.id='eraserSizeModal';
  modal.className='eraser-size-modal hidden';
  modal.innerHTML='<div class="eraser-size-card"><button type="button" id="closeEraserSize" class="close">×</button><h3>اندازه پاک‌کن</h3><p id="eraserSizeValue">اندازه: 22 پیکسل</p><input id="eraserSizeRange" type="range" min="5" max="80" value="22" step="1"><div class="eraser-size-labels"><span>کوچک</span><span>متوسط</span><span>بزرگ</span></div><button type="button" id="saveEraserSize" class="primary">ذخیره اندازه</button></div>';
  document.body.appendChild(modal);

  const range=modal.querySelector('#eraserSizeRange');
  const value=modal.querySelector('#eraserSizeValue');
  const open=()=>{range.value=eraserSize;value.textContent=`اندازه: ${eraserSize} پیکسل`;modal.classList.remove('hidden');};
  const close=()=>modal.classList.add('hidden');
  modal.querySelector('#eraserSizeBtn');
  document.querySelector('#eraserSizeBtn').onclick=open;
  modal.querySelector('#closeEraserSize').onclick=close;
  modal.querySelector('#saveEraserSize').onclick=()=>{eraserSize=Number(range.value);value.textContent=`اندازه: ${eraserSize} پیکسل`;close();};
  range.oninput=()=>value.textContent=`اندازه: ${range.value} پیکسل`;
  modal.addEventListener('click',e=>{if(e.target===modal)close();});

  const style=document.createElement('style');
  style.textContent=`
    .eraser-size-wrap{margin:0 0 6px;}
    .eraser-size-btn{width:100%;font-family:inherit;border:1px solid var(--line);border-radius:11px;padding:8px 10px;background:#fff;color:var(--ink);cursor:pointer;}
    .eraser-size-btn:hover{background:#f7fbff;}
    .eraser-size-modal{position:fixed;inset:0;background:rgba(12,35,56,.46);display:grid;place-items:center;z-index:50;padding:20px;}
    .eraser-size-modal.hidden{display:none;}
    .eraser-size-card{position:relative;width:min(430px,100%);background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);border-radius:22px;padding:28px;}
    .eraser-size-card h3{margin:0 0 8px;font-size:23px;}
    .eraser-size-card p{margin:0 0 18px;color:var(--muted);font-weight:700;}
    #eraserSizeRange{width:100%;accent-color:var(--primary);cursor:pointer;}
    .eraser-size-labels{display:flex;justify-content:space-between;color:var(--muted);font-size:12px;margin:5px 0 18px;}
    #saveEraserSize{width:100%;}
  `;
  document.head.appendChild(style);

  const originalPointerMove=window.EventTarget.prototype.addEventListener;
  // مقدار انتخاب‌شده توسط ابزار اصلی در pointermove استفاده می‌شود.
  // برای اعمال اندازه به هر دو نقطه شروع/حرکت، استایل canvas را هنگام انتخاب پاک‌کن نگه می‌داریم.
  const updateEraserCursor=()=>{canvas.style.cursor=`url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${Math.min(64,eraserSize+8)}' height='${Math.min(64,eraserSize+8)}'%3E%3Ccircle cx='${Math.min(32,(eraserSize+8)/2)}' cy='${Math.min(32,(eraserSize+8)/2)}' r='${Math.min(30,eraserSize/2)}' fill='none' stroke='%23607386' stroke-width='2'/%3E%3C/svg%3E\") ${Math.min(32,(eraserSize+8)/2)} ${Math.min(32,(eraserSize+8)/2)}, auto`;};
  document.addEventListener('click',e=>{if(e.target.closest('[data-tool="eraser"]'))setTimeout(updateEraserCursor,0);});
})();
