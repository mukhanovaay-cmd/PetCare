{
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const LANGS = ['ru', 'kk', 'en'];
let lang = 'ru';
try { lang = localStorage.getItem('pc2-lang') || 'ru'; } catch (e) {}
if (lang === 'kz') lang = 'kk';
if (!LANGS.includes(lang)) lang = 'ru';
const li = () => LANGS.indexOf(lang);
const t = (k, vars) => { let s = (PC.T[k] || [k])[li()] || PC.T[k][0]; if (vars) for (const v in vars) s = s.split('{' + v + '}').join(vars[v]); return s; };
const L = (arr) => Array.isArray(arr) ? (arr[li()] ?? arr[0]) : arr;
const fmt = (n) => Math.round(n).toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU') + ' ₸';
const shelter = (id) => PC.SHELTERS.find((s) => s.id === id);
const ig = (h) => 'https://instagram.com/' + h;
const igdm = (h) => 'https://ig.me/m/' + h;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- buddy (растущий питомец) ---------- */
const buddy = (kind, stage, mood, accent, anim = true) => {
  const s = [0.7, 0.86, 1][stage], sad = mood === 'sad', e = [7.5, 6, 5.2][stage];
  const tail = kind === 'cat'
    ? (sad ? 'M108 132q26 8 30 22' : 'M108 128q32 -2 22 -36')
    : (sad ? 'M108 132q18 8 22 18' : 'M108 122q22 -6 20 -30');
  const ears = kind === 'cat'
    ? (sad ? `<path d="M46 72L44 38L68 56Z" fill="${accent}"/><path d="M114 72L116 38L92 56Z" fill="${accent}"/>`
           : `<path d="M48 66L52 28L74 50Z" fill="${accent}"/><path d="M112 66L108 28L86 50Z" fill="${accent}"/><path d="M54 54L56 38L66 48Z" fill="#F6A5B8" opacity=".7"/><path d="M106 54L104 38L94 48Z" fill="#F6A5B8" opacity=".7"/>`)
    : `<ellipse cx="48" cy="${sad ? 78 : 66}" rx="12" ry="24" transform="rotate(${sad ? 30 : 18} 48 66)" fill="${accent}"/><ellipse cx="112" cy="${sad ? 78 : 66}" rx="12" ry="24" transform="rotate(${sad ? -30 : -18} 112 66)" fill="${accent}"/>`;
  const eyes = sad
    ? `<ellipse cx="66" cy="76" rx="${e}" ry="${e * 0.7}" fill="#1E2A2B"/><ellipse cx="94" cy="76" rx="${e}" ry="${e * 0.7}" fill="#1E2A2B"/><path d="M57 64l13 5M103 64l-13 5" stroke="#1E2A2B" stroke-width="2.6" stroke-linecap="round"/>`
    : `<circle cx="66" cy="74" r="${e}" fill="#1E2A2B"/><circle cx="94" cy="74" r="${e}" fill="#1E2A2B"/><circle cx="${68 + e * 0.1}" cy="${72 - e * 0.2}" r="${e * 0.32}" fill="#fff"/><circle cx="${96 + e * 0.1}" cy="${72 - e * 0.2}" r="${e * 0.32}" fill="#fff"/>`;
  const nose = kind === 'cat' ? '<path d="M75 85h10l-5 5z" fill="#F27C94"/>' : '<ellipse cx="80" cy="86" rx="6.5" ry="4.5" fill="#1E2A2B"/>';
  const mouth = sad ? '<path d="M71 99q9 -7 18 0" stroke="#1E2A2B" stroke-width="2.4" fill="none" stroke-linecap="round"/>' : '<path d="M71 93q9 9 18 0" stroke="#1E2A2B" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  const whisk = kind === 'cat' ? '<path d="M60 90H44M60 95l-14 4M100 90h16M100 95l14 4" stroke="#1E2A2B" stroke-width="1.6" opacity=".4" stroke-linecap="round"/>' : '';
  const extra = stage === 0 ? `<path d="M74 40q6 -12 12 0" stroke="${accent}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : stage === 1 ? '<path d="M56 104q24 12 48 0l-4 11q-20 9 -40 0z" fill="#E6E6FA"/>'
    : '<rect x="56" y="102" width="48" height="8" rx="4" fill="#FFB6C1"/><circle cx="80" cy="115" r="5.5" fill="#FFDAB9" stroke="#F0B98C"/>';
  return `<g transform="translate(80 156) scale(${s}) translate(-80 -156)"><g class="${anim && !sad ? 'bounce' : ''}">
    <path class="${anim && !sad ? 'wag' : ''}" d="${tail}" stroke="${accent}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <ellipse cx="80" cy="124" rx="30" ry="25" fill="${accent}"/><ellipse cx="80" cy="131" rx="17" ry="14" fill="#FFFDF8"/>
    <ellipse cx="66" cy="148" rx="9" ry="6" fill="#FFFDF8"/><ellipse cx="94" cy="148" rx="9" ry="6" fill="#FFFDF8"/>
    ${kind === 'dog' ? ears : ''}<circle cx="80" cy="76" r="${[38, 35, 34][stage]}" fill="#FFFDF8"/>${kind === 'cat' ? ears + '<circle cx="80" cy="76" r="' + [38, 35, 34][stage] + '" fill="#FFFDF8"/>' : ''}
    ${eyes}${nose}${mouth}${whisk}<circle cx="56" cy="88" r="5" fill="#F6A5B8" opacity=".55"/><circle cx="104" cy="88" r="5" fill="#F6A5B8" opacity=".55"/>${extra}
  </g></g>`;
};
const buddySvg = (kind, stage, mood, accent, label, anim) => `<svg viewBox="0 0 160 160" role="img" aria-label="${esc(label || '')}">${buddy(kind, stage, mood, accent, anim)}</svg>`;

/* ---------- state ---------- */
const blank = () => ({ xp: 0, lvl: 0, badges: {}, once: {}, lastAct: null, streak: 0, kind: 'dog', liked: {}, offset: 0, aiCount: 0 });
let S = blank();
try { S = Object.assign(blank(), JSON.parse(localStorage.getItem('pc2') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('pc2', JSON.stringify(S)); } catch (e) {} };
const dayStr = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + S.offset + off); return d.toISOString().slice(0, 10); };
const diffDays = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
const gap = () => S.lastAct ? diffDays(S.lastAct, dayStr()) : null;
const mood = () => S.lastAct === null ? 'new' : gap() > 1 ? 'sad' : 'happy';
const lvlOf = (xp) => { let i = 0; PC.LEVELS.forEach((l, k) => { if (xp >= l.xp) i = k; }); return i; };
const stageOf = (lv) => lv === 0 ? 0 : lv <= 2 ? 1 : 2;
const buddyName = () => S.kind === 'cat' ? ['Пушок', 'Мамық', 'Fluff'][li()] : ['Бублик', 'Бублик', 'Bagel'][li()];
const showStreak = () => (gap() !== null && gap() <= 1) ? S.streak : 0;

/* ---------- sound (hopecore) ---------- */
const Snd = { ctx: null, on: false, master: null, timer: null, step: 0 };
const CHORDS = [[130.81, 261.63, 329.63, 392.0, 493.88], [110, 220, 261.63, 329.63, 392.0], [87.31, 174.61, 220, 261.63, 329.63], [98, 196, 246.94, 293.66, 440]];
const note = (f, when, dur, type, vol, dest) => {
  const c = Snd.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = f; o.connect(g); g.connect(dest || Snd.master);
  g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + (type === 'sine' && dur < 1.5 ? 0.02 : 1.2));
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur); o.start(when); o.stop(when + dur + 0.1);
};
const startSound = () => {
  if (!Snd.ctx) {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
    Snd.ctx = new C(); Snd.master = Snd.ctx.createGain(); Snd.master.gain.value = 0;
    const lp = Snd.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    const dl = Snd.ctx.createDelay(); dl.delayTime.value = 0.38; const fbk = Snd.ctx.createGain(); fbk.gain.value = 0.32;
    Snd.master.connect(lp); lp.connect(Snd.ctx.destination); lp.connect(dl); dl.connect(fbk); fbk.connect(dl); dl.connect(Snd.ctx.destination);
  }
  Snd.ctx.resume(); const now = Snd.ctx.currentTime;
  Snd.master.gain.cancelScheduledValues(now); Snd.master.gain.setValueAtTime(Snd.master.gain.value, now); Snd.master.gain.linearRampToValueAtTime(0.5, now + 2);
  let next = now + 0.1; Snd.step = 0;
  clearInterval(Snd.timer);
  Snd.timer = setInterval(() => {
    while (next < Snd.ctx.currentTime + 0.6) {
      const bar = Math.floor(Snd.step / 8) % 4, ch = CHORDS[bar], pos = Snd.step % 8;
      if (pos === 0) { ch.forEach((f, i) => note(f, next, 4.2, i === 0 ? 'sine' : 'triangle', i === 0 ? 0.09 : 0.035)); }
      if ([0, 2, 3, 5, 6].includes(pos)) note(ch[1 + ((Snd.step * 3) % 4)] * 2, next, 1.1, 'sine', 0.05);
      next += 0.5; Snd.step++;
    }
  }, 150);
  return true;
};
const stopSound = () => { if (!Snd.ctx) return; const now = Snd.ctx.currentTime; Snd.master.gain.cancelScheduledValues(now); Snd.master.gain.setValueAtTime(Snd.master.gain.value, now); Snd.master.gain.linearRampToValueAtTime(0, now + 1); setTimeout(() => { if (!Snd.on) { clearInterval(Snd.timer); Snd.ctx.suspend(); } }, 1100); };
const chime = (big) => { if (!Snd.on || !Snd.ctx) return; const n = Snd.ctx.currentTime; [1318.5, 1975.5].concat(big ? [2637, 3136] : []).forEach((f, i) => note(f, n + i * 0.09, 0.9, 'sine', 0.07)); };
$('#sound').addEventListener('click', (e) => { Snd.on = !Snd.on; e.currentTarget.setAttribute('aria-pressed', Snd.on); if (Snd.on) { startSound(); toast('♪ ' + t('sound_on')); } else stopSound(); });

/* ---------- toasts & confetti ---------- */
const toast = (html) => { const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = html; $('#toasts').appendChild(d); setTimeout(() => d.remove(), 2700); };
const cv = $('#confetti'), cx = cv.getContext('2d'); let parts = [], raf = 0;
const confetti = () => {
  if (reduce) return; cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
  const cols = ['#0ABAB5', '#FFB6C1', '#FFDAB9', '#E6E6FA', '#F27C94'];
  for (let i = 0; i < 160; i++) parts.push({ x: cv.width / 2, y: cv.height * 0.45, vx: (Math.random() - 0.5) * 26 * devicePixelRatio, vy: (-Math.random() * 22 - 6) * devicePixelRatio, r: (4 + Math.random() * 6) * devicePixelRatio, c: cols[i % 5], a: Math.random() * 6, s: Math.random() > 0.5 });
  cancelAnimationFrame(raf);
  const tick = () => { cx.clearRect(0, 0, cv.width, cv.height); parts.forEach((p) => { p.vy += 0.7 * devicePixelRatio; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.a += 0.2; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; if (p.s) cx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { cx.beginPath(); cx.arc(0, 0, p.r / 1.4, 0, 7); cx.fill(); } cx.restore(); }); parts = parts.filter((p) => p.y < cv.height + 40); if (parts.length) raf = requestAnimationFrame(tick); else cx.clearRect(0, 0, cv.width, cv.height); };
  tick();
};

/* ---------- XP, streak, levels, badges ---------- */
const queue = [];
const showNext = () => {
  const dlg = $('#lvlup'); if (dlg.open || !queue.length) return;
  const it = queue.shift();
  dlg.innerHTML = `<div class="lu"><div class="medal">${it.icon}</div><p style="font-weight:800;color:var(--teal-d)">${esc(it.kicker)}</p><h2 style="font-size:28px">${esc(it.title)}</h2><p style="color:var(--soft)">${esc(it.sub)}</p>${it.buddy ? `<div class="grow" style="width:150px;height:150px">${it.buddy}</div>` : ''}<button class="btn" data-close>${t('lvl_ok')}</button></div>`;
  dlg.showModal(); confetti(); chime(true);
};
$('#lvlup').addEventListener('close', () => setTimeout(showNext, 250));
const giveBadge = (id) => { if (S.badges[id]) return; S.badges[id] = dayStr(); const b = PC.BADGES.find((x) => x.id === id); queue.push({ icon: b.e, kicker: t('lvl_badge'), title: L(b.t), sub: L(b.d) }); };
const award = (a, onceKey) => {
  if (onceKey) { if (S.once[onceKey]) return false; S.once[onceKey] = 1; }
  if (a === 'ai') { if (S.aiCount >= 5) return false; S.aiCount++; }
  let gain = PC.ACTIONS[a] ? PC.ACTIONS[a].xp : 0; const today = dayStr(); const parts2 = [];
  if (S.lastAct !== today) { const g = gap(); S.streak = g === 1 ? S.streak + 1 : 1; S.lastAct = today; gain += PC.ACTIONS.daily.xp; parts2.push(t('xp_daily')); giveBadge('first'); }
  const before = S.lvl; S.xp += gain; S.lvl = lvlOf(S.xp);
  if (S.streak >= 3) giveBadge('s3'); if (S.streak >= 7) giveBadge('s7');
  ({ like: 'heart', quiz: 'ready', vol: 'vol', fund: 'fund', law: 'law' })[a] && giveBadge(({ like: 'heart', quiz: 'ready', vol: 'vol', fund: 'fund', law: 'law' })[a]);
  if (gain) toast(`<em>+${gain} XP</em> ${PC.ACTIONS[a] ? esc(L(PC.ACTIONS[a].t)) : ''} 🐾`);
  chime(false);
  if (S.lvl > before) { const lv = PC.LEVELS[S.lvl]; queue.unshift({ icon: lv.icon, kicker: t('lvl_new'), title: lv.name, sub: L(lv.sub) + ' · ' + buddyName() + ' — ' + t('stage' + stageOf(S.lvl)), buddy: buddySvg(S.kind, stageOf(S.lvl), 'happy', S.kind === 'cat' ? '#FFB6C1' : '#FFDAB9', buddyName()) }); }
  save(); renderMe(); if ($('#profile').open) renderProfile(); setTimeout(showNext, 700);
  return true;
};
const accentMe = () => S.kind === 'cat' ? '#FFB6C1' : '#FFDAB9';
const renderMe = () => {
  const lv = PC.LEVELS[S.lvl];
  $('#meMini').innerHTML = buddySvg(S.kind, stageOf(S.lvl), mood() === 'sad' ? 'sad' : 'happy', accentMe(), buddyName(), false);
  $('#meLvl').textContent = lv.name; $('#meXp').textContent = S.xp + ' XP · ' + showStreak() + ' 🐾';
};
const renderProfile = () => {
  const lv = PC.LEVELS[S.lvl], nx = PC.LEVELS[S.lvl + 1], m = mood();
  const pct = nx ? Math.round((S.xp - lv.xp) / (nx.xp - lv.xp) * 100) : 100;
  const st = showStreak();
  $('#profile').innerHTML = `<div class="pf">
    <div style="display:flex;justify-content:space-between;align-items:center"><h2 style="font-size:24px">${t('me_title')}</h2><button class="x" style="position:static;background:var(--line)" data-close aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    <div class="home"><span class="mood">${esc(t('mood_' + m, { name: buddyName() }))}</span>
      <div class="kind"><button data-kind="dog" aria-pressed="${S.kind === 'dog'}" aria-label="Dog">🐶</button><button data-kind="cat" aria-pressed="${S.kind === 'cat'}" aria-label="Cat">🐱</button></div>
      <div class="grass"></div>${buddySvg(S.kind, stageOf(S.lvl), m === 'sad' ? 'sad' : 'happy', accentMe(), buddyName()).replace('<svg', '<svg class="buddy"')}</div>
    <div><div class="lvl"><b>${lv.icon} ${lv.name}</b><span class="note" style="font-size:14px">${esc(L(lv.sub))} · ${t('stage' + stageOf(S.lvl))}</span></div>
      <div class="xpbar" style="margin-top:10px"><i style="width:${pct}%"></i></div>
      <p class="note" style="margin-top:6px">${S.xp} XP · ${nx ? (nx.xp - S.xp) + ' XP ' + t('me_xp') + ' ' + nx.name : t('me_max')}</p></div>
    <div><p style="font-weight:800;margin-bottom:8px">${t('me_streak')}: ${st} ${t('me_days')}</p><div class="streak">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<i class="${i < Math.min(st, 7) ? 'on' : ''}">${i < Math.min(st, 7) ? '🐾' : ''}</i>`).join('')}</div></div>
    <div><p style="font-weight:800;margin-bottom:8px">${t('me_badges')}</p><div class="badges">${PC.BADGES.map((b) => `<div class="badge${S.badges[b.id] ? ' got' : ''}" title="${esc(L(b.t))}: ${esc(L(b.d))}" role="img" aria-label="${esc(L(b.t))}">${b.e}</div>`).join('')}</div></div>
    <div><p style="font-weight:800;margin-bottom:4px">${t('me_how')}</p><div class="acts2">${Object.values(PC.ACTIONS).map((a) => `<div><span>${esc(L(a.t))}</span><b>+${a.xp} XP</b></div>`).join('')}</div></div>
    <div class="card" style="padding:14px;border-style:dashed"><p class="note" style="font-weight:800;margin-bottom:8px">${t('me_demo')}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm ghost" data-demo="skip">${t('me_skip')}</button><button class="btn sm ghost" data-demo="next">${t('me_next')}</button><button class="btn sm ghost" data-demo="reset">${t('me_reset')}</button></div></div>
  </div>`;
};
$('#meBtn').addEventListener('click', () => { renderProfile(); $('#profile').showModal(); });
$('#profile').addEventListener('click', (e) => {
  const k = e.target.closest('[data-kind]'); if (k) { S.kind = k.dataset.kind; save(); renderProfile(); renderMe(); return; }
  const d = e.target.closest('[data-demo]'); if (!d) return;
  if (d.dataset.demo === 'skip') { S.offset += 2; save(); renderProfile(); renderMe(); }
  if (d.dataset.demo === 'next') { S.offset += 1; save(); award('none'); renderProfile(); }
  if (d.dataset.demo === 'reset') { const kind = S.kind; S = blank(); S.kind = kind; save(); renderProfile(); renderMe(); renderPets(); }
});
document.addEventListener('click', (e) => { const c = e.target.closest('[data-close]'); if (c) c.closest('dialog').close(); });
$$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));

