"""Wstawia do index.html animowane logo w hero, animowane kontury logo w tle i gwiazdki.
Uruchomienie (jednorazowo, na czystym index.html): python grafiki/hero_fx.py
"""
import random, sys, os

random.seed(11)
W, D, T = 55, 31, 34


def P(t):
    return ' '.join(f'{x},{y}' for x, y in t)


def bars():
    out = []
    for x in (46, 101):
        out += [[(x, 66), (x + W, 66 - D), (x + W, 66 - D + T), (x, 66 + T)],
                [(x, 188), (x + W, 188 - D), (x + W, 188 - D + T), (x, 188 + T)]]
    out += [[(101, 90), (68, 110), (101, 130)], [(101, 126), (134, 146), (101, 166)]]
    return out


TRIS = [[(46, 125), (46, 161), (77, 143)], [(156, 131), (156, 95), (125, 113)]]


def cy(t):
    return sum(y for _, y in t) / len(t)


# --- animowane logo ---
lg = ''.join(f'<polygon class="hb" data-cy="{cy(t):.1f}" points="{P(t)}"/>' for t in bars())
lg += f'<polygon class="ht" id="ssHtL" points="{P(TRIS[0])}"/><polygon class="ht" id="ssHtR" points="{P(TRIS[1])}"/>'
LOGO = (f'    <div class="ss-hlogo" id="ssHlogo" aria-hidden="true"><div class="ss-hlogo-glow"></div>'
        f'<svg viewBox="38 26 126 204">{lg}</svg></div>\n')


# --- kontury logo w tle ---
def outline(x, y, s):
    polys = bars() + TRIS
    ln = ''.join(f'<polygon class="ln" pathLength="1" style="--d:{random.uniform(0, 1.6):.2f}s" points="{P(t)}"/>'
                 for t in polys)
    pl = ''.join(f'<polygon class="pl" pathLength="1" style="--p:{random.uniform(0, 9):.2f}s;'
                 f'--pd:{random.uniform(5, 9):.1f}s" points="{P(t)}"/>' for t in polys)
    return (f'<g transform="translate({x} {y}) scale({s}) translate(-101 -128)">'
            f'<g class="fl" style="--f:{random.uniform(11, 18):.1f}s;--fd:-{random.uniform(0, 10):.1f}s">{ln}{pl}</g></g>')


FAR = [(170, 300, 3.1), (330, 640, 2.3), (760, 210, 2.1), (1150, 280, 1.5), (1790, 640, 1.7), (1500, 930, 1.3), (560, 960, 1.4)]
NEAR = [(70, 140, 1.6), (960, 560, 3.0)]


def layer(arr, cls):
    return (f'<svg class="ss-lines {cls}" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">'
            + ''.join(outline(*a) for a in arr) + '</svg>')


BG = (f'    <div class="ss-fx" id="ssFx" aria-hidden="true">{layer(FAR, "ss-far")}{layer(NEAR, "ss-near")}'
      f'<div class="ss-stars" id="ssStars"></div></div>\n')

CSS = open(os.path.join(os.path.dirname(__file__), 'hero_fx.css'), encoding='utf8').read()
JS = open(os.path.join(os.path.dirname(__file__), 'hero_fx.js'), encoding='utf8').read()

p = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
s = open(p, encoding='utf8').read()
if 'id="ssHlogo"' in s:
    sys.exit('index.html ma juz hero_fx - przywroc czysta wersje przed ponownym uruchomieniem')
anchor = '<div class="ss-orb ss-orb1"></div><div class="ss-orb ss-orb2"></div>\n'
nav_end = '      <a class="ss-cta ss-cta-sm" href="#kontakt">Porozmawiajmy</a>\n    </nav>\n'
assert s.count(anchor) == 1 and s.count(nav_end) == 1
s = s.replace(anchor, anchor + BG).replace(nav_end, nav_end + LOGO)
end = '</body></html>'
s = s.rstrip()
assert s.endswith(end)
s = s[:-len(end)] + '<style id="ss-hero-fx">\n' + CSS + '</style>\n<script>\n' + JS + '</script>\n' + end + '\n'
open(p, 'w', encoding='utf8').write(s)
print('ok')
