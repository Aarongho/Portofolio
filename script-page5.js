// ==================== DATA SERTIFIKAT ====================
const certificatesData = [
  { title: "Fundamentals of Deep Learning", type: "Hard Skill", img: "image/certif1.JPEG", desc: "Achieved NVIDIA certification in deep learning fundamentals, covering neural networks and modern AI applications." },
  { title: "Medical Science Olympiad Participant", type: "Soft Skill", img: "image/certif2.JPEG", desc: "Participated in SoeMO 2022 medical science olympiad, gaining experience in scientific competition and teamwork." },
  { title: "Canadian Team Mathematics Contest", type: "Hard Skill", img: "image/certif3.JPEG", desc: "Represented SMAK Penabur in Canadian Mathematics Contest hosted by University of Waterloo & UNPAR." },
  { title: "Proximity Atlantis Event Organizer", type: "Soft Skill", img: "image/certif4.JPEG", desc: "Organized Proximity Atlantis 2021 digital design competition, strengthening leadership and event management." },
  { title: "ITB Mathematics Olympiad Participant", type: "Hard Skill", img: "image/certif5.JPEG", desc: "Competed in ITB Mathematics Olympiad (ITBMO 2022), sharpening logical reasoning and analytical skills." },
  { title: "Welcoming Party DSC Club – Event Division", type: "Soft Skill", img: "image/certif6.jpg", desc: "Contributed as an event committee in DSC Club Welcoming Party 2024, focusing on collaboration and coordination." },
  { title: "Outventure 2024 Contribution", type: "Soft Skill", img: "image/certif7.PNG", desc: "Acted as Event Division Activist in DSC Outventure 2024: Beyond Boundaries, improving teamwork and creativity." },
  { title: "Moderator DSC Cascade", type: "Soft Skill", img: "image/certif8.PNG", desc: "Served as moderator for DSC Cascade 2024, enhancing public speaking and communication skills." },
  { title: "Data Science Short Course – BINUS", type: "Hard Skill", img: "image/certif9.PNG", desc: "Completed Data Science Short Course with Professor Widom, covering applied data science concepts." },
  { title: "Welcoming Party DSC Club – Moderator", type: "Soft Skill", img: "image/certif10.jpg", desc: "Moderated at DSC Welcoming Party 2024, engaging audience and improving facilitation skills." }
];

// ==================== HOLOGRAM GRID ====================
const canvas = document.getElementById("hologram-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function getThemeColors() {
  const body = document.body;
  let isLight = body.getAttribute("data-theme") === "light" || body.classList.contains("light");
  return isLight
    ? { backgroundTop: "rgba(200,200,255,0.2)", backgroundBottom: "rgba(245,245,245,1)", grid: "rgba(120,0,255,0.5)" }
    : { backgroundTop: "rgba(0,255,255,0.05)", backgroundBottom: "rgba(0,0,0,0.9)", grid: "rgba(0,255,255,0.4)" };
}
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const colors = getThemeColors();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, colors.backgroundTop);
  gradient.addColorStop(1, colors.backgroundBottom);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = colors.grid; ctx.lineWidth = 1;
  let spacing = 50;
  for (let x = 0; x < canvas.width; x += spacing) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = 0; y < canvas.height; y += spacing) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  requestAnimationFrame(drawGrid);
}
drawGrid();

// ==================== ORBIT (CAROUSEL) ====================
const orbit = document.querySelector(".orbit");
const items = orbit.querySelectorAll(".certificate");
const total = items.length;
items.forEach((item, i) => {
  const angle = (360 / total) * i;
  const distance = 500;
  item.style.transform = `rotateY(${angle}deg) translateZ(${distance}px)`;
});

// ==================== ANIMASI MUTER ====================
let autoSpin = true; 
let angleY = 0;
let drag = false;
let startX = 0;