/* ---------- static i18n ---------- */
const applyStatic = () => {
  document.documentElement.lang = lang === 'kk' ? 'kk' : lang;
  $$('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  $('#aiIn').placeholder = t('ai_ph');
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === lang));
};

/* ---------- stats ---------- */
const renderStats = () => { $('#stats').innerHTML = PC.STATS.map((s) => `<div class="card stat rv in" style="background:${s.c};border:0"><b class="pastel">${esc(s.n)}</b><p class="pastel" style="color:#3E4E4C">${esc(L(s.t))}</p></div>`).join(''); };

/* ---------- pets ---------- */
let pf = 'all';
const PF = ['all', 'dog', 'cat', 'ast', 'alm'];
const petOk = (p) => pf === 'all' || p.kind === pf || shelter(p.sh).city === pf;
const heart = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E2A2B" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
const renderPets = () => {
  $('#filters').innerHTML = PF.map((f) => `<button data-f="${f}" aria-pressed="${pf === f}">${t('f_' + f)}</button>`).join('');
  $('#petGrid').innerHTML = PC.PETS.filter(petOk).map((p) => { const sh = shelter(p.sh); return `<article class="card pet rv">
    <button class="open" data-pet="${p.id}" aria-label="${esc(L(p.name))}"><div class="pic photo"><img src="${p.photo}" alt="${esc(L(p.name))}" loading="lazy"><span class="demo">${t('demo')}</span></div>
    <div class="meta"><b>${esc(L(p.name))}</b><span>${t(p.sex === 'm' ? 'male' : 'female')} · ${esc(L(p.age))}</span><span>${esc(sh.name)} · ${t('f_' + sh.city)}</span></div></button>
    <button class="like${S.liked[p.id] ? ' on' : ''}" data-like="${p.id}" aria-pressed="${!!S.liked[p.id]}" aria-label="♥ ${esc(L(p.name))}">${heart}</button></article>`; }).join('');
  watch($('#petGrid'));
};
$('#filters').addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) { pf = b.dataset.f; renderPets(); } });
$('#petGrid').addEventListener('click', (e) => {
  const l = e.target.closest('[data-like]');
  if (l) { const id = l.dataset.like; S.liked[id] = !S.liked[id]; save(); l.classList.toggle('on', S.liked[id]); l.setAttribute('aria-pressed', S.liked[id]); if (S.liked[id]) award('like', 'like-' + id); return; }
  const o = e.target.closest('[data-pet]'); if (o) openPet(o.dataset.pet);
});
const openPet = (id) => {
  const p = PC.PETS.find((x) => x.id === id), sh = shelter(p.sh);
  $('#petDlg').innerHTML = `<div class="dhead photo"><img src="${p.photo}" alt="${esc(L(p.name))}"><span class="demo">${t('demo')}</span><button class="x" data-close aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E2A2B" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
  <div class="dbody"><div><h2 style="font-size:30px">${esc(L(p.name))}</h2><p class="note" style="font-size:15px;margin-top:4px">${t(p.sex === 'm' ? 'male' : 'female')} · ${esc(L(p.age))} · ${esc(sh.name)}, ${t('f_' + sh.city)}</p></div>
  <div class="tags">${p.traits.map((x) => `<span>${esc(L(x))}</span>`).join('')}</div><p>${esc(L(p.story))}</p>
  <a class="btn" href="${igdm(sh.ig)}" target="_blank" rel="noopener" data-meet="${p.id}">${t('pet_meet')} · +20 XP</a>
  <button class="btn ghost" data-jr="${p.id}">${t('jr_watch')}: ${esc(L(p.name))}</button>
  <p class="note">@${esc(sh.ig)} · ${esc(sh.phone)}</p><p class="note">${t('pet_note')}</p></div>`;
  $('#petDlg').showModal();
};
$('#petDlg').addEventListener('click', (e) => { const m = e.target.closest('[data-meet]'); if (m) award('meet', 'meet-' + m.dataset.meet); const j = e.target.closest('[data-jr]'); if (j) window.PCjourney(j.dataset.jr); });

