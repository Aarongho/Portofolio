// script-page4.js
document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('.filter-btn');
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const mobileBtn = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-overlay');

  // FILTER
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(c => {
        const cat = c.dataset.category;
        if (filter === 'all' || filter === cat) {
          c.style.display = '';
          c.style.opacity = 0;
          c.style.transform = 'translateY(8px)';
          requestAnimationFrame(()=> {
            c.style.transition = 'opacity .32s ease, transform .32s ease';
            c.style.opacity = 1;
            c.style.transform = 'translateY(0)';
          });
        } else {
          c.style.display = 'none';
        }
      });
    });
  });

  // prevent horizontal scroll
  const preventX = ()=>{ document.documentElement.style.overflowX='hidden'; document.body.style.overflowX='hidden'; };
  preventX(); window.addEventListener('resize', preventX);

  // SHOCKWAVE on emoji hover
  document.querySelectorAll('.emoji-chip').forEach(chip => {
    chip.addEventListener('mouseenter', () => {
      chip.classList.add('shockwave');
      setTimeout(() => chip.classList.remove('shockwave'), 600);
    });
  });

  // PARALLAX hover untuk kartu
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 6; // max 6deg
      const rotateY = ((x - centerX) / centerX) * -6;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = "rotateX(0) rotateY(0) scale(1)";
    });
  });
});
