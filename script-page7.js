// ===============================
// PAGE 7: UNDER MAINTENANCE FX
// ===============================

// --- 1. Animasi glitch title (opsional tambahan flicker stabilizer) ---
const glitchTitle = document.querySelector('.glitch');
if (glitchTitle) {
  glitchTitle.addEventListener('mouseenter', () => {
    glitchTitle.style.animation = 'flicker 1.5s infinite alternate';
  });
  glitchTitle.addEventListener('mouseleave', () => {
    glitchTitle.style.animation = '';
  });
}

// --- 2. Efek bata hancur (brick shatter) saat diklik ---
glitchTitle.addEventListener('click', () => {
  // Kalau sedang dalam efek, jangan ulang
  if (glitchTitle.classList.contains('shatter')) return;

  // Simpan teks aslinya
  const text = glitchTitle.textContent.trim();
  glitchTitle.setAttribute('data-text', text);
  glitchTitle.innerHTML = ''; // kosongin isi

  // Bungkus setiap huruf ke <span>
  [...text].forEach(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char; // spasi tetep
    glitchTitle.appendChild(span);
  });

  glitchTitle.classList.add('shatter');

  // Buat tiap huruf terlempar acak
  glitchTitle.querySelectorAll('span').forEach(span => {
    const x = (Math.random() - 0.5) * 300;   // acak arah horizontal
    const y = (Math.random() - 0.2) * 400;   // acak arah vertikal
    const r = (Math.random() - 0.5) * 720;   // rotasi acak
    span.style.setProperty('--x', x);
    span.style.setProperty('--y', y);
    span.style.setProperty('--r', r);
    span.classList.add('fall');
  });

  // Efek suara kecil (opsional)
  const audio = new Audio('sound/crash.mp3');
  audio.volume = 0.4;
  audio.play().catch(() => {}); // silent kalau autoplay diblok

  // Rebuild teks setelah 2 detik
  setTimeout(() => {
    glitchTitle.classList.remove('shatter');
    glitchTitle.innerHTML = glitchTitle.dataset.text;
  }, 2000);
});

// --- 3. Fade-in page content (biar cinematic masuk pelan) ---
window.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.8s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

// --- 4. Optional: efek cahaya scanner lewat di background ---
const scanner = document.createElement('div');
scanner.style.position = 'fixed';
scanner.style.top = '-50%';
scanner.style.left = '0';
scanner.style.width = '100%';
scanner.style.height = '200%';
scanner.style.background = 'linear-gradient(180deg, transparent 30%, rgba(0,255,255,0.1), transparent 70%)';
scanner.style.pointerEvents = 'none';
scanner.style.animation = 'scanlight 6s linear infinite';
scanner.style.zIndex = '1';
document.body.appendChild(scanner);

// Animasi scanner
const style = document.createElement('style');
style.textContent = `
@keyframes scanlight {
  0% { transform: translateY(-100%); opacity: 0.1; }
  50% { opacity: 0.4; }
  100% { transform: translateY(100%); opacity: 0.1; }
}`;
document.head.appendChild(style);
