# CLAUDE.md — SparkScale website

Kontekst projektu dla Claude Code. Strona firmowa SparkScale (`spark-scale.pl`) — jednostronicowa,
statyczna, już wdrożona na produkcję. Poniżej wszystko, co trzeba, żeby kontynuować pracę.

---

## 1. Czym jest SparkScale

Hybrydowe studio **„Product · Growth · AI"** — pomiędzy agencją brandingową, software house'em,
studiem AI/automatyzacji, product studio i growth partnerem. Nie sprzedaje pojedynczych usług,
tylko **„system wzrostu"** w 5 filarach: **Brand · Growth · Systems · AI · Scale**.
Hasło przewodnie: „Budujemy Twój brand/growth/system/scale — od pustej strony do płacących klientów".

**Model sprzedaży:** cold-calling. Strona = portfolio/wizytówka, na którą rep sprowadza prospekta.
Stąd: nacisk na dema realizacji i niskotarciowy kontakt (bez „audytów"; CTA = „Napisz do nas" / „Porozmawiajmy").

**Grupy docelowe:** e-commerce, startupy, firmy B2B, MŚP, sklepy internetowe, firmy usługowe,
lokalne biznesy. Cała Polska, zdalnie.

**Dane firmy (do stopki/polityki):** SPARK SCALE sp. z o.o., ul. Jeleniogórska 14/81, 60-179 Poznań,
KRS 0001163806, NIP 7792586001, REGON 541286233. Kontakt: sparkscale.agencja@gmail.com.

---

## 2. Stack i zasada edycji

- **Czysty statyczny HTML.** Brak frameworka, brak kroku budowania, brak node_modules.
- **`index.html` jest samowystarczalny** — cały CSS i JS są inline, logo i favicony osadzone jako
  base64 (data:URI), fonty z Google Fonts (CDN). **Edytuje się bezpośrednio `index.html`.**
  (W repo NIE ma osobnego pipeline'u/budowania — to był proces z poprzedniej sesji, tu już nie istnieje.)
- Vanilla JS (IntersectionObserver reveal, akordeon FAQ, rotujący nagłówek, modale filarów,
  skalowane iframe'y podglądów dem). Brak zależności zewnętrznych poza Google Fonts.

### Struktura plików (repo = katalog główny strony)
```
index.html                  # główna strona (self-contained)
polityka-prywatnosci.html   # polityka prywatności (dane firmy wpisane)
dziekujemy.html             # strona po wysłaniu formularza
og-image.png                # obrazek podglądu linku (1200x630)
demo/                       # dema realizacji (podpięte w sekcji "Realizacje")
  arvena/index.html         # Arvena — stomatologia (self-contained)
  pao-elite.html            # PAO Elite — elewacje i dachy (ładuje wideo z pexels)
  wreba/index.html + styles.css + kuchnia-pod-klucz.html   # Wręba — kuchnie na wymiar
  slemie/index.html + styles.css + wymiana-stolarki.html   # Ślemię — okna/drzwi/bramy
.gitignore
```

### Design system (trzymać spójność)
- Kolory: tło `#0A0A0B`, panel `#0F0F12`, akcent pomarańcz `#FF8900` (jasny wariant `#FFB259`),
  tekst `#F5F5F4`, muted `#8C8C88` / `#B8B8B4`, border `#1c1c20`.
- Typografia: **Space Grotesk** (nagłówki/UI) + **Inter** (body). Duża, pewna typografia.
- Motyw ciemny + jeden pomarańczowy akcent; animacje: scroll-reveal, marquee, hover, custom glow
  za kursorem w hero. Lekko, bez ciężkiego WebGL.
- Motyw marki: „iskra" (4-ramienna gwiazdka) z logo jako powtarzalny element.

### Sekcje strony (kotwice)
hero → manifest (#) → **#filary** (5 kafli z modalami) → **#proces** (4 kroki: Rozmowa → Strategia →
Wdrożenie → Skalowanie) → **#realizacje** (4 dema w ramkach „okna przeglądarki" z iframe) →
**#o-nas** → **#faq** (akordeon) → **#kontakt** (formularz) → stopka. Sticky mini-nav po przewinięciu.

---

## 3. Konfiguracja wpięta w kod

- **Domena:** `https://spark-scale.pl` wpisana na stałe (OG `og:url`, `og:image`, `canonical`,
  oraz `_next` w formularzu). Przy zmianie domeny — podmienić te miejsca.
- **Formularz kontaktowy:** FormSubmit (`action="https://formsubmit.co/sparkscale.agencja@gmail.com"`),
  pola: Imię i nazwisko, E-mail, Wiadomość, checkbox zgody RODO (wymagany), honeypot `_honey`,
  `_next` → `dziekujemy.html`. **Wymaga jednorazowej aktywacji** (pierwsze wysłanie → mail „Activate"
  na gmaila → klik w link).
- **Analityka:** zakomentowany slot w `<head>` na GoatCounter (cookieless, bez baneru zgody) —
  do aktywacji wpisać własny kod i odkomentować.

---

## 4. Deployment (produkcja)

- **Hosting:** VPS OVH Ubuntu, IP **164.132.243.94**, użytkownik **ubuntu** (SSH), wiele aplikacji.
- **Serwer WWW:** **Caddy** jako reverse proxy dla innych appek; dla tej strony serwuje pliki statyczne.
- **Katalog strony na serwerze:** `/var/www/spark-scale/`
- **Blok w `/etc/caddy/Caddyfile`:**
  ```
  spark-scale.pl, www.spark-scale.pl {
      root * /var/www/spark-scale
      file_server
      encode gzip
  }
  ```
  SSL (Let's Encrypt) Caddy ogarnia automatycznie.
- **DNS:** domena w LH.pl, „zaparkowana w LH.pl". Rekordy: `A @ → 164.132.243.94`,
  `CNAME www → spark-scale.pl`. Rekordy pocztowe (MX/TXT/SRV autoconfig) zostawione nietknięte.

### Jak zaktualizować stronę na produkcji
```
# z Maca, w folderze repo:
scp -r index.html polityka-prywatnosci.html dziekujemy.html og-image.png demo \
    ubuntu@164.132.243.94:/var/www/spark-scale/
# potem na serwerze (przez ssh) ustawić prawa odczytu dla Caddy:
ssh ubuntu@164.132.243.94 'chmod -R a+rX /var/www/spark-scale'
```
Caddy NIE wymaga restartu przy zmianie plików. (Uwaga: po `unzip`/kopiowaniu pliki potrafią mieć
prawa `600` — dlatego `chmod -R a+rX` jest konieczny, inaczej Caddy zwraca 404.)
Przy zmianie samego Caddyfile: `sudo caddy validate --config /etc/caddy/Caddyfile` → `sudo systemctl reload caddy`.

---

## 5. Repo GitHub

- `https://github.com/sparkscaleagencja-png/sparkscale-website`
- Stan (2026-10-08): branch `main` wypchnięty, zsynchronizowany z `origin/main`.
- `.gitignore`: `.DS_Store`, `sparkscale-site.zip`.

---

## 6. TODO / otwarte wątki

- [x] ~~Dokończyć `git push`~~ — zrobione.
- [ ] **Aktywować formularz** FormSubmit (pierwsze wysłanie + klik w mail aktywacyjny na gmailu).
- [ ] **Social proof** — dodać sekcję z opiniami/logo klientów, gdy będzie treść. Naturalne miejsce:
      między FAQ a kontaktem. (Świadomie odłożone.)
- [ ] **Realne realizacje** — podmienić opisowe dema na prawdziwe case studies z twardymi metrykami,
      gdy będą dane.
- [ ] Rozważyć hosting dem pod ich własnymi domenami (firma ma w LH.pl m.in. `pao-elite.pl`,
      `revowykony.pl`) i podmianę linków w kartach realizacji.
- [ ] Odświeżyć podgląd linku (OG) w cache FB/LinkedIn po publikacji (Post Inspector).
- [ ] Opcjonalnie: favicon z pomarańczowymi trójkątami (dostarczony sygnet jest monochromatyczny).

---

## 7. Zasady treści / tonu

- Copy po polsku, konkretnie, „challenger", bez korpo-ściemy. Pozycjonowanie: „nie kolejna agencja —
  system wzrostu".
- CTA kontaktowe, nie „audytowe" („Napisz do nas", „Porozmawiajmy").
- Inspiracje (gust właściciela, trzymać estetykę product/growth studio): Market Studio, Widelab,
  SwitchCase, Apptension, Ragged Edge, Gallop Studio, Brand Strategy. Dark + pomarańcz, duża typografia,
  marquee/reveal — bez przeładowania efektami.
