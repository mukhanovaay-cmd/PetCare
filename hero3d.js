/* Pet Care — cinematic real-time hero.
   Three.js (WebGL, PBR + HDRI + shadows + DOF + bloom) + GSAP master timeline (46 s).
   Real CC0 photography on cards; procedural premium smartphone; all motion driven by the timeline. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const P = window.PCapp, gsap = window.gsap;
const $ = (s) => document.querySelector(s);
const hero = $('#hx'), canvas = $('#hxCanvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STILL = /[?&]still/.test(location.search), LITE = /[?&]lite/.test(location.search);
const CH = [0, 4.6, 13, 21, 29, 37, 41.7, 46];
const C = { green: '#0B3D3B', deep: '#06302F', cream: '#FFFACD', beige: '#FFDAB9', sage: '#E6E6FA', orange: '#FFB6C1', white: '#FFFFFF', ink: '#0B3D3B' };
const FH = '"Unbounded", Manrope, sans-serif', FB = 'Manrope, system-ui, sans-serif';

/* ---------- WebGL check & fallback ---------- */
const gl = (() => { try { return !!(window.WebGLRenderingContext && document.createElement('canvas').getContext('webgl2')); } catch (e) { return false; } })();
if (!gl || !gsap) { hero.classList.add('hx-nogl'); setCaption(6, true); throw new Error('Pet Care hero: WebGL or GSAP unavailable — static fallback shown'); }

/* ---------- captions & controls (DOM) ---------- */
function setCaption(i, instant) {
  const t = $('#hxTitle'), s = $('#hxSub'), a = $('#hxCta');
  const apply = () => { t.textContent = P.t('hx_t' + i); t.classList.toggle('long', P.t('hx_t' + i).length > 18); s.textContent = P.t('hx_s' + i); a.textContent = P.t('hx_c' + i); a.href = ['#pets', '#pets', '#funds', '#volunteer', '#quiz', '#journey', '#pets'][i]; };
  document.querySelectorAll('#hxChapters button').forEach((b, k) => b.setAttribute('aria-current', k === i ? 'step' : 'false'));
  if (window.gsap) gsap.killTweensOf('#hxCopy');
  if (instant || reduce || !window.gsap) { apply(); if (window.gsap) gsap.set('#hxCopy', { opacity: 1, y: 0 }); return; }
  gsap.to('#hxCopy', { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in', onComplete: () => { apply(); gsap.fromTo('#hxCopy', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }); } });
}

/* ---------- renderer / scene ---------- */
const mobile = matchMedia('(max-width: 760px)').matches || navigator.hardwareConcurrency <= 4;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
let DPR = Math.min(devicePixelRatio, mobile ? 1.25 : 1.75);
renderer.setPixelRatio(DPR);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = !LITE; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06302F, 0.028);
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

/* ---------- assets ---------- */
const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const IM = {};
const qr = await fetch('assets/qr.json').then((r) => r.json()).catch(() => null);
await Promise.all(['baron', 'marta', 'rex', 'alma', 'simba', 'jessie', 'kitten', 'duo'].map(async (k) => { IM[k] = await loadImg('assets/pets/' + k + '.jpg'); }));
IM.forest = await loadImg('assets/env/forest.jpg');
try { await Promise.all([document.fonts.load('800 40px Unbounded'), document.fonts.load('700 20px Manrope'), document.fonts.load('600 20px Manrope')]); } catch (e) {}

const pmrem = new THREE.PMREMGenerator(renderer);
new THREE.TextureLoader().load('assets/env/studio.png', (env) => { env.mapping = THREE.EquirectangularReflectionMapping; env.colorSpace = THREE.SRGBColorSpace; scene.environment = pmrem.fromEquirectangular(env).texture; scene.environmentIntensity = 1.25; env.dispose(); pmrem.dispose(); });

/* ---------- canvas drawing helpers ---------- */
const rr = (x, ctx, X, Y, W, H, R) => { ctx.beginPath(); ctx.moveTo(X + R, Y); ctx.arcTo(X + W, Y, X + W, Y + H, R); ctx.arcTo(X + W, Y + H, X, Y + H, R); ctx.arcTo(X, Y + H, X, Y, R); ctx.arcTo(X, Y, X + W, Y, R); ctx.closePath(); };
const R = (ctx, x, y, w, h, r) => rr(0, ctx, x, y, w, h, r);
const cover = (ctx, img, x, y, w, h) => { if (!img) { ctx.fillStyle = C.sage; ctx.fillRect(x, y, w, h); return; } const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s; ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); };
const ICONS = {
  paw: 'M12 12c-3.2 0-5.5 3.3-5.5 5.6 0 1.7 1.4 2.4 2.7 2.4 1.2 0 1.8-.7 2.8-.7s1.6.7 2.8.7c1.3 0 2.7-.7 2.7-2.4 0-2.3-2.3-5.6-5.5-5.6zM4.4 9.5a1.6 2 0 1 0 3.2 0a1.6 2 0 1 0-3.2 0M7.9 5.5a1.6 2 0 1 0 3.2 0a1.6 2 0 1 0-3.2 0M12.9 5.5a1.6 2 0 1 0 3.2 0a1.6 2 0 1 0-3.2 0M16.4 9.5a1.6 2 0 1 0 3.2 0a1.6 2 0 1 0-3.2 0',
  check: 'M5 12.5l4.5 4.5L19 7', shield: 'M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z', pin: 'M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', bag: 'M6 8h12l-1 12H7zM9 8V6a3 3 0 0 1 6 0v2', car: 'M3 13l2-5h14l2 5v5H3zM7 18v2M17 18v2M3 13h18',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2', wallet: 'M3 7h18v12H3zM16 13h2M5 7l11-4 2 4', home: 'M3 11l9-7 9 7v9H3zM9 20v-6h6v6', heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  doc: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6', qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2z', walk: 'M13 4a2 2 0 1 0 0 .1M10 21l2-7 3 3v4M9 11l3-3 3 3 2 1M12 8l-1 6'
};
const icon = (ctx, name, x, y, s, color, fill) => { ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); const p = new Path2D(ICONS[name]); if (fill) { ctx.fillStyle = color; ctx.fill(p); } else { ctx.strokeStyle = color; ctx.lineWidth = 1.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(p); } ctx.restore(); };
const txt = (ctx, s, x, y, font, color, align = 'left', maxW) => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; if (maxW) { let t = s; while (ctx.measureText(t).width > maxW && t.length > 3) t = t.slice(0, -2); if (t !== s) t = t.trim() + '…'; ctx.fillText(t, x, y); } else ctx.fillText(s, x, y); };
const wrap = (ctx, s, x, y, maxW, lh, font, color, maxLines = 3) => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'left'; const words = s.split(' '); let line = '', n = 0; for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y + n * lh); line = w; if (++n >= maxLines) return; } else line = test; } if (line) ctx.fillText(line, x, y + n * lh); };
const pill = (ctx, s, x, y, bg, fg, font = `700 22px ${FB}`, padX = 18, h = 40) => { ctx.font = font; const w = ctx.measureText(s).width + padX * 2; ctx.fillStyle = bg; R(ctx, x, y, w, h, h / 2); ctx.fill(); txt(ctx, s, x + padX, y + h * 0.68, font, fg); return w; };
const badge = (ctx, x, y, scale = 1) => { const s = P.t('hx_verified'); ctx.font = `700 ${20 * scale}px ${FB}`; const w = ctx.measureText(s).width + 58 * scale; ctx.fillStyle = 'rgba(230,230,250,.28)'; R(ctx, x, y, w, 38 * scale, 19 * scale); ctx.fill(); icon(ctx, 'shield', x + 10 * scale, y + 7 * scale, 24 * scale, C.green); icon(ctx, 'check', x + 14 * scale, y + 11 * scale, 16 * scale, C.green); txt(ctx, s, x + 42 * scale, y + 26 * scale, `700 ${20 * scale}px ${FB}`, C.green); return w; };
const bar = (ctx, x, y, w, h, p, col = C.orange) => { ctx.fillStyle = 'rgba(11,61,59,.12)'; R(ctx, x, y, w, h, h / 2); ctx.fill(); ctx.fillStyle = col; R(ctx, x, y, Math.max(h, w * p), h, h / 2); ctx.fill(); };
const fmt = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₸';

/* ---------- rounded slab (extruded rounded rect with bevel) ---------- */
function slab(w, h, d, r, bevel = 0.012) { const s = new THREE.Shape(), x = -w / 2 + bevel, y = -h / 2 + bevel, W = w - bevel * 2, H = h - bevel * 2, rr = Math.max(0.001, r - bevel);
  s.moveTo(x + rr, y); s.lineTo(x + W - rr, y); s.quadraticCurveTo(x + W, y, x + W, y + rr); s.lineTo(x + W, y + H - rr); s.quadraticCurveTo(x + W, y + H, x + W - rr, y + H); s.lineTo(x + rr, y + H); s.quadraticCurveTo(x, y + H, x, y + H - rr); s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - bevel * 2), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 18 }); g.center(); return g; }
