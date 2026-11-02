(function(){
  var sec=document.getElementById('filary'),stage=document.getElementById('holoStage'),svg=document.getElementById('holoSvg');
  if(!sec||!stage||!svg)return;
  var NS='http://www.w3.org/2000/svg',labs=[].slice.call(stage.querySelectorAll('.holo-lab')),DIR=['n','ne','e','se','s','sw','w','nw'];
  var LAYOUT={
    d:{W:1000,H:660,cx:500,cy:330,R:205,inner:46,w:15,lw:230,ls:.40},
    m:{W:600,H:760,cx:300,cy:380,R:166,inner:42,w:13,lw:120,ls:.34}
  };
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,force=/[?&]holo=([\d.]+)/.exec(location.search);
  var mode=null,L=null,els=null,landed=false,full=false;
  function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
  // geometria logo SS (te same figury co w nagłówku/hero)
  var BARS=[[[46,66],[101,35],[101,69],[46,100]],[[101,66],[156,35],[156,69],[101,100]],[[101,90],[68,110],[101,130]],[[101,126],[134,146],[101,166]],[[46,188],[101,157],[101,191],[46,222]],[[101,188],[156,157],[156,191],[101,222]]];
  var TRIS=[[[46,125],[46,161],[77,143]],[[156,131],[156,95],[125,113]]];
  function pts(a){return a.map(function(p){return p.join(',')}).join(' ');}
  function build(){
    var m=matchMedia('(max-width:720px)').matches?'m':'d';if(m===mode)return;mode=m;L=LAYOUT[m];
    stage.setAttribute('data-m',m==='m'?'1':'0');
    svg.setAttribute('viewBox','0 0 '+L.W+' '+L.H);svg.innerHTML='';
    var defs=el('defs',{},svg);
    for(var i=0;i<2;i++){var g=el('linearGradient',{id:'hg'+i,gradientUnits:'userSpaceOnUse',x1:0,y1:-L.inner,x2:0,y2:-L.R},defs);
      el('stop',{offset:'0','stop-color':'#58d0ff','stop-opacity':'.04'},g);
      el('stop',{offset:'1','stop-color':i?'#8fe3ff':'#58d0ff','stop-opacity':i?'.42':'.55'},g);}
    var ringsG=el('g',{transform:'translate('+L.cx+' '+L.cy+')'},svg);
    el('circle',{class:'ring r1',r:L.inner+30,cx:0,cy:0},ringsG);
    el('circle',{class:'ring r2',r:L.R*.62,cx:0,cy:0},ringsG);
    el('circle',{class:'ring r3',r:L.R*.86,cx:0,cy:0},ringsG);
    var rays=el('g',{class:'rays',style:'filter:drop-shadow(0 0 7px rgba(88,208,255,.55))'},svg);
    els={rays:[]};
    for(var i=0;i<8;i++){
      var g=el('g',{class:'ray',transform:'translate('+L.cx+' '+L.cy+') rotate('+(i*45)+')'},rays),pil=i<5;
      var kite='0,'+(-L.R)+' '+L.w+','+(-L.R*.42)+' 0,'+(-L.inner)+' '+(-L.w)+','+(-L.R*.42);
      var poly=el('polygon',{points:kite,fill:'url(#hg'+(pil?0:1)+')',stroke:pil?'#7fdcff':'#a6ecff','stroke-width':pil?1.6:1.2,'stroke-linejoin':'round',pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1,'fill-opacity':0},g);
      var ax=el('line',{x1:0,y1:-L.inner,x2:0,y2:-L.R,stroke:'#cdf3ff','stroke-width':1,'stroke-dasharray':'1 6','stroke-linecap':'round',opacity:0},g);
      var tip=el('circle',{class:'pt',cx:0,cy:-L.R,r:0,fill:pil?'#FF8900':'#58d0ff'},g);
      els.rays.push({poly:poly,ax:ax,tip:tip,pil:pil});
      var lab=labs[i],a=i*45*Math.PI/180,rr=L.R+(m==='m'?10:20);
      lab.setAttribute('data-d',DIR[i]);
      lab.style.left=((L.cx+rr*Math.sin(a))/L.W*100)+'%';lab.style.top=((L.cy-rr*Math.cos(a))/L.H*100)+'%';
      lab.style.setProperty('--x',((L.cx+rr*Math.sin(a))/L.W*100)+'%');lab.style.setProperty('--y',((L.cy-rr*Math.cos(a))/L.H*100)+'%');
      lab.style.setProperty('--lw',(L.lw/L.W*stage.clientWidth||L.lw)+'px');
    }
    // logo w srodku: 3 warstwy (duchy + wlasciwe)
    els.logo=[];
    for(var k=0;k<3;k++){
      var lg=el('g',{class:'lg'+k,opacity:0},svg);
      BARS.forEach(function(b){el('polygon',{points:pts(b),fill:k?'none':'#EAF6FF',stroke:k?'#58d0ff':'#EAF6FF','stroke-width':k?2.2:.4,'stroke-linejoin':'miter'},lg);});
      TRIS.forEach(function(t){el('polygon',{points:pts(t),fill:k?'none':'#FF8900',stroke:k?'#FF8900':'none','stroke-width':k?2.2:0},lg);});
      els.logo.push(lg);
    }
    els.flash=el('circle',{class:'flash',cx:L.cx,cy:L.cy,r:30},svg);
    setP(cur);
  }
  var cur=0;
  function cl(x){return x<0?0:x>1?1:x}
  function eo(t){return 1-Math.pow(1-t,3)}
  function setP(p){
    cur=p;if(!els)return;
    stage.style.setProperty('--p',p.toFixed(3));
    var on=cl(p/.1);stage.style.setProperty('--on',on.toFixed(3));
    // logo "wlatuje" na ekran i zostaje nieruchomo
    var t=cl((p-.1)/.24),e=eo(t),base=(mode==='m'?.34:.4),s=base*(1+5*(1-e));
    els.logo.forEach(function(g,k){
      var sc=k===0?s:s*(1+.45*k*(1-e)+.2*k),al=k===0?cl(t*2.4):(1-e)*(.5-.18*k)*cl(t*3);
      g.setAttribute('transform','translate('+L.cx+' '+L.cy+') scale('+sc+') translate(-101 -128)');
      g.setAttribute('opacity',al.toFixed(3));
      if(k)g.style.display=t<=0?'none':'';
    });
    var nl=p>=.34;if(nl!==landed){landed=nl;if(nl&&!RM){stage.classList.remove('fl');void stage.offsetWidth;stage.classList.add('fl');}}
    // promienie po kolei
    els.rays.forEach(function(r,i){
      var k=cl((p-(.36+i*.075))/.09),kk=eo(k);
      r.poly.setAttribute('stroke-dashoffset',(1-kk).toFixed(3));r.poly.setAttribute('fill-opacity',kk.toFixed(3));
      r.ax.setAttribute('opacity',(kk*.8).toFixed(3));r.tip.setAttribute('r',(kk*(r.pil?5.5:4.5)).toFixed(2));
      labs[i].classList.toggle('on',k>.6);
    });
    var f=p>=.97;if(f!==full){full=f;stage.classList.toggle('full',f);}
  }
  function pFromScroll(){
    var tr=sec.querySelector('.holo-track'),r=tr.getBoundingClientRect(),vh=window.innerHeight,span=tr.offsetHeight-vh;
    return span<=0?1:cl(-r.top/span/.9);   // pelny efekt na ~90% przewijania, reszta = chwila z gotowym ekranem
  }
  var tick=false;
  function onScroll(){if(tick)return;tick=true;requestAnimationFrame(function(){tick=false;setP(pFromScroll());});}
  // klik w etykiete = modal filaru/zasady
  labs.forEach(function(b){b.addEventListener('click',function(){if(window.ssOpenPillar)window.ssOpenPillar(b.getAttribute('data-pillar'));});});
  build();
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){build();setP(force?+force[1]:pFromScroll());},120);});
  if(force){sec.classList.add('holo-static');setP(+force[1]);document.documentElement.style.scrollBehavior='auto';setTimeout(function(){sec.scrollIntoView();document.querySelectorAll('.reveal').forEach(function(n){n.classList.add('in')});},30);return;}
  if(RM){sec.classList.add('holo-static');setP(1);return;}
  window.addEventListener('scroll',onScroll,{passive:true});setP(pFromScroll());
  window.__holoP=setP;window.__holoSync=function(){setP(pFromScroll())}; // do testow
})();
