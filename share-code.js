(function(){
  const copyBtn=document.getElementById('copyCodeBtn');
  const statusEl=document.getElementById('status');
  if(!copyBtn||!statusEl)return;
  function addShareButton(){
    if(document.getElementById('shareCodeBtn'))return;
    const b=document.createElement('button');
    b.id='shareCodeBtn';
    b.className='btn primary';
    b.textContent='📤 اشتراک‌گذاری کد';
    b.style.marginBottom='8px';
    b.onclick=shareCode;
    statusEl.parentNode.insertBefore(b,statusEl);
  }
  function getCode(){return (document.getElementById('myCode')?.textContent||'').trim();}
  function shareCode(){
    const code=getCode();
    if(!code||code==='—'){statusEl.textContent='ابتدا اتاق را بساز.';return;}
    const text=`کد ورود به کلاس مهر فرازان: ${code}`;
    if(navigator.share){
      navigator.share({title:'اتاق مهر فرازان',text}).catch(()=>{});
    }else{
      statusEl.textContent='اشتراک‌گذاری مستقیم روی این دستگاه پشتیبانی نمی‌شود؛ کد را کپی کردم.';
      copyCode(false);
    }
  }
  function copyCode(showButton){
    const code=getCode();
    if(!code||code==='—'){statusEl.textContent='ابتدا اتاق را بساز.';return;}
    const done=()=>{
      statusEl.textContent='کد اتاق کپی شد ✅';
      if(showButton)addShareButton();
    };
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(code).then(done).catch(()=>fallback(done));
    }else fallback(done);
  }
  function fallback(done){
    const ta=document.createElement('textarea');ta.value=getCode();document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');}catch(e){}
    ta.remove();done();
  }
  copyBtn.onclick=()=>copyCode(true);
})();
