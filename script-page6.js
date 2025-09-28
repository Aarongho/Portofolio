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
