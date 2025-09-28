const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileOverlay = document.querySelector(".mobile-overlay");

if (hamburger && mobileMenu && mobileOverlay) {
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
    mobileOverlay.classList.toggle("show");
  });

  // Klik overlay juga nutup menu
  mobileOverlay.addEventListener("click", () => {
    mobileMenu.classList.remove("show");
    mobileOverlay.classList.remove("show");
  });
}

// Cari semua section dan link
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-center a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120; // offset karena navbar fixed
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }
  });
});



window.addEventListener("scroll", () => {
  let current = null;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120; // offset karena navbar
    const sectionHeight = section.clientHeight;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");

    // Kalau ada section aktif baru kasih class
    if (current && link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }

    // Kalau di paling atas (scroll < 50px), aktifin "About Me" default (page3.html)
    if (!current && window.location.pathname.includes("page3.html") && link.getAttribute("href").includes("page3.html")) {
      link.classList.add("active");
    }
  });
});
