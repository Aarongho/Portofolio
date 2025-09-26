const muteBtn = document.getElementById("mute-btn");
const toggle = document.getElementById("theme-toggle");
const body = document.body;
const label = document.querySelector(".toggle-slider .label-text");
const icon = document.querySelector(".toggle-slider .icon");

/* ====== IFRAME MUSIC CONTROLLER ====== */
let musicFrame;
let frameAudio;

function initMuteControl() {
  if (musicFrame && musicFrame.contentWindow) {
    try {
      frameAudio = musicFrame.contentWindow.document.getElementById("bg-music");
      if (frameAudio) {
        muteBtn.textContent = frameAudio.muted ? "🔇" : "🔊";

        if (!muteBtn.dataset.bound) {
          muteBtn.addEventListener("click", () => {
            frameAudio.muted = !frameAudio.muted;
            muteBtn.textContent = frameAudio.muted ? "🔇" : "🔊";
            localStorage.setItem("music-muted", frameAudio.muted);
          });
          muteBtn.dataset.bound = "true";
        }
      }
    } catch (err) {
      console.log("Audio belum siap:", err);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  musicFrame = document.querySelector("iframe[src='music.html']");
  if (musicFrame) {
    const check = setInterval(() => {
      initMuteControl();
      if (frameAudio) clearInterval(check);
    }, 300);
  }

  // Awalnya tanpa animasi theme
  body.classList.remove("theme-animate");

  const theme = localStorage.getItem("theme") || "light";
  if (theme === "dark") {
    body.classList.add("dark-mode");
    if (toggle) {
      toggle.checked = true;
      label.textContent = "Night Mode";
      icon.textContent = "🌙";
    }
  } else {
    body.classList.remove("dark-mode");
    if (toggle) {
      toggle.checked = false;
      label.textContent = "Light Mode";
      icon.textContent = "☀️";
    }
  }

  // Aktifkan animasi theme lagi
  setTimeout(() => {
    body.classList.add("theme-animate");
  }, 100);

  // Page2 animasi
  const page2Els = document.querySelectorAll(".page2-animate");
  if (page2Els.length > 0) {
    page2Els.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add("show");
      }, i * 150);
    });
  }

  // Page3 animasi (slide up)
  const page3Els = document.querySelectorAll(".page3-animate");
  if (page3Els.length > 0) {
    page3Els.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add("show");
      }, i * 150);
    });
  }

  // Hilangkan preload setelah 2 frame → animasi masuk terlihat
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove("preload");
    });
  });

  // Tangkap semua link internal
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener("click", e => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http")) {
          e.preventDefault();
          document.body.classList.add("fade-out");
          setTimeout(() => {
            window.location.href = href;
          }, 800); // sesuai durasi CSS
        }
      });
    }
  });
});

/* ====== START MUSIC ON ANY INTERACTION ====== */
function triggerMusicStart() {
  const frame = document.querySelector("iframe[src='music.html']");
  if (frame) {
    try {
      const audio = frame.contentWindow.document.getElementById("bg-music");
      if (audio && audio.paused) {
        audio.play()
          .then(() => {
            localStorage.setItem("music-started", "true");
          })
          .catch((err) => console.log("Autoplay blocked:", err));
      }
    } catch (err) {
      console.log("Frame belum siap:", err);
    }
  }
}
["click", "keydown", "scroll"].forEach(evt => {
  document.addEventListener(evt, triggerMusicStart, { once: true });
});

/* ====== THEME TOGGLE ====== */
if (toggle) {
  toggle.addEventListener("change", () => {
    body.classList.toggle("dark-mode");
    label.style.opacity = 0;
    icon.style.opacity = 0;

    setTimeout(() => {
      if (toggle.checked) {
        label.textContent = "Night Mode";
        icon.textContent = "🌙";
        localStorage.setItem("theme", "dark");
      } else {
        label.textContent = "Light Mode";
        icon.textContent = "☀️";
        localStorage.setItem("theme", "light");
      }
      label.style.opacity = 1;
      icon.style.opacity = 1;
    }, 300);
  });
}

// Handle back/forward navigation (bfcache restore)
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});
