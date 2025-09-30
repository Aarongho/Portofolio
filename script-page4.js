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


// =========================
// Paper Falling with Pile + Wind + Respawn Batch
// =========================
(function(){
  const canvas = document.getElementById("paper-canvas");
  const ctx = canvas.getContext("2d");
  let papers = [];
  let windActive = false;
  let pile = []; // kertas yang sudah sampai bawah

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  class Paper {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height; 
      this.size = 8 + Math.random() * 14;
      this.speed = 1 + Math.random() * 2;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.1;
      this.opacity = 0.8 + Math.random() * 0.2;
      this.color = ["#fdf5e6","#fff","#f4e1d2","#e8dcc7"][Math.floor(Math.random()*4)];
      this.isInPile = false;
    }
    update() {
      if (this.isInPile) return; // sudah menumpuk → berhenti
      this.y += this.speed;
      this.angle += this.spin;

      if (windActive) {
        this.x += 15 + Math.random() * 10;
        this.y -= 2;
      }

      // kalau sampai dasar → masuk pile
      if (this.y >= canvas.height - this.size/2 && !windActive) {
        this.isInPile = true;
        pile.push(this);
      }

      // kalau kesapu angin ke luar layar → reset lagi
      if (this.x > canvas.width + 100 || this.y < -50) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size*1.3);
      ctx.restore();
    }
  }

  function spawnBatch(n=70) {
    papers = [];
    pile = [];
    for (let i = 0; i < n; i++) {
      papers.push(new Paper());
    }
  }

  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    papers.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);

    checkPileHeight();
    checkAllInPile();
  }

  function checkPileHeight() {
    if (windActive) return;
    if (pile.length === 0) return;

    let avgY = pile.reduce((sum,p)=>sum+p.y,0) / pile.length;
    let pileHeight = canvas.height - avgY;

    if (pileHeight > canvas.height/3) {
      triggerWind();
    }
  }

  function checkAllInPile() {
    if (windActive) return;
    if (pile.length === papers.length) {
      // semua kertas sudah di bawah → spawn batch baru
      setTimeout(() => spawnBatch(70), 800);
    }
  }

  function triggerWind() {
    windActive = true;
    // semua kertas keluar pile supaya bisa kesapu
    pile.forEach(p => p.isInPile = false);
    pile = [];

    setTimeout(()=>{
      windActive = false;
      spawnBatch(70);
    }, 2500);
  }

  // pertama kali spawn
  spawnBatch(70);
  animate();
})();
