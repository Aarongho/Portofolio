const canvas = document.getElementById("matrix-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// atur ukuran awal
resizeCanvas();

// update kalau layar diresize
window.addEventListener("resize", resizeCanvas);

// huruf matrix (campur Jepang + Latin + angka)
const letters = "アァイィウヴエェオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);

// tiap kolom punya "drop" (posisi Y)
const drops = Array(columns).fill(1);

function draw() {
  const isDark = document.body.classList.contains("dark-mode");

  // background fade beda mode
  ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // warna huruf beda mode
  ctx.fillStyle = isDark ? "#0F0" : "#111";
  ctx.font = fontSize + "px Orbitron";

  for (let i = 0; i < drops.length; i++) {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}


// jalankan setiap 35ms
setInterval(draw, 35);

// responsive resize
window.addEventListener("resize", () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
});


document.querySelectorAll('.slider').forEach(slider => {
  const slides = slider.querySelector('.slides');
  const images = slider.querySelectorAll('img');
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  let index = 0;

  function showSlide(i) {
    if (i < 0) index = images.length - 1;
    else if (i >= images.length) index = 0;
    else index = i;
    slides.style.transform = `translateX(${-index * 100}%)`;
  }

  prev.addEventListener('click', () => showSlide(index - 1));
  next.addEventListener('click', () => showSlide(index + 1));

  // optional: auto-slide every 5s
  setInterval(() => showSlide(index + 1), 5000);
});

// Spotlight cursor untuk project-card
document.querySelectorAll('.project-card').forEach(card => {
  const spotlight = document.createElement('div');
  spotlight.classList.add('spotlight');
  card.appendChild(spotlight);

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    spotlight.style.left = (e.clientX - rect.left) + "px";
    spotlight.style.top = (e.clientY - rect.top) + "px";
  });
});




