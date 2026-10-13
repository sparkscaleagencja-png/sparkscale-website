"""Wstawia sekcje "Rolka" (rolka.css / rolka.js, film video/rolka-spark-scale.mp4) do index.html, przed #kontakt. Jednorazowo."""
import os, sys
D = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(D, '..', 'index.html')
s = open(p, encoding='utf8').read()
if 'id="rolka"' in s:
    sys.exit('juz wstawione')
GLOS = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
        'stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/>'
        '<path class="fala" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'
        '<path class="krzyz" d="m16 9 6 6m0-6-6 6"/></svg>')
HTML = '''  <!-- ROLKA -->
  <section class="ss-sec ss-rolka" id="rolka">
    <div class="r-grid">
      <div class="r-phone reveal" id="rPhone">
        <video id="rVid" muted loop playsinline preload="none" poster="video/rolka-spark-scale.jpg" data-src="video/rolka-spark-scale.mp4" aria-label="Rolka Spark Scale: dział marnowania zasobów zastąpiony agentami AI"></video>
        <button class="r-dzwiek" id="rDzwiek" type="button" aria-pressed="false">%s<span>Włącz dźwięk</span></button>
      </div>
      <div class="r-copy">
        <div class="ss-kicker reveal">(nasza rolka)</div>
        <h2 class="ss-h2 reveal">Dział marnowania zasobów.<br><span class="o">Zastąp go agentem AI.</span></h2>
        <p class="ss-lead reveal">24 sekundy o tym, za co naprawdę płacisz. Kadry, ruch i dźwięk zrobiliśmy w naszym pipeline AI - tak samo powstają treści dla naszych klientów.</p>
        <a class="ss-cta reveal" href="#kontakt">Chcę agenta AI w firmie</a>
      </div>
    </div>
  </section>

''' % GLOS
css = open(os.path.join(D, 'rolka.css'), encoding='utf8').read()
js = open(os.path.join(D, 'rolka.js'), encoding='utf8').read()
m = '  <!-- KONTAKT -->'
assert s.count(m) == 1
s = s.replace(m, HTML + m, 1)
i = s.index('</style>')            # pierwszy (glowny) arkusz strony
s = s[:i] + css + s[i:]
end = '</body></html>'
s = s.rstrip()
assert s.endswith(end)
s = s[:-len(end)] + '<script>\n' + js + '</script>\n' + end + '\n'
open(p, 'w', encoding='utf8').write(s)
print('ok')
