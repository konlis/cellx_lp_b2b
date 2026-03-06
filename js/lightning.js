/**
 * Home Fit+ Hero Lightning Canvas Animation (pv-magazyn.pl)
 * Generates animated lightning bolts in green/blue representing energy flow
 */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let bolts = [];
  let animationId;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createBolt() {
    const isGreen = Math.random() > 0.4;
    const color = isGreen ? { r: 126, g: 217, b: 87 } : { r: 0, g: 92, b: 187 };

    const startX = Math.random() * width;
    const startY = Math.random() * height * 0.3;
    const endX = startX + (Math.random() - 0.5) * width * 0.5;
    const endY = startY + height * 0.3 + Math.random() * height * 0.4;

    const segments = [];
    const steps = 8 + Math.floor(Math.random() * 8);
    let x = startX;
    let y = startY;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const targetX = startX + (endX - startX) * t;
      const targetY = startY + (endY - startY) * t;
      const offset = (1 - Math.abs(t - 0.5) * 2) * 60;

      x = targetX + (Math.random() - 0.5) * offset;
      y = targetY + (Math.random() - 0.5) * offset * 0.3;

      segments.push({ x, y });
    }

    // Create branches
    const branches = [];
    for (let i = 2; i < segments.length - 1; i++) {
      if (Math.random() > 0.6) {
        const branchSegs = [];
        let bx = segments[i].x;
        let by = segments[i].y;
        const branchLen = 2 + Math.floor(Math.random() * 3);
        const angle = Math.random() * Math.PI - Math.PI / 2;

        for (let j = 0; j <= branchLen; j++) {
          bx += Math.cos(angle) * (15 + Math.random() * 20);
          by += Math.sin(angle) * (15 + Math.random() * 20);
          branchSegs.push({ x: bx, y: by });
        }
        branches.push(branchSegs);
      }
    }

    return {
      segments,
      branches,
      color,
      life: 1,
      decay: 0.015 + Math.random() * 0.02,
      thickness: 1.5 + Math.random() * 1.5,
      glowSize: 15 + Math.random() * 20,
    };
  }

  function drawBolt(bolt) {
    const { segments, branches, color, life, thickness, glowSize } = bolt;
    const alpha = life;

    // Glow layer
    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},0.4)`;
    ctx.lineWidth = glowSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.filter = `blur(${glowSize / 2}px)`;
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i++) {
      ctx.lineTo(segments[i].x, segments[i].y);
    }
    ctx.stroke();
    ctx.restore();

    // Core bolt
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},1)`;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = `rgba(${color.r},${color.g},${color.b},0.8)`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i++) {
      ctx.lineTo(segments[i].x, segments[i].y);
    }
    ctx.stroke();

    // White core
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = `rgba(255,255,255,0.8)`;
    ctx.lineWidth = thickness * 0.3;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i++) {
      ctx.lineTo(segments[i].x, segments[i].y);
    }
    ctx.stroke();

    // Branches
    branches.forEach((branch) => {
      ctx.globalAlpha = alpha * 0.4;
      ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},0.6)`;
      ctx.lineWidth = thickness * 0.5;
      ctx.beginPath();
      const parentSeg = segments[2];
      ctx.moveTo(parentSeg?.x || branch[0].x, parentSeg?.y || branch[0].y);
      for (let i = 0; i < branch.length; i++) {
        ctx.lineTo(branch[i].x, branch[i].y);
      }
      ctx.stroke();
    });

    ctx.restore();
  }

  // Ambient particles
  const particles = [];
  function initParticles() {
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        alpha: 0.1 + Math.random() * 0.3,
        isGreen: Math.random() > 0.4,
      });
    }
  }

  function drawParticles() {
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const color = p.isGreen ? '126,217,87' : '0,92,187';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${p.alpha})`;
      ctx.fill();
    });
  }

  let lastBoltTime = 0;
  let nextBoltDelay = 800;

  function animate(timestamp) {
    ctx.clearRect(0, 0, width, height);

    // Spawn new bolts
    if (timestamp - lastBoltTime > nextBoltDelay) {
      bolts.push(createBolt());
      lastBoltTime = timestamp;
      nextBoltDelay = 2000 + Math.random() * 2000;
    }

    // Draw particles
    drawParticles();

    // Update and draw bolts
    bolts = bolts.filter((bolt) => {
      bolt.life -= bolt.decay;
      if (bolt.life <= 0) return false;
      drawBolt(bolt);
      return true;
    });

    animationId = requestAnimationFrame(animate);
  }

  // Reduce motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    resize();
    initParticles();

    if (!prefersReducedMotion) {
      // Start with a few bolts
      bolts.push(createBolt());
      bolts.push(createBolt());
      animationId = requestAnimationFrame(animate);
    } else {
      // Static fallback: draw a few frozen bolts
      bolts.push(createBolt());
      bolts.push(createBolt());
      bolts.push(createBolt());
      drawParticles();
      bolts.forEach(drawBolt);
    }
  }

  window.addEventListener('resize', () => {
    resize();
    particles.length = 0;
    initParticles();
  });

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(animate);
    }
  });

  init();
})();