function animate() { 
  if (autoSpin) { 
    angleY += 0.2; 
    orbit.style.transform = `rotateY(${angleY}deg)`; 
  } 
  requestAnimationFrame(animate); 
}
animate();

// ==================== DRAG CONTROL ====================
const dragBtn = document.getElementById("toggle-drag");

dragBtn.addEventListener("click", () => {
  autoSpin = !autoSpin; // toggle
  if (autoSpin) {
    dragBtn.textContent = "Enable Drag Control";
    drag = false;
  } else {
    dragBtn.textContent = "Disable Drag Control";
  }
});

// event listener drag manual
orbit.addEventListener("mousedown", (e) => {
  if (!autoSpin) {
    drag = true;
    startX = e.clientX;
  }
});
window.addEventListener("mouseup", () => drag = false);
window.addEventListener("mousemove", (e) => {
  if (drag && !autoSpin) {
    let deltaX = e.clientX - startX;
    angleY += deltaX * 0.3; // sensitivity
    orbit.style.transform = `rotateY(${angleY}deg)`;
    startX = e.clientX;
  }
});

// support touch
orbit.addEventListener("touchstart", (e) => {
  if (!autoSpin) {
    drag = true;
    startX = e.touches[0].clientX;
  }
});
orbit.addEventListener("touchend", () => drag = false);
orbit.addEventListener("touchmove", (e) => {
  if (drag && !autoSpin) {
    let deltaX = e.touches[0].clientX - startX;
    angleY += deltaX * 0.3;
    orbit.style.transform = `rotateY(${angleY}deg)`;
    startX = e.touches[0].clientX;
  }
});

// ==================== BUTTONS ====================
const viewRandom = document.getElementById("view-random");
const viewAll = document.getElementById("view-all");
const randomView = document.getElementById("random-view");
const randomCert = randomView.querySelector(".random-cert");
const backRandom = document.getElementById("back-random");
const pickAgain = document.getElementById("pick-again");
const allView = document.getElementById("all-view");
const allContainer = allView.querySelector(".all-container");
const returnGlobe = document.getElementById("return-globe");




// ==================== RANDOM VIEW ====================
function pickRandomCert() {
  const pick = certificatesData[Math.floor(Math.random() * certificatesData.length)];
  randomCert.innerHTML = `
    <div class="random-card">
      <h2>${pick.title}</h2>
      <h4 style="color:cyan">${pick.type}</h4>
      <div class="img-wrapper">
        <img src="${pick.img}" alt="${pick.title}">
      </div>
      <p>${pick.desc}</p>
    </div>
  `;
}

viewRandom.addEventListener("click", () => {
  orbit.classList.add("hide");
  orbit.classList.remove("show");
  pickRandomCert();
  randomView.style.display = "flex";
  setTimeout(() => randomView.classList.add("show"), 10);
});

pickAgain.addEventListener("click", pickRandomCert);

backRandom.addEventListener("click", () => {
  randomView.classList.remove("show");
  setTimeout(() => {
    randomView.style.display = "none";
    orbit.classList.add("show");
    orbit.classList.remove("hide");
  }, 400);
});

// ==================== ALL VIEW ====================
viewAll.addEventListener("click", () => {
  orbit.classList.add("hide");
  orbit.classList.remove("show");
  allContainer.innerHTML = "";
  certificatesData.forEach(cert => {
    allContainer.innerHTML += `
      <div class="cert-card">
        <h2>${cert.title}</h2>
        <h4 style="color:cyan">${cert.type}</h4>
        <div class="img-wrapper">
          <img src="${cert.img}" alt="${cert.title}">
        </div>
        <p>${cert.desc}</p>
      </div>`;
  });
  allView.style.display = "flex";
  setTimeout(() => allView.classList.add("show"), 10);
});

returnGlobe.addEventListener("click", () => {
  allView.classList.remove("show");
  setTimeout(() => {
    allView.style.display = "none";
    orbit.classList.add("show");
    orbit.classList.remove("hide");
  }, 400);
});
