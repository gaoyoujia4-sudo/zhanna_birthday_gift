/* ============================================================
   生日祝福网站 — 主逻辑
   星空背景 · 仪式动画 · 打字机文案 · 音乐 · 访问计数
   ============================================================ */
(function () {
  'use strict';

  const CFG = window.SITE_CONFIG || {};
  const START_DATE = CFG.startDate || '2023-06-10';

  // ---------- DOM ----------
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  const introStage = document.getElementById('stage-intro');
  const mainStage = document.getElementById('stage-main');
  const gift = document.getElementById('gift');
  const openBtn = document.getElementById('open-btn');
  const musicToggle = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  const cakeWrap = document.getElementById('cake-wrap');
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');
  const daysNum = document.getElementById('days-num');
  const visitsNum = document.getElementById('visits-num');
  const letterEl = document.getElementById('letter');
  const letterText = document.getElementById('letter-text');
  const blowBtn = document.getElementById('blow-btn');
  const toastEl = document.getElementById('toast');

  // ---------- 工具 ----------
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (min, max) => min + Math.random() * (max - min);

  // ---------- 初始化文案 ----------
  titleEl.textContent = CFG.title || '生日快乐';
  subtitleEl.textContent = CFG.subtitle || `致「${CFG.herName || '你'}」`;

  // ---------- 天数计算（本地时区，含当天：起始日当天 = 第 1 天） ----------
  function daysBetween(sinceStr) {
    const [y, m, d] = sinceStr.split('-').map(Number);
    const since = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((today - since) / 86400000);
    return Math.max(1, diff + 1);
  }

  // ============================================================
  //  星空背景（Canvas）
  // ============================================================
  let W = 0, H = 0;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const stars = [];
  for (let i = 0; i < 170; i++) {
    stars.push({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.3, 1.5),
      base: rand(0.4, 0.9),
      tw: rand(0, Math.PI * 2),
      sp: rand(0.01, 0.04),
    });
  }

  const hearts = [];
  for (let i = 0; i < 14; i++) {
    hearts.push({
      x: rand(0, W), y: rand(0, H),
      size: rand(6, 16),
      vy: rand(0.15, 0.5),
      vx: rand(-0.2, 0.2),
      alpha: rand(0.1, 0.4),
      wob: rand(0, Math.PI * 2),
      wobSp: rand(0.005, 0.02),
    });
  }

  let meteors = [];
  let particles = [];

  const CONFETTI = ['#ffd166', '#ff6b9d', '#a78bfa', '#7dd3fc', '#f472b6', '#fde68a'];
  const FIREWORKS = ['#fde68a', '#fbbf24', '#f472b6', '#a78bfa', '#7dd3fc', '#fb7185'];

  function drawHeart(x, y, s, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 16, s / 16);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ff7eb6';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-12, -4, -8, -14, 0, -6);
    ctx.bezierCurveTo(8, -14, 12, -4, 0, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function spawnMeteor() {
    meteors.push({
      x: rand(W * 0.2, W * 0.9),
      y: rand(0, H * 0.3),
      vx: rand(-9, -6),
      vy: rand(2.5, 4),
      life: 1,
      decay: rand(0.012, 0.02),
    });
  }

  function burst(x, y, count, colors, speed) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(1, speed || 7);
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2.5,
        size: rand(2, 6),
        color: colors[(Math.random() * colors.length) | 0],
        life: 1,
        decay: rand(0.008, 0.02),
        grav: 0.16,
        shape: Math.random() < 0.5 ? 'r' : 'c',
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2),
      });
    }
  }

  let last = 0;
  function frame(t) {
    const dt = Math.min((t - last) / 16.67, 3) || 1;
    last = t;

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#070a1f');
    g.addColorStop(0.55, '#141238');
    g.addColorStop(1, '#2b1b4d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      s.tw += s.sp * dt;
      const a = s.base * (0.5 + 0.5 * Math.sin(s.tw));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (Math.random() < 0.004 * dt) spawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= m.decay * dt;
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 10, m.y - m.vy * 10);
      grad.addColorStop(0, 'rgba(255,255,255,' + Math.max(m.life, 0) + ')');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 10, m.y - m.vy * 10);
      ctx.stroke();
      if (m.life <= 0) meteors.splice(i, 1);
    }

    for (const h of hearts) {
      h.y -= h.vy * dt;
      h.x += h.vx * dt + Math.sin(h.wob) * 0.3;
      h.wob += h.wobSp * dt;
      if (h.y < -30) { h.y = H + 30; h.x = rand(0, W); }
      if (h.x < -30) h.x = W + 30;
      if (h.x > W + 30) h.x = -30;
      drawHeart(h.x, h.y, h.size, h.alpha);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.grav * dt;
      p.vx *= 0.99;
      p.life -= p.decay * dt;
      p.rot += p.vr * dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 'r') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ============================================================
  //  数据加载（访问次数 + 起始日）
  // ============================================================
  let visits = 0;
  let daysTogether = daysBetween(START_DATE);

  async function loadStats() {
    try {
      const res = await fetch('/api/stats', { cache: 'no-store' });
      const data = await res.json();
      if (data && typeof data.visits === 'number') visits = data.visits;
      if (data && data.since) daysTogether = daysBetween(data.since);
    } catch (e) {
      visits = visits || 1;
    }
  }

  // ============================================================
  //  音乐（循环播放）
  // ============================================================
  const music = new Audio(CFG.musicFile || 'assets/audio/music.mp3');
  music.loop = true;
  music.preload = 'none';

  function updateMusicUI() {
    const on = !music.paused;
    musicToggle.classList.toggle('on', on);
    musicIcon.textContent = on ? '🔊' : '🔇';
    musicToggle.title = on ? '暂停音乐' : '播放音乐';
  }

  function playMusic() {
    music.play().then(() => {
      musicToggle.hidden = false;
      updateMusicUI();
    }).catch(() => {
      musicToggle.hidden = false;
      updateMusicUI();
      if (music.error) {
        showToast('未找到音乐文件，请把音频放到 ' + (CFG.musicFile || 'assets/audio/music.mp3'));
      }
    });
  }

  musicToggle.addEventListener('click', () => {
    if (music.paused) {
      music.play().then(updateMusicUI).catch(updateMusicUI);
    } else {
      music.pause();
      updateMusicUI();
    }
  });

  // ============================================================
  //  Toast
  // ============================================================
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4200);
  }

  // ============================================================
  //  数字滚动动画
  // ============================================================
  function countUp(el, target, dur) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const from = 0;
      function step(now) {
        const p = Math.min((now - t0) / (dur || 1300), 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (target - from) * e).toLocaleString('zh-CN');
        if (p < 1) requestAnimationFrame(step);
        else { el.textContent = target.toLocaleString('zh-CN'); resolve(); }
      }
      requestAnimationFrame(step);
    });
  }

  // ============================================================
  //  打字机（数据流式输出文案）
  // ============================================================
  const PAUSE = '，。！？、…；：';
  function charDelay(ch) {
    return PAUSE.includes(ch) ? rand(110, 200) : rand(24, 60);
  }

  async function typeLines() {
    letterEl.classList.add('show');
    letterText.innerHTML = '';
    const typed = document.createElement('span');
    typed.className = 'typed';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    letterText.appendChild(typed);
    letterText.appendChild(cursor);

    const lines = CFG.lines || [];
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      if (line === '') {
        typed.appendChild(document.createElement('br'));
        await wait(180);
        continue;
      }
      for (const ch of line) {
        typed.appendChild(document.createTextNode(ch));
        await wait(charDelay(ch));
      }
      typed.appendChild(document.createElement('br'));
      await wait(260);
    }
  }

  // ============================================================
  //  吹蜡烛 → 愿望成真
  // ============================================================
  function blowCandles() {
    document.querySelectorAll('.candle').forEach((c) => c.classList.remove('lit'));
    blowBtn.classList.add('hidden');

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    let n = 0;
    const iv = setInterval(() => {
      burst(rand(cx - 200, cx + 200), rand(cy - 160, cy + 120), 36, FIREWORKS, 6);
      if (++n >= 6) clearInterval(iv);
    }, 180);

    titleEl.textContent = '愿望成真';
    subtitleEl.textContent = '你的每个心愿，我都想陪你一起实现';
  }

  // ============================================================
  //  仪式启动
  // ============================================================
  let started = false;
  async function startCeremony() {
    if (started) return;
    started = true;
    openBtn.disabled = true;

    gift.classList.add('open');
    const r = gift.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 130, CONFETTI, 7.5);

    playMusic();

    await wait(1300);
    introStage.classList.add('hidden');
    mainStage.classList.remove('hidden');

    await wait(250);
    cakeWrap.classList.add('show');
    await wait(500);
    document.querySelectorAll('.candle').forEach((c, i) => {
      setTimeout(() => c.classList.add('lit'), i * 350);
    });
    await wait(950);

    titleEl.classList.add('show');
    subtitleEl.classList.add('show');
    await wait(500);

    await countUp(daysNum, daysTogether, 1400);
    await wait(250);
    await countUp(visitsNum, visits || 1, 1400);

    await wait(400);
    await typeLines();

    blowBtn.classList.remove('hidden');
  }

  openBtn.addEventListener('click', startCeremony);
  blowBtn.addEventListener('click', blowCandles);

  // ============================================================
  //  启动
  // ============================================================
  loadStats();
})();
