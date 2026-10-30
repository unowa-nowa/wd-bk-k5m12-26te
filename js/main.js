/* ===== 共通JS ===== */
(function() {
  
  // 画面の要素が確実に読み込まれてから実行するための安全な設定
  const init = () => {
    
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
      // URLから現在のファイル名を安全に取得する
      const cur=(location.pathname.split('/').pop() || 'index.html').split('?')[0].split('#')[0];
      const i=order.findIndex(o=>o[0]===cur);
      if(i>0){
        const p=order[i-1],n=order[i+1];
        pg.innerHTML=`<a href="${p[0]}">← ${p[1]}</a><a class="home" href="home.html">Top</a>${n?`<a href="${n[0]}">${n[1]} →</a>`:`<a href="home.html">Close</a>`}`;
        document.querySelectorAll('.pager a').forEach(go);
      }
    }

    /* =========================================================
       各ページ専用処理
       ========================================================= */

    /* --- opening.html 専用処理 --- */
    const sc=document.getElementById('scene'),fl=document.getElementById('flash');
    if(sc && fl){
      const T=(f,ms)=>setTimeout(f,ms);
      T(()=>sc.classList.add('phase2'),3000);
      T(()=>sc.classList.add('tapready'),3000+1400+1000);
      let started=false;
      
      function start(){
        if(started||!sc.classList.contains('tapready'))return;started=true;
        
        try {
           if (window.parent && window.parent !== window) {
               window.parent.postMessage('playBGM', '*');
           }
        } catch(e) {
           console.warn('BGM再生指示スキップ', e);
        }
        
        sc.classList.add('knock');
        T(()=>sc.classList.add('open'),150);
        T(()=>{
          const r=document.querySelector('.glow').getBoundingClientRect();
          fl.style.setProperty('--cx',(r.left+r.width/2)+'px');fl.style.setProperty('--cy',(r.top+r.height/2)+'px');
          sc.classList.add('zoom');fl.classList.add('on');
        },650);
        T(()=>{
          try{sessionStorage.setItem('wol-light','1')}catch(e){};
          location.href='home.html';
        },2100);
      }
      const tapBtn=document.getElementById('tapBtn');
      const art=document.getElementById('art');
      if(tapBtn) tapBtn.addEventListener('click',start);
      if(art) art.addEventListener('click',start);
      addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
    }

    /* --- seating.html 専用処理 --- */
    const tbls=[...document.querySelectorAll('.tbl')],btns=[...document.querySelectorAll('.map button')];
    if(tbls.length > 0 && btns.length > 0){
      const flash=(el)=>{el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1800)};
      btns.forEach(b=>b.addEventListener('click',()=>{
        const t=document.getElementById('t'+b.dataset.t);
        if(t){ t.scrollIntoView({behavior:'smooth',block:'start'}); flash(t); }
        btns.forEach(x=>x.classList.toggle('on',x===b));
        window.burst&&burst(b.getBoundingClientRect().left+19,b.getBoundingClientRect().top+19);
      }));
      const q=document.getElementById('q'),res=document.getElementById('res');
      if(q && res){
        q.addEventListener('input',()=>{
          const v=q.value.replace(/\s|　/g,'');
          tbls.forEach(t=>{t.classList.remove('dim');t.querySelectorAll('li').forEach(l=>l.classList.remove('hit'))});
          btns.forEach(b=>b.classList.remove('on'));
          if(!v){res.textContent='';return}
          const hits=[];
          tbls.forEach(t=>t.querySelectorAll('li').forEach(l=>{if(l.dataset.n.includes(v)){l.classList.add('hit');hits.push([t,l])}}));
          tbls.forEach(t=>{if(!hits.some(h=>h[0]===t))t.classList.add('dim')});
          if(!hits.length){res.textContent='見つかりませんでした。スタッフへお尋ねください。';return}
          const ks=[...new Set(hits.map(h=>h[0].dataset.t))];
          res.textContent=hits.length===1?`${hits[0][1].dataset.n.replace(/(.{2})/,'$1 ')} 様は ${ks[0]} 卓です`:`${hits.length}件：${ks.join('・')} 卓`;
          hits[0][0].scrollIntoView({behavior:'smooth',block:'center'});flash(hits[0][0]);
          btns.forEach(b=>b.classList.toggle('on',ks.includes(b.dataset.t)));
        });
      }
    }

    /* --- timeline.html 専用処理 --- */
    const schLi=[...document.querySelectorAll('.sch li')];
    if(schLi.length > 0){
      const n=new Date();
      if(n.getFullYear()===2035 && n.getMonth()===10 && n.getDate()===22){
        const m=n.getHours()*60+n.getMinutes();
        const t=schLi.map(l=>{const[h,mi]=l.dataset.t.split(':');return h*60+ +mi});
        let k=-1;t.forEach((v,i)=>{if(m>=v)k=i});
        if(k>=0&&k<schLi.length-1)schLi[k].classList.add('now');
      }
    }
    
  };

  // ドキュメントの読み込み状態を判定して安全に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();