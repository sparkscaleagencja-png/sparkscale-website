/* --- SEKCJA "ROLKA": film laduje sie dopiero przy przewinieciu, gra wyciszony gdy widoczny,
   przycisk / klik w film wlacza dzwiek (od poczatku przy pierwszym wlaczeniu) --- */
(function(){
  var v=document.getElementById('rVid'),b=document.getElementById('rDzwiek'),ph=document.getElementById('rPhone');
  if(!v||!b)return;
  var zaladowany=false,widac=false,slyszal=false,spokoj=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function laduj(){if(!zaladowany){v.src=v.getAttribute('data-src');zaladowany=true}}
  function graj(){laduj();var p=v.play();if(p&&p.catch)p.catch(function(){})}
  function etykieta(){b.classList.toggle('on',!v.muted);b.setAttribute('aria-pressed',v.muted?'false':'true');
    b.querySelector('span').textContent=v.muted?'Włącz dźwięk':'Wycisz'}
  function przelacz(e){if(e)e.stopPropagation();
    v.muted=!v.muted;
    if(!v.muted&&!slyszal){slyszal=true;v.currentTime=0}
    etykieta();graj()}
  b.addEventListener('click',przelacz);
  ph.addEventListener('click',przelacz);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){en.forEach(function(x){
      widac=x.isIntersecting;
      if(widac){if(!spokoj||!v.muted)graj()}else if(zaladowany){v.pause()}
    })},{threshold:.4}).observe(ph);
  }else{laduj()}
  etykieta();
})();
