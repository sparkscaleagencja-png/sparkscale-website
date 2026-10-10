(function(){
  var scene=document.getElementById('scene');if(!scene)return;
  var chars=document.getElementById('chars'),mach=document.getElementById('machine'),surf=document.getElementById('beltSurf'),
      rol=document.getElementById('rollers'),dIn=document.getElementById('dIn'),dOut=document.getElementById('dOut');
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,W=0,M={},rolls=[],list=[],off=0,vis=false,last=0,since=1e9;
  function measure(){
    W=scene.clientWidth;M={l:mach.offsetLeft-mach.offsetWidth/2,r:mach.offsetLeft+mach.offsetWidth/2,c:mach.offsetLeft};
    rol.innerHTML='';rolls=[];var n=Math.ceil(W/64)+1;
    for(var i=0;i<n;i++){var e=document.createElement('i');e.style.left=(i*64+14)+'px';rol.appendChild(e);rolls.push(e)}
  }
  measure();addEventListener('resize',measure);
  function make(){
    var d=document.createElement('div');d.className='ch';
    d.innerHTML='<img class="m" src="img/malpka.webp" alt=""><img class="g" src="img/goryl.webp" alt="">';
    d.querySelector('.m').style.animationDelay=(-Math.random()).toFixed(2)+'s';
    chars.appendChild(d);var o={el:d,x:-260,w:0,st:0};list.push(o);return o;
  }
  function flap(el){el.classList.add('flap');setTimeout(function(){el.classList.remove('flap')},320)}
  var STAR='<svg viewBox="-1 -1 2 2"><path d="M0,-1 Q.14,-.14 1,0 Q.14,.14 0,1 Q-.14,.14 -1,0 Q-.14,-.14 0,-1Z"/></svg>';
  function zap(){
    mach.classList.remove('zap');void mach.offsetWidth;mach.classList.add('zap');
    setTimeout(function(){mach.classList.remove('zap')},480);
    var top=mach.offsetTop;
    for(var i=0;i<5;i++){var p=document.createElement('span');p.className='puff';p.innerHTML=STAR;
      p.style.cssText='left:'+(M.c-10+(Math.random()*40-20))+'px;top:'+(top-6)+'px;--s:'+(10+Math.random()*16)+'px;--c:'+(Math.random()<.7?'#FF8900':'#F4F4F2')+
        ';--dx:'+(Math.random()*90-45)+'px;--dy:'+(-50-Math.random()*70)+'px';
      scene.appendChild(p);p.addEventListener('animationend',function(){this.remove()})}
  }
  if(RM){var a=make(),b=make();a.x=W*.08;b.x=W*.74;b.el.classList.add('gor');
    [a,b].forEach(function(o){o.el.style.transform='translateX('+o.x+'px)'});return}
  new IntersectionObserver(function(es){vis=es[0].isIntersecting;last=0}).observe(scene);
  function step(dt){
    var v=Math.max(90,W/10);off+=v*dt;since+=v*dt;
    surf.style.backgroundPosition=off+'px 0';
    var ang=off/((rolls[0]&&rolls[0].offsetWidth/2)||8)*57.3;
    rolls.forEach(function(e){e.style.transform='rotate('+ang+'deg)'});
    if(since>mach.offsetWidth*1.05){since=0;make()}
    for(var i=list.length-1;i>=0;i--){var o=list[i];o.x+=v*dt;if(!o.w)o.w=o.el.offsetWidth||150;var c=o.x+o.w/2;
      if(o.st===0&&o.x+o.w>M.l+8){o.st=1;flap(dIn)}
      if(o.st===1&&c>M.c){o.st=2;o.el.classList.add('gor');o.w=o.el.offsetWidth||o.w;o.x=c-o.w/2;zap()}
      if(o.st===2&&o.x+o.w*.15>M.r-6){o.st=3;flap(dOut)}
      if(o.x>W+40){o.el.remove();list.splice(i,1);continue}
      o.el.style.transform='translateX('+o.x+'px)'}
  }
  function tick(n){
    requestAnimationFrame(tick);if(!vis||document.hidden){last=0;return}
    var dt=last?Math.min(.05,(n-last)/1000):0;last=n;step(dt);
  }
  requestAnimationFrame(tick);
  window.__tasmaKlatka=function(sec){measure();for(var k=0;k<Math.round(sec*30);k++)step(1/30)}; // do testow
})();
