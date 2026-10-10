import math,random,subprocess,os
OR='#ff8c00';BK='#0a0a0a';WH='#ffffff'
W,D,T=55,31,34
def P(t):return ' '.join(f'{x},{y}' for x,y in t)
def bars():
    out=[]
    for x in(46,101):
        out+= [[(x,66),(x+W,66-D),(x+W,66-D+T),(x,66+T)],[(x,188),(x+W,188-D),(x+W,188-D+T),(x,188+T)]]
    out+=[[(101,90),(68,110),(101,130)],[(101,126),(134,146),(101,166)]]
    return out
TRIS=[[(46,125),(46,161),(77,143)],[(156,131),(156,95),(125,113)]]
def logo(cx,cy,s,bar=BK,tri=OR,rot=0,op=1,outline=None,halo=None):
    g=f'<g transform="translate({cx} {cy}) rotate({rot}) scale({s}) translate(-101 -128)" opacity="{op}">'
    for b in bars():
        a=f'fill="none" stroke="{outline}" stroke-width="1.2"' if outline else f'fill="{bar}" stroke="{bar}" stroke-width=".35"'
        g+=f'<polygon points="{P(b)}" {a} stroke-linejoin="miter"/>'
    for t in TRIS:
        if outline:a=f'fill="none" stroke="{outline}" stroke-width="1.2"'
        elif halo:a=f'fill="{tri}" stroke="{halo}" stroke-width="3" paint-order="stroke"'
        else:a=f'fill="{tri}"'
        g+=f'<polygon points="{P(t)}" {a} stroke-linejoin="miter"/>'
    return g+'</g>'
def star(cx,cy,r,fill=OR,stroke=None,sw=2,op=1):
    k=.14*r
    d=f'M{cx},{cy-r} Q{cx+k},{cy-k} {cx+r},{cy} Q{cx+k},{cy+k} {cx},{cy+r} Q{cx-k},{cy+k} {cx-r},{cy} Q{cx-k},{cy-k} {cx},{cy-r}Z'
    a=f'fill="{fill}"' if fill else 'fill="none"'
    if stroke:a+=f' stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"'
    return f'<path d="{d}" {a} opacity="{op}"/>'
def svg(w,h,body,bg=WH,name='x'):
    s=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect width="{w}" height="{h}" fill="{bg}"/>{body}</svg>'
    open(name+'.svg','w',encoding='utf8').write(s)
# --- 0. lewy panel banera (283x389), cala reszta banera zostaje oryginalna
svg(283,389,f'<clipPath id="c"><rect width="283" height="389"/></clipPath><g clip-path="url(#c)">{logo(141.5,195,2.58,OR,OR)}{logo(141.5,195,1.18,BK,OR,halo=WH)}</g>',WH,'banner-lewy-panel')
# --- 1. wzor: powtarzajace sie logo (ukosna kratka)
b=''
for r in range(-1,8):
    for c in range(-1,12):
        x=c*190+(95 if r%2 else 0);y=r*150
        col=[(BK,OR),(OR,OR),(WH,OR)][(r+c)%3] if False else (OR,BK) if (r+c)%2 else (BK,OR)
        b+=logo(x,y,.62,col[0],col[1])
svg(1920,1080,b,WH,'grafika-1-wzor-logo')
# --- 2. hero: wielkie pomaranczowe logo ucięte + czarne male + gwiazdki
b=logo(1380,540,4.6,OR,OR)+logo(1380,540,2.1,BK,OR)
for x,y,r,f in[(260,200,70,BK),(420,820,38,OR),(140,640,22,BK),(980,120,30,OR)]:b+=star(x,y,r,f)
b+=star(560,420,95,None,OR,4)
svg(1920,1080,b,WH,'grafika-2-hero-logo')
# --- 3. ciemne tlo: kontury logo + iskry
random.seed(7)
b=''
for i in range(7):
    b+=logo(random.randint(100,1800),random.randint(60,1020),random.uniform(1.4,3.4),outline=OR,rot=0,op=.55)
b+=logo(960,540,2.6,WH,OR)
for i in range(16):
    b+=star(random.randint(40,1880),random.randint(30,1050),random.randint(10,46),OR if i%3 else WH,op=random.choice([1,.8,.6]))
svg(1920,1080,b,'#111111','grafika-3-ciemne-iskry')
# --- 4. pomaranczowe tlo: czarne i biale ksztalty
b=logo(300,300,5,BK,WH)+logo(1700,800,5.4,WH,BK)+logo(980,540,2.2,BK,WH)
for x,y,r,f in[(1500,210,80,BK),(520,880,60,WH),(1180,880,26,BK),(120,860,30,BK),(1850,420,34,WH)]:b+=star(x,y,r,f)
svg(1920,1080,b,OR,'grafika-4-pomaranczowe')
# --- 5. pas-separator: zygzak S (2400x420)
b=''
for i in range(-1,14):
    x=i*190
    b+=logo(x+95,210,1.55,BK if i%2==0 else OR,OR)
b+=''.join(star(random.randint(0,2400),random.randint(20,400),random.randint(8,20),OR) for _ in range(0))
svg(2400,420,b,WH,'grafika-5-pas')
