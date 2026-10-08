/* Kliniec - Zaklad Kamieniarski (DEMO) - app.js. Wspolny dla index.html i nagrobek-granitowy.html */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };

  /* ---------- tryb jasny / ciemny (3 stany: system, jasny, ciemny) ---------- */
  try { var saved = localStorage.getItem("kliniec-theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
  var themeBtn = $("#theme");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var cur = root.getAttribute("data-theme");
    var sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = cur ? cur === "dark" : sysDark;
    var next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("kliniec-theme", next); } catch (e) {}
  });

  /* ---------- menu mobilne ---------- */
  var burger = $("#burger"), mobile = $("#mobile");
  if (burger && mobile) {
    burger.addEventListener("click", function () {
      var open = mobile.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", mobile).forEach(function (a) { a.addEventListener("click", function () { mobile.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* ---------- animacje wejscia + liczniki ---------- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10), suf = el.getAttribute("data-suffix") || "";
    if (reduce || !target) return;
    var t0 = null, dur = 1200;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var sib = el.parentElement ? $$(".rv", el.parentElement).indexOf(el) : 0;
        el.style.transitionDelay = (Math.min(Math.max(sib, 0), 3) * 0.08) + "s";
        el.classList.add("in");
        $$("[data-count]", el).forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else {
    root.classList.add("no-io");
  }

  /* ---------- otwarte teraz ---------- */
  var openDot = $("#openDot"), openTxt = $("#openTxt");
  if (openDot && openTxt) {
    var d = new Date(), day = d.getDay(), h = d.getHours() + d.getMinutes() / 60, m = d.getMonth(), dd = d.getDate();
    var season = (m === 8 && dd >= 15) || m === 9; // 15.09 - 31.10: dluzej
    var close = day >= 1 && day <= 5 ? (season ? 19 : 17) : (day === 6 ? 14 : 0);
    var openH = day >= 1 && day <= 5 ? 8 : 9;
    if (close && h >= openH && h < close) {
      openDot.classList.add("on");
      openTxt.textContent = "Wystawa otwarta teraz \u00b7 do " + close + ":00";
    } else {
      openTxt.textContent = "Teraz zamkni\u0119te \u00b7 pn\u2013pt 8\u201317, sob 9\u201314";
    }
  }

  /* ---------- filtry realizacji ---------- */
  var chips = $$(".chip[data-filter]");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-filter");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      $$("#catalog .card").forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-cat") === f;
        card.classList.toggle("hide", !show);
        if (show) card.classList.add("in");
      });
    });
  });

  /* ---------- "Zapytaj o podobny" -> wypelnia formularz ---------- */
  $$("[data-ask]").forEach(function (a) {
    a.addEventListener("click", function () {
      var msg = $("#q-msg"), what = $("#q-what");
      if (msg) msg.value = "Interesuje mnie: " + a.getAttribute("data-ask") + ". ";
      if (what) {
        var t = a.getAttribute("data-ask").toLowerCase();
        what.value = /blat|schod|parapet/.test(t) ? "Blat / schody / parapety" : (/renowac/.test(t) ? "Renowacja / czyszczenie" : "Nowy nagrobek");
      }
    });
  });

  /* ---------- kalkulator + podglad ---------- */
  var cfg = $("#cfgForm");
  var STONES = {
    strzegom: { c: "#A4A39D", m: 1.0, n: "Strzegom szary", light: true },
    kashmir: { c: "#D8D1C4", m: 1.08, n: "Kashmir White", light: true },
    impala: { c: "#474B50", m: 1.12, n: "Impala", light: false },
    multicolor: { c: "#7D4B3E", m: 1.18, n: "Multicolor Red", light: false },
    absolute: { c: "#1E1F22", m: 1.3, n: "Absolute Black", light: false },
    konglomerat: { c: "#ECEAE4", m: 1.05, n: "Konglomerat", light: true }
  };
  var TYPES = {
    urn: { base: 3900, n: "Gr\u00f3b urnowy", lid: 0, kostka: 500, demontaz: 400 },
    single: { base: 6400, n: "Nagrobek pojedynczy", lid: 900, kostka: 900, demontaz: 600 },
    double: { base: 10900, n: "Nagrobek podw\u00f3jny", lid: 1500, kostka: 1300, demontaz: 900 },
    family: { base: 16900, n: "Gr\u00f3b rodzinny", lid: 2200, kostka: 1800, demontaz: 1300 }
  };
  var EXTRA = { lampion: [450, "Lampion granitowy"], wazon: [350, "Wazon"], krzyz: [600, "Krzy\u017c w steli"], foto: [250, "Zdj\u0119cie na porcelanie"], lawka: [1400, "\u0141awka granitowa"] };
  var LETTERS = { sand: [0, "Napis piaskowany"], gold: [350, "Napis z\u0142ocony"], bronze: [900, "Litery z br\u0105zu"] };

  function val(name) { var el = cfg && cfg.querySelector("input[name=" + name + "]:checked"); return el ? el.value : null; }
  function calc() {
    if (!cfg) return;
    var type = val("type"), stone = val("stone"), lid = val("lid"), letters = val("letters");
    var T = TYPES[type], S = STONES[stone];
    var baseP = Math.round(T.base * S.m / 10) * 10;
    var rows = [], total = baseP;
    rows.push([T.n + " \u00b7 " + S.n, baseP]);
    var lidRow = $("#fLid");
    if (type === "urn") { lid = "full"; if (lidRow) lidRow.style.display = "none"; } else if (lidRow) lidRow.style.display = "";
    if (lid === "full" && T.lid) { total += T.lid; rows.push(["Pe\u0142na p\u0142yta", T.lid]); }
    var L = LETTERS[letters]; if (L[0]) { total += L[0]; rows.push([L[1], L[0]]); }
    var on = {};
    $$("#extras input").forEach(function (cb) {
      on[cb.value] = cb.checked;
      if (!cb.checked) return;
      var price, name;
      if (cb.value === "kostka") { price = T.kostka; name = "Kostka wok\u00f3\u0142 grobu"; }
      else if (cb.value === "demontaz") { price = T.demontaz; name = "Demonta\u017c starego nagrobka"; }
      else { price = EXTRA[cb.value][0]; name = EXTRA[cb.value][1]; }
      total += price; rows.push([name, price]);
    });
    var k = $("[data-kostka]"), dm = $("[data-demontaz]");
    if (k) k.textContent = "+" + fmt(T.kostka) + " z\u0142";
    if (dm) dm.textContent = "+" + fmt(T.demontaz) + " z\u0142";
    var dist = parseInt($("#dist").value, 10) || 0;
    if (dist) { total += dist; rows.push(["Dojazd", dist]); }
    var lo = Math.round(total * 0.92 / 100) * 100, hi = Math.round(total * 1.12 / 100) * 100;
    $("#range").textContent = fmt(lo) + " \u2013 " + fmt(hi) + " z\u0142";
    $("#rata").textContent = "lub ok. " + fmt(Math.round((lo + hi) / 2 / 24 / 10) * 10) + " z\u0142 miesi\u0119cznie przy 24 ratach";
    $("#breakdown").innerHTML = rows.map(function (r) { return "<li><span>" + r[0] + "</span><span>" + fmt(r[1]) + " z\u0142</span></li>"; }).join("");
    var cta = $("#cfgCta");
    if (cta) cta.setAttribute("data-ask", T.n + ", " + S.n + (type !== "urn" ? (lid === "full" ? ", pe\u0142na p\u0142yta" : ", p\u0142yta cz\u0119\u015bciowa") : "") + " (kalkulator: " + fmt(lo) + "\u2013" + fmt(hi) + " z\u0142)");
    /* podglad SVG */
    var pv = $("#pv");
    if (pv) {
      pv.setAttribute("data-t", type);
      pv.classList.toggle("half", lid === "half");
      pv.style.setProperty("--stone", S.c);
      var letterColor = letters === "sand" ? (S.light ? "#2F3135" : "#E9E4DA") : (letters === "gold" ? (S.light ? "#B8933E" : "#D9BE78") : "#9C6B3C");
      pv.style.setProperty("--letter", letterColor);
      ["lampion", "wazon", "krzyz", "foto", "lawka", "kostka"].forEach(function (x) { pv.classList.toggle("show-" + x, !!on[x]); });
    }
  }
  if (cfg) {
    cfg.addEventListener("change", calc);
    calc();
    var cta = $("#cfgCta");
    if (cta) cta.addEventListener("click", function () {
      var msg = $("#q-msg"), what = $("#q-what");
      if (msg) msg.value = "Wycena z kalkulatora: " + cta.getAttribute("data-ask") + ". ";
      if (what) what.value = "Nowy nagrobek";
    });
  }

  /* ---------- pomocnik wyboru (quiz) ---------- */
  var quiz = $("#pomocnik");
  if (quiz) {
    var answers = {}, stepN = 1;
    var show = function (n) {
      stepN = n;
      $$(".qstep", quiz).forEach(function (s) { s.classList.toggle("on", s.getAttribute("data-q") === String(n)); });
      $("#qbar").style.width = ((n - 1) / 3 * 100) + "%";
    };
    $$(".qopt", quiz).forEach(function (b) {
      b.addEventListener("click", function () {
        answers[b.getAttribute("data-k")] = b.getAttribute("data-v");
        if (stepN < 3) { show(stepN + 1); return; }
        var T = TYPES[answers.type], S = STONES[answers.stone];
        var lid = answers.type === "urn" ? "full" : answers.lid;
        var est = T.base * S.m + (lid === "full" ? T.lid : 0);
        $("#qTitle").textContent = T.n + " \u00b7 " + S.n + (answers.type === "urn" ? "" : (lid === "full" ? " \u00b7 pe\u0142na p\u0142yta" : " \u00b7 p\u0142yta cz\u0119\u015bciowa"));
        $("#qDesc").textContent = "Orientacyjnie " + fmt(Math.round(est * 0.92 / 100) * 100) + " \u2013 " + fmt(Math.round(est * 1.12 / 100) * 100) + " z\u0142 z monta\u017cem i napisem. " +
          (lid === "full" ? "Pe\u0142na p\u0142yta oznacza minimum piel\u0119gnacji \u2014 wystarczy przetrze\u0107 raz na jaki\u015b czas. " : "Cz\u0119\u015b\u0107 ziemi zostaje na kwiaty i znicze. ") +
          "Na wizualizacji poka\u017cemy te\u017c jeden wariant alternatywny.";
        answers.lidFinal = lid;
        show(4);
      });
    });
    $("#qReset").addEventListener("click", function () { answers = {}; show(1); });
    $("#qApply").addEventListener("click", function () {
      var set = function (name, v) { var el = cfg && cfg.querySelector("input[name=" + name + "][value=" + v + "]"); if (el) el.checked = true; };
      set("type", answers.type); set("stone", answers.stone); set("lid", answers.lidFinal || "half");
      calc();
    });
  }

  /* ---------- przed / po ---------- */
  var baR = $("#baRange");
  if (baR) {
    var upd = function () {
      var v = baR.value;
      $("#baAfter").style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
      $("#baLine").style.left = v + "%";
      $("#baKnob").style.left = v + "%";
    };
    baR.addEventListener("input", upd); upd();
  }

  /* ---------- przypomnienie przed 1.11 (pokaz automatyzacji) ---------- */
  var rf = $("#remindForm");
  if (rf) rf.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = $("#remindOk"), phone = rf.phone.value.replace(/\D/g, "");
    ok.classList.add("show");
    if (phone.length < 9 || !rf.ok.checked) {
      ok.textContent = "Prosimy poda\u0107 numer telefonu (9 cyfr) i zaznaczy\u0107 zgod\u0119.";
      return;
    }
    ok.textContent = "Gotowe \u2014 przypomnienie zapisane. To wersja demonstracyjna, wi\u0119c nic nie zosta\u0142o wys\u0142ane. Na wdro\u017ceniu SMS wyjdzie automatycznie w drugim tygodniu pa\u017adziernika, a zg\u0142oszenie trafi do listy zak\u0142adu.";
    rf.reset();
  });

  /* ---------- formularz wyceny ---------- */
  var drop = $("#drop"), file = $("#file");
  if (drop && file) {
    var label = function (files) {
      if (!files || !files.length) return;
      var names = Array.prototype.map.call(files, function (f) { return f.name; }).join(", ");
      drop.innerHTML = "Dodano: <b>" + names.replace(/</g, "&lt;") + "</b>";
      drop.appendChild(file);
    };
    drop.addEventListener("click", function () { file.click(); });
    drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); file.click(); } });
    file.addEventListener("change", function () { label(file.files); });
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
    drop.addEventListener("drop", function (e) { label(e.dataTransfer && e.dataTransfer.files); });
  }
  $$("form[data-quote], #quoteForm").forEach(function (qf) {
    qf.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $(".err", qf), sent = $(".sent", qf), missing = [];
      $$("[data-req]", qf).forEach(function (el) { if (!el.value.trim()) missing.push(el.getAttribute("data-req")); });
      if (qf.id === "quoteForm") {
        if (!$("#q-name").value.trim()) missing.push("imi\u0119");
        if ($("#q-phone").value.replace(/\D/g, "").length < 9) missing.push("telefon");
        if (!$("#q-what").value) missing.push("czego dotyczy zapytanie");
      }
      var consent = $("input[type=checkbox]", qf);
      if (consent && !consent.checked) missing.push("zgoda na kontakt");
      if (missing.length) { err.textContent = "Uzupe\u0142nij: " + missing.join(", ") + "."; return; }
      err.textContent = "";
      sent.classList.add("show");
      sent.innerHTML = "<b>Dzi\u0119kujemy.</b> To strona demonstracyjna, wi\u0119c wiadomo\u015b\u0107 nie zosta\u0142a wys\u0142ana. Na wdro\u017ceniu trafi od razu na telefon zak\u0142adu (SMS + e-mail), a Pa\u0144stwo dostan\u0105 automatyczne potwierdzenie z informacj\u0105, kiedy oddzwonimy.";
    });
  });

  /* ---------- powrot na gore ---------- */
  var top = $("#totop");
  if (top) {
    window.addEventListener("scroll", function () { top.classList.toggle("show", window.scrollY > 620); }, { passive: true });
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
  }
})();
