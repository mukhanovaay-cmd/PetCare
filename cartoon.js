{
/* «Дорога домой» — мультфильм. Персонаж с ригом (ноги, хвост, уши, глаза),
   5 сцен-декораций, камера едет за питомцем, anime.js для прыжков и реакций. */
const P = window.PCapp, A = window.anime || null;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = 1000, G = 430;
const shade = (h, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
const rnd = (() => { let s = 7; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();

/* ---------- персонаж ---------- */
const rig = (p) => {
  const a = p.accent, d = shade(a, 0.8), cat = p.kind === 'cat';
  const tail = cat ? 'M-46 -52q-44 -6 -34 -62' : 'M-46 -56q-26 -12 -22 -42';
  const earB = cat ? `<path d="M-22 -14L-16 -48L4 -26Z" fill="${d}"/>` : `<ellipse cx="-14" cy="-14" rx="11" ry="21" fill="${d}" transform="rotate(22 -14 -14)"/>`;
  const earF = cat ? `<path d="M0 -22L12 -54L28 -18Z" fill="${a}"/><path d="M7 -26L13 -44L21 -24Z" fill="#F6A5B8"/>` : `<ellipse cx="-4" cy="-12" rx="12" ry="23" fill="${a}" transform="rotate(-8 -4 -12)"/>`;
  return `<g class="squash" id="sq"><g class="bob">
    <path class="tail" d="${tail}" stroke="${a}" stroke-width="${cat ? 9 : 12}" fill="none" stroke-linecap="round"/>
    <rect class="leg l3" x="-40" y="-36" width="15" height="38" rx="7.5" fill="${d}"/>
    <rect class="leg l2" x="24" y="-36" width="15" height="38" rx="7.5" fill="${d}"/>
    <ellipse cx="0" cy="-48" rx="54" ry="31" fill="${a}"/>
    <ellipse cx="8" cy="-35" rx="31" ry="13" fill="#FFFDF8" opacity=".92"/>
    <rect class="leg l4" x="-28" y="-32" width="16" height="34" rx="8" fill="${a}"/>
    <rect class="leg l1" x="34" y="-32" width="16" height="34" rx="8" fill="${a}"/>
    <g class="bandage"><rect x="32" y="-20" width="20" height="11" rx="4" fill="#fff" stroke="#F27C94" stroke-width="2"/><path d="M42 -18v7M38.5 -14.5h7" stroke="#F27C94" stroke-width="2"/></g>
    <g transform="translate(48 -84)"><g class="head">
      <g class="ear-b">${earB}</g>
      <circle r="32" fill="${cat ? a : '#FFFDF8'}"/>
      ${cat ? `<g class="ear-f">${earF}</g>` : ''}
      <ellipse cx="25" cy="10" rx="${cat ? 14 : 18}" ry="${cat ? 11 : 13}" fill="#FFFDF8"/>
      <ellipse cx="${cat ? 34 : 40}" cy="${cat ? 6 : 4}" rx="${cat ? 4.5 : 6.5}" ry="${cat ? 3.5 : 5}" fill="${cat ? '#F27C94' : '#1E2A2B'}"/>
      <g class="eye"><ellipse cx="11" cy="-6" rx="5.5" ry="7" fill="#1E2A2B"/><circle cx="13" cy="-9" r="2.2" fill="#fff"/></g>
      <path class="m-happy" d="M21 18q8 9 17 0" stroke="#1E2A2B" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path class="m-sad" d="M21 22q8 -7 17 0" stroke="#1E2A2B" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path class="brow" d="M3 -18l13 5" stroke="#1E2A2B" stroke-width="2.6" stroke-linecap="round"/>
      <path class="tear" d="M14 3q-3 6 0 9q3 -3 0 -9z" fill="#E6E6FA"/>
      <circle cx="4" cy="13" r="5.5" fill="#F6A5B8" opacity=".6"/>
      ${cat ? '<path d="M32 14h15M32 18l13 5" stroke="#1E2A2B" stroke-width="1.5" opacity=".45" stroke-linecap="round"/>' : `<g class="ear-f">${earF}</g>`}
    </g></g>
  </g></g>`;
};

/* ---------- люди ---------- */
const person = (x, o = {}) => {
  const { shirt = '#E6E6FA', hair = '#3B2A22', skin = '#F3D3B8', pants = '#4A5755', kneel = false, coat = false, s = 1, cls = '' } = o;
  const legs = kneel ? `<rect x="-22" y="-44" width="44" height="16" rx="8" fill="${pants}"/><rect x="14" y="-44" width="14" height="44" rx="7" fill="${pants}"/>` : `<rect x="-16" y="-70" width="14" height="70" rx="7" fill="${pants}"/><rect x="2" y="-70" width="14" height="70" rx="7" fill="${pants}"/>`;
  const top = kneel ? -44 : -70;
  return `<g transform="translate(${x} ${G}) scale(${s})" class="${cls}">${legs}
    <rect x="-24" y="${top - 70}" width="48" height="78" rx="20" fill="${coat ? '#FFFFFF' : shirt}" ${coat ? 'stroke="#D9D2C4" stroke-width="2"' : ''}/>
    ${coat ? `<path d="M-8 ${top - 60}q8 30 0 42" stroke="#077F7B" stroke-width="3" fill="none"/><circle cx="-8" cy="${top - 16}" r="5" fill="#077F7B"/>` : ''}
    <g class="arm-l"><rect x="-30" y="${top - 62}" width="13" height="52" rx="6.5" fill="${coat ? '#FFFFFF' : shirt}" stroke="${coat ? '#D9D2C4' : 'none'}"/></g>
    <g class="arm-r"><rect x="17" y="${top - 62}" width="13" height="52" rx="6.5" fill="${coat ? '#FFFFFF' : shirt}" stroke="${coat ? '#D9D2C4' : 'none'}"/><circle cx="23.5" cy="${top - 10}" r="7" fill="${skin}"/></g>
    <circle cx="0" cy="${top - 92}" r="26" fill="${skin}"/>
    <path d="M-27 ${top - 94}q2 -32 27 -30q27 -2 28 30q-10 -14 -28 -14q-18 0 -27 14z" fill="${hair}"/>
    <circle cx="-8" cy="${top - 90}" r="2.6" fill="#1E2A2B"/><circle cx="9" cy="${top - 90}" r="2.6" fill="#1E2A2B"/>
    <path d="M-7 ${top - 80}q7 6 14 0" stroke="#1E2A2B" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="-15" cy="${top - 82}" r="4" fill="#F6A5B8" opacity=".55"/><circle cx="15" cy="${top - 82}" r="4" fill="#F6A5B8" opacity=".55"/></g>`;
};
const heart = (x, y, c = '#F27C94', s = 1, cls = '') => `<g transform="translate(${x} ${y}) scale(${s})"><path class="${cls}" d="M0 6c-8 -10 -22 -2 -14 10l14 12 14 -12c8 -12 -6 -20 -14 -10z" fill="${c}"/></g>`;
const cloud = (x, y, s = 1, o = 1) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="46" ry="20" fill="#fff"/><ellipse cx="26" cy="-12" rx="28" ry="18" fill="#fff"/><ellipse cx="-24" cy="-6" rx="22" ry="14" fill="#fff"/></g>`;
const ground = (c, c2) => `<rect y="${G}" width="${W}" height="${520 - G}" fill="${c}"/><rect y="${G}" width="${W}" height="8" fill="${c2}"/>`;

/* ---------- сцены ---------- */
const SC = {
  street: () => {
    let snow = ''; for (let i = 0; i < 46; i++) snow += `<circle class="snow" cx="${Math.round(rnd() * W)}" cy="-10" r="${(1.6 + rnd() * 2.6).toFixed(1)}" fill="#fff" style="animation-duration:${(4 + rnd() * 5).toFixed(1)}s;animation-delay:-${(rnd() * 8).toFixed(1)}s"/>`;
    let bld = ''; [[40, 170, 120], [180, 120, 150], [350, 200, 110], [480, 90, 140], [820, 150, 160]].forEach(([x, y, w]) => { bld += `<rect x="${x}" y="${y}" width="${w}" height="${G - y}" fill="#2B3654"/>`; for (let r = y + 24; r < G - 30; r += 44) for (let c = x + 18; c < x + w - 20; c += 36) bld += `<rect x="${c}" y="${r}" width="16" height="20" rx="3" fill="${rnd() > .55 ? '#FFDAB9' : '#3A4767'}" ${rnd() > .8 ? 'class="win-flick"' : ''}/>`; });
    return `<rect width="${W}" height="520" fill="url(#gNight)"/><circle cx="760" cy="86" r="34" fill="#FFFACD"/><circle cx="760" cy="86" r="60" fill="#FFFACD" opacity=".12"/>${bld}
      ${ground('#CDD6E6', '#E8EEF7')}<ellipse cx="560" cy="470" rx="90" ry="12" fill="#9FB3CF" opacity=".6"/>
      <g transform="translate(150 ${G})"><path d="M0 0v-70h120v70z" fill="#C9A27A"/><path d="M0 -70l-24 -26h120l24 26z" fill="#DDB98E"/><path d="M30 -46h60" stroke="#A8845E" stroke-width="4"/></g>
      <rect x="690" y="190" width="12" height="${G - 190}" rx="4" fill="#1E2A2B"/><path d="M696 196q0 -26 40 -26" stroke="#1E2A2B" stroke-width="10" fill="none"/><rect x="722" y="168" width="34" height="18" rx="6" fill="#1E2A2B"/>
      <path class="flicker" d="M726 186L680 ${G}h136L752 186z" fill="#FFFACD" opacity=".22"/><g class="snowfall">${snow}</g>`;
  },
  caught: () => `<rect width="${W}" height="520" fill="url(#gDusk)"/>${cloud(200, 110, 1.2, .7)}${cloud(780, 80, .9, .6)}
      ${ground('#B9C2CF', '#D6DCE4')}<g opacity=".55">${[...Array(16)].map((_, i) => `<rect x="${20 + i * 62}" y="300" width="8" height="${G - 300}" fill="#7C8798"/>`).join('')}<rect x="0" y="320" width="${W}" height="6" fill="#7C8798"/><rect x="0" y="370" width="${W}" height="6" fill="#7C8798"/></g>
      <g transform="translate(560 ${G - 10})"><rect x="0" y="-130" width="330" height="120" rx="26" fill="#A7B1BF"/><rect x="230" y="-118" width="80" height="56" rx="12" fill="#DCE6F2"/><rect class="van-door" x="40" y="-112" width="150" height="96" rx="10" fill="#93A0B0" stroke="#7C8798" stroke-width="3"/><path d="M60 -98v70M80 -98v70M100 -98v70M120 -98v70M140 -98v70M160 -98v70" stroke="#7C8798" stroke-width="3"/>
      <circle cx="70" cy="-6" r="26" fill="#1E2A2B"/><circle cx="70" cy="-6" r="10" fill="#B9C2CF"/><circle cx="270" cy="-6" r="26" fill="#1E2A2B"/><circle cx="270" cy="-6" r="10" fill="#B9C2CF"/></g>`,
  rescue: () => `<rect width="${W}" height="520" fill="url(#gDay)"/><circle cx="860" cy="90" r="42" fill="#FFDAB9"/>${cloud(240, 100, 1.1)}${cloud(560, 70, .8)}
      ${ground('#A8DCCB', '#C9ECDF')}<g transform="translate(110 ${G})"><rect x="-8" y="-120" width="16" height="120" fill="#B98E6A"/><circle cx="0" cy="-150" r="56" fill="#0ABAB5"/><circle cx="-30" cy="-120" r="36" fill="#8ED8C8"/></g>
      <g transform="translate(900 ${G})"><rect x="-8" y="-100" width="16" height="100" fill="#B98E6A"/><circle cx="0" cy="-130" r="48" fill="#0ABAB5"/></g>
      ${person(650, { kneel: true, shirt: '#FFB6C1', hair: '#5A3A2A', cls: 'vol' })}${heart(600, 220, '#F27C94', 2.2, 'pop-heart')}`,
  treat: () => `<rect width="${W}" height="520" fill="#F0F0FC"/><rect y="0" width="${W}" height="70" fill="#D4E8F8"/>
      <g transform="translate(260 170)"><circle r="54" fill="#fff"/><path d="M-12 -34h24v22h22v24h-22v22h-24v-22h-22v-24h22z" fill="#0ABAB5"/></g>
      <rect x="820" y="160" width="130" height="${G - 160}" rx="12" fill="#fff" stroke="#C9DCEC" stroke-width="3"/><path d="M820 250h130M820 330h130" stroke="#C9DCEC" stroke-width="3"/>
      ${ground('#F1EEE8', '#E2DDD3')}${person(680, { coat: true, hair: '#2B2B2B', cls: 'vet' })}
      <path d="M672 ${G - 140}q-24 30 6 56" stroke="#1E2A2B" stroke-width="3" fill="none"/><circle cx="680" cy="${G - 82}" r="7" fill="#E6E6FA"/>
      <g class="spark">${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(${400 + i * 34} ${250 - (i % 2) * 40})"><path d="M0 -10l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFDAB9"/></g>`).join('')}</g>`,
  shelter: () => `<rect width="${W}" height="520" fill="url(#gDay)"/><circle cx="140" cy="90" r="40" fill="#FFDAB9"/>${cloud(500, 90, 1)}${cloud(800, 130, .7)}
      ${ground('#A8DCCB', '#C9ECDF')}<g>${[...Array(18)].map((_, i) => `<rect x="${10 + i * 56}" y="250" width="10" height="${G - 250}" rx="4" fill="#E2DDD3"/>`).join('')}<rect x="0" y="262" width="${W}" height="8" fill="#E2DDD3"/></g>
      <g transform="translate(720 ${G})"><path d="M-90 0v-110h180v110z" fill="#FFFDF8"/><path d="M-110 -104l110 -70 110 70z" fill="#0ABAB5"/><path d="M-30 0v-56a30 30 0 0 1 60 0v56z" fill="#4A5755"/></g>
      <g transform="translate(860 ${G - 8})" opacity=".8"><ellipse cx="0" cy="0" rx="46" ry="20" fill="#C9B8A6"/><circle cx="36" cy="-10" r="18" fill="#D8C9B8"/><text class="zzz" x="50" y="-40" font-family="Unbounded,sans-serif" font-size="20" fill="#4A5755">z z</text></g>
      <g transform="translate(560 ${G})"><path d="M-40 -18h80l-10 18h-60z" fill="#FFB6C1"/><g class="food"><circle cx="-14" cy="-22" r="7" fill="#B98E6A"/><circle cx="0" cy="-25" r="7" fill="#C9A27A"/><circle cx="14" cy="-22" r="7" fill="#B98E6A"/></g></g>`,
  now: () => `<rect width="${W}" height="520" fill="url(#gSunset)"/><circle cx="820" cy="300" r="70" fill="#F8C87A" opacity=".85"/>${cloud(240, 110, 1, .8)}
      ${ground('#C9B8D8', '#DDD0E6')}<g transform="translate(600 ${G})"><rect x="0" y="-240" width="34" height="240" fill="#B9A6C9"/><rect x="250" y="-240" width="34" height="240" fill="#B9A6C9"/><path d="M34 -210q108 -50 216 0" stroke="#8F7AA8" stroke-width="10" fill="none"/>${[...Array(9)].map((_, i) => `<rect x="${46 + i * 24}" y="-190" width="8" height="190" rx="4" fill="#8F7AA8"/>`).join('')}</g>
      ${[...Array(10)].map((_, i) => `<ellipse class="leaf" cx="${80 + i * 92}" cy="-10" rx="7" ry="4" fill="${['#FFB6C1', '#FFDAB9', '#E9A77A'][i % 3]}" style="animation-duration:${6 + (i % 4)}s;animation-delay:-${i * 0.9}s"/>`).join('')}
      <g transform="translate(330 150)"><g class="think"><circle cx="40" cy="120" r="8" fill="#fff"/><circle cx="60" cy="96" r="12" fill="#fff"/><rect x="40" y="-6" width="150" height="92" rx="40" fill="#fff"/><g transform="translate(115 48)"><path d="M-30 18v-26l30 -22 30 22v26z" fill="#FFB6C1"/><path d="M-8 18v-14h16v14" fill="#FFFDF8"/>${heart(0, -40, '#F27C94', .6)}</g></g></g>`,
  home: () => `<rect width="${W}" height="520" fill="url(#gHome)"/>${cloud(160, 80, 1)}${cloud(860, 120, .8)}
      <g class="rainbow" transform="translate(700 ${G})">${['#FFB6C1', '#FFDAB9', '#0ABAB5', '#E6E6FA'].map((c, i) => `<path class="arc2" d="M${-300 + i * 22} 0a${300 - i * 22} ${300 - i * 22} 0 0 1 ${600 - i * 44} 0" fill="none" stroke="${c}" stroke-width="20"/>`).join('')}</g>
      ${ground('#A8DCCB', '#C9ECDF')}<g transform="translate(870 ${G})"><path d="M-120 0v-160h240v160z" fill="#FFFDF8"/><path d="M-145 -152l145 -96 145 96z" fill="#0ABAB5"/><path d="M-30 0v-80a30 30 0 0 1 60 0v80z" fill="#FFB6C1"/><rect class="win" x="-96" y="-130" width="46" height="40" rx="8" fill="#E2DDD3"/><rect class="win" x="50" y="-130" width="46" height="40" rx="8" fill="#E2DDD3"/></g>
      ${[...Array(8)].map((_, i) => `<g transform="translate(${40 + i * 70} ${G + 20})"><circle r="7" fill="${['#FFB6C1', '#FFDAB9', '#E6E6FA'][i % 3]}"/><circle r="3" fill="#fff"/></g>`).join('')}
      ${person(650, { shirt: '#FFDAB9', hair: '#2B1E16', cls: 'fam fam1' })}${person(735, { shirt: '#E6E6FA', hair: '#6B4A2E', s: .78, cls: 'fam fam2' })}`
};
const DEFS = `<defs><linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#222C47"/><stop offset="1" stop-color="#4E5D86"/></linearGradient>
  <linearGradient id="gDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E8AA6"/><stop offset="1" stop-color="#E2C3C0"/></linearGradient>
  <linearGradient id="gDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6E6FA"/><stop offset="1" stop-color="#EAF6FF"/></linearGradient>
  <linearGradient id="gSunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6B9A8"/><stop offset="1" stop-color="#FFE4E9"/></linearGradient>
  <linearGradient id="gHome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD4F7"/><stop offset="1" stop-color="#FFFACD"/></linearGradient>
  <linearGradient id="fadeR" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient></defs>`;
const MOOD = { street: 'sad cold', caught: 'sad', rescue: 'happy', treat: 'happy', shelter: 'happy', now: 'neutral', home: 'happy' };

/* ---------- состояние ---------- */
const C = { pet: 'baron', st: 0, run: 0, x: 420, done: {}, started: false, scenes: [] };
const stage = $('#toon'), world = () => $('#world'), petG = () => $('#pet'), rigG = () => $('#rig');
const posOf = (i) => i * W + 420;
const pet = () => PC.PETS.find((p) => p.id === C.pet);
const cam = () => { const c = Math.max(0, Math.min(4 * W, C.x - 420)); world().setAttribute('transform', `translate(${-c} 0)`); petG().setAttribute('transform', `translate(${C.x} 0)`); };
const setMood = (m, walking) => { rigG().setAttribute('class', 'rig ' + m + (walking ? ' walking' : '')); };
const build = () => {
  const p = pet(), keys = PC.JOURNEY[p.id].stops.map((s) => s[0]).concat('home');
  C.scenes = keys;
  $('#toonSvg').innerHTML = DEFS + `<g id="world">${keys.map((k, i) => `<g class="scene sc-${k}" data-s="${i}" transform="translate(${i * W} 0)"><svg width="${W}" height="520" overflow="hidden">${SC[k]()}</svg></g>`).join('')}
    <g id="pet" transform="translate(${C.x} 0)"><g transform="translate(0 ${G}) scale(1.25)"><g id="rig" class="rig">${rig(p)}</g></g></g><g id="fx"></g></g>`;
  $('#toonSvg').setAttribute('aria-label', P.t('jr_h') + ': ' + P.L(p.name));
};
const typeSub = (title, text) => {
  const el = $('#toonSub'); el.innerHTML = `<b></b><span></span>`; $('b', el).textContent = title;
  const sp = $('span', el); clearInterval(C.typer);
  if (reduce) { sp.textContent = text; return; }
  let i = 0; C.typer = setInterval(() => { sp.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(C.typer); }, 22);
};
const steps = () => { $('#toonSteps').innerHTML = C.scenes.map((k, i) => `<li><button data-i="${i}" ${i === C.st ? 'aria-current="step"' : ''}>${i + 1}. ${P.esc(P.L(PC.STOPNAMES[k]))}</button></li>`).join(''); };
const sceneEl = (i) => $(`#world .scene[data-s="${i}"]`);
const anim = (o) => A && !reduce ? A(o) : null;
const react = (i) => {
  const k = C.scenes[i], s = sceneEl(i); if (!s) return;
  if (!A || reduce) { $$('.think, .pop-heart', s).forEach((e) => (e.style.opacity = 1)); if (k === 'treat') $('#rig .bandage').classList.add('on'); }
  if (k === 'caught') anim({ targets: $('.van-door', s), translateX: [0, 120], duration: 1200, easing: 'cubicBezier(.65,0,.35,1)' });
  if (k === 'rescue') { anim({ targets: $('.vol .arm-l', s), rotate: [0, 70], duration: 700, easing: 'cubicBezier(.16,1,.3,1)', direction: 'alternate', loop: 2 }); anim({ targets: $('.pop-heart', s), scale: [0, 2.2], opacity: [0, 1], translateY: [0, -30], duration: 900, delay: 600, easing: 'spring(1, 80, 10, 0)' }); }
  if (k === 'treat') { $('#rig .bandage').classList.add('on'); anim({ targets: $$('.spark path', s), scale: [0, 1.4, 1], opacity: [0, 1, 0], delay: A ? A.stagger(120) : 0, duration: 1100, loop: 2, easing: 'easeOutQuad' }); anim({ targets: $('.vet .arm-r', s), rotate: [0, -50], duration: 600, direction: 'alternate', loop: 2, easing: 'easeInOutSine' }); }
  if (k === 'shelter') { anim({ targets: $$('.food circle', s), translateY: [-60, 0], opacity: [0, 1], delay: A ? A.stagger(140) : 0, duration: 800, easing: 'easeOutBounce' }); }
  if (k === 'now') anim({ targets: $('.think', s), opacity: [0, 1], scale: [0.6, 1], duration: 900, delay: 400, easing: 'cubicBezier(.16,1,.3,1)' });
};
const arrive = (i) => {
  C.st = i; const k = C.scenes[i];
  setMood(MOOD[k]); steps();
  if (i < 4) typeSub(P.L(PC.STOPNAMES[k]), P.L(PC.JOURNEY[C.pet].stops[i][1]));
  react(i);
  if (k === 'now') setTimeout(() => { if (C.st === 3) showCta(); }, reduce ? 0 : 1600); else hideCta();
};
const walk = (to, dur, mood) => new Promise((res) => {
  const from = C.x; setMood(mood, true);
  if (reduce || !A) { C.x = to; cam(); return res(); }
  const o = { x: from }; A.remove(o);
  A({ targets: o, x: to, duration: dur, easing: 'easeInOutSine', update: () => { C.x = o.x; cam(); }, complete: res });
});
const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
const showCta = () => {
  const p = pet(), sh = P.shelter(p.sh);
  $('#toonCta').innerHTML = `<h3>${P.t('jr_home')}</h3><p>${P.esc(P.t('jr_why', { name: P.L(p.name) }))}</p><div class="tags">${sh.needs.map((n) => `<span>${P.esc(P.L(n))}</span>`).join('')}</div><button class="btn" id="toonGo">${P.t('jr_cta')}</button>`;
  $('#toonCta').hidden = false; anim({ targets: '#toonCta', opacity: [0, 1], translateY: [20, 0], duration: 600, easing: 'cubicBezier(.16,1,.3,1)' });
};
const hideCta = () => { $('#toonCta').hidden = true; };
const showHelp = () => {
  const p = pet(), sh = P.shelter(p.sh), jr = PC.JOURNEY[p.id], f = jr.fund ? PC.FUNDS.find((x) => x.id === jr.fund) : null;
  $('#toonCta').innerHTML = `<h3>${P.esc(P.L(p.name))} 🏠</h3><p>${P.esc(P.t('jr_done', { name: P.L(p.name) }))}</p>
    <a class="btn" href="${P.igdm(sh.ig)}" target="_blank" rel="noopener" data-meet>${P.t('jr_msg')}</a>
    <a class="btn ghost" href="${f ? (sh.site || P.ig(sh.ig)) : P.ig(sh.ig)}" target="_blank" rel="noopener" ${f ? `data-fund="${f.id}"` : ''}>${f ? P.t('jr_fund') + ' · ' + Math.round(f.raised / f.goal * 100) + '%' : 'Instagram @' + P.esc(sh.ig)}</a>
    <a class="btn ghost" href="#volunteer" data-vsh="${sh.id}">${P.t('jr_vol')}</a>`;
  $('#toonCta').hidden = false; anim({ targets: '#toonCta', opacity: [0, 1], scale: [.92, 1], duration: 700, easing: 'spring(1, 90, 12, 0)' });
};
const burst = (x, y) => {
  const fx = $('#fx'); fx.innerHTML = [...Array(9)].map((_, i) => heart(x, y, ['#F27C94', '#FFB6C1', '#E6E6FA', '#FFDAB9'][i % 4], 1.1, 'b')).join('');
  anim({ targets: $$('#fx .b'), translateX: () => (A ? A.random(-140, 140) : 0), translateY: () => (A ? A.random(-220, -90) : 0), scale: [0.2, 1.4], opacity: [1, 0], duration: 1600, delay: A ? A.stagger(60) : 0, easing: 'cubicBezier(.16,1,.3,1)' });
};
const jump = () => anim({ targets: '#sq', keyframes: [
  { scaleY: .74, scaleX: 1.2, translateY: 0, duration: 180, easing: 'easeOutQuad' },
  { scaleY: 1.16, scaleX: .88, translateY: -120, duration: 360, easing: 'easeOutQuad' },
  { scaleY: 1.1, scaleX: .92, translateY: 0, duration: 320, easing: 'easeInQuad' },
  { scaleY: .8, scaleX: 1.16, duration: 120, easing: 'easeOutQuad' },
  { scaleY: 1, scaleX: 1, duration: 420, easing: 'spring(1, 80, 9, 0)' }] });

const play = async () => {
  const run = ++C.run; hideCta(); C.x = posOf(0); build(); cam(); arrive(0);
  for (let i = 1; i <= 3; i++) {
    await wait(3000); if (run !== C.run) return;
    await walk(posOf(i), 2800, MOOD[C.scenes[i - 1]] === 'sad cold' ? 'sad' : MOOD[C.scenes[i - 1]]); if (run !== C.run) return;
    arrive(i);
  }
};
const finish = async () => {
  const run = ++C.run; hideCta(); $('#toonSub').innerHTML = '';
  await walk(posOf(4), 2600, 'happy'); if (run !== C.run) return;
  arrive(4); typeSub(P.L(PC.STOPNAMES.home), P.t('jr_home_sub', { name: P.L(pet().name) }));
  const s = sceneEl(4);
  anim({ targets: $$('.fam .arm-l, .fam .arm-r', s), rotate: (el, i) => (i % 2 ? [0, -150] : [0, 150]), duration: 500, direction: 'alternate', loop: 4, easing: 'easeInOutSine' });
  await walk(4 * W + 500, 900, 'happy'); if (run !== C.run) return; setMood('happy');
  jump(); setTimeout(() => burst(C.x + 60, 260), reduce ? 0 : 400);
  $$('.win', s).forEach((w) => w.setAttribute('fill', '#FFDAB9'));
  if (A && !reduce) A({ targets: $$('.arc2', s), strokeDashoffset: [A.setDashoffset, 0], duration: 1600, delay: A.stagger(150), easing: 'cubicBezier(.65,0,.35,1)' }); else $$('.arc2', s).forEach((a) => a.style.opacity = 1);
  $('.rainbow', s).classList.add('on');
  C.done[C.pet] = true; P.confetti(); P.award('journey', 'jr-' + C.pet);
  setTimeout(showHelp, reduce ? 0 : 1400);
};
const goTo = async (i) => {
  if (i === 4 && !C.done[C.pet]) i = 3;
  const run = ++C.run; hideCta();
  await walk(posOf(i), 900, 'happy'); if (run !== C.run) return;
  if (i === 4) { arrive(4); typeSub(P.L(PC.STOPNAMES.home), P.t('jr_home_sub', { name: P.L(pet().name) })); showHelp(); } else arrive(i);
};
const pick = () => { $('#toonPick').innerHTML = PC.PETS.map((p) => `<button data-jp="${p.id}" aria-pressed="${C.pet === p.id}"><span style="background:${p.color}"><svg viewBox="-70 -130 160 140" width="44" height="44">${rig(p).replace('id="sq"', '')}</svg></span>${P.esc(P.L(p.name))}</button>`).join(''); };

$('#toonPick').addEventListener('click', (e) => { const b = e.target.closest('[data-jp]'); if (b) { C.pet = b.dataset.jp; pick(); play(); } });
$('#toonSteps').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) goTo(+b.dataset.i); });
$('#toonReplay').addEventListener('click', () => { C.done[C.pet] = false; play(); });
$('#toonCta').addEventListener('click', (e) => {
  if (e.target.closest('#toonGo')) finish();
  else if (e.target.closest('[data-meet]')) P.award('meet', 'meet-' + C.pet);
  else if (e.target.closest('[data-fund]')) P.award('fund', 'fund-' + e.target.closest('[data-fund]').dataset.fund);
  else if (e.target.closest('[data-vsh]')) P.pickShelter(e.target.closest('[data-vsh]').dataset.vsh);
});
const refreshLang = () => { pick(); steps(); const k = C.scenes[C.st]; if (k && C.st < 4) typeSub(P.L(PC.STOPNAMES[k]), P.L(PC.JOURNEY[C.pet].stops[C.st][1])); if (!$('#toonCta').hidden) (C.done[C.pet] && C.st === 4 ? showHelp() : showCta()); };
document.addEventListener('pc:lang', refreshLang);
pick(); C.x = posOf(0); build(); cam(); setMood('sad cold'); steps(); typeSub(P.L(PC.STOPNAMES[C.scenes[0]]), P.L(PC.JOURNEY[C.pet].stops[0][1]));
let vis = false;
new IntersectionObserver((es) => { vis = es[0].isIntersecting; stage.classList.toggle('paused', !vis); if (vis && !C.started) { C.started = true; play(); } }, { threshold: 0.3 }).observe(stage);
window.PCjourney = (id) => { const d = $('#petDlg'); if (d.open) d.close(); C.started = true; C.pet = id; pick(); play(); $('#journey').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
}
