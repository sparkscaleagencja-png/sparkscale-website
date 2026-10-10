(function(){
  var box=document.getElementById('ssStrefy');if(!box)return;
  var r=box.querySelector('.ss-st-ruler'),n=61;
  for(var i=0;i<n;i++){var t=document.createElement('i');t.style.setProperty('--i',i);r.appendChild(t);}
  // linijka ma konczyc sie kreska "duza" na obu koncach: 61 = 12 odcinkow po 5 + 1
  if(!('IntersectionObserver' in window)){box.classList.add('on');return}
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting){box.classList.add('on');o.disconnect()}},{threshold:.25}).observe(box);
})();
