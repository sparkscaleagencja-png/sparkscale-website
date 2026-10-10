(function(){
  var hero=document.getElementById('ssHero'),box=document.getElementById('ssHlogo'),stars=document.getElementById('ssStars');
  if(!hero||!box)return;
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  // paralaksa od myszy (zmienne --mx/--my w zakresie -1..1)
  hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();
    hero.style.setProperty('--mx',((e.clientX-r.left)/r.width*2-1).toFixed(3));hero.style.setProperty('--my',((e.clientY-r.top)/r.height*2-1).toFixed(3));});
  hero.addEventListener('pointerleave',function(){hero.style.setProperty('--mx',0);hero.style.setProperty('--my',0);});
  // --- rozkladanie logo od srodka (start = "sciśniete logo" z kokardka z trojkatow) ---
  var C=128,bs=[].slice.call(box.querySelectorAll('.hb')),tL=document.getElementById('ssHtL'),tR=document.getElementById('ssHtR');
  var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},
      back=function(t){var c=1.4;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)},
      cl=function(x){return Math.max(0,Math.min(1,x))};
  var DUR=1900,ST=140,tris=[[tL,143,46],[tR,113,156]];
  function frame(T){
    bs.forEach(function(g){var b=+g.getAttribute('data-cy'),d=Math.abs(b-C)/45*ST,t=back(cl((T-d)/(DUR-300))),s=.4+.6*Math.max(t,0);
      g.setAttribute('transform','matrix(1,0,0,'+s+',0,'+(b+(C-b)*(1-t)-b*s)+')');});
    tris.forEach(function(a){var t=ease(cl((T-250)/(DUR-250))),sx=1+(1-t)*1.2,sy=1+(1-t)*.6,dy=(C-a[1])*(1-t);
      a[0].setAttribute('transform','translate(0 '+dy+') translate('+a[2]+' '+a[1]+') scale('+sx+' '+sy+') translate('+(-a[2])+' '+(-a[1])+')');});
  }
  var raf,t0;
  function play(delay){
    cancelAnimationFrame(raf);t0=null;box.classList.remove('on');
    if(RM){frame(1e5);box.classList.add('on');return}
    frame(0);
    var step=function(n){t0=t0||n;var T=n-t0-(delay||0);frame(Math.max(T,0));if(T<DUR+ST*2)raf=requestAnimationFrame(step);else frame(1e5)};
    raf=requestAnimationFrame(step);setTimeout(function(){box.classList.add('on')},(delay||0)+600);
  }
  box.addEventListener('click',function(){play(0)});
  window.__ssLogoKlatka=frame; // do testow: __ssLogoKlatka(ms)
  play(450);
  // --- gwiazdki: losowo sie pojawiaja, lekki blask, krycie max 70% ---
  if(RM||!stars)return;
  var SV='<svg viewBox="-1 -1 2 2"><path d="M0,-1 Q.14,-.14 1,0 Q.14,.14 0,1 Q-.14,.14 -1,0 Q-.14,-.14 0,-1Z"/></svg>',live=0,vis=true;
  new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(hero);
  function spawn(){
    if(!vis||document.hidden||live>=16)return;
    var s=document.createElement('span'),big=Math.random()<.18,sz=big?28+Math.random()*26:8+Math.random()*18;
    s.className='ss-star';s.innerHTML=SV;
    s.style.cssText='left:'+(2+Math.random()*96)+'%;top:'+(3+Math.random()*94)+'%;--s:'+sz.toFixed(0)+'px;--c:'+(Math.random()<.68?'#FF8900':'#F4F4F2')+';--t:'+(2.8+Math.random()*3.4).toFixed(2)+'s';
    live++;s.addEventListener('animationend',function(){s.remove();live--});stars.appendChild(s);
  }
  for(var i=0;i<6;i++)setTimeout(spawn,600+i*260);
  setInterval(spawn,420);
})();