/* ---------- funds ---------- */
const renderFunds = () => {
  $('#fundGrid').innerHTML = PC.FUNDS.map((f) => { const sh = shelter(f.sh), pct = Math.round(f.raised / f.goal * 100); return `<article class="card fund rv">
    <div class="row"><span class="chip">${esc(L(f.kind))}</span><span class="demo" style="position:static">${t('demo')}</span></div>
    <h3>${esc(L(f.title))}</h3><p class="note" style="font-size:14px">${esc(sh.name)} · ${t('f_' + sh.city)}</p>
    <div class="track"><i data-w="${pct}" style="background:${pct >= 65 ? '#F5B98A' : '#FF9AAE'}"></i></div>
    <div class="row"><span>${fmt(f.raised)} ${t('of')} ${fmt(f.goal)}</span><b>${pct}%</b></div>
    <a class="btn sm" href="${sh.site || ig(sh.ig)}" target="_blank" rel="noopener" data-fund="${f.id}">${t('fund_go')} · +25 XP</a>
    <a class="btn sm ghost" href="${ig(sh.ig)}" target="_blank" rel="noopener" data-fund="${f.id}">${t('fund_rep')}</a></article>`; }).join('');
  watch($('#fundGrid'));
  const bio = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.style.width = en.target.dataset.w + '%'; bio.unobserve(en.target); } }), { threshold: 0.4 });
  $$('#fundGrid .track i').forEach((i) => bio.observe(i));
};
$('#fundGrid').addEventListener('click', (e) => { const a = e.target.closest('[data-fund]'); if (a) award('fund', 'fund-' + a.dataset.fund); });

