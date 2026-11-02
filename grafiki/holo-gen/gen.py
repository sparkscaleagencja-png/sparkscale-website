# gen.py — tekstury domku 3D PAO Elite silnikiem Pracowni (Vertex gemini-3-pro-image).
# Użycie: python gen.py <nazwa> [--ref plik ...] [--ar 16:9] [--size 2K] [--model ...]
# Prompt z prompty/<nazwa>.txt, wynik wyjscie/<nazwa>.png (+_vN). Koszt dopisywany do koszty.txt.
import argparse, base64, io, os, sys, time
TU = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(TU, "..", "..", "..", "pracownia"))
import app as pracownia  # call_model / _extract_image / SA Vertex z pracownia/data
CENA = {"gemini-3-pro-image": 0.134, "gemini-3.1-flash-image": 0.05, "gemini-2.5-flash-image": 0.039}
def mime(p): return "image/jpeg" if p.lower().endswith((".jpg", ".jpeg")) else "image/webp" if p.lower().endswith(".webp") else "image/png"
a = argparse.ArgumentParser(); a.add_argument("nazwa"); a.add_argument("--ref", nargs="*", default=[])
a.add_argument("--ar", default="16:9"); a.add_argument("--size", default="2K"); a.add_argument("--model", default="gemini-3-pro-image")
o = a.parse_args()
prompt = io.open(os.path.join(TU, "prompty", o.nazwa + ".txt"), encoding="utf-8").read().strip()
parts = [{"text": prompt}]
for r in o.ref:
    with open(os.path.join(TU, r), "rb") as f:
        parts.append({"inlineData": {"mimeType": mime(r), "data": base64.b64encode(f.read()).decode()}})
cfg = {"responseModalities": ["TEXT", "IMAGE"], "imageConfig": {"aspectRatio": o.ar, "imageSize": o.size}}
t = time.time()
for proba in range(6):
    try:
        payload = pracownia.call_model(o.model, parts, cfg, timeout=300); break
    except RuntimeError as e:
        if "429" not in str(e) or proba == 5: raise
        time.sleep(25 * (proba + 1))
raw = pracownia._extract_image(payload)
if not raw:
    print("BRAK OBRAZU:", pracownia._extract_text(payload)[:600], str([(c.get("finishReason"), c.get("finishMessage")) for c in payload.get("candidates", [])])[:400], str(payload.get("promptFeedback"))[:300]); sys.exit(1)
os.makedirs(os.path.join(TU, "wyjscie"), exist_ok=True)
wyj = os.path.join(TU, "wyjscie", o.nazwa + ".png"); n = 2
while True:
    try:
        with open(wyj, "xb") as f: f.write(raw)
        break
    except FileExistsError:
        wyj = os.path.join(TU, "wyjscie", "%s_v%d.png" % (o.nazwa, n)); n += 1
with io.open(os.path.join(TU, "koszty.txt"), "a", encoding="utf-8") as f:
    f.write("%s\t%s\t%s\t$%.3f\trefs=%s\t%.0fs\n" % (time.strftime("%Y-%m-%d %H:%M"), os.path.relpath(wyj, TU), o.model, CENA.get(o.model, 0.134), ",".join(o.ref), time.time() - t))
print("OK", os.path.relpath(wyj, TU), "$%.3f" % CENA.get(o.model, 0.134), "%.0fs" % (time.time() - t))
