/* ===== 共通JS ===== */
(function(){
  /* 金色のきらめき（背景）＋ burst(x,y) で紙吹雪 */
  const cv=document.getElementById('sparkle');
  window.burst=()=>{};
  if(cv && !matchMedia('(prefers-reduced-motion:reduce)').matches){
    const ctx=cv.getContext('2d');let W,H,ps=[];
    const fit=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};fit();addEventListener('resize',fit);
    const mk=(x,y,burst)=>({x:x??Math.random()*W,y:y??Math.random()*H,r:Math.random()*1.6+.4,
      vx:burst?(Math.random()-.5)*8:(Math.random()-.5)*.15,vy:burst?(Math.random()-.9)*8:-Math.random()*.3-.05,
      a:burst?1:Math.random(),da:burst?-.012:(Math.random()*.012+.004)*(Math.random()<.5?1:-1),burst,
      c:burst?['#d9c28f','#b8964f','#fff','#f3e3b5'][Math.random()*4|0]:'#d9c28f',s:burst?Math.random()*6+3:0});
    for(let i=0;i<(innerWidth<600?28:50);i++)ps.push(mk());
    window.burst=(x,y)=>{for(let i=0;i<80;i++)ps.push(mk(x,y,true))};
    (function loop(){ctx.clearRect(0,0,W,H);
      ps=ps.filter(p=>!(p.burst&&p.a<=0));
      for(const p of ps){
        p.x+=p.vx;p.y+=p.vy;
        if(p.burst){p.vy+=.12;p.vx*=.99;p.a+=p.da}
        else{p.a+=p.da;if(p.a>1||p.a<.05)p.da*=-1;if(p.y<-5){p.y=H+5;p.x=Math.random()*W}}
        ctx.globalAlpha=Math.max(Math.min(p.a,1),0);ctx.fillStyle=p.c;
        if(p.burst){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.x*.05);ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore()}
        else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}
      }
      requestAnimationFrame(loop)})();
  }

  /* スクロール出現 */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
  document.querySelectorAll('.rv,.ev').forEach((el,i)=>{el.style.transitionDelay=(i%4)*60+'ms';io.observe(el)});

  /* ページ遷移フェード */
  const go=a=>a.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();
    document.body.classList.add('leaving');setTimeout(()=>location.href=a.href,320)});
  document.querySelectorAll('a[href$=".html"]').forEach(go);
  addEventListener('pageshow',e=>{if(e.persisted)document.body.classList.remove('leaving')});

  /* ページ送り（順番はここで一元管理） */
  const order=[['home.html','Top'],['message.html','Message'],['profile.html','Profile'],['story.html','Story'],
    ['timeline.html','Wedding Day'],['menu.html','Menu'],['drink.html','Drink Menu'],['seating.html','Setting Plan']];
  const pg=document.getElementById('pager');
  if(pg){
    const cur=location.pathname.split('/').pop()||'index.html';
    const i=order.findIndex(o=>o[0]===cur);
    if(i>0){
      const p=order[i-1],n=order[i+1];
      pg.innerHTML=`<a href="${p[0]}">← ${p[1]}</a><a class="home" href="home.html">Top</a>${n?`<a href="${n[0]}">${n[1]} →</a>`:`<a href="home.html">Close</a>`}`;
      /* 画面右上に常時表示のメニューボタン */
      const f=document.createElement('a');f.className='float-menu';f.href='home.html';f.textContent='☰ MENU';f.setAttribute('aria-label','メニューへ戻る');
      document.body.appendChild(f);
      document.querySelectorAll('.pager a,.float-menu').forEach(go);
    }
  }
})();
