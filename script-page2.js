// Bisa dipakai buat animasi tambahan di menu nanti
document.querySelectorAll('.menu-box').forEach(box => {
  box.addEventListener('mouseenter', () => {
    box.style.transition = "transform 0.4s ease, box-shadow 0.4s ease";
  });
  box.addEventListener('mouseleave', () => {
    box.style.transition = "transform 0.4s ease, box-shadow 0.4s ease";
  });
});

function updateClock() {
  const now = new Date();
  let h = now.getHours().toString().padStart(2, "0");
  let m = now.getMinutes().toString().padStart(2, "0");
  let s = now.getSeconds().toString().padStart(2, "0");
  document.getElementById("clock").textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock(); // initial


const canvas = document.getElementById("sparkle-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [], meteors = [], explosions = [], blackholes = [], shockwaves = [], electricArcs = [];
let colors = [];
let entityInterval;

/* === Sounds === */
const sounds = {
  meteor: new Audio("sounds/whoosh.mp3"),
  explosion: new Audio("sounds/boom.mp3"),
  blackhole: new Audio("sounds/blackhole.mp3"),
  shockwave: new Audio("sounds/shockwave.mp3")
};

/* === Update Warna Sesuai Mode === */
function updateColors() {
  if (document.body.classList.contains("dark-mode")) {
    colors = ["#00ffff", "#ff00ff", "#ffff00", "#ffffff", "#ff69b4"];
  } else {
    colors = ["#8B0000", "#00008B", "#4B0082", "#006400", "#B8860B"];
  }
  initParticles();
}

/* === Init Canvas === */
function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  updateColors();

  if (entityInterval) clearInterval(entityInterval);
  entityInterval = setInterval(spawnEntity, 6000);
}

/* === Sparkles === */
function initParticles() {
  particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 2,
      dx: (Math.random() - 0.5) * 0.7,
      dy: (Math.random() - 0.5) * 0.7,
      opacity: Math.random() * 0.8 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

/* === Spawn arcs keliling shockwave === */
function spawnElectricArcs(x, y, color) {
  let arcs = [];
  for (let i = 0; i < 12; i++) { // 12 arc di keliling
    let angle = (Math.PI * 2 / 12) * i;
    arcs.push({
      x, y, angle,
      radius: 40,
      length: 20,
      color,
      opacity: 1
    });
  }
  electricArcs.push({ arcs, life: 30 });
}

/* === Draw arcs === */
function drawElectricArcs() {
  electricArcs.forEach((set, i) => {
    set.arcs.forEach(a => {
      let startX = a.x + Math.cos(a.angle) * a.radius;
      let startY = a.y + Math.sin(a.angle) * a.radius;
      let endX = startX + (Math.random() - 0.5) * a.length;
      let endY = startY + (Math.random() - 0.5) * a.length;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `rgba(${hexToRgb(a.color)}, ${a.opacity})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = a.color;
      ctx.shadowBlur = 20;
      ctx.stroke();
    });

    set.life--;
    set.arcs.forEach(a => {
      a.radius += 3;       // ikut shockwave
      a.opacity -= 0.03;   // fade out
    });

    if (set.life <= 0) electricArcs.splice(i, 1);
  });
}

/* === Draw Frame === */
function draw() {
  ctx.clearRect(0, 0, width, height);

  // --- Sparkles ---
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.opacity})`;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 25;
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
  });

  // --- Meteors ---
  meteors.forEach((m, index) => {
    ctx.beginPath();
    let gradient = m.dx > 0
      ? ctx.createLinearGradient(m.x, m.y, m.x - m.length, m.y - m.length)
      : ctx.createLinearGradient(m.x, m.y, m.x + m.length, m.y - m.length);

    gradient.addColorStop(0, m.color);
    gradient.addColorStop(1, "transparent");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - (m.dx > 0 ? m.length : -m.length), m.y - m.length);
    ctx.stroke();

    m.x += m.dx;
    m.y += m.dy;

    if (m.x > width || m.y > height || m.x < 0) {
      spawnExplosion(m.x, m.y, m.color);
      sounds.explosion.play();
      meteors.splice(index, 1);
    }
  });

  // --- Explosions ---
  explosions.forEach((exp, i) => {
    exp.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(exp.color)}, ${p.opacity})`;
      ctx.shadowColor = exp.color;
      ctx.shadowBlur = 20;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      p.opacity -= 0.02;
    });
    if (exp.particles.every(p => p.opacity <= 0)) explosions.splice(i, 1);
  });

  // --- Blackholes ---
  blackholes.forEach((b, index) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${b.opacity})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius + 10, b.angle, b.angle + Math.PI * 1.5);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 6;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 25;
    ctx.stroke();

    // Gravitasi sparkles
    const pullRadius = 150;
    particles.forEach(p => {
      let dx = b.x - p.x;
      let dy = b.y - p.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < pullRadius) {
        let force = (pullRadius - dist) / pullRadius * 0.5;
        p.x += dx * force * 0.05;
        p.y += dy * force * 0.05;
        p.opacity -= 0.002;
        if (p.opacity < 0) p.opacity = 0;
      }
    });

    b.angle += 0.05;

    // Auto meledak setelah 4 detik
    if (!b.exploded && Date.now() - b.spawnTime > 4000) {
      spawnShockwave(b.x, b.y, b.color);
      spawnElectricArcs(b.x, b.y, b.color);
      sounds.shockwave.play();
      b.exploded = true;
      blackholes.splice(index, 1);
    }
  });

  // --- Shockwaves ---
  shockwaves.forEach((s, i) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${hexToRgb(s.color)}, ${s.opacity})`;
    ctx.lineWidth = 4;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 30;
    ctx.stroke();

    s.radius += 5;
    s.opacity -= 0.02;
    if (s.opacity <= 0) shockwaves.splice(i, 1);
  });

  // --- Electric Arcs ---
  drawElectricArcs();

  requestAnimationFrame(draw);
}

/* === Entity Spawner === */
function spawnEntity() {
  const chance = Math.random();
  if (chance < 0.7) { // 70% meteor
    spawnMeteor();
    sounds.meteor.play();
  } else { // 30% blackhole
    spawnBlackhole();
  }
}

/* === Meteor === */
function spawnMeteor() {
  const fromLeft = Math.random() > 0.5;
  const color = colors[Math.floor(Math.random() * colors.length)];
  meteors.push({
    x: fromLeft ? Math.random() * 100 : width - Math.random() * 100,
    y: Math.random() * 100,
    dx: fromLeft ? 10 : -10,
    dy: 10,
    length: 180,
    color: color
  });
}

/* === Explosion === */
function spawnExplosion(x, y, color) {
  let exp = { color: color, particles: [] };
  for (let i = 0; i < 20; i++) {
    exp.particles.push({
      x: x, y: y,
      dx: (Math.random() - 0.5) * 8,
      dy: (Math.random() - 0.5) * 8,
      size: Math.random() * 4 + 2,
      opacity: 1
    });
  }
  explosions.push(exp);
}

/* === Blackhole === */
function spawnBlackhole() {
  const bh = {
    x: Math.random() * width * 0.8 + width * 0.1,
    y: Math.random() * height * 0.8 + height * 0.1,
    radius: 30,
    opacity: 1,
    angle: 0,
    color: colors[Math.floor(Math.random() * colors.length)],
    spawnTime: Date.now(),
    exploded: false
  };
  blackholes.push(bh);
  sounds.blackhole.play();
}

/* === Shockwave === */
function spawnShockwave(x, y, color) {
  shockwaves.push({ x, y, radius: 30, opacity: 1, color });
}

/* === Utils === */
function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(",");
}

/* === Events === */
window.addEventListener("resize", init);
const observer = new MutationObserver(() => init());
observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

init();
draw();