/* ---------- textures / card factory ---------- */
const PX = 200; /* canvas px per world unit */
const disposables = [];
function canvasTex(w, h) { const c = document.createElement('canvas'); c.width = Math.round(w * PX); c.height = Math.round(h * PX); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); disposables.push(tex); return { c, ctx: c.getContext('2d'), tex }; }
const backMat = () => new THREE.MeshPhysicalMaterial({ color: 0xFFFACD, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.25, envMapIntensity: 0.7, transparent: true });
function card(w, h, draw, { depth = 0.05, r = 0.14, data = {} } = {}) {
  const g = new THREE.Group(); const T = canvasTex(w, h);
  const body = new THREE.Mesh(slab(w, h, depth, r, 0.012), backMat());
  body.castShadow = true; body.receiveShadow = true; g.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: T.tex, transparent: true, roughness: 0.5, envMapIntensity: 0.35 }));
  face.position.z = depth / 2 + 0.002; g.add(face);
  g.userData = { T, draw, w, h, r, p: 0, ...data };
  g.userData.redraw = (p = g.userData.p) => { const { ctx, c } = T; ctx.clearRect(0, 0, c.width, c.height); ctx.save(); R(ctx, 0, 0, c.width, c.height, r * PX); ctx.clip(); ctx.fillStyle = C.cream; ctx.fillRect(0, 0, c.width, c.height); draw(ctx, c.width, c.height, p); ctx.restore(); T.tex.needsUpdate = true; g.userData.p = p; };
  g.userData.redraw(0); setOp(g, 0); return g;
}
function setOp(o, v) { o.traverse((m) => { if (m.material) { const ms = Array.isArray(m.material) ? m.material : [m.material]; ms.forEach((mm) => { if (mm.userData.base === undefined) mm.userData.base = mm.opacity; mm.transparent = true; mm.opacity = v * mm.userData.base; mm.depthWrite = v > 0.98; }); } }); o.visible = v > 0.005; o.userData.op = v; }
const op = (o) => ({ get v() { return o.userData.op ?? 1; }, set v(x) { setOp(o, x); } });

/* ---------- environment: forest backdrop, floor, lights, shafts ---------- */
const backTex = new THREE.Texture(IM.forest); backTex.needsUpdate = true; backTex.colorSpace = THREE.SRGBColorSpace;
const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(120, 68), new THREE.MeshBasicMaterial({ map: backTex, color: 0x3d8f8c, fog: false }));
backdrop.position.set(0, 18, -46); scene.add(backdrop);
const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 96), new THREE.MeshPhysicalMaterial({ color: 0x0b3a39, roughness: 0.32, metalness: 0.15, clearcoat: 0.4, clearcoatRoughness: 0.4, envMapIntensity: 0.5 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
scene.add(new THREE.HemisphereLight(0xE9F1E4, 0x06302F, 0.45));
const key = new THREE.DirectionalLight(0xFFE7C6, 2.4); key.position.set(-7, 14, 9); key.castShadow = true;
key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); key.shadow.radius = 6; key.shadow.bias = -0.0004;
Object.assign(key.shadow.camera, { left: -14, right: 14, top: 14, bottom: -6, near: 1, far: 50 }); scene.add(key);
const rim = new THREE.SpotLight(0xFFB6C1, 30, 40, 0.5, 0.8, 1.5); rim.position.set(8, 9, -8); rim.target.position.set(0, 3, 0); scene.add(rim, rim.target);
const fill = new THREE.PointLight(0xE6E6FA, 6, 30, 1.6); fill.position.set(-8, 4, 6); scene.add(fill);
/* volumetric light shafts (additive, soft) */
const shaftTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 512; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(255,236,200,0.9)'); gr.addColorStop(1, 'rgba(255,236,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 512); const gx = g.createLinearGradient(0, 0, 64, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, 64, 512); const t = new THREE.CanvasTexture(c); return t; })();
const shafts = new THREE.Group(); scene.add(shafts);
[[-6, 0.22, 7], [-2.5, 0.3, 5], [3, 0.26, 6], [7, 0.2, 8]].forEach(([x, rz, w], i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 26), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); m.position.set(x, 12, -12 - i); m.rotation.z = rz; m.userData.k = i; shafts.add(m); });

