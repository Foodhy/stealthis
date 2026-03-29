/* Miro / Whiteboard — Interactive JS */

(function () {
  'use strict';

  // ── Draggable sticky note ──
  const draggable = document.getElementById('draggableSticky');

  if (draggable) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    function getPos() {
      const style = window.getComputedStyle(draggable);
      const rect = draggable.getBoundingClientRect();
      const canvas = document.getElementById('canvas').getBoundingClientRect();
      return {
        left: rect.left - canvas.left,
        top: rect.top - canvas.top,
      };
    }

    draggable.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      const pos = getPos();
      origLeft = pos.left;
      origTop = pos.top;
      startX = e.clientX;
      startY = e.clientY;
      draggable.style.position = 'absolute';
      draggable.style.left = origLeft + 'px';
      draggable.style.top = origTop + 'px';
      draggable.style.right = 'auto';
      draggable.style.transform = 'rotate(-3deg) scale(1.03)';
      draggable.style.zIndex = '100';
      draggable.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      draggable.style.left = (origLeft + dx) + 'px';
      draggable.style.top = (origTop + dy) + 'px';
      // Update connectors while dragging
      updateConnectors();
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      draggable.style.transform = 'rotate(-3deg)';
      draggable.style.zIndex = '10';
      draggable.style.transition = 'box-shadow 0.15s ease';
    });

    // Touch support
    draggable.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const pos = getPos();
      origLeft = pos.left;
      origTop = pos.top;
      startX = touch.clientX;
      startY = touch.clientY;
      isDragging = true;
      draggable.style.position = 'absolute';
      draggable.style.left = origLeft + 'px';
      draggable.style.top = origTop + 'px';
      draggable.style.right = 'auto';
      draggable.style.transition = 'none';
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      draggable.style.left = (origLeft + dx) + 'px';
      draggable.style.top = (origTop + dy) + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // ── SVG Connector lines ──
  function getCenterRelativeToCanvas(el) {
    const canvas = document.getElementById('canvas');
    if (!canvas || !el) return { x: 0, y: 0 };
    const canvasRect = canvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      x: elRect.left - canvasRect.left + elRect.width / 2,
      y: elRect.top - canvasRect.top + elRect.height / 2,
    };
  }

  function drawCurvedPath(x1, y1, x2, y2) {
    const cx1 = x1 + (x2 - x1) * 0.4;
    const cy1 = y1;
    const cx2 = x1 + (x2 - x1) * 0.6;
    const cy2 = y2;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  }

  function updateConnectors() {
    const conn1 = document.getElementById('conn1');
    const conn2 = document.getElementById('conn2');
    const profileCluster = document.getElementById('profileCluster');
    const controlsCluster = document.getElementById('controlsCluster');
    const draggableEl = document.getElementById('draggableSticky');

    if (conn1 && profileCluster && controlsCluster) {
      const p1 = getCenterRelativeToCanvas(profileCluster);
      const p2 = getCenterRelativeToCanvas(controlsCluster);
      conn1.setAttribute('d', drawCurvedPath(
        p1.x + 100, p1.y,
        p2.x - 80, p2.y
      ));
    }

    if (conn2 && controlsCluster && draggableEl) {
      const p1 = getCenterRelativeToCanvas(controlsCluster);
      const p2 = getCenterRelativeToCanvas(draggableEl);
      conn2.setAttribute('d', drawCurvedPath(
        p1.x + 80, p1.y,
        p2.x - 60, p2.y
      ));
    }
  }

  // Initial draw + update on resize
  updateConnectors();
  window.addEventListener('resize', updateConnectors);

  // ── Sticker hover pop ──
  document.querySelectorAll('.sticky').forEach((sticky) => {
    if (sticky.id === 'draggableSticky') return;
    sticky.addEventListener('mouseenter', () => {
      const rot = parseFloat(sticky.style.transform.replace(/[^-\d.]/g, '') || '0');
      sticky.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease';
      sticky.style.transform = `rotate(${rot * 0.5}deg) scale(1.03)`;
      sticky.style.boxShadow = '6px 8px 20px rgba(0,0,0,.2)';
      sticky.style.zIndex = '5';
    });

    sticky.addEventListener('mouseleave', () => {
      const rot = sticky.dataset.origRot || sticky.style.transform;
      sticky.style.transform = sticky.dataset.origTransform || sticky.style.transform;
      sticky.style.boxShadow = '';
      sticky.style.zIndex = '2';
    });
  });
})();
