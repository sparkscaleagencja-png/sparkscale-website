import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

const RUCH = !matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - t, 3);
const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const SRUBA_DL = 2.3;
const promienRdzenia = y => {
  const k = clamp(-y / SRUBA_DL);
  const r = 0.4 - 0.1 * k;
  return k > 0.86 ? r * Math.sqrt(1 - Math.pow((k - 0.86) / 0.14, 2) * 0.6) : r;
};

function geometriaSruby() {
  const profil = [new THREE.Vector2(0, -SRUBA_DL - 0.02)];
  for (let i = 0; i <= 40; i++) {
    const y = -SRUBA_DL + (SRUBA_DL * i) / 40;
    profil.push(new THREE.Vector2(promienRdzenia(y), y));
  }
  profil.push(new THREE.Vector2(0.45, 0.0), new THREE.Vector2(0.45, 0.14), new THREE.Vector2(0.2, 0.15), new THREE.Vector2(0.2, 0.05), new THREE.Vector2(0, 0.05));
  const rdzen = new THREE.LatheGeometry(profil, 72);

  class Spirala extends THREE.Curve {
    getPoint(t, cel = new THREE.Vector3()) {
      const y = -0.18 - t * (SRUBA_DL - 0.36);
      const kat = t * 9.5 * Math.PI * 2;
      const r = promienRdzenia(y) + 0.035;
      return cel.set(Math.cos(kat) * r, y, Math.sin(kat) * r);
    }
  }
  const ksztalt = new THREE.Shape();
  ksztalt.moveTo(-0.075, 0);
  ksztalt.lineTo(0, 0.1);
  ksztalt.lineTo(0.075, 0);
  ksztalt.lineTo(-0.075, 0);
  const gwint = new THREE.ExtrudeGeometry(ksztalt, { steps: 900, bevelEnabled: false, extrudePath: new Spirala() });
  return [rdzen, gwint];
}

function geometriaLacznika() {
  const pkt = [[0, 0], [0.38, 0], [0.41, 0.08], [0.31, 0.22], [0.3, 0.32], [0.26, 0.86], [0.19, 0.94], [0, 0.95]].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pkt, 64);
}

function geometriaKorony() {
  const krzywa = new THREE.SplineCurve([
    [0.001, 0], [0.42, 0.0], [0.5, 0.22], [0.64, 0.58], [0.72, 0.86], [0.69, 1.02], [0.56, 1.1], [0.3, 1.06], [0.001, 1.02],
  ].map(([x, y]) => new THREE.Vector2(x, y)));
  let g = new THREE.LatheGeometry(krzywa.getPoints(70), 96);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g, 1e-4);
  const p = g.attributes.position;
  const guzki = [[0.3, 0.28], [-0.3, 0.28], [0.3, -0.26], [-0.3, -0.26]];
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const w = clamp((y - 0.72) / 0.3);
    if (w > 0) {
      let h = 0;
      for (const [gx, gz] of guzki) h += Math.exp(-((x - gx) ** 2 + (z - gz) ** 2) / 0.05);
      const bruzda = Math.exp(-(x * x) / 0.006) * 0.9 + Math.exp(-(z * z) / 0.008) * 0.6;
      y += w * (0.16 * h - 0.09 * bruzda * clamp(1 - Math.hypot(x, z) / 0.62));
    }
    const fala = 1 + 0.035 * Math.sin(Math.atan2(z, x) * 4);
    p.setXYZ(i, x * 1.06 * fala, y, z * 0.88 * fala);
  }
  g.computeVertexNormals();
  return g;
}

function materialy() {
  return {
    tytan: new THREE.MeshPhysicalMaterial({ color: 0xb9bcc0, metalness: 1, roughness: 0.28, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
    lacznik: new THREE.MeshPhysicalMaterial({ color: 0xd4b483, metalness: 1, roughness: 0.22 }),
    ceramika: new THREE.MeshPhysicalMaterial({ color: 0xf6f2ea, metalness: 0, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.4, sheenColor: new THREE.Color(0xfff4e6), sheenRoughness: 0.5 }),
  };
}

function zbudujImplant() {
  const m = materialy();
  const [rdzen, gwint] = geometriaSruby();
  const sruba = new THREE.Group();
  sruba.add(new THREE.Mesh(rdzen, m.tytan), new THREE.Mesh(gwint, m.tytan));
  const lacznik = new THREE.Mesh(geometriaLacznika(), m.lacznik);
  const korona = new THREE.Mesh(geometriaKorony(), m.ceramika);
  return { sruba, lacznik, korona, m };
}

function scena(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const s = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  s.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const klucz = new THREE.DirectionalLight(0xf2f8ff, 2.2);
  klucz.position.set(3, 5, 4);
  const kontra = new THREE.DirectionalLight(0x58a9e0, 2.4);
  kontra.position.set(-4, 1, -3);
  s.add(klucz, kontra, new THREE.AmbientLight(0xffffff, 0.25));
  const kamera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  return { renderer, s, kamera };
}

function dopasuj(renderer, kamera, canvas, wys, szer) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return false;
  const roz = renderer.getSize(new THREE.Vector2());
  if (roz.x !== w || roz.y !== h) {
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(kamera.fov / 2));
    const odl = Math.max(wys / 2 / tan, szer / 2 / tan / kamera.aspect);
    kamera.userData.odl = odl;
    kamera.updateProjectionMatrix();
  }
  return true;
}

function widocznosc(el, cb) {
  new IntersectionObserver(([w]) => cb(w.isIntersecting), { rootMargin: "100px" }).observe(el);
}