/* ---------- shelters ---------- */
let cf = 'all';
const renderShelters = () => {
  $('#cityF').innerHTML = ['all', 'ast', 'alm'].map((f) => `<button data-c="${f}" aria-pressed="${cf === f}">${t('f_' + f)}</button>`).join('');
  $('#shGrid').innerHTML = PC.SHELTERS.filter((s) => cf === 'all' || s.city === cf).map((s) => `<article class="card sh rv">
    <div class="top"><span class="av" style="background:${s.color}">${esc(s.name.replace(/[«»Фонд ]/g, '').slice(0, 1))}</span><div><h3>${esc(s.name)}</h3><span class="chip" style="background:var(--teal-t);color:var(--teal-d);margin-top:4px">${t('f_' + s.city)} · ${t('sh_official')}</span></div></div>
    <p style="font-size:15px">${esc(L(s.focus))}</p>
    <dl><dt>${t('sh_addr')}</dt><dd>${esc(L(s.addr))}</dd><dt>${t('sh_hours')}</dt><dd>${esc(L(s.hours))}</dd><dt>${t('sh_phone')}</dt><dd style="white-space:nowrap">${esc(s.phone)}</dd></dl>
    <div><p class="note" style="font-weight:800;margin-bottom:6px">${t('sh_needs')}</p><div class="tags">${s.needs.map((n) => `<span>${esc(L(n))}</span>`).join('')}</div></div>
    <div class="links2"><a class="btn sm" href="${ig(s.ig)}" target="_blank" rel="noopener">Instagram @${esc(s.ig)}</a>${s.site ? `<a class="btn sm ghost" href="${s.site}" target="_blank" rel="noopener">${esc(s.site.replace('https://', ''))}</a>` : ''}</div></article>`).join('');
  watch($('#shGrid'));
};
$('#cityF').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (b) { cf = b.dataset.c; renderShelters(); } });

