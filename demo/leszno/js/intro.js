(() => {
  const film = document.querySelector(".film");
  if (!film) return;
  const $ = s => film.querySelector(s);
  const video = $(".film-wideo"), cieply = $(".film-cieply"), slot = $(".film-slot");
  const [mx, my, ma] = film.dataset.lustro.split(",").map(Number);
  const [VW, VH] = film.dataset.klatka.split(",").map(Number);
  const ZOOM = 1.12;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let trwa = false, zegar = 0;

  // object-position = położenie lusterka w %, więc jego środek leży zawsze w tych samych % ramki
  const geometria = () => {
    const W = film.clientWidth, H = film.clientHeight;
    return { s: Math.max(W / VW, H / VH), cx: W * mx / VW, cy: H * my / VH };
  };

  async function finale(animuj = true) {
    if (trwa || film.classList.contains("final")) return;
    trwa = true;
    clearTimeout(zegar);
    const anim = animuj && !reduce && !document.hidden;
    film.classList.add("konczy");
    const g = geometria();
    if (anim) {
      await video.animate([{ transform: "scale(1)" }, { transform: `scale(${ZOOM})` }],
        { duration: 1000, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards" }).finished;
    }
    const fr = film.getBoundingClientRect();
    film.classList.add("final");
    if (anim) {
      const sr = slot.getBoundingClientRect();
      const dx = g.cx - (sr.left - fr.left + sr.width / 2);
      const dy = g.cy - (sr.top - fr.top + sr.height / 2);
      const k = (2 * ma * g.s * ZOOM) / sr.width;
      slot.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${k})` }, { transform: "none" }],
        { duration: 1300, easing: "cubic-bezier(.16,1,.3,1)" });
      cieply.animate([{ clipPath: `circle(0px at ${g.cx}px ${g.cy}px)` }, { clipPath: `circle(150% at ${g.cx}px ${g.cy}px)` }],
        { duration: 1200, easing: "cubic-bezier(.5,0,.2,1)" });
    }
    trwa = false;
  }

  function start() {
    zegar = setTimeout(() => finale(false), 9000);
    video.addEventListener("playing", () => clearTimeout(zegar), { once: true });
    const p = video.play();
    if (p && p.catch) p.catch(() => finale(false));
  }

  if (reduce) {
    film.classList.add("final", "statyczny");
    return;
  }
  video.addEventListener("ended", () => setTimeout(finale, 400));
  $(".film-pomin").addEventListener("click", () => {
    clearTimeout(zegar);
    if (!video.duration) return finale(false);
    video.pause();
    video.addEventListener("seeked", () => finale(), { once: true });
    video.currentTime = video.duration - 0.05;
  });
  $(".film-powtorz").addEventListener("click", () => {
    film.classList.remove("final", "konczy");
    video.getAnimations().forEach(a => a.cancel());
    video.currentTime = 0;
    start();
  });
  start();
})();