function kroki(canvas) {
  const sekcja = document.getElementById("implant");
  const listaKrokow = [...document.querySelectorAll(".krok")];
  const etykiety = Object.fromEntries([...document.querySelectorAll(".etykiety span")].map(el => [el.dataset.cz, el]));
  const { renderer, s, kamera } = scena(canvas);
  const { sruba, lacznik, korona } = zbudujImplant();

  const kosc = new THREE.Mesh(new RoundedBoxGeometry(2.6, 2.7, 1.7, 6, 0.32),
    new THREE.MeshPhysicalMaterial({ color: 0xeee3d2, roughness: 0.75, transparent: true, opacity: 0.26, depthWrite: false, side: THREE.DoubleSide }));
  kosc.position.y = -1.35;
  const dziaslo = new THREE.Mesh(new RoundedBoxGeometry(2.62, 0.34, 1.72, 4, 0.16),
    new THREE.MeshPhysicalMaterial({ color: 0xd98f8a, roughness: 0.45, clearcoat: 0.6, transparent: true, opacity: 0.38, depthWrite: false }));
  dziaslo.position.y = 0.12;
  const krawedzie = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.6, 2.7, 1.7)),
    new THREE.LineBasicMaterial({ color: 0x58a9e0, transparent: true, opacity: 0.25 }));
  krawedzie.position.copy(kosc.position);

  const skan = new THREE.Group();
  const plaszczyzna = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2),
    new THREE.MeshBasicMaterial({ color: 0x58a9e0, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  plaszczyzna.rotation.x = -Math.PI / 2;
  const ramka = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(3.2, 2.2)), new THREE.LineBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.9 }));
  ramka.rotation.x = -Math.PI / 2;
  skan.add(plaszczyzna, ramka);

  const grupa = new THREE.Group();
  grupa.add(kosc, krawedzie, dziaslo, skan, sruba, lacznik, korona);
  s.add(grupa);

  let widac = false, p = 0, pGladkie = 0;
  const start = performance.now();
  const liczP = () => {
    const r = sekcja.getBoundingClientRect();
    p = clamp(-r.top / (r.height - innerHeight));
  };
  addEventListener("scroll", liczP, { passive: true });
  addEventListener("resize", liczP);
  liczP();
  widocznosc(sekcja, v => { widac = v; if (v) requestAnimationFrame(petla); });

  const wektor = new THREE.Vector3();
  const przypnij = (el, obiekt, dy, pokaz) => {
    if (!el) return;
    el.classList.toggle("widac", pokaz);
    if (!pokaz) return;
    obiekt.getWorldPosition(wektor);
    wektor.y += dy;
    wektor.project(kamera);
    const w = canvas.clientWidth;
    const x = Math.min((wektor.x * 0.5 + 0.5) * w + Math.max(70, w * 0.16), w - el.offsetWidth - 4);
    const y = (-wektor.y * 0.5 + 0.5) * canvas.clientHeight;
    el.style.setProperty("--x", x.toFixed(1) + "px");
    el.style.setProperty("--y", (y - 8).toFixed(1) + "px");
  };

  let aktywny = -1;
  function klatka(t) {
    if (!dopasuj(renderer, kamera, canvas, 6.2, 3.6)) return;
    pGladkie += (p - pGladkie) * (RUCH ? 0.12 : 1);
    const q = pGladkie;
    const lok = i => clamp((q - i * 0.25) / 0.25);

    const nr = Math.min(3, Math.floor(q * 4 + 0.0001));
    if (nr !== aktywny) {
      aktywny = nr;
      listaKrokow.forEach((k, i) => k.classList.toggle("aktywny", i === nr));
    }

    const l0 = lok(0);
    skan.visible = q < 0.27;
    skan.position.y = 0.45 - ((l0 * 1.6) % 1) * 3.2;
    plaszczyzna.material.opacity = 0.22 * (1 - clamp((q - 0.22) / 0.05));
    kosc.material.opacity = 0.2 + 0.12 * (1 - l0);

    const l1 = easeIO(clamp(lok(1) / 0.85));
    sruba.visible = l1 > 0;
    sruba.position.y = 3.6 * (1 - l1);
    sruba.rotation.y = -(1 - l1) * 14;

    const l2 = ease(clamp(lok(2) / 0.8));
    lacznik.visible = l2 > 0;
    lacznik.position.y = 0.05 + 3.4 * (1 - l2);

    const l3 = ease(clamp(lok(3) / 0.7));
    korona.visible = l3 > 0;
    korona.position.y = 0.3 + 3.6 * (1 - l3);

    const odl = kamera.userData.odl;
    kamera.position.set(0, 0.8, odl);
    kamera.lookAt(0, -0.1, 0);
    grupa.rotation.y = 0.55 + q * 1.4 + (RUCH ? Math.sin(t * 0.3) * 0.12 : 0);
    grupa.rotation.x = 0.16;
    grupa.updateMatrixWorld();

    przypnij(etykiety.sruba, sruba, -1.1, l1 > 0.98);
    przypnij(etykiety.lacznik, lacznik, 0.55, l2 > 0.98 && l3 === 0);
    przypnij(etykiety.korona, korona, 0.6, l3 > 0.98);
    renderer.render(s, kamera);
  }
  function petla() {
    if (!widac) return;
    klatka((performance.now() - start) / 1000);
    requestAnimationFrame(petla);
  }
  requestAnimationFrame(petla);
}

try {
  const k = document.getElementById("implant-kroki");
  if (k) kroki(k);
} catch (err) {
  console.warn("3D niedostępne:", err);
  document.documentElement.classList.add("bez-3d");
}
