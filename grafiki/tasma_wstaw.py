"""Wstawia sekcje tasmociagu (tasma.css / tasma.js) do dla-influencera.html. Jednorazowo."""
import os, sys
D = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(D, '..', 'dla-influencera.html')
s = open(p, encoding='utf8').read()
if 'id="scene"' in s:
    sys.exit('juz wstawione')
LOGO = ('<svg class="m-logo" viewBox="38 26 126 204" aria-hidden="true"><g fill="#F4F4F2">'
        '<polygon points="46,66 101,35 101,69 46,100"/><polygon points="101,66 156,35 156,69 101,100"/>'
        '<polygon points="101,90 68,110 101,130"/><polygon points="101,126 134,146 101,166"/>'
        '<polygon points="46,188 101,157 101,191 46,222"/><polygon points="101,188 156,157 156,191 101,222"/></g>'
        '<g fill="#FF8900"><polygon points="46,125 46,161 77,143"/><polygon points="156,131 156,95 125,113"/></g></svg>')
HTML = '''
<section class="belt-sec" aria-label="Maszyna SparkScale">
  <div class="belt-head">
    <div class="kick">(maszyna sparkscale)</div>
    <h2>Wjeżdżasz jako małpka.<br><em>Wyjeżdżasz jako goryl biznesu.</em></h2>
  </div>
  <div class="scene" id="scene" aria-hidden="true">
    <div class="chars" id="chars"></div>
    <div class="machine" id="machine"><div class="m-glow"></div><div class="m-body"><div class="m-lights"><i></i><i></i><i></i></div>LOGO<div class="m-label">SCALE</div></div><div class="m-door in" id="dIn"></div><div class="m-door out" id="dOut"></div></div>
    <div class="belt"><div class="belt-surface" id="beltSurf"></div><div class="rollers" id="rollers"></div></div>
  </div>
</section>
'''.replace('LOGO', LOGO)
css = open(os.path.join(D, 'tasma.css'), encoding='utf8').read()
js = open(os.path.join(D, 'tasma.js'), encoding='utf8').read()
assert s.count('</style></head>') == 1 and s.count('</main>\n') == 1
s = s.replace('</style></head>', css + '</style></head>', 1)
s = s.replace('</main>\n', '</main>\n' + HTML, 1)
s = s.replace('</body></html>', '<script>\n' + js + '</script>\n</body></html>')
open(p, 'w', encoding='utf8').write(s)
print('ok')