/* ---------- volunteer ---------- */
let dir = 'walk';
const renderVol = () => {
  $('#dirs').innerHTML = PC.DIRS.map((d) => `<button class="dir" data-d="${d.id}" aria-pressed="${dir === d.id}"><span class="e">${d.e}</span><span><b>${esc(L(d.t))}</b><p>${esc(L(d.d))}</p></span></button>`).join('');
  const cur = $('#vfSh').value || 'alive';
  $('#vfSh').innerHTML = PC.SHELTERS.map((s) => `<option value="${s.id}">${esc(s.name)} · ${t('f_' + s.city)}</option>`).join('');
  $('#vfSh').value = cur; compose();
};
const compose = () => {
  const s = shelter($('#vfSh').value), d = PC.DIRS.find((x) => x.id === dir);
  const dt = $('#vfDate').value ? new Date($('#vfDate').value).toLocaleDateString(lang === 'en' ? 'en-GB' : 'ru-RU') : t('vf_anydate');
  $('#vfMsg').value = t('vf_tpl', { name: $('#vfName').value.trim() || t('vf_anyname'), shelter: s.name, dir: L(d.t).toLowerCase(), date: dt });
  $('#vfIg').href = igdm(s.ig); $('#vfHow').textContent = L(d.how) + ' · @' + s.ig + ' · ' + s.phone;
};
$('#dirs').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) { dir = b.dataset.d; renderVol(); } });
['#vfSh', '#vfDate', '#vfName'].forEach((s) => $(s).addEventListener('input', compose));
$('#vfCopy').addEventListener('click', async () => {
  let ok = false; try { await navigator.clipboard.writeText($('#vfMsg').value); ok = true; } catch (e) { $('#vfMsg').select(); }
  toast(ok ? t('vf_copied') : '⌘/Ctrl + C'); award('vol', 'vol-' + dir + '-' + $('#vfSh').value);
});
$('#vfIg').addEventListener('click', () => award('vol', 'vol-' + dir + '-' + $('#vfSh').value));

