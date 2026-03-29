/* Claymorphism — Interactive JS */

(function () {
  'use strict';

  // ── Squish animation on button click ──
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      this.style.transition = 'transform 0.07s ease, box-shadow 0.07s ease';
      this.style.transform = 'scale(0.9) translateY(2px)';

      setTimeout(() => {
        this.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease';
        this.style.transform = 'scale(1.08) translateY(-4px)';

        setTimeout(() => {
          this.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
          this.style.transform = '';
          setTimeout(() => {
            this.style.transition = '';
          }, 350);
        }, 150);
      }, 70);
    });
  });

  // ── Card tilt / 3D perspective on hover ──
  const profileCard = document.querySelector('.clay-card');
  if (profileCard) {
    profileCard.addEventListener('mousemove', (e) => {
      const rect = profileCard.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      profileCard.style.transform = `
        translateY(-6px) scale(1.02)
        rotateX(${-dy * 6}deg)
        rotateY(${dx * 6}deg)
      `;
    });

    profileCard.addEventListener('mouseleave', () => {
      profileCard.style.transform = '';
      profileCard.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease';
      setTimeout(() => {
        profileCard.style.transition = '';
      }, 400);
    });
  }

  // ── Entrance animation for page elements ──
  const page = document.querySelector('.page');
  const children = page ? Array.from(page.children) : [];

  children.forEach((child, i) => {
    child.style.opacity = '0';
    child.style.transform = 'translateY(30px) scale(0.96)';
    child.style.transition = `
      opacity 0.5s ease ${i * 0.12}s,
      transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.12}s
    `;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      children.forEach((child) => {
        child.style.opacity = '1';
        child.style.transform = '';
      });
    });
  });

  // ── Sphere parallax ──
  const spheres = document.querySelectorAll('.clay-sphere');
  document.addEventListener('mousemove', (e) => {
    const px = (e.clientX / window.innerWidth - 0.5);
    const py = (e.clientY / window.innerHeight - 0.5);

    spheres.forEach((sphere, i) => {
      const depth = (i + 1) * 8;
      sphere.style.translate = `${px * depth}px ${py * depth}px`;
    });
  });

  // ── Input: clay wobble on focus ──
  const clayInput = document.getElementById('clayInput');
  if (clayInput) {
    clayInput.addEventListener('focus', () => {
      clayInput.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
      clayInput.style.transform = 'scale(1.02)';
    });
    clayInput.addEventListener('blur', () => {
      clayInput.style.transform = '';
    });
  }
})();