/* ---------- bokeh dust + logo particles ---------- */
const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const rnd = (() => { let s = 1337; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
function dust(n) {
  const g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = (rnd() - .5) * 34; pos[i * 3 + 1] = rnd() * 14; pos[i * 3 + 2] = (rnd() - .6) * 24; seed[i] = rnd() * 100; }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, map: { value: dotTex }, uA: { value: 0.55 } },
    vertexShader: 'attribute float seed;uniform float uT;varying float vA;void main(){vec3 p=position;p.y+=mod(uT*0.18+seed*0.2,14.0)-7.0+7.0;p.y=mod(p.y,14.0);p.x+=sin(uT*0.3+seed)*0.6;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=(18.0+mod(seed,10.0)*2.4)*(10.0/-mv.z);vA=0.35+0.65*abs(sin(uT*0.7+seed));gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform sampler2D map;uniform float uA;varying float vA;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(vec3(1.0,0.98,0.82)*t.rgb,t.a*vA*uA*0.5);}' });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; return pts;
}
const dustPts = dust(mobile ? 140 : 320); scene.add(dustPts);
/* logo particles: sample "Pet Care" */
const logoPts = (() => {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 300; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.font = `800 190px ${FH}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Pet Care', 600, 160);
  const d = g.getImageData(0, 0, 1200, 300).data, tgt = [];
  for (let y = 0; y < 300; y += mobile ? 6 : 4) for (let x = 0; x < 1200; x += mobile ? 6 : 4) if (d[(y * 1200 + x) * 4 + 3] > 128) tgt.push((x - 600) / 120, (150 - y) / 120 + 4.2, 0);
  const n = tgt.length / 3, start = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) { const a = rnd() * 6.283, r = 8 + rnd() * 10; start[i * 3] = Math.cos(a) * r; start[i * 3 + 1] = 4 + (rnd() - .5) * 12; start[i * 3 + 2] = Math.sin(a) * r - 4; seed[i] = rnd(); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tgt), 3)); geo.setAttribute('start', new THREE.BufferAttribute(start, 3)); geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uP: { value: 0 }, uF: { value: 1 }, uT: { value: 0 }, map: { value: dotTex } },
    vertexShader: 'attribute vec3 start;attribute float seed;uniform float uP;uniform float uT;varying float vS;void main(){float k=clamp((uP-seed*0.35)/0.65,0.0,1.0);k=1.0-pow(1.0-k,3.0);vec3 p=mix(start,position,k);p+=vec3(sin(uT*2.0+seed*40.0),cos(uT*1.7+seed*30.0),0.0)*0.03*(1.0-k*0.7);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=(4.0+seed*4.0)*(10.0/-mv.z);vS=seed;gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform sampler2D map;uniform float uF;varying float vS;void main(){vec4 t=texture2D(map,gl_PointCoord);vec3 col=mix(vec3(1.0,0.98,0.85),vec3(1.0,0.71,0.76),step(0.82,vS));gl_FragColor=vec4(col*t.rgb,t.a*uF*0.75);}' });
  const p = new THREE.Points(geo, m); p.frustumCulled = false; return p;
})();
scene.add(logoPts);

/* ---------- smartphone ---------- */
const phone = new THREE.Group(); scene.add(phone);
const PW = 3.1, PHh = 6.4;
const frameMat = new THREE.MeshPhysicalMaterial({ color: 0x2d6f6c, metalness: 0.85, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.2 });
const body = new THREE.Mesh(slab(PW, PHh, 0.32, 0.46, 0.06), frameMat); body.castShadow = true; phone.add(body);
const glassFront = new THREE.Mesh(slab(PW - 0.08, PHh - 0.08, 0.02, 0.42, 0.004), new THREE.MeshPhysicalMaterial({ color: 0x050807, roughness: 0.04, metalness: 0, clearcoat: 1, envMapIntensity: 1.4 }));
glassFront.position.z = 0.161; phone.add(glassFront);
const SCR = canvasTex(PW - 0.22, PHh - 0.22); SCR.c.width = 640; SCR.c.height = Math.round(640 * (PHh - 0.22) / (PW - 0.22));
const screen = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.22, PHh - 0.22), new THREE.MeshBasicMaterial({ map: SCR.tex, transparent: true, toneMapped: false }));
screen.position.z = 0.173; phone.add(screen);
const island = new THREE.Mesh(slab(0.78, 0.22, 0.02, 0.11, 0.004), new THREE.MeshBasicMaterial({ color: 0x000000 })); island.position.set(0, PHh / 2 - 0.36, 0.185); phone.add(island);
[[PW / 2 + 0.01, 1.4, 0.55], [PW / 2 + 0.01, 0.6, 0.4], [-PW / 2 - 0.01, 1.2, 0.9]].forEach(([x, y, h]) => { const b = new THREE.Mesh(new RoundedBoxGeometry(0.05, h, 0.1, 2, 0.02), frameMat); b.position.set(x, y, 0); phone.add(b); });
const camBump = new THREE.Mesh(slab(1.2, 1.2, 0.08, 0.32, 0.02), frameMat); camBump.position.set(-0.75, PHh / 2 - 0.85, -0.19); phone.add(camBump);
[[-1.0, 2.6], [-0.5, 2.6], [-1.0, 2.1]].forEach(([x, y]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 48), new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.05, clearcoat: 1 })); l.rotation.x = Math.PI / 2; l.position.set(x, y, -0.24); phone.add(l); });
phone.position.set(0, -8, 0);

/* screen content */
const SC = { id: 'logo', prev: null, mix: 1, p: 0 };
const PETS = PC.PETS;
function statusBar(ctx, w, dark) { const col = dark ? C.cream : C.green; txt(ctx, '9:41', 44, 52, `700 24px ${FB}`, col); ctx.fillStyle = col; [0, 1, 2].forEach((i) => { R(ctx, w - 120 + i * 14, 40 - i * 4, 9, 12 + i * 4, 2); ctx.fill(); }); R(ctx, w - 70, 34, 34, 18, 5); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); ctx.fillRect(w - 67, 37, 24, 12); }
const SCREENS = {
  logo(ctx, w, h) { ctx.fillStyle = C.green; ctx.fillRect(0, 0, w, h); statusBar(ctx, w, true); ctx.save(); ctx.globalAlpha = .18; cover(ctx, IM.forest, 0, 0, w, h); ctx.restore();
    ctx.fillStyle = 'rgba(247,244,236,.12)'; ctx.beginPath(); ctx.arc(w / 2, h * 0.36, 110, 0, 7); ctx.fill(); icon(ctx, 'paw', w / 2 - 66, h * 0.36 - 66, 132, C.cream, true);
    txt(ctx, 'Pet Care', w / 2, h * 0.55, `800 76px ${FH}`, C.cream, 'center'); ctx.globalAlpha = .85; wrap(ctx, P.t('hx_s0'), 80, h * 0.6 + 20, w - 160, 40, `600 30px ${FB}`, C.beige, 2); ctx.globalAlpha = 1;
    ctx.fillStyle = C.orange; R(ctx, 70, h - 210, w - 140, 88, 44); ctx.fill(); txt(ctx, P.t('hx_c0'), w / 2, h - 154, `800 28px ${FB}`, C.green, 'center'); },
  adopt(ctx, w, h) { ctx.fillStyle = C.cream; ctx.fillRect(0, 0, w, h); statusBar(ctx, w); txt(ctx, P.t('hx_find'), 40, 140, `800 44px ${FH}`, C.green);
    let x = 40; [P.t('f_all'), P.t('f_dog'), P.t('f_cat')].forEach((s, i) => { x += pill(ctx, s, x, 168, i ? C.beige : C.green, i ? C.green : C.cream, `700 22px ${FB}`) + 10; });
    PETS.slice(0, 4).forEach((p, i) => { const cx = 40 + (i % 2) * ((w - 100) / 2 + 20), cy = 240 + Math.floor(i / 2) * 400, cw = (w - 100) / 2; ctx.save(); R(ctx, cx, cy, cw, 300, 26); ctx.clip(); cover(ctx, IM[p.id], cx, cy, cw, 300); ctx.restore(); txt(ctx, P.L(p.name), cx + 4, cy + 340, `800 28px ${FH}`, C.green); txt(ctx, P.L(p.age) + ' · ' + P.t('f_' + P.shelter(p.sh).city), cx + 4, cy + 374, `600 20px ${FB}`, 'rgba(11,61,59,.7)'); }); },
  profile(ctx, w, h, p, id = 'simba') { const pet = PETS.find((x) => x.id === id), sh = P.shelter(pet.sh); ctx.fillStyle = C.cream; ctx.fillRect(0, 0, w, h); ctx.save(); R(ctx, 0, 0, w, h * 0.52, 0); ctx.clip(); cover(ctx, IM[id], 0, 0, w, h * 0.52); ctx.restore(); statusBar(ctx, w, true);
    ctx.fillStyle = C.cream; R(ctx, 0, h * 0.49, w, h * 0.55, 40); ctx.fill(); txt(ctx, P.L(pet.name), 44, h * 0.49 + 86, `800 56px ${FH}`, C.green); txt(ctx, P.t(pet.sex === 'm' ? 'male' : 'female') + ' · ' + P.L(pet.age) + ' · ' + P.t('f_' + sh.city), 44, h * 0.49 + 130, `600 24px ${FB}`, 'rgba(11,61,59,.75)');
    badge(ctx, 44, h * 0.49 + 158); wrap(ctx, P.L(pet.story), 44, h * 0.49 + 250, w - 88, 34, `500 24px ${FB}`, 'rgba(11,61,59,.85)', 4);
    ctx.fillStyle = C.orange; R(ctx, 44, h - 150, w - 88, 88, 44); ctx.fill(); txt(ctx, P.t('hx_adopt'), w / 2, h - 94, `800 28px ${FB}`, C.green, 'center'); },
  donate(ctx, w, h, p) { ctx.fillStyle = C.cream; ctx.fillRect(0, 0, w, h); statusBar(ctx, w); const f = PC.FUNDS[0], sh = P.shelter(f.sh), v = 0.45 + 0.4 * p;
    ctx.save(); R(ctx, 40, 110, w - 80, 360, 30); ctx.clip(); cover(ctx, IM.duo, 40, 110, w - 80, 360); ctx.restore();
    pill(ctx, P.t('hx_food'), 60, 130, 'rgba(247,244,236,.9)', C.green); wrap(ctx, P.L(f.title), 44, 540, w - 88, 46, `800 36px ${FH}`, C.green, 2); txt(ctx, sh.name, 44, 640, `600 24px ${FB}`, 'rgba(11,61,59,.7)');
    bar(ctx, 44, 680, w - 88, 22, v); txt(ctx, Math.round(v * 100) + '%', 44, 750, `800 44px ${FH}`, C.green); txt(ctx, fmt(f.goal * v) + ' / ' + fmt(f.goal), w - 44, 748, `700 22px ${FB}`, 'rgba(11,61,59,.75)', 'right');
    badge(ctx, 44, 790); ctx.fillStyle = C.green; R(ctx, 44, h - 150, w - 88, 88, 44); ctx.fill(); txt(ctx, P.t('jr_fund'), w / 2, h - 94, `800 26px ${FB}`, C.cream, 'center', w - 140); },
  reports(ctx, w, h, p) { ctx.fillStyle = C.cream; ctx.fillRect(0, 0, w, h); statusBar(ctx, w); txt(ctx, P.t('hx_t2'), 40, 140, `800 44px ${FH}`, C.green);
    [['doc', 'hx_receipt'], ['camera', 'hx_photo'], ['check', 'hx_report']].forEach(([ic, k], i) => { const y = 200 + i * 150, on = p > (i + 1) / 4; ctx.fillStyle = on ? 'rgba(230,230,250,.3)' : 'rgba(11,61,59,.06)'; R(ctx, 40, y, w - 80, 120, 28); ctx.fill(); icon(ctx, ic, 70, y + 36, 48, C.green); txt(ctx, P.t(k), 140, y + 72, `700 28px ${FB}`, C.green); if (on) { ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(w - 90, y + 60, 26, 0, 7); ctx.fill(); icon(ctx, 'check', w - 105, y + 45, 30, C.green); } });
    ctx.save(); R(ctx, 40, 680, w - 80, 420, 30); ctx.clip(); cover(ctx, IM.kitten, 40, 680, w - 80, 420); ctx.restore(); },
  map(ctx, w, h, p) { ctx.fillStyle = C.cream; ctx.fillRect(0, 0, w, h); statusBar(ctx, w); txt(ctx, P.t('hx_t3'), 40, 140, `800 40px ${FH}`, C.green, 'left', w - 80); drawMap(ctx, 40, 180, w - 80, 560, p);
    [['walk', 'hx_walk'], ['camera', 'hx_photog'], ['bag', 'hx_deliv']].forEach(([ic, k], i) => { const y = 780 + i * 116; ctx.fillStyle = 'rgba(11,61,59,.06)'; R(ctx, 40, y, w - 80, 100, 24); ctx.fill(); icon(ctx, ic, 64, y + 28, 44, C.green); txt(ctx, P.t(k), 130, y + 62, `700 26px ${FB}`, C.green); pill(ctx, '+', w - 110, y + 30, C.orange, C.green, `800 24px ${FB}`, 14); }); },
  verify(ctx, w, h, p) { ctx.fillStyle = C.cream; ctx.fillRect(0, 0, w, h); statusBar(ctx, w); const sh = PC.SHELTERS[0]; txt(ctx, sh.name, 40, 150, `800 46px ${FH}`, C.green); badge(ctx, 40, 180, 1.1);
    [['doc', 'hx_docs'], ['home', 'hx_visit'], ['check', 'hx_reports']].forEach(([ic, k], i) => { const y = 270 + i * 140, on = p > (i + .6) / 3.4; ctx.fillStyle = 'rgba(11,61,59,.06)'; R(ctx, 40, y, w - 80, 116, 26); ctx.fill(); icon(ctx, ic, 66, y + 34, 48, C.green); txt(ctx, P.t(k), 136, y + 68, `700 28px ${FB}`, C.green); ctx.fillStyle = on ? C.green : 'rgba(11,61,59,.15)'; ctx.beginPath(); ctx.arc(w - 90, y + 58, 26, 0, 7); ctx.fill(); if (on) icon(ctx, 'check', w - 105, y + 43, 30, C.cream); });
    ctx.save(); R(ctx, 40, 720, w - 80, 380, 30); ctx.clip(); cover(ctx, IM.alma, 40, 720, w - 80, 380); ctx.restore(); },
  sim(ctx, w, h, p) { ctx.fillStyle = C.green; ctx.fillRect(0, 0, w, h); statusBar(ctx, w, true); txt(ctx, P.t('hx_t4'), 40, 150, `800 52px ${FH}`, C.cream);
    [['clock', 'hx_time', .9], ['wallet', 'hx_money', .7], ['home', 'hx_move', .75]].forEach(([ic, k, v], i) => { const y = 220 + i * 170, q = Math.min(1, Math.max(0, (p - i * 0.25) / 0.35)); ctx.fillStyle = 'rgba(247,244,236,.08)'; R(ctx, 40, y, w - 80, 146, 28); ctx.fill(); icon(ctx, ic, 66, y + 30, 44, C.orange); txt(ctx, P.t(k), 130, y + 64, `700 28px ${FB}`, C.cream); bar(ctx, 66, y + 96, w - 200, 16, v * q); txt(ctx, Math.round(v * q * 100) + '%', w - 70, y + 112, `800 24px ${FB}`, C.cream, 'right'); });
    const r = Math.round(78 * Math.min(1, Math.max(0, (p - .55) / .4))); txt(ctx, P.t('hx_ready'), 40, 830, `700 26px ${FB}`, C.beige); txt(ctx, r + '%', 40, 930, `800 96px ${FH}`, C.orange); },
  scan(ctx, w, h, p) { ctx.fillStyle = '#0b1714'; ctx.fillRect(0, 0, w, h); ctx.save(); ctx.globalAlpha = .55; cover(ctx, IM.forest, 0, 0, w, h); ctx.restore(); statusBar(ctx, w, true); const s = w * 0.62, x = (w - s) / 2, y = h * 0.3;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = C.white; R(ctx, x, y, s, s, 24); ctx.fill(); drawQR(ctx, x + 30, y + 30, s - 60); ctx.strokeStyle = C.orange; ctx.lineWidth = 8; ctx.lineCap = 'round';
    [[x - 16, y - 16, 1, 1], [x + s + 16, y - 16, -1, 1], [x - 16, y + s + 16, 1, -1], [x + s + 16, y + s + 16, -1, -1]].forEach(([a, b, dx, dy]) => { ctx.beginPath(); ctx.moveTo(a, b + 60 * dy); ctx.lineTo(a, b); ctx.lineTo(a + 60 * dx, b); ctx.stroke(); });
    const ly = y + s * ((p * 2) % 1); ctx.fillStyle = 'rgba(255,182,193,.85)'; ctx.fillRect(x, ly, s, 5); txt(ctx, P.t('hx_scan'), w / 2, y + s + 110, `700 28px ${FB}`, C.cream, 'center'); },
  scanned(ctx, w, h, p) { SCREENS.profile(ctx, w, h, p, 'baron'); },
  final(ctx, w, h) { SCREENS.logo(ctx, w, h); }
};
function drawQR(ctx, x, y, s) { if (!qr) return; const n = qr.length, c = s / n; ctx.fillStyle = C.green; qr.forEach((row, j) => { for (let i = 0; i < n; i++) if (row[i] === '1') ctx.fillRect(Math.floor(x + i * c), Math.floor(y + j * c), Math.ceil(c), Math.ceil(c)); }); }
const MAPPTS = [[.22, .3], [.36, .62], [.55, .4], [.72, .7], [.8, .26], [.46, .82]];
function drawMap(ctx, x, y, w, h, p) {
  ctx.save(); R(ctx, x, y, w, h, 30); ctx.clip(); ctx.fillStyle = '#E6E0D2'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#C9D6C2'; [[.1, .1, .3, .25], [.6, .55, .3, .3], [.15, .7, .2, .2]].forEach(([a, b, c, d]) => { R(ctx, x + a * w, y + b * h, c * w, d * h, 30); ctx.fill(); });
  ctx.strokeStyle = '#A7C4C9'; ctx.lineWidth = h * 0.05; ctx.beginPath(); ctx.moveTo(x, y + h * .55); ctx.bezierCurveTo(x + w * .3, y + h * .35, x + w * .6, y + h * .8, x + w, y + h * .6); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = h * 0.018; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x + w * i / 6, y); ctx.lineTo(x + w * i / 6 + w * .05, y + h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y + h * i / 6); ctx.lineTo(x + w, y + h * i / 6 - h * .04); ctx.stroke(); }
  MAPPTS.forEach(([a, b], i) => { const k = Math.min(1, Math.max(0, p * 6 - i)); if (!k) return; const px = x + a * w, py = y + b * h; ctx.fillStyle = 'rgba(255,182,193,.25)'; ctx.beginPath(); ctx.arc(px, py, 34 * k, 0, 7); ctx.fill(); ctx.save(); ctx.translate(px - 24, py - 46 * k); icon(ctx, 'pin', 0, 0, 48, C.green, true); ctx.restore(); ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(px, py - 46 * k + 20, 7, 0, 7); ctx.fill(); });
  ctx.restore();
}
function drawScreen() {
  const { ctx, c, tex } = SCR, w = c.width, h = c.height;
  ctx.clearRect(0, 0, w, h); ctx.save(); R(ctx, 0, 0, w, h, 58); ctx.clip();
  const one = (id, dx) => { ctx.save(); ctx.translate(dx, 0); SCREENS[id](ctx, w, h, SC.p); ctx.restore(); };
  if (SC.prev && SC.mix < 1) { const e = SC.mix; one(SC.prev, -w * e * 0.35); ctx.globalAlpha = e; one(SC.id, w * (1 - e) * 0.5); ctx.globalAlpha = 1; } else one(SC.id, 0);
  ctx.restore(); tex.needsUpdate = true;
}
const SCREEN_T = [[0, 'logo'], [4.7, 'adopt'], [8.5, 'profile'], [13.2, 'donate'], [17.2, 'reports'], [21.1, 'map'], [25.6, 'verify'], [29.2, 'sim'], [37.3, 'scan'], [40.2, 'scanned'], [41.8, 'final']];
const pickScreen = (t) => { let k = 0; SCREEN_T.forEach(([t0], i) => { if (t >= t0) k = i; }); SC.id = SCREEN_T[k][1]; SC.prev = k ? SCREEN_T[k - 1][1] : null; const m = Math.min(1, (t - SCREEN_T[k][0]) / 0.8); SC.mix = k ? m * m * (3 - 2 * m) : 1; };
const goScreen = () => {};

/* ---------- 3D content groups ---------- */
const petCard = (p) => card(1.7, 2.3, (ctx, w, h) => {
  ctx.save(); R(ctx, 16, 16, w - 32, h * 0.6, 30); ctx.clip(); cover(ctx, IM[p.id], 16, 16, w - 32, h * 0.6); ctx.restore();
  txt(ctx, P.L(p.name), 30, h * 0.6 + 72, `800 40px ${FH}`, C.green, 'left', w - 60); txt(ctx, P.L(p.age) + ' · ' + P.t('f_' + P.shelter(p.sh).city), 30, h * 0.6 + 112, `600 22px ${FB}`, 'rgba(11,61,59,.72)', 'left', w - 60);
  badge(ctx, 28, h * 0.6 + 132, .92); ctx.fillStyle = C.orange; R(ctx, 28, h - 84, w - 56, 62, 31); ctx.fill(); txt(ctx, P.t('hx_adopt'), w / 2, h - 43, `800 24px ${FB}`, C.green, 'center');
}, { data: { link: 'pet', pet: p.id } });
const adopt = new THREE.Group(); scene.add(adopt);
const adoptCards = PETS.map((p) => { const c = petCard(p); adopt.add(c); return c; });
const ADOPT_POS = [[-4.6, 3.9, -1.2, .35], [-2.6, 5.6, -2.4, .2], [2.6, 5.5, -2.4, -.2], [4.6, 3.8, -1.2, -.35], [-3.6, 1.6, .4, .3], [3.7, 1.7, .4, -.3]];
adoptCards.forEach((c, i) => { const [x, y, z, ry] = ADOPT_POS[i]; c.position.set(x, y, z); c.rotation.y = ry; c.userData.home = [x, y, z, ry]; });

const donate = new THREE.Group(); scene.add(donate);
const donCard = (k, f, img, val) => card(2.6, 1.5, (ctx, w, h, p) => {
  ctx.save(); R(ctx, 16, 16, h - 32, h - 32, 26); ctx.clip(); cover(ctx, IM[img], 16, 16, h - 32, h - 32); ctx.restore();
  const x = h + 6; pill(ctx, P.t(k), x, 24, C.beige, C.green, `700 20px ${FB}`, 14, 36); wrap(ctx, P.L(f.title), x, 104, w - x - 24, 32, `800 26px ${FH}`, C.green, 2);
  const v = val[0] + (val[1] - val[0]) * p; bar(ctx, x, h - 74, w - x - 30, 16, v); txt(ctx, Math.round(v * 100) + '%', x, h - 26, `800 26px ${FB}`, C.green); txt(ctx, P.shelter(f.sh).name, w - 30, h - 26, `600 18px ${FB}`, 'rgba(11,61,59,.7)', 'right');
}, { data: { link: '#funds' } });
const donCards = [donCard('hx_food', PC.FUNDS[0], 'duo', [.45, .85]), donCard('hx_med', PC.FUNDS[2], 'simba', [.4, .56]), donCard('hx_rehab', PC.FUNDS[1], 'alma', [.5, .65])];
donCards.forEach((c, i) => { c.position.set(3.2 + i * 0.4, 5.3 - i * 1.75, -1 - i * 0.6); c.rotation.y = -0.34; donate.add(c); });
const reportItems = [
  card(1.3, 1.8, (ctx, w, h) => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); txt(ctx, P.t('hx_receipt'), 24, 56, `800 30px ${FH}`, C.green); ctx.fillStyle = 'rgba(11,61,59,.15)'; for (let i = 0; i < 7; i++) { R(ctx, 24, 90 + i * 34, w * (0.45 + (i % 3) * 0.12), 12, 6); ctx.fill(); R(ctx, w - 90, 90 + i * 34, 66, 12, 6); ctx.fill(); } ctx.fillStyle = C.green; ctx.fillRect(24, h - 92, w - 48, 3); txt(ctx, '285 000 ₸', w - 24, h - 44, `800 30px ${FB}`, C.green, 'right'); }, { data: { link: '#funds' } }),
  card(1.6, 1.25, (ctx, w, h) => { ctx.save(); R(ctx, 14, 14, w - 28, h - 70, 22); ctx.clip(); cover(ctx, IM.kitten, 14, 14, w - 28, h - 70); ctx.restore(); txt(ctx, P.t('hx_photo'), 24, h - 20, `700 22px ${FB}`, C.green); }, { data: { link: '#funds' } }),
  card(1.4, 1.8, (ctx, w, h) => { icon(ctx, 'doc', 22, 22, 60, C.green); txt(ctx, P.t('hx_report'), 24, 130, `800 26px ${FH}`, C.green, 'left', w - 40); ctx.fillStyle = 'rgba(11,61,59,.14)'; for (let i = 0; i < 5; i++) { R(ctx, 24, 160 + i * 30, w - 48 - (i % 2) * 40, 12, 6); ctx.fill(); } badge(ctx, 22, h - 64, .85); }, { data: { link: '#funds' } })
];
reportItems.forEach((c, i) => { c.position.set(-6 + i * 1.75, 2.3 + (i % 2) * 0.5, 1.2); c.rotation.set(0, 0.25 - i * 0.2, (i - 1) * 0.05); donate.add(c); });
/* glass verification coin */
const coin = new THREE.Group(); scene.add(coin);
const coinGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.16, 96), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: LITE ? 0 : 1, thickness: 0.6, roughness: 0.06, ior: 1.45, clearcoat: 1, envMapIntensity: 1.5, transparent: true }));
coinGlass.rotation.x = Math.PI / 2; coin.add(coinGlass);
const checkT = canvasTex(1.3, 1.3); const ck = checkT.ctx; ck.lineCap = 'round'; ck.lineJoin = 'round';
const drawCheck = (p) => { ck.clearRect(0, 0, 260, 260); ck.strokeStyle = C.orange; ck.lineWidth = 26; ck.shadowColor = C.orange; ck.shadowBlur = 24; ck.beginPath(); const pts = [[70, 135], [115, 180], [195, 90]]; const L1 = 64, L2 = 120, d = p * (L1 + L2); ck.moveTo(...pts[0]); if (d < L1) ck.lineTo(pts[0][0] + 45 * d / L1, pts[0][1] + 45 * d / L1); else { ck.lineTo(...pts[1]); const k = (d - L1) / L2; ck.lineTo(pts[1][0] + 80 * k, pts[1][1] - 90 * k); } ck.stroke(); checkT.tex.needsUpdate = true; };
const checkMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: checkT.tex, transparent: true, toneMapped: false, depthWrite: false })); checkMesh.position.z = 0.1; coin.add(checkMesh);
coin.position.set(2.4, 7.2, 0.8); coin.userData.c = { p: 0 }; drawCheck(0); setOp(coin, 0);

/* volunteering: 3D map + task cards + shelter verification docs */
const vol = new THREE.Group(); scene.add(vol);
const mapT = canvasTex(14, 9); const mapMesh = new THREE.Mesh(new THREE.PlaneGeometry(22, 14), new THREE.MeshStandardMaterial({ map: mapT.tex, roughness: .7, transparent: true, envMapIntensity: .3 }));
mapMesh.rotation.x = -Math.PI / 2; mapMesh.position.set(0, 0.03, -1); mapMesh.receiveShadow = true; vol.add(mapMesh);
const mapState = { p: 0 }; const redrawMap = () => { const { ctx, c } = mapT; ctx.clearRect(0, 0, c.width, c.height); drawMap(ctx, 0, 0, c.width, c.height, mapState.p); mapT.tex.needsUpdate = true; };
const pinGeo = (() => { const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(0.1, 0.28), new THREE.Vector2(0.22, 0.56)]; for (let i = 0; i <= 20; i++) { const a = -0.9 + (Math.PI / 2 + 0.9) * i / 20; pts.push(new THREE.Vector2(Math.max(0.001, Math.cos(a) * 0.28), 0.78 + Math.sin(a) * 0.28)); } return new THREE.LatheGeometry(pts, 48); })();
const pins = MAPPTS.map(([a, b]) => { const g = new THREE.Group(); const m = new THREE.Mesh(pinGeo, new THREE.MeshPhysicalMaterial({ color: 0x0B3D3B, roughness: .22, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.1 })); m.scale.set(1.15, 1.25, 1.15); m.castShadow = true; g.add(m); const ring = new THREE.Mesh(new THREE.TorusGeometry(.12, .035, 16, 48), new THREE.MeshStandardMaterial({ color: 0xFFB6C1, emissive: 0xFFB6C1, emissiveIntensity: .6 })); ring.position.set(0, .98, 0); ring.rotation.x = -Math.PI / 2.4; g.add(ring); g.position.set(-11 + a * 22, 0.05, -8 + b * 14); g.scale.setScalar(0.001); vol.add(g); return g; });
const volCard = (ic, k, n) => card(2.7, 1.2, (ctx, w, h) => { ctx.fillStyle = 'rgba(255,182,193,.2)'; R(ctx, 18, 18, h - 36, h - 36, 24); ctx.fill(); icon(ctx, ic, 30, 30, h - 60, C.green); txt(ctx, P.t(k), h + 4, 72, `800 26px ${FH}`, C.green, 'left', w - h - 20); txt(ctx, n, h + 4, 118, `600 20px ${FB}`, 'rgba(11,61,59,.7)', 'left', w - h - 20); }, { data: { link: '#volunteer' } });
const volCards = [volCard('walk', 'hx_walk', '«Я живой» · Сб 10:00'), volCard('camera', 'hx_photog', '«Ковчег» · Вс 12:00'), volCard('bag', 'hx_deliv', '«Котопёс» · Будни'), volCard('car', 'hx_trans', '«Белый Бим» · По записи')];
volCards.forEach((c, i) => { const pin = pins[i + (i > 1 ? 1 : 0)]; c.position.set(pin.position.x, 2.5 + (i % 2) * 0.5, pin.position.z); c.userData.base = c.position.clone(); vol.add(c); });
const docCards = ['hx_docs', 'hx_visit', 'hx_reports'].map((k, i) => card(1.7, 2.2, (ctx, w, h, p) => { icon(ctx, ['doc', 'home', 'check'][i], 26, 26, 64, C.green); txt(ctx, P.t(k), 26, 150, `800 28px ${FH}`, C.green, 'left', w - 50); ctx.fillStyle = 'rgba(11,61,59,.14)'; for (let j = 0; j < 4; j++) { R(ctx, 26, 180 + j * 30, w - 52 - (j % 2) * 50, 12, 6); ctx.fill(); }
  ctx.fillStyle = p > 0.5 ? C.green : 'rgba(11,61,59,.15)'; ctx.beginPath(); ctx.arc(w - 66, h - 66, 40, 0, 7); ctx.fill(); if (p > .5) icon(ctx, 'check', w - 90, h - 90, 48, C.cream); badge(ctx, 24, h - 86, .8); }, { data: { link: '#shelters' } }));
docCards.forEach((c, i) => { c.position.set(-4.6 + i * 1.25, 3.6 - i * 0.18, -0.6 + i * 0.5); c.rotation.set(0, 0.42 - i * 0.12, (1 - i) * 0.05); vol.add(c); });

/* simulator */
const sim = new THREE.Group(); scene.add(sim);
const simCards = [['clock', 'hx_time', 'hx_q_time'], ['wallet', 'hx_money', 'hx_q_money'], ['home', 'hx_move', 'hx_q_move']].map(([ic, k, q], i) => card(2.6, 1.6, (ctx, w, h, p) => { ctx.fillStyle = 'rgba(255,182,193,.22)'; ctx.beginPath(); ctx.arc(70, 70, 46, 0, 7); ctx.fill(); icon(ctx, ic, 44, 44, 52, C.green); txt(ctx, (i + 1) + '. ' + P.t(k), 134, 84, `800 32px ${FH}`, C.green, 'left', w - 150); wrap(ctx, P.t(q), 32, 168, w - 64, 32, `600 24px ${FB}`, 'rgba(11,61,59,.8)', 2); bar(ctx, 30, h - 46, w - 60, 12, p * [.9, .7, .75][i]); }, { data: { link: '#quiz' } }));
const SIM_POS = [[-4.2, 5.6, -1.2, .3], [0, 8.6, -2.4, 0], [3.8, 5.6, -1.2, -.3]];
simCards.forEach((c, i) => { const [x, y, z, ry] = SIM_POS[i]; c.position.set(x, y, z); c.rotation.y = ry; sim.add(c); });
const tubeMat = new THREE.MeshBasicMaterial({ color: 0xFFB6C1, transparent: true, opacity: .9, toneMapped: false });
const links = SIM_POS.map(([x, y, z]) => { const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, y - .75, z), new THREE.Vector3(x * .6, (y + 6.6) / 2, (z + .2) / 2 + .6), new THREE.Vector3(0, 6.8, 0.2)]); const g = new THREE.TubeGeometry(curve, 64, 0.022, 8, false); const m = new THREE.Mesh(g, tubeMat); m.geometry.setDrawRange(0, 0); m.userData.n = g.index.count; sim.add(m); return m; });

/* QR poster stand */
const qrg = new THREE.Group(); scene.add(qrg);
const posterT = canvasTex(3, 4.4);
(() => { const { ctx, c } = posterT, w = c.width, h = c.height; ctx.fillStyle = C.green; ctx.fillRect(0, 0, w, h); ctx.save(); R(ctx, 30, 30, w - 60, h * .55, 30); ctx.clip(); cover(ctx, IM.baron, 30, 30, w - 60, h * .55); ctx.restore(); txt(ctx, P.L(PETS[0].name), 40, h * .55 + 120, `800 72px ${FH}`, C.cream); txt(ctx, P.t('hx_poster'), 40, h * .55 + 180, `700 38px ${FB}`, C.beige); ctx.fillStyle = C.white; R(ctx, w - 290, h - 290, 250, 250, 20); ctx.fill(); drawQR(ctx, w - 270, h - 270, 210); txt(ctx, 'Pet Care', 40, h - 60, `800 40px ${FH}`, C.orange); posterT.tex.needsUpdate = true; })();
const posterG = new THREE.Group(); qrg.add(posterG);
const posterFrame = new THREE.Mesh(new RoundedBoxGeometry(3.3, 4.7, 0.14, 4, 0.06), new THREE.MeshPhysicalMaterial({ color: 0x1c2b27, metalness: .7, roughness: .3, clearcoat: .8 })); posterFrame.castShadow = true; posterG.add(posterFrame);
const poster = new THREE.Mesh(new THREE.PlaneGeometry(3, 4.4), new THREE.MeshStandardMaterial({ map: posterT.tex, roughness: .45, envMapIntensity: .5 })); poster.position.z = 0.075; posterG.add(poster);
const glare = new THREE.Mesh(new THREE.PlaneGeometry(3, 4.4), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .08, roughness: .05, clearcoat: 1 })); glare.position.z = 0.08; posterG.add(glare);
const stand = new THREE.Mesh(new RoundedBoxGeometry(0.5, 1.8, 0.3, 4, 0.1), posterFrame.material); stand.position.y = -3.2; posterG.add(stand);
const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.16, 1.1, 4, 0.06), posterFrame.material); plinth.position.y = -4.06; plinth.receiveShadow = plinth.castShadow = true; posterG.add(plinth);
const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.04), new THREE.MeshBasicMaterial({ color: 0xFFB6C1, transparent: true, toneMapped: false })); scanLine.position.set(0.85, -1.5, 0.09); qrg.add(scanLine);
const scanCard = petCard(PETS[0]); scanCard.position.set(0.85, -1.4, 0.2); scanCard.scale.setScalar(.3); qrg.add(scanCard); scanCard.userData.link = 'pet';
qrg.position.set(-2.8, 4.2, -1.2); qrg.rotation.y = 0.32; setOp(posterG, 0);

/* final ecosystem ring */
const eco = new THREE.Group(); scene.add(eco);
const ECO = [['heart', 'hx_eco_adopt', '#pets'], ['wallet', 'hx_eco_don', '#funds'], ['walk', 'hx_eco_vol', '#volunteer'], ['shield', 'hx_eco_ver', '#shelters'], ['clock', 'hx_eco_sim', '#quiz'], ['qr', 'hx_eco_qr', '#journey']];
const ecoCards = ECO.map(([ic, k, link]) => card(1.9, 0.82, (ctx, w, h) => { ctx.fillStyle = 'rgba(230,230,250,.3)'; ctx.beginPath(); ctx.arc(h / 2, h / 2, h / 2 - 18, 0, 7); ctx.fill(); icon(ctx, ic, 30, 30, h - 60, C.green); txt(ctx, P.t(k), h + 4, h / 2 + 12, `800 26px ${FH}`, C.green, 'left', w - h - 16); }, { data: { link } }));
ecoCards.forEach((c) => eco.add(c));

/* paw prints on the floor */
const pawT = canvasTex(1, 1); icon(pawT.ctx, 'paw', 20, 20, 160, 'rgba(247,244,236,1)', true); pawT.tex.needsUpdate = true;
const paws = new THREE.Group(); scene.add(paws);
for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.55, .55), new THREE.MeshBasicMaterial({ map: pawT.tex, transparent: true, opacity: 0, depthWrite: false })); const t = i / 11; m.position.set(-9 + t * 18, 0.02, 4.2 - Math.sin(t * 3.2) * 1.6 + (i % 2) * .45); m.rotation.set(-Math.PI / 2, 0, -Math.PI / 2 + Math.cos(t * 3.2) * .5); paws.add(m); }

/* optional real GLB animals (drop files into assets/models/) */
const gltf = new GLTFLoader(); const mixers = [];
[['assets/models/dog.glb', [-2.6, 0, 1.6], .6], ['assets/models/cat.glb', [2.6, 0, 1.8], -.6]].forEach(([url, pos, ry]) => {
  fetch(url, { method: 'HEAD' }).then((r) => { if (!r.ok) return; gltf.load(url, (g) => { const m = g.scene; const box = new THREE.Box3().setFromObject(m); const s = 1.6 / Math.max(.001, box.getSize(new THREE.Vector3()).y); m.scale.setScalar(s); m.position.set(...pos); m.rotation.y = ry; m.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); scene.add(m); if (g.animations[0]) { const mx = new THREE.AnimationMixer(m); mx.clipAction(g.animations[0]).play(); mixers.push(mx); } }); }).catch(() => {});
});

/* ---------- post-processing ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 13, aperture: 0.0012, maxblur: 0.009 }); bokeh.enabled = !mobile && !LITE; composer.addPass(bokeh);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.5, 0.96); bloom.enabled = !LITE; composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---------- master timeline (GSAP) ---------- */
const cam = { x: 0, y: 4.2, z: 22, lx: 0, ly: 4.2, lz: 0 };
const ctl = { logo: 0, logoFade: 1, shafts: .06, orbit: 0, scanY: 0 };
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
const enter = (objs, at, stagger = .12, from = { y: -1.2, s: .85 }, dur = 1.1) => objs.forEach((o, i) => { const base = o.position.y; tl.fromTo(op(o), { v: 0 }, { v: 1, duration: dur * .7, ease: 'power2.out', immediateRender: false }, at + i * stagger); tl.fromTo(o.position, { y: base + from.y }, { y: base, duration: dur, ease: 'power3.out', immediateRender: false }, at + i * stagger); tl.fromTo(o.scale, { x: from.s, y: from.s, z: from.s }, { x: 1, y: 1, z: 1, duration: dur, ease: 'power3.out', immediateRender: false }, at + i * stagger); });
const leave = (objs, at, dur = .7) => objs.forEach((o, i) => tl.to(op(o), { v: 0, duration: dur, ease: 'power2.in' }, at + i * .04));
const sweep = (to, at, dur) => tl.to(cam, { ...to, duration: dur, ease: 'sine.inOut' }, at);

/* ch0 intro 0–4.6 */
tl.to(cam, { z: 15.5, duration: 4.6, ease: 'power2.out' }, 0);
tl.to(ctl, { logo: 1, duration: 2.8, ease: 'power2.inOut' }, 0.1);
tl.to(ctl, { logoFade: 0, duration: 0.9, ease: 'power2.in' }, 3.1);
tl.fromTo(phone.position, { y: -8, z: -4 }, { y: 3.9, z: 0, duration: 2.2, ease: 'expo.out', immediateRender: false }, 2.5);
tl.fromTo(phone.rotation, { x: .55, y: -.9 }, { x: 0, y: -.22, duration: 2.6, ease: 'expo.out', immediateRender: false }, 2.5);
enter([adoptCards[0], adoptCards[3], adoptCards[1]], 3.3, .15);
/* ch1 adoption 4.6–13 */
goScreen(tl, 'adopt', 4.7); enter([adoptCards[2], adoptCards[4], adoptCards[5]], 4.9, .14);
tl.to(phone.rotation, { y: .12, duration: 2 }, 4.7);
sweep({ x: -1.6, y: 4.6, z: 14.2, lx: 0, ly: 4, lz: 0 }, 4.6, 3.4);
const sel = adoptCards[4];
tl.to(sel.position, { x: 1.3, y: 3.7, z: 3.4, duration: 1.6 }, 8.2); tl.to(sel.rotation, { y: -.22, duration: 1.6 }, 8.2); tl.to(sel.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 1.6 }, 8.2);
tl.to(phone.position, { x: -1.6, duration: 1.6 }, 8.2);
goScreen(tl, 'profile', 8.5);
sweep({ x: .9, y: 4, z: 11.5, lx: .9, ly: 3.8, lz: 2 }, 8.2, 3.8);
/* ch2 donations 13–21 */
leave(adoptCards, 12.6);
tl.to(phone.position, { x: -1.4, y: 3.9, z: 0, duration: 1.6 }, 12.9); tl.to(phone.rotation, { y: .32, duration: 1.6 }, 12.9);
goScreen(tl, 'donate', 13.2); tl.fromTo(SC, { p: 0 }, { p: 1, duration: 3.6, ease: 'power2.inOut', immediateRender: false }, 13.8);
enter(donCards, 13.3, .18, { y: -1, s: .9 }); donCards.forEach((c) => tl.fromTo(c.userData, { p: 0 }, { p: 1, duration: 3.4, ease: 'power2.inOut', onUpdate: () => c.userData.redraw(c.userData.p), immediateRender: false }, 13.9));
sweep({ x: 3.4, y: 4.8, z: 13.6, lx: 2.2, ly: 3.8, lz: 0 }, 12.8, 4);
goScreen(tl, 'reports', 17.2); tl.fromTo(SC, { p: 0 }, { p: 1, duration: 2.6, ease: 'none', immediateRender: false }, 17.4);
enter(reportItems, 17.1, .22, { y: -.8, s: .8 });
sweep({ x: -.6, y: 4.4, z: 13.4, lx: -.4, ly: 3.8, lz: 0 }, 16.8, 3.4);
tl.fromTo(op(coin), { v: 0 }, { v: 1, duration: .6, immediateRender: false }, 18.9); tl.fromTo(coin.position, { y: 5.8 }, { y: 7.2, duration: 1.2, ease: 'back.out(1.6)', immediateRender: false }, 18.9);
tl.fromTo(coin.userData.c, { p: 0 }, { p: 1, duration: .8, ease: 'power2.out', onUpdate: () => drawCheck(coin.userData.c.p), immediateRender: false }, 19.5);
tl.to(rim, { intensity: 60, duration: .6, yoyo: true, repeat: 1 }, 19.5);
/* ch3 volunteering 21–29 */
leave([...donCards, ...reportItems, coin], 20.6);
tl.to(phone.position, { x: 2.2, y: 3.9, z: 2.4, duration: 1.8 }, 20.8); tl.to(phone.rotation, { y: -.55, duration: 1.8 }, 20.8);
goScreen(tl, 'map', 21.1); tl.fromTo(SC, { p: 0 }, { p: 1, duration: 2.6, ease: 'none', immediateRender: false }, 21.4);
tl.fromTo(op(mapMesh), { v: 0 }, { v: 1, duration: 1, immediateRender: false }, 21);
tl.fromTo(mapState, { p: 0 }, { p: 1, duration: 2.4, ease: 'none', onUpdate: redrawMap, immediateRender: false }, 21.4);
pins.forEach((pn, i) => tl.fromTo(pn.scale, { x: .001, y: .001, z: .001 }, { x: 1, y: 1, z: 1, duration: .7, ease: 'back.out(2.2)', immediateRender: false }, 21.6 + i * .22));
enter(volCards, 22.8, .2, { y: 1.2, s: .7 });
sweep({ x: -1, y: 10.5, z: 12.5, lx: -.5, ly: 1, lz: -2 }, 20.6, 2.6);
sweep({ x: -2.4, y: 7.5, z: 12.5, lx: -1, ly: 2, lz: -1 }, 23.4, 2.4);
leave(volCards, 25.4); tl.to(op(mapMesh), { v: .35, duration: 1 }, 25.4); pins.forEach((pn) => tl.to(pn.scale, { x: .001, y: .001, z: .001, duration: .5, ease: 'power2.in' }, 25.4));
goScreen(tl, 'verify', 25.6); tl.fromTo(SC, { p: 0 }, { p: 1, duration: 2.6, ease: 'none', immediateRender: false }, 25.9);
tl.to(phone.position, { x: .8, y: 3.9, z: 0, duration: 1.6 }, 25.4); tl.to(phone.rotation, { y: -.3, duration: 1.6 }, 25.4);
enter(docCards, 25.8, .25, { y: -1, s: .85 }); docCards.forEach((c, i) => tl.fromTo(c.userData, { p: 0 }, { p: 1, duration: .5, onUpdate: () => c.userData.redraw(c.userData.p), immediateRender: false }, 26.6 + i * .5));
sweep({ x: -1.5, y: 4.4, z: 13, lx: -1.6, ly: 3.7, lz: 0 }, 25.4, 3.4);
/* ch4 simulator 29–37 */
leave([...docCards, mapMesh], 28.7);
tl.to(phone.position, { x: 0, y: 3.3, z: .6, duration: 1.6 }, 28.9); tl.to(phone.rotation, { y: 0, duration: 1.6 }, 28.9);
goScreen(tl, 'sim', 29.2); tl.fromTo(SC, { p: 0 }, { p: 1, duration: 6, ease: 'none', immediateRender: false }, 29.6);
simCards.forEach((c, i) => { enter([c], 29.6 + i * 1.9, 0, { y: -1, s: .8 }); tl.fromTo(c.userData, { p: 0 }, { p: 1, duration: 1.3, onUpdate: () => c.userData.redraw(c.userData.p), immediateRender: false }, 30.1 + i * 1.9); tl.fromTo(links[i].userData, { d: 0 }, { d: 1, duration: 1, onUpdate: () => links[i].geometry.setDrawRange(0, Math.floor(links[i].userData.n * links[i].userData.d)), immediateRender: false }, 30.3 + i * 1.9); });
sweep({ x: 0, y: 5.6, z: 17, lx: 0, ly: 5.3, lz: -.5 }, 28.9, 3); sweep({ x: 1.2, y: 5.2, z: 15.5, lx: 0, ly: 5, lz: -.5 }, 32, 5);
/* ch5 QR 37–41.7 */
leave([...simCards], 36.6); links.forEach((l) => tl.to(l.userData, { d: 0, duration: .5, onUpdate: () => l.geometry.setDrawRange(0, Math.floor(l.userData.n * l.userData.d)) }, 36.6));
tl.fromTo(op(posterG), { v: 0 }, { v: 1, duration: .9, immediateRender: false }, 36.9);
tl.to(phone.position, { x: 1.2, y: 3.8, z: .6, duration: 1.8 }, 37.1); tl.to(phone.rotation, { y: -.42, x: .04, duration: 1.8 }, 37.1);
goScreen(tl, 'scan', 37.3); tl.fromTo(SC, { p: 0 }, { p: 1, duration: 2, ease: 'none', immediateRender: false }, 37.6);
tl.fromTo(ctl, { scanY: 0 }, { scanY: 1, duration: 1.3, ease: 'sine.inOut', repeat: 1, yoyo: true, immediateRender: false }, 38.3);
tl.fromTo(op(scanCard), { v: 0 }, { v: 1, duration: .5, immediateRender: false }, 40.1); tl.fromTo(scanCard.position, { x: .85, y: -1.4, z: .2 }, { x: -.2, y: .3, z: 1.6, duration: 1.3, ease: 'expo.out', immediateRender: false }, 40.1); tl.fromTo(scanCard.scale, { x: .3, y: .3, z: .3 }, { x: 1, y: 1, z: 1, duration: 1.3, ease: 'expo.out', immediateRender: false }, 40.1);
goScreen(tl, 'scanned', 40.2);
sweep({ x: 1.2, y: 4.4, z: 14.2, lx: -.6, ly: 3.8, lz: 0 }, 36.8, 2.4); sweep({ x: 1.8, y: 4.2, z: 13, lx: -.2, ly: 3.9, lz: .4 }, 39.4, 2.2);
/* ch6 final 41.7–46 */
leave([posterG, scanCard], 41.4);
tl.to(phone.position, { x: 0, y: 4, z: 0, duration: 1.8 }, 41.6); tl.to(phone.rotation, { x: 0, y: 0, duration: 1.8 }, 41.6);
goScreen(tl, 'final', 41.8);
tl.fromTo(ctl, { orbit: 0 }, { orbit: 1, duration: 4.3, ease: 'power2.out', immediateRender: false }, 41.7);
ecoCards.forEach((c, i) => tl.fromTo(op(c), { v: 0 }, { v: 1, duration: .6, immediateRender: false }, 41.9 + i * .1));
tl.to(ctl, { shafts: .12, duration: 2 }, 41.7);
sweep({ x: 0, y: 4.6, z: 16.5, lx: 0, ly: 4.1, lz: 0 }, 41.6, 4.4);
CH.slice(0, 7).forEach((t0, i) => tl.call(() => setCaption(i), null, t0 + (i ? .05 : .2)));
tl.call(() => { hero.classList.add('hx-done'); }, null, 46);
tl.eventCallback('onUpdate', () => { const t = tl.time(); $('#hxBar').style.transform = `scaleX(${t / 46})`; });

/* ---------- frame loop ---------- */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => { pointer.tx = e.clientX / innerWidth - .5; pointer.ty = e.clientY / innerHeight - .5; }, { passive: true });
let visible = true, raf = 0, last = performance.now(), slow = 0;
function frame(now) {
  raf = 0; if (!visible) return;
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (dt > .045) { if (++slow > 40 && DPR > 1) { DPR = Math.max(1, DPR - .25); renderer.setPixelRatio(DPR); resize(); slow = 0; } if (slow > 80) bokeh.enabled = false; } else slow = Math.max(0, slow - 1);
  const t = tl.time(), g = now / 1000;
  pointer.x += (pointer.tx - pointer.x) * .05; pointer.y += (pointer.ty - pointer.y) * .05;
  const asp = hero.clientWidth / hero.clientHeight, dm = asp < 0.9 ? 2.05 : asp < 1.15 ? 1.3 : 1;
  camera.position.set(cam.lx + (cam.x - cam.lx) * dm + pointer.x * .8, cam.ly + (cam.y - cam.ly) * dm - pointer.y * .5, cam.lz + (cam.z - cam.lz) * dm); camera.lookAt(cam.lx, cam.ly, cam.lz);
  logoPts.material.uniforms.uP.value = ctl.logo; logoPts.material.uniforms.uF.value = ctl.logoFade; logoPts.material.uniforms.uT.value = g; logoPts.visible = ctl.logoFade > .01;
  dustPts.material.uniforms.uT.value = g;
  shafts.children.forEach((m) => { m.material.opacity = ctl.shafts * (.7 + .3 * Math.sin(g * .4 + m.userData.k)); });
  phone.position.y += Math.sin(g * 1.1) * .0009; phone.rotation.z = Math.sin(g * .7) * .015;
  [adopt, donate, sim, vol].forEach((grp) => grp.children.forEach((c, i) => { if (c.visible && c.userData.T) c.rotation.z = Math.sin(g * .8 + i) * .012; }));
  volCards.forEach((c, i) => { if (c.visible) c.position.y = c.userData.base.y + Math.sin(g * 1.2 + i) * .08; });
  coin.rotation.y = Math.sin(g * .9) * .35;
  scanLine.position.y = -2.08 + ctl.scanY * 1.15; scanLine.visible = posterG.visible && t > 38.2 && t < 40.4;
  ecoCards.forEach((c, i) => { const a = i / 6 * Math.PI * 2 + g * .12 * ctl.orbit + (1 - ctl.orbit) * 1.2; const r = 3 + 0.9 * ctl.orbit; c.position.set(Math.cos(a) * r, 4.1 + Math.sin(a) * r * .62, Math.sin(a) * 1.4 - .5); c.rotation.y = -Math.cos(a) * .25; });
  paws.children.forEach((m, i) => { const st = 5 + i * .55; m.material.opacity = Math.max(0, Math.min(1, (t - st) * 2)) * Math.max(0, Math.min(1, (st + 6 - t) * .8)) * .16; });
  mixers.forEach((m) => m.update(dt));
  pickScreen(t); drawScreen();
  if (bokeh.enabled) { const d = camera.position.distanceTo(phone.position); bokeh.uniforms.focus.value = d; }
  composer.render();
  if (!raf && !STILL) raf = requestAnimationFrame(frame);
}
function resize() {
  const w = hero.clientWidth, h = hero.clientHeight; renderer.setSize(w, h, false); composer.setSize(w, h); bloom.resolution.set(w, h);
  const a = w / h; let fw = w, fh = h;
  if (a > 1.15) fw = w * 1.42; else if (a < 0.9) fh = h * 1.35; else fw = w * 1.2;
  camera.aspect = fw / fh; camera.fov = a < 0.9 ? 40 : a < 1.15 ? 38 : 34; camera.setViewOffset(fw, fh, 0, a < 0.9 ? fh - h : 0, w, h); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(hero); resize();
new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) { last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); if (!tl.isActive() && !hero.classList.contains('hx-paused') && tl.time() < 46 && !reduce) tl.play(); } else tl.pause(); }, { threshold: .05 }).observe(hero);
document.addEventListener('visibilitychange', () => { if (document.hidden) tl.pause(); else if (visible && !hero.classList.contains('hx-paused') && tl.time() < 46 && !reduce) tl.play(); });

/* ---------- interaction: clickable cards ---------- */
const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
const clickables = () => [...adoptCards, ...donCards, ...reportItems, ...volCards, ...docCards, ...simCards, ...ecoCards, scanCard].filter((c) => c.visible && (c.userData.op ?? 1) > .5);
const pick = (e) => { const r = canvas.getBoundingClientRect(); mv.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(mv, camera); const hit = ray.intersectObjects(clickables(), true)[0]; if (!hit) return null; let o = hit.object; while (o && !o.userData.draw) o = o.parent; return o; };
hero.addEventListener('pointermove', (e) => { if (e.target !== canvas) return; hero.style.cursor = pick(e) ? 'pointer' : ''; });
canvas.addEventListener('click', (e) => { const o = pick(e); if (!o) return; if (o.userData.pet) { P.openPet && P.openPet(o.userData.pet); return; } const l = o.userData.link; if (l && l.startsWith('#')) document.querySelector(l)?.scrollIntoView({ behavior: 'smooth' }); });

/* ---------- controls ---------- */
const chapBtns = $('#hxChapters');
const renderChapters = () => { chapBtns.innerHTML = CH.slice(0, 7).map((t0, i) => `<button data-i="${i}">${P.t('hx_n' + i)}</button>`).join(''); };
renderChapters();
chapBtns.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; const i = +b.dataset.i; tl.seek(CH[i] + (i ? .9 : 0), false); setCaption(i, true); if (!hero.classList.contains('hx-paused')) tl.play(); hero.classList.remove('hx-done'); });
$('#hxReplay').addEventListener('click', () => { hero.classList.remove('hx-done', 'hx-paused'); tl.restart(); setCaption(0, true); });
$('#hxPause').addEventListener('click', () => { const p = hero.classList.toggle('hx-paused'); p ? tl.pause() : tl.play(); $('#hxPause').textContent = P.t(p ? 'hx_play' : 'hx_pause'); });
$('#hxSound').addEventListener('click', () => { document.getElementById('sound').click(); $('#hxSound').setAttribute('aria-pressed', document.getElementById('sound').getAttribute('aria-pressed')); });
document.addEventListener('pc:lang', () => { renderChapters(); [...adoptCards, ...donCards, ...reportItems, ...volCards, ...docCards, ...simCards, ...ecoCards, scanCard].forEach((c) => c.userData.redraw()); const i = CH.findIndex((x, k) => tl.time() >= x && tl.time() < CH[k + 1]); setCaption(i < 0 ? 6 : i, true); $('#hxPause').textContent = P.t(hero.classList.contains('hx-paused') ? 'hx_play' : 'hx_pause'); $('#hxReplay').textContent = P.t('hx_replay'); });
$('#hxReplay').textContent = P.t('hx_replay'); $('#hxPause').textContent = P.t('hx_pause');

/* ---------- start ---------- */
hero.classList.add('hx-ready');
if (reduce) { tl.seek(45.9, false); setCaption(6, true); hero.classList.add('hx-done'); }
else { setCaption(0, true); if (STILL) tl.pause(0); else tl.play(0); }
raf = requestAnimationFrame(frame);
window.PCHero = { tl, seek: (t) => { tl.seek(t, false); }, renderOnce: () => { const t0 = performance.now(); frame(performance.now()); return performance.now() - t0; } };
addEventListener('pagehide', () => { cancelAnimationFrame(raf); tl.kill(); disposables.forEach((t) => t.dispose()); renderer.dispose(); });