/* ---------- quiz ---------- */
let q = 0, score = 0, locked = false;
const renderQuiz = () => {
  const box = $('#quizBox');
  if (q >= PC.QUIZ.length) {
    const r = Math.round(score / 6 * 100), k = score >= 5 ? 'r1' : score >= 3 ? 'r2' : 'r3';
    box.innerHTML = `<h2>${t('quiz_h')}</h2><p class="lead" style="margin-top:8px">${t('quiz_r')}</p><div class="meter">${r}%</div>
      <div class="track" style="margin:10px 0 20px;max-width:520px;background:#EDE3C2"><i id="qbar" style="background:#1E2A2B"></i></div>
      <h3 style="font-size:24px">${t(k)}</h3><p class="lead" style="margin-top:8px">${t(k + 'p')}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:22px"><a class="btn" href="#pets">${t('hero_cta1')}</a><a class="btn ghost" href="#volunteer">${t('w3h')}</a><button class="btn ghost" id="again">${t('quiz_again')}</button></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => { $('#qbar').style.width = r + '%'; }));
    $('#again').addEventListener('click', () => { q = 0; score = 0; renderQuiz(); });
    return;
  }
  const c = PC.QUIZ[q];
  box.innerHTML = `<h2>${t('quiz_h')}</h2><p class="lead" style="margin-top:8px">${t('quiz_p')}</p>
    <div class="segs">${PC.QUIZ.map((_, i) => `<i style="background:${i < q ? '#0ABAB5' : i === q ? '#FFDAB9' : ''}"></i>`).join('')}</div>
    <p style="font-weight:800;font-size:14px">${t('quiz_n', { n: q + 1 })}</p><h3 style="font-size:clamp(20px,2.4vw,26px);margin-top:8px">${esc(L(c.q))}</h3>
    <div class="opts">${c.o.map((o, i) => `<button data-o="${i}">${esc(L(o[0]))}</button>`).join('')}</div><p class="fb" aria-live="polite"></p>`;
  locked = false;
};
$('#quizBox').addEventListener('click', (e) => {
  const b = e.target.closest('[data-o]'); if (!b || locked) return; locked = true;
  const o = PC.QUIZ[q].o[+b.dataset.o], c = o[1] === 2 ? ['#D4F4F2', '#0ABAB5'] : o[1] === 1 ? ['#FFFACD', '#F0B98C'] : ['#FFE4E9', '#F27C94'];
  $$('[data-o]', $('#quizBox')).forEach((x) => { x.disabled = true; if (x !== b) x.style.opacity = '.45'; });
  b.style.background = c[0]; b.style.borderColor = c[1]; $('#quizBox .fb').textContent = L(o[2]);
  setTimeout(() => { score += o[1]; q++; renderQuiz(); if (q >= PC.QUIZ.length) award('quiz', 'quiz'); }, 1800);
});

/* ---------- law ---------- */
const renderLaw = () => {
  $('#lawAcc').innerHTML = PC.LAW.map((x) => `<details><summary>${esc(L(x.h))}</summary><p>${esc(L(x.p))}</p><p><a href="${x.link}" target="_blank" rel="noopener">${esc(x.link.replace('https://', '').split('/')[0])} ↗</a></p></details>`).join('');
  $$('#lawAcc details').forEach((d) => d.addEventListener('toggle', () => { if (d.open) award('law', 'law'); }));
  $('#fines').innerHTML = PC.FINES.map((f) => `<tr><td>${esc(L(f[0]))}</td><td class="n">${esc(L(f[1]))}</td></tr>`).join('');
};

/* ---------- AI assistant ---------- */
let sample = null; const hist = [];
const tryClaude = (n = 0) => { if (window.claude && window.claude.use) { window.claude.use('sample').then((s) => { sample = s; }).catch(() => {}); } else if (n < 20) setTimeout(() => tryClaude(n + 1), 500); };
tryClaude();
const addMsg = (txt, who) => { const d = document.createElement('div'); d.className = 'm ' + who; d.textContent = txt; $('#msgs').appendChild(d); $('#msgs').scrollTop = 1e6; return d; };
const ctxData = () => JSON.stringify({
  shelters: PC.SHELTERS.map((s) => ({ name: s.name, city: s.city === 'ast' ? 'Astana' : 'Almaty', address: L(s.addr), hours: L(s.hours), instagram: '@' + s.ig, phone: s.phone, site: s.site || '', focus: L(s.focus), needs: s.needs.map(L) })),
  pets_demo: PC.PETS.map((p) => ({ name: L(p.name), kind: p.kind, sex: p.sex, age: L(p.age), shelter: shelter(p.sh).name, traits: p.traits.map(L), story: L(p.story) })),
  fundraisers_demo: PC.FUNDS.map((f) => ({ title: L(f.title), shelter: shelter(f.sh).name, goal: f.goal, raised: f.raised })),
  volunteering: PC.DIRS.map((d) => ({ type: L(d.t), what: L(d.d), how: L(d.how) })),
  law: PC.LAW.map((x) => ({ title: L(x.h), text: L(x.p), link: x.link })), fines: PC.FINES.map((f) => L(f[0]) + ': ' + L(f[1]))
});
const localAnswer = (qq) => {
  const s = qq.toLowerCase(), has = (...w) => w.some((x) => s.includes(x));
  const shl = (c) => PC.SHELTERS.filter((x) => x.city === c).map((x) => `• ${x.name} — @${x.ig}, ${x.phone}`).join('\n');
  if (has('астан', 'astana')) return shl('ast');
  if (has('алмат', 'almaty')) return shl('alm');
  if (has('кош', 'кот', 'cat', 'мысық')) return PC.PETS.filter((p) => p.kind === 'cat').map((p) => `• ${L(p.name)} (${L(p.age)}) — ${shelter(p.sh).name}: ${p.traits.map(L).join(', ')}`).join('\n');
  if (has('собак', 'пёс', 'пес', 'dog', 'ит ', 'күшік')) return PC.PETS.filter((p) => p.kind === 'dog').map((p) => `• ${L(p.name)} (${L(p.age)}) — ${shelter(p.sh).name}`).join('\n');
  if (has('закон', 'law', 'заң', 'чип', 'chip', 'штраф', 'fine', 'айыппұл')) return PC.LAW.map((x) => `• ${L(x.h)}: ${L(x.p)}`).join('\n');
  if (has('день', 'деньг', 'money', 'ақша', 'без', 'without', 'волонт', 'volunt')) return PC.DIRS.map((d) => `${d.e} ${L(d.t)} — ${L(d.d)}`).join('\n');
  return t('ai_hi');
};
const ask = async (qq) => {
  if (!qq.trim()) return; addMsg(qq, 'me2'); $('#aiIn').value = ''; hist.push({ role: 'user', content: qq }); award('ai');
  const bot = addMsg('…', 'bot');
  if (!sample) { const a = localAnswer(qq); bot.textContent = a + '\n' + t('ai_off'); hist.push({ role: 'assistant', content: a }); return; }
  const sys = `You are Pet Care AI, a warm, concise assistant on a website that helps people help homeless animals in Kazakhstan (Astana and Almaty). Answer ONLY in ${['Russian', 'Kazakh', 'English'][li()]}. Keep answers under 90 words, friendly, practical, with at most 2 emoji. Use ONLY the data below for shelters, contacts, pets and fundraisers; pets and fundraiser amounts are DEMO — say so if relevant. Never invent phone numbers, addresses or card numbers; for donations always point to the shelter's official Instagram/site. If unsure, suggest contacting the shelter. For medical questions recommend a veterinarian. Plain text, no markdown headings.\nDATA: ${ctxData()}`;
  const msgs = [{ role: 'user', content: sys + '\n\nConversation follows.' }, { role: 'assistant', content: 'OK.' }].concat(hist.slice(-8));
  try {
    const r = await sample(msgs, { cache: false, modelTier: 'quick', onText: ({ text }) => { bot.textContent = text; $('#msgs').scrollTop = 1e6; } });
    bot.textContent = r.text; hist.push({ role: 'assistant', content: r.text });
  } catch (err) {
    if (err && err.code === 'not_granted') { sample = null; const a = localAnswer(qq); bot.textContent = a + '\n' + t('ai_off'); }
    else bot.textContent = (err && err.text) || t('ai_err');
  }
};
const openAI = () => { $('#ai').classList.add('open'); if (!$('#msgs').children.length) addMsg(t('ai_hi'), 'bot'); $('#sugg').innerHTML = ['ai_s1', 'ai_s2', 'ai_s3'].map((k) => `<button data-s="${k}">${t(k)}</button>`).join(''); $('#aiIn').focus(); };
$('#aiBtn').addEventListener('click', () => $('#ai').classList.contains('open') ? $('#ai').classList.remove('open') : openAI());
$('#aiX').addEventListener('click', () => $('#ai').classList.remove('open'));
$('#sugg').addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (b) ask(t(b.dataset.s)); });
$('#aif').addEventListener('submit', (e) => { e.preventDefault(); ask($('#aiIn').value); });

