(function(){
  var sec=document.getElementById('filary'),stage=document.getElementById('holoStage'),svg=document.getElementById('holoSvg'),cvs=document.getElementById('holoFx');
  if(!sec||!stage||!svg)return;
  var NS='http://www.w3.org/2000/svg',labs=[].slice.call(stage.querySelectorAll('.holo-lab')),DIR=['n','ne','e','se','s','sw','w','nw'];
  var LAYOUT={
    d:{W:1000,H:690,cx:500,cy:345,R:236,inner:50,w:42,lw:300,rs:1.25,gap:22,sgw:56,rain:15,motes:70,traces:30},
    m:{W:600,H:760,cx:300,cy:380,R:150,inner:38,w:27,lw:150,rs:.72,gap:30,sgw:66,rain:6,motes:34,traces:18}
  };
  // runy (siatka 24x24, same proste kreski): 8 odnog + 8 ozdobnych
  var RUNES=[
    'M12 22V4M5 11L12 4L19 11M6 18L12 12L18 18',
    'M12 2L21 12L12 22L3 12ZM12 8V16M8 12H16',
    'M4 3V21M20 3V21M4 3L12 13L20 3',
    'M8 3V21M8 7L18 12L8 17',
    'M2 12L12 4L22 12L12 20ZM12 9V15',
    'M4 4L20 20M20 4L4 20M12 4V20',
    'M12 22V3M12 12L5 5M12 12L19 5',
    'M5 3V21M19 3V21M5 3L19 21M19 3L5 21',
    'M7 3V21M7 3L17 8L7 13',
    'M5 21L12 3L19 21M8 15H16',
    'M6 3V21M6 12L17 3M6 12L17 21',
    'M12 3V21M6 8L12 14L18 8',
    'M4 12H20M12 4L20 12L12 20',
    'M7 3L17 12L7 21M17 3V21',
    'M12 3L19 12L12 21L5 12ZM5 12H19',
    'M6 21V3L18 12L6 12'
  ];
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,force=/[?&]holo=([\d.]+)/.exec(location.search);
  var mode=null,L=null,els=null,landed=false,full=false,cur=0;
  function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
  var BARS=[[[46,66],[101,35],[101,69],[46,100]],[[101,66],[156,35],[156,69],[101,100]],[[101,90],[68,110],[101,130]],[[101,126],[134,146],[101,166]],[[46,188],[101,157],[101,191],[46,222]],[[101,188],[156,157],[156,191],[101,222]]];
  var TRIS=[[[46,125],[46,161],[77,143]],[[156,131],[156,95],[125,113]]];
  function pts(a){return a.map(function(p){return p.join(',')}).join(' ');}
  function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  // sciezki obwodow (PCB: odcinki co 45 stopni) rozchodzace sie od pierscienia ku krawedziom ekranu
  function traces(g){
    var rnd=rng(mode==='m'?11:7),N=L.traces,dirs=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]],M=14,out=[];
    for(var k=0;k<N;k++){
      var th=k/N*Math.PI*2+rnd()*.12,r0=L.R*(1.02+rnd()*.06),x=L.cx+Math.sin(th)*r0,y=L.cy-Math.cos(th)*r0;
      var best=0,bd=-9;dirs.forEach(function(d,i){var l=Math.hypot(d[0],d[1]),dd=(Math.sin(th)*d[0]-Math.cos(th)*d[1])/l;if(dd>bd){bd=dd;best=i;}});
      var di=best,pts=[[x,y]],segs=2+Math.floor(rnd()*3);
      for(var s=0;s<segs;s++){
        var d=dirs[(di+8)%8],l=Math.hypot(d[0],d[1]),len=(40+rnd()*(mode==='m'?70:150));
        x+=d[0]/l*len;y+=d[1]/l*len;
        if(x<M||x>L.W-M||y<M||y>L.H-M){x=Math.max(M,Math.min(L.W-M,x));y=Math.max(M,Math.min(L.H-M,y));pts.push([x,y]);break;}
        pts.push([x,y]);di+=(rnd()<.5?-1:1);
      }
      out.push(pts);
    }
    out.forEach(function(p,i){
      var d='M'+p.map(function(q){return q[0].toFixed(1)+' '+q[1].toFixed(1)}).join('L');
      el('path',{d:d,'stroke-width':1.2,class:i%3===0?'flow':'','stroke-dasharray':i%3===0?'8 8':'none'},g);
      var e=p[p.length-1];el('circle',{cx:e[0],cy:e[1],r:3.2,'stroke-width':1.2},g);
      for(var j=1;j<p.length-1;j++)el('circle',{class:'nd',cx:p[j][0],cy:p[j][1],r:1.8},g);
      if(!RM&&i%2===0){var c=el('circle',{class:'pulse',r:2.6},g),a=el('animateMotion',{dur:(5+rnd()*6).toFixed(1)+'s',repeatCount:'indefinite',begin:(rnd()*4).toFixed(1)+'s',path:d},c);}
    });
  }
  function build(){
    var m=matchMedia('(max-width:720px)').matches?'m':'d';if(m===mode)return;mode=m;L=LAYOUT[m];
    stage.setAttribute('data-m',m==='m'?'1':'0');stage.style.setProperty('--sgw',L.sgw+'%');
    svg.setAttribute('viewBox','0 0 '+L.W+' '+L.H);svg.innerHTML='';
    var defs=el('defs',{},svg),g0=el('linearGradient',{id:'hg0',gradientUnits:'userSpaceOnUse',x1:0,y1:-L.inner,x2:0,y2:-L.R},defs);
    el('stop',{offset:'0','stop-color':'#58d0ff','stop-opacity':'.06'},g0);el('stop',{offset:'.7','stop-color':'#58d0ff','stop-opacity':'.42'},g0);el('stop',{offset:'1','stop-color':'#bff2ff','stop-opacity':'.62'},g0);
    var gc=el('g',{class:'circ'},svg);traces(gc);els={rays:[],circ:gc};
    var ringsG=el('g',{transform:'translate('+L.cx+' '+L.cy+')'},svg);
    el('circle',{class:'ring r1',r:L.inner+34,cx:0,cy:0},ringsG);
    el('circle',{class:'ring r3',r:L.R*.88,cx:0,cy:0},ringsG);
    // pierscien z drobnych run (obraca sie powoli)
    var rr=el('g',{class:'rr'},ringsG),NR=m==='m'?18:28,RR=L.R*.64;
    for(var q=0;q<NR;q++){var aa=q/NR*360;el('path',{d:RUNES[q%RUNES.length],transform:'rotate('+aa+') translate(0 '+(-RR)+') scale('+(m==='m'?.3:.42)+') translate(-12 -12)','stroke-width':2.4},rr);}
    var rays=el('g',{class:'rays',style:'filter:drop-shadow(0 0 8px rgba(88,208,255,.6))'},svg);
    for(var i=0;i<8;i++){
      var ang=i*45,g=el('g',{transform:'translate('+L.cx+' '+L.cy+') rotate('+ang+')'},rays);
      var kite='0,'+(-L.R)+' '+L.w+','+(-L.R*.40)+' 0,'+(-L.inner)+' '+(-L.w)+','+(-L.R*.40);
      var poly=el('polygon',{points:kite,fill:'url(#hg0)',stroke:'#7fdcff','stroke-width':1.9,'stroke-linejoin':'round',pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1,'fill-opacity':0},g);
      var inn=el('polygon',{points:'0,'+(-L.R*.9)+' '+(L.w*.5)+','+(-L.R*.4)+' 0,'+(-L.inner*1.5)+' '+(-L.w*.5)+','+(-L.R*.4),fill:'none',stroke:'#cdf3ff','stroke-width':.9,opacity:0},g);
      var half=el('polygon',{points:'0,'+(-L.R)+' '+L.w+','+(-L.R*.40)+' 0,'+(-L.inner),fill:'rgba(255,255,255,.07)',opacity:0},g);
      var ax=el('line',{x1:0,y1:-L.inner,x2:0,y2:-L.R,stroke:'#e6faff','stroke-width':1.3,'stroke-dasharray':'2 6','stroke-linecap':'round',opacity:0,class:'flow'},g);
      var glow=el('circle',{cx:0,cy:-L.R,r:0,fill:'rgba(255,137,0,.28)'},g),tip=el('circle',{cx:0,cy:-L.R,r:0,fill:'#FF8900'},g);
      var rg=el('g',{transform:'translate(0 '+(-L.R*.5)+') rotate('+(-ang)+') scale('+L.rs+')',opacity:0},g);
      el('circle',{r:19,fill:'rgba(5,12,28,.6)',stroke:'rgba(127,220,255,.6)','stroke-width':1.2},rg);
      el('circle',{r:22.5,fill:'none',stroke:'rgba(127,220,255,.28)','stroke-width':.8,'stroke-dasharray':'2 3'},rg);
      el('path',{d:RUNES[i],transform:'translate(-12 -12)',fill:'none',stroke:'#EAF6FF','stroke-width':2.3,'stroke-linecap':'round','stroke-linejoin':'round',style:'filter:drop-shadow(0 0 4px #58d0ff)'},rg);
      els.rays.push({poly:poly,inn:inn,half:half,ax:ax,tip:tip,glow:glow,rune:rg});
      var lab=labs[i],a=ang*Math.PI/180,rd=L.R+L.gap;
      lab.setAttribute('data-d',DIR[i]);
      lab.style.setProperty('--x',((L.cx+rd*Math.sin(a))/L.W*100)+'%');lab.style.setProperty('--y',((L.cy-rd*Math.cos(a))/L.H*100)+'%');
      var room=(i===2||i===6)?(L.W-(L.cx+L.R+L.gap)-10):L.lw;lab.style.setProperty('--lw',(Math.min(L.lw,room)/L.W*100)+'%');
    }
    els.logo=[];
    for(var k=0;k<3;k++){
      var lg=el('g',{opacity:0},svg);
      BARS.forEach(function(b){el('polygon',{points:pts(b),fill:k?'none':'#EAF6FF',stroke:k?'#58d0ff':'#EAF6FF','stroke-width':k?2.2:.4,'stroke-linejoin':'miter'},lg);});
      TRIS.forEach(function(t){el('polygon',{points:pts(t),fill:k?'none':'#FF8900',stroke:k?'#FF8900':'none','stroke-width':k?2.2:0},lg);});
      els.logo.push(lg);
    }
    els.flash=el('circle',{class:'flash',cx:L.cx,cy:L.cy,r:30},svg);
    fx.fit();setT(cur);
  }
  function cl(x){return x<0?0:x>1?1:x}
  function eo(t){return 1-Math.pow(1-t,3)}
  var T_RAY0=2000,T_STEP=520,T_DRAW=850,T_END=T_RAY0+7*T_STEP+T_DRAW;
  function setT(ms){
    cur=ms;if(!els)return;
    stage.style.setProperty('--on',cl(ms/800).toFixed(3));
    var t=cl((ms-500)/1400),e=eo(t),base=(mode==='m'?.42:.5),s=base*(1+5*(1-e));
    els.logo.forEach(function(g,k){
      var sc=k===0?s:s*(1+.45*k*(1-e)+.2*k),al=k===0?cl(t*2.4):(1-e)*(.5-.18*k)*cl(t*3);
      g.setAttribute('transform','translate('+L.cx+' '+L.cy+') scale('+sc+') translate(-101 -128)');
      g.setAttribute('opacity',al.toFixed(3));if(k)g.style.display=t<=0?'none':'';
    });
    var nl=ms>=1900;if(nl!==landed){landed=nl;if(nl&&!RM){stage.classList.remove('fl');void stage.offsetWidth;stage.classList.add('fl');}}
    els.rays.forEach(function(r,i){
      var k=cl((ms-(T_RAY0+i*T_STEP))/T_DRAW),kk=eo(k);
      r.poly.setAttribute('stroke-dashoffset',(1-kk).toFixed(3));r.poly.setAttribute('fill-opacity',kk.toFixed(3));
      r.inn.setAttribute('opacity',(kk*.55).toFixed(3));r.half.setAttribute('opacity',kk.toFixed(3));
      r.ax.setAttribute('opacity',(kk*.9).toFixed(3));r.tip.setAttribute('r',(kk*6).toFixed(2));r.glow.setAttribute('r',(kk*16).toFixed(2));
      r.rune.setAttribute('opacity',cl((k-.35)/.5).toFixed(3));
      labs[i].classList.toggle('on',k>.55);
      if(k>0&&k<=.2)fx.burst(i);
    });
    var f=ms>=T_END;if(f!==full){full=f;stage.classList.toggle('full',f);}
  }
  // ---- czastki: pyl, spadajace runy (matrix), wznoszace sie runy, iskry z konców odnog ----
  var fx=(function(){
    var ctx=cvs&&cvs.getContext&&cvs.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,1.75),cw=0,ch=0,P=RUNES.map(function(d){return new Path2D(d)}),motes=[],cols=[],rising=[],sparks=[],running=false,last=0,vis=true;
    function R(a,b){return a+Math.random()*(b-a)}
    function fit(){
      if(!ctx)return;var r=stage.getBoundingClientRect();cw=r.width;ch=r.height;if(!cw)return;cvs.width=Math.round(cw*dpr);cvs.height=Math.round(ch*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      motes=[];for(var i=0;i<L.motes;i++)motes.push({x:R(0,cw),y:R(0,ch),vx:R(-6,6),vy:R(-14,-3),r:R(.6,2.1),a:R(.25,.9),ph:R(0,6.28),c:Math.random()<.14?'255,137,0':'150,225,255'});
      cols=[];for(var j=0;j<L.rain;j++)cols.push({x:(j+.5)/L.rain*cw+R(-12,12),y:R(-ch,0),v:R(35,95),s:R(9,13),n:Math.floor(R(7,14)),i:Math.floor(R(0,16)),t:0});
      rising=[];for(var k=0;k<(L.rain>10?12:5);k++)rising.push(mkRise(true));
    }
    function mkRise(init){return{x:R(.05,.95)*cw,y:init?R(0,ch):ch+20,vy:R(14,34),s:R(14,26),i:Math.floor(R(0,16)),a:0,life:R(.5,1),c:Math.random()<.3?'255,160,60':'127,220,255',ph:R(0,6.28)}}
    function glyph(i,x,y,s,col,al){ctx.save();ctx.translate(x,y);var k=s/24;ctx.scale(k,k);ctx.translate(-12,-12);ctx.lineWidth=1.5/k;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba('+col+','+al+')';ctx.stroke(P[i%P.length]);ctx.restore();}
    function burst(i){
      if(!ctx||!cw||RM)return;var a=i*45*Math.PI/180,x=(L.cx+Math.sin(a)*L.R)/L.W*cw,y=(L.cy-Math.cos(a)*L.R)/L.H*ch;
      for(var n=0;n<2;n++)sparks.push({x:x,y:y,vx:R(-40,40)+Math.sin(a)*30,vy:R(-50,10)+(-Math.cos(a))*30,life:R(.7,1.4),t:0});
    }
    function frame(ts){
      if(!running)return;requestAnimationFrame(frame);if(!vis||!cw)return;
      var dt=Math.min(.05,(ts-last)/1000||.016);last=ts;ctx.clearRect(0,0,cw,ch);
      var on=parseFloat(stage.style.getPropertyValue('--on'))||0;if(on<.05)return;
      ctx.globalAlpha=on;
      // matrix-rain z run
      cols.forEach(function(c){
        c.y+=c.v*dt;c.t+=dt;if(c.t>.28){c.t=0;c.i=(c.i+1)%16;}
        if(c.y-c.n*c.s*1.5>ch){c.y=R(-60,0);c.v=R(35,95);}
        for(var n=0;n<c.n;n++){var yy=c.y-n*c.s*1.5;if(yy<-10||yy>ch+10)continue;var al=(1-n/c.n)*(n===0?.7:.34);glyph(c.i+n*3,c.x,yy,c.s,n===0?'210,245,255':'88,208,255',al.toFixed(3));}
      });
      // pyl
      motes.forEach(function(m){
        m.x+=m.vx*dt;m.y+=m.vy*dt;m.ph+=dt*1.4;if(m.y<-6){m.y=ch+6;m.x=R(0,cw);}if(m.x<-6)m.x=cw+6;if(m.x>cw+6)m.x=-6;
        var tw=.55+.45*Math.sin(m.ph),g=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r*5);g.addColorStop(0,'rgba('+m.c+','+(m.a*tw).toFixed(3)+')');g.addColorStop(1,'rgba('+m.c+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(m.x,m.y,m.r*5,0,6.2832);ctx.fill();
      });
      // wznoszace sie runy
      rising.forEach(function(r,ix){
        r.y-=r.vy*dt;r.ph+=dt;var p=1-(r.y/ch);r.a=Math.max(0,Math.sin(Math.min(1,Math.max(0,p))*Math.PI))*r.life;
        if(r.y<-30)rising[ix]=mkRise(false);else glyph(r.i,r.x+Math.sin(r.ph)*8,r.y,r.s,r.c,(r.a*.8).toFixed(3));
      });
      // iskry
      for(var q=sparks.length-1;q>=0;q--){var sp=sparks[q];sp.t+=dt;if(sp.t>sp.life){sparks.splice(q,1);continue;}sp.x+=sp.vx*dt;sp.y+=sp.vy*dt;sp.vy+=24*dt;var a=1-sp.t/sp.life;ctx.fillStyle='rgba(255,170,70,'+(a*.9).toFixed(3)+')';ctx.beginPath();ctx.arc(sp.x,sp.y,1.6*a+.4,0,6.2832);ctx.fill();}
      // iskry okresowe z konców odnog po pelnym ukladzie
      if(full&&Math.random()<dt*5)burst(Math.floor(Math.random()*8));
      ctx.globalAlpha=1;
    }
    function start(){if(running||!ctx||RM)return;running=true;last=performance.now();requestAnimationFrame(frame);}
    if('IntersectionObserver' in window&&cvs)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)start();}).observe(stage);else start();
    return{fit:fit,burst:burst};
  })();
  var raf=0,t0=0;
  function play(){
    cancelAnimationFrame(raf);landed=false;full=false;stage.classList.remove('full');
    if(RM){setT(1e6);return;}
    setT(0);t0=0;
    (function step(n){if(!t0)t0=n;var ms=n-t0;setT(ms);if(ms<T_END+200)raf=requestAnimationFrame(step);else setT(1e6);})(performance.now());
  }
  labs.forEach(function(b){b.addEventListener('click',function(){if(window.ssOpenPillar)window.ssOpenPillar(b.getAttribute('data-pillar'));});});
  var rp=document.getElementById('holoReplay');if(rp)rp.addEventListener('click',play);
  build();
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){var was=cur;mode=null;build();setT(was);},150);});
  window.__holoT=setT; // do testow
  if(force){document.documentElement.style.scrollBehavior='auto';setT(+force[1]<=1?+force[1]*T_END:+force[1]);setTimeout(function(){sec.scrollIntoView();document.querySelectorAll('.reveal').forEach(function(n){n.classList.add('in')});},30);return;}
  setT(0);
  if(!('IntersectionObserver' in window)){setT(1e6);return;}
  var started=false;
  new IntersectionObserver(function(es,o){if(!started&&es[0].isIntersecting){started=true;o.disconnect();play();}},{threshold:.3}).observe(stage);
})();
