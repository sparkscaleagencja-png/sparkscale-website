(function(){
  var phone=document.getElementById('uPhone');if(!phone)return;
  var NS='http://www.w3.org/2000/svg',svg=document.getElementById('uSvg'),pill=document.getElementById('uTime'),cta=document.getElementById('uCta');
  var $=function(id){return document.getElementById(id)};
  var W=55,P=function(t){return t.map(function(p){return p.join(',')}).join(' ')};
  var BARS=[[[46,66],[101,35],[101,69],[46,100]],[[46,188],[101,157],[101,191],[46,222]],[[101,66],[156,35],[156,69],[101,100]],[[101,188],[156,157],[156,191],[101,222]],[[101,90],[68,110],[101,130]],[[101,126],[134,146],[101,166]]];
  var ORS=[[[46,125],[46,161],[77,143]],[[156,131],[156,95],[125,113]]];
  var FROM=[[0,-300],[0,300],[0,-300],[0,300],[-260,0],[260,0],[-300,0],[300,0]],DEL=[0,.12,.24,.36,.5,.6,.7,.8];
  function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e}
  var clamp=function(x){return Math.max(0,Math.min(1,x))},oExp=function(x){return x>=1?1:1-Math.pow(2,-10*x)},iO=function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};

  // --- tlo + sceny ---
  var bg=el('rect',{width:540,height:960,fill:'#0a0a0b'});
  var streaks=el('g',{});for(var i=0;i<16;i++)el('line',{x1:20+i*34,x2:20+i*34,y1:0,y2:150+(i%4)*70,stroke:'#FF8900','stroke-width':1.2,opacity:.0},streaks);
  var gA=el('g',{}),wrapA=el('g',{},gA),pcs=[],nds=[],i;
  BARS.concat(ORS).forEach(function(poly,k){var isO=k>=6;var g=el('g',{},wrapA);var pl=el('polygon',{points:P(poly),fill:isO?'#FF8900':'#F4F4F2',stroke:isO?'#FF8900':'#F4F4F2','stroke-width':.35},g);pcs.push(g)});
  var ols=BARS.concat(ORS).map(function(poly){return el('polygon',{points:P(poly),fill:'none',stroke:'#FF8900','stroke-width':1.1,'vector-effect':'non-scaling-stroke',opacity:0},wrapA)});
  BARS.forEach(function(poly){poly.forEach(function(p){nds.push(el('rect',{x:p[0]-3,y:p[1]-3,width:6,height:6,fill:'#0a0a0b',stroke:'#FF8900','stroke-width':1.2,'vector-effect':'non-scaling-stroke',opacity:0},wrapA))})});
  var br=el('path',{d:'M38,48 L38,27 L59,27 M164,27 L185,27 L185,48 M185,214 L185,235 L164,235 M59,235 L38,235 L38,214',transform:'translate(-11 0)',fill:'none',stroke:'#F4F4F2','stroke-width':1.4,'vector-effect':'non-scaling-stroke',opacity:0},wrapA);
  // scena B: pierscien odliczania
  var gB=el('g',{}),ring0=el('circle',{cx:270,cy:440,r:150,fill:'none',stroke:'#26262c','stroke-width':8},gB),
      ring=el('circle',{cx:270,cy:440,r:150,fill:'none',stroke:'#FF8900','stroke-width':8,'stroke-linecap':'round','stroke-dasharray':942.5,'stroke-dashoffset':942.5,transform:'rotate(-90 270 440)'},gB),
      num=el('text',{x:270,y:495,'text-anchor':'middle','font-family':'Space Grotesk','font-weight':700,'font-size':190,fill:'#F4F4F2'},gB),
      t1=el('text',{x:270,y:660,'text-anchor':'middle','font-family':'Space Grotesk','font-weight':700,'font-size':30,fill:'#b8b8b4'},gB),
      t2=el('text',{x:270,y:700,'text-anchor':'middle','font-family':'Space Grotesk','font-weight':700,'font-size':30,fill:'#FF8900'},gB);
  t1.textContent='sekundy, żeby zatrzymać kciuk.';
  // scena C: slowa
  var gC=el('g',{}),wd=el('text',{x:270,y:520,'text-anchor':'middle','font-family':'Space Grotesk','font-weight':700,'font-size':100,'letter-spacing':-4},gC),echo=[];
  for(i=0;i<3;i++)echo.push(el('text',{x:270,y:520,'text-anchor':'middle','font-family':'Space Grotesk','font-weight':700,'font-size':100,'letter-spacing':-4,fill:'none',stroke:'#FF8900','stroke-width':2},gC));
  // scena D: pen tool
  var gD=el('g',{}),wrapD=el('g',{transform:'translate(270 480) scale(2.4) translate(-101 -128)'},gD),
      clip=el('clipPath',{id:'uClip'},wrapD),cr=el('rect',{x:30,y:20,width:0,height:220},clip),fills=el('g',{'clip-path':'url(#uClip)'},wrapD),outs=[],hnd=el('g',{},wrapD);
  BARS.forEach(function(poly){el('polygon',{points:P(poly),fill:'#FF8900'},fills)});ORS.forEach(function(poly){el('polygon',{points:P(poly),fill:'#F4F4F2'},fills)});
  BARS.concat(ORS).forEach(function(poly,k){outs.push(el('polygon',{points:P(poly),fill:'none',stroke:'#F4F4F2','stroke-width':1.5,'vector-effect':'non-scaling-stroke',pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1},wrapD))});
  var hn=[];BARS.concat(ORS).forEach(function(poly){poly.forEach(function(p,j){var q=poly[(j+1)%poly.length];var hx=p[0]+(q[0]-p[0])*.28,hy=p[1]+(q[1]-p[1])*.28;
    var l=el('line',{x1:p[0],y1:p[1],x2:hx,y2:hy,stroke:'#FF8900','stroke-width':1,'vector-effect':'non-scaling-stroke',opacity:0},hnd),c=el('circle',{cx:hx,cy:hy,r:1.8,fill:'#FF8900',opacity:0},hnd),s=el('rect',{x:p[0]-2.4,y:p[1]-2.4,width:4.8,height:4.8,fill:'#0a0a0b',stroke:'#F4F4F2','stroke-width':1.2,'vector-effect':'non-scaling-stroke',opacity:0},hnd);hn.push([l,c,s])})});
  // scena E: finalowa karta
  var gE=el('g',{}),logoE=el('g',{transform:'translate(270 300) scale(1.25) translate(-101 -128)'},gE);
  BARS.forEach(function(poly){el('polygon',{points:P(poly),fill:'#F4F4F2'},logoE)});ORS.forEach(function(poly){el('polygon',{points:P(poly),fill:'#FF8900'},logoE)});
  var eT=el('text',{x:270,y:560,'text-anchor':'middle','font-family':'Space Grotesk','font-weight':700,'font-size':62,fill:'#F4F4F2','letter-spacing':-2},gE);eT.innerHTML='sparkscale<tspan fill="#FF8900">.</tspan>';
  var eS=el('text',{x:270,y:612,'text-anchor':'middle','font-family':'Space Grotesk','font-weight':600,'font-size':27,fill:'#b8b8b4'},gE);eS.textContent='Zatrzymujemy uwagę.';
  var flash=el('rect',{width:540,height:960,fill:'#fff',opacity:0});

  var WORDS=['BRAND','GROWTH','SYSTEM','AI'];
  function f(T){
    var a=T,show=function(g,v){g.style.display=v?'':'none'};
    // ----- A: wejscie z dwoch stron, 0 - 3.7 s -----
    show(gA,a<3.8);show(streaks,a<1.4);
    if(a<3.8){
      var out=a>3.2?iO(clamp((a-3.2)/.5)):0,s=2.2*(1-.75*out),y=480-out*230;
      var sh=(a>2.2&&a<2.6)?(Math.random()*8-4):0;
      wrapA.setAttribute('transform','translate('+(270+sh)+' '+(y+sh)+') scale('+s+') translate(-101 -128)');wrapA.setAttribute('opacity',1-out);
      pcs.forEach(function(g,k){var p=oExp(clamp((a-DEL[k])/.75));g.setAttribute('transform','translate('+(FROM[k][0]*(1-p))+' '+(FROM[k][1]*(1-p))+')')});
      ols.forEach(function(o,k){o.setAttribute('opacity',clamp((a-1.35-k*.05)/.25)*.9)});
      nds.forEach(function(n,k){n.setAttribute('opacity',clamp((a-1.4-k*.03)/.2))});
      br.setAttribute('opacity',clamp((a-1.6)/.3));
      var sy=(a*900)%300;streaks.setAttribute('transform','translate(0 '+sy+')');streaks.setAttribute('opacity',a<1.2?.6:0);
      for(var q=0;q<streaks.childNodes.length;q++)streaks.childNodes[q].setAttribute('opacity',a<1.2?.5:0);
    }
    flash.setAttribute('opacity',(a>2.2&&a<2.5)?.65*(1-(a-2.2)/.3):0);
    // ----- B: odliczanie, 3.2 - 6.3 s -----
    var b=a-3.2;show(gB,b>0&&a<6.4);
    if(b>0&&a<6.4){var k2=clamp(b/2.7);ring.setAttribute('stroke-dashoffset',942.5*(1-iO(k2)));gB.setAttribute('opacity',clamp(b/.3)*(a>6.1?1-clamp((a-6.1)/.3):1));
      var n=Math.max(1,3-Math.floor(b/.85));num.textContent=b<2.55?n:'0';var pop=1+.12*Math.max(0,1-((b%.85)/.2));num.setAttribute('transform','translate(0 0) scale('+pop+')');num.setAttribute('transform-origin','270 440');
      t2.textContent=b>2.5?'Albo znikasz.':'';num.setAttribute('fill',b>2.5?'#FF8900':'#F4F4F2')}
    // ----- C: szybkie slowa i skala, 6.2 - 11 s -----
    show(gC,a>=6.2&&a<11.0);
    if(a>=6.2&&a<11.0){var c=a-6.2,idx=Math.floor(c/.55),dark;
      if(idx<4){dark=idx%2===0;bg.setAttribute('fill',dark?'#FF8900':'#0a0a0b');wd.textContent=WORDS[idx];wd.setAttribute('fill',dark?'#0a0a0b':'#F4F4F2');wd.setAttribute('font-size',100);wd.removeAttribute('transform');echo.forEach(function(e){e.textContent=''})}
      else{var d=c-2.2;bg.setAttribute('fill','#0a0a0b');wd.textContent='SCALE';wd.setAttribute('fill','#F4F4F2');
        var g=.6+oExp(clamp(d/.7))*.5;wd.setAttribute('font-size',100);wd.setAttribute('transform','translate(270 460) scale('+g+') translate(-270 -460)');wd.setAttribute('transform-origin','270 460');
        echo.forEach(function(e,k){e.textContent='SCALE';var gg=g*(1+.12*(k+1)*clamp(d/.6));e.setAttribute('transform','translate(270 460) scale('+gg+') translate(-270 -460)');e.setAttribute('opacity',(.55-.16*k)*clamp(d/.4))})}}
    else if(a>=11.0||a<6.2)bg.setAttribute('fill','#0a0a0b');
    // ----- D: pen tool, 10.8 - 15.6 s -----
    var dd=a-10.8;show(gD,dd>0&&a<15.7);
    if(dd>0&&a<15.7){gD.setAttribute('opacity',clamp(dd/.3));
      outs.forEach(function(o,k){var p=iO(clamp((dd-k*.18)/1.2));o.setAttribute('stroke-dashoffset',1-p);o.setAttribute('opacity',1)});
      hn.forEach(function(h,k){var v=clamp((dd-.5-k*.05)/.25);h.forEach(function(e){e.setAttribute('opacity',v*(dd>3.2?1-clamp((dd-3.2)/.5):1))})});
      cr.setAttribute('width',iO(clamp((dd-2.4)/1.4))*130)}
    // ----- E: finalowa karta, 15.5 - 21 s -----
    var e2=a-15.5;show(gE,e2>0);
    if(e2>0){var k3=clamp(e2/.7);gE.setAttribute('opacity',k3);logoE.setAttribute('transform','translate(270 '+(300+(1-oExp(k3))*40)+') scale(1.25) translate(-101 -128)')}
    cta.classList.toggle('on',e2>.9&&a<20.6);
    // licznik
    var sh2=Math.min(a,20);pill.textContent=(sh2<10?'0':'')+sh2.toFixed(1)+'s';
    phone.style.opacity=(a>20.6)?1-clamp((a-20.6)/.4):1;
  }
  var LOOP=21,t0=null,vis=false,raf,RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function loop(n){if(!vis||document.hidden){t0=null;raf=requestAnimationFrame(loop);return}if(t0===null)t0=n;var T=(n-t0)/1000;if(T>LOOP){t0=n;T=0}f(T);raf=requestAnimationFrame(loop)}
  if(RM){f(18.5);return}
  f(0);
  new IntersectionObserver(function(es){vis=es[0].isIntersecting},{threshold:.3}).observe(phone);
  phone.addEventListener('click',function(e){if(e.target.closest('a'))return;t0=null});
  raf=requestAnimationFrame(loop);
  window.__uwagaKlatka=function(s){vis=false;cancelAnimationFrame(raf);phone.style.opacity=1;f(s)}; // do testow
})();