/* ---------- reveal, hero, qr, members ---------- */
const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.1 });
const watch = (root) => $$('.rv:not(.in)', root).forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
{ let s = '', seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const fin = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#1E2A2B"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#1E2A2B"/>`;
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { const f = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12); if (!f && rnd() > 0.5) s += `<rect x="${x}" y="${y}" width="1" height="1" fill="#1E2A2B"/>`; }
  $('#qr').innerHTML = s + fin(0, 0) + fin(14, 0) + fin(0, 14); }


const A = window.anime || null;


/* ---------- language ---------- */
const renderAll = () => { applyStatic(); renderStats(); renderPets(); renderFunds(); renderShelters(); renderVol(); renderQuiz(); renderLaw(); renderMe(); document.dispatchEvent(new Event('pc:lang')); if ($('#profile').open) renderProfile(); if ($('#ai').classList.contains('open')) $('#sugg').innerHTML = ['ai_s1', 'ai_s2', 'ai_s3'].map((k) => `<button data-s="${k}">${t(k)}</button>`).join(''); watch(document); };
$$('[data-lang]').forEach((b) => b.addEventListener('click', () => { lang = b.dataset.lang; try { localStorage.setItem('pc2-lang', lang); } catch (e) {} renderAll(); }));
renderAll();
window.PCapp = { t, award, L, esc, shelter, ig, igdm, confetti, openPet, pickShelter: (id) => { $('#vfSh').value = id; compose(); } };
}
