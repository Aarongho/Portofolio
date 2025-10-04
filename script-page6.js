/* ============================================================
   ✨ CONTACT BOX ANIMATIONS
   ============================================================ */
document.querySelectorAll('.contact-box').forEach((box, i) => {
  setTimeout(() => { box.classList.add('animate-in'); }, i * 200);

  box.addEventListener('mousemove', e => {
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 6; 
    const rotateY = ((x - centerX) / centerX) * -6;
    box.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });

  box.addEventListener('mouseleave', () => {
    box.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  });

  box.addEventListener('click', e => {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = box.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    ripple.style.width = ripple.style.height = '100px';
    box.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

window.addEventListener('beforeunload', () => {
  document.querySelectorAll('.contact-box').forEach(box => {
    box.classList.remove('animate-in');
    box.classList.add('animate-out');
  });
});

/* ============================================================
   ⚡ DIGITAL QUAKE - PETIR SAAT BATU JATUH
   ============================================================ */
(function(){
  const canvas = document.createElement('canvas');
  canvas.id = 'digital-quake-lightning';
  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, DPR = window.devicePixelRatio || 1;
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const rocks = [];
  const dusts = [];
  const bolts = [];
  let shake = 0;
  const gravity = 0.35;

  function spawnRocks(count = 40) {
    for (let i = 0; i < count; i++) {
      const size = 10 + Math.random() * 20;
      rocks.push({
        x: Math.random() * W,
        y: -Math.random() * 300 - size,
        w: size,
        h: size * (0.8 + Math.random() * 0.4),
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0,
        color: `hsl(${Math.random() * 20}, 5%, ${20 + Math.random() * 20}%)`,
        hit: false,
      });
    }
    shake = 10;
  }

  function spawnDust(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      dusts.push({
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        r: 2 + Math.random() * 3,
        a: 1,
      });
    }
  }

  function spawnLightning(x, y) {
    bolts.push({
      x, y,
      segments: createLightningPath(x, y, x + (Math.random() - 0.5) * 300, y - (80 + Math.random() * 100)),
      life: 1
    });
  }

  function createLightningPath(x1, y1, x2, y2) {
    const segments = [];
    const steps = 10 + Math.floor(Math.random() * 8);
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
      const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
      segments.push({x, y});
    }
    return segments;
  }

  // Loop tiap 10 detik
  setInterval(() => spawnRocks(50), 10000);

  function loop() {
    requestAnimationFrame(loop);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    // Tanah
    const g = ctx.createLinearGradient(0, H - 150, 0, H);
    g.addColorStop(0, "#111");
    g.addColorStop(1, "#000");
    ctx.fillStyle = g;
    ctx.fillRect(0, H - 120, W, 200);

    // Shake
    if (shake > 0) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      shake *= 0.9;
    }

    // Rocks
    for (let i = rocks.length - 1; i >= 0; i--) {
      const r = rocks[i];
      r.vy += gravity;
      r.x += r.vx;
      r.y += r.vy;

      if (r.y + r.h >= H - 120 && !r.hit) {
        r.hit = true;
        spawnDust(r.x, H - 120, 30);
        spawnLightning(r.x, H - 120);
        shake = 10;

        for (let j = 0; j < 3; j++) {
          rocks.push({
            x: r.x + (Math.random() - 0.5) * 25,
            y: H - 130,
            w: r.w / 2,
            h: r.h / 2,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3 - 1,
            color: r.color,
            hit: true,
          });
        }
      }

      if (r.y > H + 50) {
        rocks.splice(i, 1);
        continue;
      }

      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + r.w, r.y + 2);
      ctx.lineTo(r.x + r.w * 0.8, r.y + r.h);
      ctx.lineTo(r.x, r.y + r.h * 0.8);
      ctx.closePath();
      ctx.fill();
    }

    // Dust
    for (let i = dusts.length - 1; i >= 0; i--) {
      const d = dusts[i];
      d.vy += 0.1;
      d.x += d.vx;
      d.y += d.vy;
      d.a -= 0.02;
      ctx.fillStyle = `rgba(200,200,200,${d.a})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      if (d.a <= 0) dusts.splice(i, 1);
    }

    // Lightning bolts
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      b.life -= 0.05;
      ctx.lineWidth = 2 + Math.random() * 2;
      ctx.strokeStyle = `rgba(0,255,255,${b.life})`;
      ctx.shadowColor = "rgba(0,255,255,0.8)";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      b.segments.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (b.life <= 0) bolts.splice(i, 1);
    }

    if (shake > 0) ctx.restore();
  }

  loop();
})();
