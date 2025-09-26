document.addEventListener("DOMContentLoaded", () => {
  const normal = document.getElementById("profile-normal");
  const cyber = document.getElementById("profile-cyber");
  const clickText = document.getElementById("click-text");

  document.querySelector(".profile-container").addEventListener("click", () => {
    if (normal.classList.contains("hidden")) {
      normal.classList.remove("hidden");
      cyber.classList.add("hidden");
      clickText.textContent = "Click Me";
    } else {
      normal.classList.add("hidden");
      cyber.classList.remove("hidden");
      clickText.textContent = "Click Me Again";
    }
  });
});

// Toggle active skill chip
document.querySelectorAll(".skill-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    if (chip.classList.contains("active")) {
      chip.classList.remove("active");
    } else {
      document.querySelectorAll(".skill-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
    }
  });
});

const canvas = document.getElementById("ocean-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let bubbles = [];
let jellies = [];
let sparks = [];
let shockwaves = [];
let jellyTimer = 0;

// Spawns
let lanternFish = [];
let giantSquids = [];
let tsunamis = [];
let rareTimerDark = Date.now();
let lastSquid = Date.now();
let lastTsunami = Date.now();
let bgOverride = null;

/* === Spawn Jellyfish (Dark) === */
function spawnJelly() {
  const neonColors = ["#0ff", "#f0f", "#ff0", "#8f0"];
  const color = neonColors[Math.floor(Math.random() * neonColors.length)];
  jellies.push({
    x: Math.random() * width,
    y: Math.random() * height * 0.7 + height * 0.2,
    size: 50 + Math.random() * 40,
    color,
    floatOffset: Math.random() * 100,
    spawnTime: Date.now()
  });
}

/* === Jelly Explosion === */
function explodeJelly(j) {
  for (let i = 0; i < 20; i++) {
    sparks.push({
      x: j.x,
      y: j.y,
      size: Math.random() * 6 + 2,
      color: j.color,
      opacity: 1
    });
  }
  shockwaves.push({
    x: j.x,
    y: j.y,
    radius: 10,
    color: j.color,
    opacity: 1
  });
}

/* === Spawn Lantern Fish (Dark Rare) === */
function spawnLanternFish() {
  lanternFish.push({
    x: -100,
    y: Math.random() * height * 0.5 + height * 0.3,
    size: 40,
    color: "#0ff",
    speed: 2
  });
}
function drawLanternFish() {
  lanternFish.forEach((f, i) => {
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, f.size, f.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(f.x + f.size, f.y - f.size * 0.6, 10, 0, Math.PI * 2);
    ctx.fillStyle = f.color;
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 40;
    ctx.fill();

    f.x += f.speed;
    if (f.x > width + 200) lanternFish.splice(i, 1);
  });
}

/* === Spawn Giant Squid (Light) === */
function spawnGiantSquid() {
  const colors = ["#9933ff", "#ff3333", "#33ccff"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  giantSquids.push({
    x: Math.random() * width,
    y: height * 0.6,
    size: 80 + Math.random() * 40,
    color,
    spawnTime: Date.now()
  });
  bgOverride = { color, until: Date.now() + 2000 }; // ubah background 2s
}
function drawGiantSquids() {
  giantSquids.forEach((s, i) => {
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, s.size * 0.5, s.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 40;
    ctx.fill();

    for (let t = -4; t <= 4; t++) {
      ctx.beginPath();
      ctx.moveTo(s.x + t * 10, s.y + s.size / 2);
      ctx.quadraticCurveTo(
        s.x + t * 15 + Math.sin(Date.now() / 300 + t) * 20,
        s.y + s.size * 1.5,
        s.x + t * 10,
        s.y + s.size * 2
      );
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (Date.now() - s.spawnTime > 7000) giantSquids.splice(i, 1);
  });
}

/* === Spawn Tsunami (Light) === */
function spawnTsunami() {
  tsunamis.push({
    start: Date.now()
  });
}
function drawTsunamis() {
  tsunamis.forEach((t, i) => {
    let progress = (Date.now() - t.start) / 2000;
    if (progress < 1) {
      ctx.fillStyle = "rgba(102,204,255,0.7)";
      ctx.fillRect(0, height * (1 - progress), width, height);
    } else {
      tsunamis.splice(i, 1);
    }
  });
}

/* === Draw Bubbles === */
function drawBubbles() {
  ctx.fillStyle = "rgba(200,255,255,0.5)";
  bubbles.forEach((b, i) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    b.y -= b.speed;
    if (b.y < -10) bubbles.splice(i, 1);
  });
}

/* === Draw Jellyfish === */
function drawJellyfish() {
  jellies.forEach(j => {
    let floatY = Math.sin(Date.now() / 1000 + j.floatOffset) * 10;

    ctx.beginPath();
    ctx.arc(j.x, j.y + floatY, j.size / 2, 0, Math.PI, true);
    ctx.fillStyle = j.color;
    ctx.shadowColor = j.color;
    ctx.shadowBlur = 30;
    ctx.fill();

    for (let t = -3; t <= 3; t++) {
      ctx.beginPath();
      ctx.moveTo(j.x + t * 8, j.y + floatY);
      ctx.quadraticCurveTo(
        j.x + t * 8 + Math.sin(Date.now() / 500 + t) * 10,
        j.y + floatY + j.size,
        j.x + t * 8,
        j.y + floatY + j.size * 1.5
      );
      ctx.strokeStyle = j.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

/* === Sparks === */
function drawSparks() {
  sparks.forEach((s, i) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(s.color)},${s.opacity})`;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 20;
    ctx.fill();

    s.x += (Math.random() - 0.5) * 4;
    s.y += (Math.random() - 0.5) * 4;
    s.opacity -= 0.03;
    if (s.opacity <= 0) sparks.splice(i, 1);
  });
}

/* === Shockwaves === */
function drawShockwaves() {
  shockwaves.forEach((sw, i) => {
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${hexToRgb(sw.color)},${sw.opacity})`;
    ctx.lineWidth = 4;
    ctx.shadowColor = sw.color;
    ctx.shadowBlur = 20;
    ctx.stroke();

    sw.radius += 5;
    sw.opacity -= 0.02;
    if (sw.opacity <= 0) shockwaves.splice(i, 1);
  });
}

/* === Update Jellyfish === */
function updateJellies() {
  let now = Date.now();
  jellies.forEach((j, i) => {
    if (now - j.spawnTime > 5000) {
      explodeJelly(j);
      jellies.splice(i, 1);
    }
  });

  if (now - jellyTimer > 10000) {
    spawnJelly();
    jellyTimer = now;
  }
}

/* === Update Rare Spawns === */
function updateRareSpawns() {
  let now = Date.now();
  if (document.body.classList.contains("dark-mode")) {
    if (now - rareTimerDark > 45000) {
      spawnLanternFish();
      rareTimerDark = now;
    }
  } else {
    if (now - lastSquid > 30000) {
      spawnGiantSquid();
      lastSquid = now;
    }
    if (now - lastTsunami > 60000) {
      spawnTsunami();
      lastTsunami = now;
    }
  }
}

/* === Draw Ocean Scene === */
function drawOcean() {
  ctx.clearRect(0, 0, width, height);

  if (document.body.classList.contains("dark-mode")) {
    let gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#00111f");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    drawBubbles();
    drawJellyfish();
    drawSparks();
    drawShockwaves();
    drawLanternFish();
    updateJellies();
    updateRareSpawns();
  } else {
    if (bgOverride && Date.now() < bgOverride.until) {
      ctx.fillStyle = bgOverride.color;
      ctx.fillRect(0, 0, width, height);
    } else {
      let gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#66ccff");
      gradient.addColorStop(1, "#b3e5ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    drawBubbles();
    drawGiantSquids();
    drawTsunamis();
    drawShockwaves();
    updateRareSpawns();
  }

  requestAnimationFrame(drawOcean);
}

/* === Utils === */
function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(",");
}

/* === Init === */
function initOcean() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  bubbles = [];
  for (let i = 0; i < 40; i++) {
    bubbles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 6 + 2,
      speed: Math.random() * 1 + 0.5
    });
  }

  jellies = [];
  sparks = [];
  shockwaves = [];
  lanternFish = [];
  giantSquids = [];
  tsunamis = [];
  jellyTimer = Date.now();
  rareTimerDark = Date.now();
  lastSquid = Date.now();
  lastTsunami = Date.now();
  spawnJelly();
}

window.addEventListener("resize", initOcean);
const observer = new MutationObserver(() => initOcean());
observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

initOcean();
drawOcean();
