(function(){
  var sec=document.getElementById('filary'),stage=document.getElementById('holoStage'),svg=document.getElementById('holoSvg');
  if(!sec||!stage||!svg)return;
  var NS='http://www.w3.org/2000/svg',labs=[].slice.call(stage.querySelectorAll('.holo-lab')),DIR=['n','ne','e','se','s','sw','w','nw'];
  var LAYOUT={
    d:{W:1000,H:690,cx:500,cy:345,R:236,inner:50,w:42,lw:300,rs:1.25,gap:22},
    m:{W:600,H:760,cx:300,cy:380,R:150,inner:38,w:27,lw:150,rs:.72,gap:30}
  };
  // runy odnog: kolejno Scalowanie, AI, Aplikacje, Strony, Widocznosc, Social, Marketing, Marka (siatka 24x24, same proste kreski)
  var RUNES=[
    'M12 22V4M5 11L12 4L19 11M6 18L12 12L18 18',
    'M12 2L21 12L12 22L3 12ZM12 8V16M8 12H16',
    'M4 3V21M20 3V21M4 3L12 13L20 3',
    'M8 3V21M8 7L18 12L8 17',
    'M2 12L12 4L22 12L12 20ZM12 9V15',
    'M4 4L20 20M20 4L4 20M12 4V20',
    'M12 22V3M12 12L5 5M12 12L19 5',
    'M5 3V21M19 3V21M5 3L19 21M19 3L5 21'
  ];
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,force=/[?&]holo=([\d.]+)/.exec(location.search);
  var mode=null,L=null,els=null,landed=false,full=false,cur=0;
  function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
  var BARS=[[[46,66],[101,35],[101,69],[46,100]],[[101,66],[156,35],[156,69],[101,100]],[[101,90],[68,110],[101,130]],[[101,126],[134,146],[101,166]],[[46,188],[101,157],[101,191],[46,222]],[[101,188],[156,157],[156,191],[101,222]]];
  var TRIS=[[[46,125],[46,161],[77,143]],[[156,131],[156,95],[125,113]]];
  function pts(a){return a.map(function(p){return p.join(',')}).join(' ');}
  function build(){
    var m=matchMedia('(max-width:720px)').matches?'m':'d';if(m===mode)return;mode=m;L=LAYOUT[m];
    stage.setAttribute('data-m',m==='m'?'1':'0');
    svg.setAttribute('viewBox','0 0 '+L.W+' '+L.H);svg.innerHTML='';
    var defs=el('defs',{},svg),g0=el('linearGradient',{id:'hg0',gradientUnits:'userSpaceOnUse',x1:0,y1:-L.inner,x2:0,y2:-L.R},defs);
    el('stop',{offset:'0','stop-color':'#58d0ff','stop-opacity':'.05'},g0);el('stop',{offset:'1','stop-color':'#58d0ff','stop-opacity':'.5'},g0);
    var ringsG=el('g',{transform:'translate('+L.cx+' '+L.cy+')'},svg);
    el('circle',{class:'ring r1',r:L.inner+34,cx:0,cy:0},ringsG);
    el('circle',{class:'ring r2',r:L.R*.6,cx:0,cy:0},ringsG);
    el('circle',{class:'ring r3',r:L.R*.88,cx:0,cy:0},ringsG);
    var rays=el('g',{class:'rays',style:'filter:drop-shadow(0 0 8px rgba(88,208,255,.55))'},svg);
    els={rays:[]};
    for(var i=0;i<8;i++){
      var ang=i*45,g=el('g',{transform:'translate('+L.cx+' '+L.cy+') rotate('+ang+')'},rays);
      var kite='0,'+(-L.R)+' '+L.w+','+(-L.R*.40)+' 0,'+(-L.inner)+' '+(-L.w)+','+(-L.R*.40);
      var poly=el('polygon',{points:kite,fill:'url(#hg0)',stroke:'#7fdcff','stroke-width':1.8,'stroke-linejoin':'round',pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1,'fill-opacity':0},g);
      var ax=el('line',{x1:0,y1:-L.inner,x2:0,y2:-L.R,stroke:'#cdf3ff','stroke-width':1,'stroke-dasharray':'1 7','stroke-linecap':'round',opacity:0},g);
      var tip=el('circle',{cx:0,cy:-L.R,r:0,fill:'#FF8900'},g);
      // runa wewnatrz odnogi (zawsze pionowo, niezaleznie od obrotu odnogi)
      var rg=el('g',{transform:'translate(0 '+(-L.R*.5)+') rotate('+(-ang)+') scale('+L.rs+')',opacity:0},g);
      el('circle',{r:19,fill:'rgba(5,12,28,.55)',stroke:'rgba(127,220,255,.55)','stroke-width':1.2},rg);
      el('path',{d:RUNES[i],transform:'translate(-12 -12)',fill:'none',stroke:'#EAF6FF','stroke-width':2.3,'stroke-linecap':'round','stroke-linejoin':'round'},rg);
      els.rays.push({poly:poly,ax:ax,tip:tip,rune:rg});
      var lab=labs[i],a=ang*Math.PI/180,rr=L.R+L.gap;
      lab.setAttribute('data-d',DIR[i]);
      lab.style.setProperty('--x',((L.cx+rr*Math.sin(a))/L.W*100)+'%');lab.style.setProperty('--y',((L.cy-rr*Math.cos(a))/L.H*100)+'%');
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
    setT(cur);
  }
  function cl(x){return x<0?0:x>1?1:x}
  function eo(t){return 1-Math.pow(1-t,3)}
  var T_RAY0=2000,T_STEP=520,T_DRAW=850,T_END=T_RAY0+7*T_STEP+T_DRAW;
  // os czasu animacji (ms od startu): ekran wlacza sie -> logo wlatuje -> odnogi pojawiaja sie po kolei
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
      r.ax.setAttribute('opacity',(kk*.8).toFixed(3));r.tip.setAttribute('r',(kk*6).toFixed(2));
      r.rune.setAttribute('opacity',cl((k-.35)/.5).toFixed(3));
      labs[i].classList.toggle('on',k>.55);
    });
    var f=ms>=T_END;if(f!==full){full=f;stage.classList.toggle('full',f);}
  }
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
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){var was=cur;build();setT(was);},120);});
  window.__holoT=setT; // do testow
  if(force){document.documentElement.style.scrollBehavior='auto';setT(+force[1]<=1?+force[1]*T_END:+force[1]);setTimeout(function(){sec.scrollIntoView();document.querySelectorAll('.reveal').forEach(function(n){n.classList.add('in')});},30);return;}
  setT(0);
  if(!('IntersectionObserver' in window)){setT(1e6);return;}
  var started=false;
  new IntersectionObserver(function(es,o){if(!started&&es[0].isIntersecting){started=true;o.disconnect();play();}},{threshold:.3}).observe(stage);
})();
