"""Wstawia sekcje "Jak przyciagamy uwage" (uwaga.css / uwaga.js) do index.html, przed #realizacje. Jednorazowo."""
import os, sys
D = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(D, '..', 'index.html')
s = open(p, encoding='utf8').read()
if 'id="uwaga"' in s:
    sys.exit('juz wstawione')
HTML = '''  <!-- JAK PRZYCIAGAMY UWAGE -->
  <section class="ss-sec ss-uwaga" id="uwaga">
    <div class="u-grid">
      <div class="u-copy">
        <div class="ss-kicker reveal">(jak przyciągamy uwagę)</div>
        <h2 class="ss-h2 reveal">Uwaga to waluta.<br><span class="o">Zatrzymujemy kciuk.</span></h2>
        <p class="ss-lead reveal">Obejrzyj 20 sekund obok. To nie przypadek - każdy element ma jedno zadanie: nie pozwolić odpuścić. Tak samo projektujemy filmy, strony i kampanie naszych klientów.</p>
        <ul class="u-list reveal">
          <li><b>Kolizja zamiast wejścia.</b> Jedno spada z góry, drugie wjeżdża z dołu - oko nie ma jak zignorować ruchu.</li>
          <li><b>Licznik sekund.</b> Widzisz, ile już patrzysz. To przypomina, że warto zostać do końca.</li>
          <li><b>Cięcia co kilka sekund.</b> Nowy rytm, kolor i kształt, zanim kciuk pójdzie dalej.</li>
          <li><b>Jedno działanie na końcu.</b> Zero chaosu - po finale wiesz dokładnie, co zrobić.</li>
        </ul>
        <a class="ss-cta reveal" href="#kontakt">Zróbmy to dla Twojej marki</a>
      </div>
      <div class="u-phone" id="uPhone" aria-label="Animacja: 20 sekund, które zatrzymują uwagę">
        <svg id="uSvg" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg>
        <div class="u-pill"><i></i>oglądasz <b id="uTime">00.0s</b></div>
        <a class="u-cta" id="uCta" href="#kontakt">Napisz do nas →</a>
      </div>
    </div>
  </section>

'''
css = open(os.path.join(D, 'uwaga.css'), encoding='utf8').read()
js = open(os.path.join(D, 'uwaga.js'), encoding='utf8').read()
m = '  <!-- REALIZACJE -->'
k = '</style>\n<script>\n(function(){\n  var hero=document.getElementById'
assert s.count(m) == 1 and s.count(k) == 1
s = s.replace(m, HTML + m, 1)
s = s.replace(k, css + k, 1)
end = '</body></html>'
s = s.rstrip()
assert s.endswith(end)
s = s[:-len(end)] + '<script>\n' + js + '</script>\n' + end + '\n'
open(p, 'w', encoding='utf8').write(s)
print('ok')
