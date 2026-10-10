(() => {
  const ruch = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mysz = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const naglowek = $(".naglowek");
  const postep = $(".postep");
  let tik = false;
  const naPrzewin = () => {
    tik = false;
    const y = scrollY;
    naglowek.classList.toggle("przewiniety", y > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    postep.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
  };
  addEventListener("scroll", () => { if (!tik) { tik = true; requestAnimationFrame(naPrzewin); } }, { passive: true });
  naPrzewin();

  const hamburger = $(".hamburger");
  hamburger.addEventListener("click", () => {
    const otw = document.body.classList.toggle("menu-otwarte");
    hamburger.setAttribute("aria-expanded", otw);
  });
  $$(".menu a").forEach(a => a.addEventListener("click", () => {
    document.body.classList.remove("menu-otwarte");
    hamburger.setAttribute("aria-expanded", "false");
  }));

  const linki = new Map($$(".menu a").map(a => [a.getAttribute("href").slice(1), a]));
  const obsSekcji = new IntersectionObserver(wpisy => {
    wpisy.forEach(w => {
      if (!w.isIntersecting) return;
      linki.forEach(a => a.classList.remove("aktywny"));
      linki.get(w.target.id)?.classList.add("aktywny");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  linki.forEach((_, id) => { const s = document.getElementById(id); if (s) obsSekcji.observe(s); });

  const licz = el => {
    const cel = parseFloat(el.dataset.licz), miejsca = +el.dataset.miejsca || 0;
    const przed = el.dataset.przed || "", po = el.dataset.po || "";
    const fmt = v => przed + v.toLocaleString("pl-PL", { minimumFractionDigits: miejsca, maximumFractionDigits: miejsca }) + po;
    if (!ruch) { el.textContent = fmt(cel); return; }
    const t0 = performance.now(), czas = 1800;
    const krok = t => {
      const k = Math.min(1, (t - t0) / czas), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(cel * e);
      if (k < 1) requestAnimationFrame(krok);
    };
    requestAnimationFrame(krok);
  };

  const obs = new IntersectionObserver(wpisy => {
    wpisy.forEach(w => {
      if (!w.isIntersecting) return;
      w.target.classList.add("widoczne");
      const b = w.target.querySelector("[data-licz]");
      if (b) licz(b);
      obs.unobserve(w.target);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
  $$(".odslon").forEach(el => obs.observe(el));

  if (mysz && ruch) {
    const kursor = $(".kursor");
    addEventListener("pointermove", e => {
      document.body.classList.add("mysz");
      kursor.style.setProperty("--kx", e.clientX + "px");
      kursor.style.setProperty("--ky", e.clientY + "px");
    }, { passive: true });
    document.addEventListener("pointerleave", () => document.body.classList.remove("mysz"));

    $$("[data-tilt]").forEach(el => {
      const cel = el.classList.contains("karta") ? el : el;
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        cel.style.setProperty("--ry", ((x - 0.5) * 10).toFixed(2) + "deg");
        cel.style.setProperty("--rx", ((0.5 - y) * 10).toFixed(2) + "deg");
        cel.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        cel.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      });
      el.addEventListener("pointerleave", () => { cel.style.setProperty("--rx", "0deg"); cel.style.setProperty("--ry", "0deg"); });
    });

    $$(".magnes").forEach(el => {
      const span = el.querySelector("span");
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
        if (span) span.style.transform = `translate(${dx * 0.08}px, ${dy * 0.12}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; if (span) span.style.transform = ""; });
    });
  }

  const zakladki = $$(".zakladka");
  const znacznik = $(".znacznik");
  const ustawZnacznik = z => {
    znacznik.style.setProperty("--w", z.offsetWidth + "px");
    znacznik.style.setProperty("--x", z.offsetLeft + "px");
  };
  const wybierz = z => {
    zakladki.forEach(k => {
      const ak = k === z;
      k.classList.toggle("aktywna", ak);
      k.setAttribute("aria-selected", ak);
      k.tabIndex = ak ? 0 : -1;
      const p = document.getElementById(k.getAttribute("aria-controls"));
      p.hidden = !ak;
      p.classList.toggle("aktywny", ak);
    });
    ustawZnacznik(z);
    z.scrollIntoView({ block: "nearest", inline: "nearest", behavior: ruch ? "smooth" : "auto" });
  };
  zakladki.forEach((z, i) => {
    z.addEventListener("click", () => wybierz(z));
    z.addEventListener("keydown", e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!k) return;
      const n = zakladki[(i + k + zakladki.length) % zakladki.length];
      n.focus(); wybierz(n);
    });
  });
  if (zakladki[0]) {
    requestAnimationFrame(() => ustawZnacznik($(".zakladka.aktywna")));
    addEventListener("resize", () => ustawZnacznik($(".zakladka.aktywna")));
    document.fonts?.ready.then(() => ustawZnacznik($(".zakladka.aktywna")));
  }

  $$(".pyt").forEach(d => {
    const s = d.querySelector("summary"), odp = d.querySelector(".odp");
    s.addEventListener("click", e => {
      if (!ruch) return;
      e.preventDefault();
      if (d.open) {
        const a = odp.animate([{ height: odp.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 450, easing: "cubic-bezier(.16,1,.3,1)" });
        d.classList.add("zamyka");
        a.onfinish = () => { d.open = false; d.classList.remove("zamyka"); };
      } else {
        d.open = true;
        odp.animate([{ height: "0px", opacity: 0 }, { height: odp.offsetHeight + "px", opacity: 1 }], { duration: 600, easing: "cubic-bezier(.16,1,.3,1)" });
      }
    });
  });

  const form = $(".formularz");
  if (form) {
    const kom = form.querySelector(".komunikat");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      let ok = true;
      const imie = form.elements.imie, tel = form.elements.telefon, zgoda = form.elements.zgoda;
      const cyfry = tel.value.replace(/\D/g, "");
      [[imie, imie.value.trim().length > 1], [tel, cyfry.length >= 9 && cyfry.length <= 13]].forEach(([el, war]) => {
        el.closest(".pole").classList.toggle("blad", !war); if (!war) ok = false;
      });
      zgoda.closest(".zgoda").classList.toggle("blad", !zgoda.checked);
      if (!zgoda.checked) ok = false;
      if (!ok) {
        kom.textContent = "Uzupełnij imię, poprawny numer telefonu i zaznacz zgodę.";
        if (ruch) form.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 360 });
        return;
      }
      const cel = form.dataset.endpoint;
      if (!cel) {
        kom.textContent = "To wersja demonstracyjna — w gotowej stronie zgłoszenie trafi prosto do recepcji. Na razie zadzwoń: " + document.querySelector(".tel-duzy").textContent;
        return;
      }
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true; kom.textContent = "Wysyłanie…";
      try {
        const r = await fetch(cel, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
        if (!r.ok) throw new Error(r.status);
        form.reset();
        kom.textContent = "Dziękujemy! Oddzwonimy najszybciej, jak to możliwe.";
      } catch {
        kom.textContent = "Nie udało się wysłać. Zadzwoń do nas: " + document.querySelector(".tel-duzy").textContent;
      } finally { btn.disabled = false; }
    });
  }
})();
