/* ========================================
   E² - Projetos e Portfolio
   Organic, living JavaScript. Not AI-generated.
   ======================================== */

'use strict';

/* ========================================
   1. AMBIENT CANVAS — Organic flow field
   ======================================== */
class AmbientCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.flowField = [];
    this.cols = 0;
    this.rows = 0;
    this.cellSize = 40;
    this.noiseScale = 0.003;
    this.noiseZ = 0;
    this.maxParticles = 120;
    this.lastTime = 0;
    this.mouse = { x: -9999, y: -9999 };
    this.mouseInfluence = 150;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    this.initParticles();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);

    this.cols = Math.floor(window.innerWidth / this.cellSize) + 1;
    this.rows = Math.floor(window.innerHeight / this.cellSize) + 1;
    this.buildFlowField();
  }

  buildFlowField() {
    this.flowField = [];
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        const angle = this.noise(x * this.noiseScale, y * this.noiseScale, this.noiseZ) * Math.PI * 2;
        row.push({ x: Math.cos(angle), y: Math.sin(angle) });
      }
      this.flowField.push(row);
    }
  }

  // Simple 3D noise approximation
  noise(x, y, z) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 43.758) * 43758.5453;
    return n - Math.floor(n);
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch (side) {
      case 0: x = Math.random() * window.innerWidth; y = -20; break;
      case 1: x = window.innerWidth + 20; y = Math.random() * window.innerHeight; break;
      case 2: x = Math.random() * window.innerWidth; y = window.innerHeight + 20; break;
      default: x = -20; y = Math.random() * window.innerHeight;
    }
    return {
      x, y,
      vx: 0, vy: 0,
      size: Math.random() * 2 + 1,
      maxSize: Math.random() * 3 + 2,
      life: 0,
      maxLife: Math.random() * 200 + 150,
      hue: 120 + Math.random() * 30, // Green hue range
      alpha: 0,
      trail: []
    };
  }

  animate(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    // Clear with trail effect
    this.ctx.fillStyle = 'rgba(8, 10, 12, 0.15)';
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Slowly evolve flow field
    this.noiseZ += dt * 0.05;
    this.buildFlowField();

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      this.updateParticle(p, dt);

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
        this.particles.push(this.createParticle());
      } else {
        this.drawParticle(p);
      }
    }

    // Maintain particle count
    while (this.particles.length < this.maxParticles) {
      this.particles.push(this.createParticle());
    }

    requestAnimationFrame(this.animate);
  }

  updateParticle(p, dt) {
    const col = Math.floor(p.x / this.cellSize);
    const row = Math.floor(p.y / this.cellSize);

    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      const force = this.flowField[row][col];
      p.vx += force.x * 30 * dt;
      p.vy += force.y * 30 * dt;
    }

    // Mouse influence
    const dx = this.mouse.x - p.x;
    const dy = this.mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < this.mouseInfluence && dist > 0) {
      const force = (this.mouseInfluence - dist) / this.mouseInfluence;
      p.vx -= (dx / dist) * force * 100 * dt;
      p.vy -= (dy / dist) * force * 100 * dt;
    }

    // Velocity damping
    p.vx *= 0.98;
    p.vy *= 0.98;

    // Update position
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Life cycle
    p.life++;
    const progress = p.life / p.maxLife;
    if (progress < 0.1) {
      p.alpha = progress / 0.1 * 0.4;
      p.size = p.maxSize * (progress / 0.1);
    } else if (progress > 0.9) {
      p.alpha = (1 - progress) / 0.1 * 0.4;
    } else {
      p.alpha = 0.4;
      p.size = p.maxSize;
    }

    // Trail
    p.trail.push({ x: p.x, y: p.y, alpha: p.alpha * 0.3 });
    if (p.trail.length > 8) p.trail.shift();
  }

  drawParticle(p) {
    // Trail
    this.ctx.beginPath();
    for (let i = 0; i < p.trail.length; i++) {
      const t = p.trail[i];
      const r = p.size * (i / p.trail.length) * 0.5;
      this.ctx.moveTo(t.x + r, t.y);
      this.ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
    }
    this.ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.alpha * 0.3})`;
    this.ctx.fill();

    // Main particle
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.alpha})`;
    this.ctx.fill();

    // Glow
    if (p.alpha > 0.2) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      gradient.addColorStop(0, `hsla(${p.hue}, 70%, 60%, ${p.alpha * 0.3})`);
      gradient.addColorStop(1, `hsla(${p.hue}, 70%, 60%, 0)`);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }
  }
}

/* ========================================
   2. FLOATING PARTICLES — CSS-based ambient
   ======================================== */
class FloatingParticles {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.particles = [];
    this.maxParticles = 25;
    this.createParticles();
    this.animate();
  }

  createParticles() {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      const startX = Math.random() * 100;
      const startY = 100 + Math.random() * 20;
      const duration = 15 + Math.random() * 20;
      const delay = Math.random() * 20;

      p.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${startX}%; top: ${startY}%;
        animation-duration: ${duration}s;
        animation-delay: -${delay}s;
        --particle-hue: ${120 + Math.random() * 30};
      `;
      this.container.appendChild(p);
      this.particles.push(p);
    }
  }

  animate() {
    // CSS handles animation, just ensure they exist
    if (this.particles.length < this.maxParticles) {
      this.createParticles();
    }
    requestAnimationFrame(() => this.animate());
  }
}

/* ========================================
   3. TYPEWRITER — Organic typing effect
   ======================================== */
class Typewriter {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.currentTextIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.typeSpeed = options.typeSpeed || 60;
    this.deleteSpeed = options.deleteSpeed || 30;
    this.pauseTime = options.pauseTime || 2500;
    this.loop = options.loop !== false;
    this.timer = null;
  }

  start() {
    this.type();
  }

  type() {
    const currentText = this.texts[this.currentTextIndex];
    const visibleText = currentText.substring(0, this.charIndex);
    this.element.textContent = visibleText;

    if (!this.isDeleting) {
      if (this.charIndex < currentText.length) {
        this.charIndex++;
        this.timer = setTimeout(() => this.type(), this.typeSpeed + Math.random() * 40);
      } else {
        this.isDeleting = true;
        this.timer = setTimeout(() => this.type(), this.pauseTime);
      }
    } else {
      if (this.charIndex > 0) {
        this.charIndex--;
        this.timer = setTimeout(() => this.type(), this.deleteSpeed);
      } else {
        this.isDeleting = false;
        this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
        this.timer = setTimeout(() => this.type(), 500);
      }
    }
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

/* ========================================
   4. COUNTER — Smooth number animation
   ======================================== */
class Counter {
  constructor(element, target, options = {}) {
    this.element = element;
    this.target = target;
    this.duration = options.duration || 1800;
    this.easing = options.easing || ((t) => 1 - Math.pow(1 - t, 3));
    this.format = options.format || ((n) => n.toLocaleString('pt-BR'));
    this.start = null;
  }

  animate(timestamp) {
    if (!this.start) this.start = timestamp;
    const progress = Math.min((timestamp - this.start) / this.duration, 1);
    const eased = this.easing(progress);
    this.element.textContent = this.format(Math.floor(eased * this.target));

    if (progress < 1) {
      requestAnimationFrame((t) => this.animate(t));
    } else {
      this.element.textContent = this.format(this.target);
    }
  }

  run() {
    requestAnimationFrame((t) => this.animate(t));
  }
}

/* ========================================
   5. PROJECTS MANAGER — With progress bars
   ======================================== */
class ProjectsManager {
  constructor() {
    this.list = document.getElementById('projects-list');
    this.projects = [];
    this.animated = new Set();
  }

  addBatch(projects) {
    this.projects.push(...projects);
    this.render();
  }

  render() {
    if (!this.list) return;
    this.list.innerHTML = this.projects.map((p, i) => this.createCard(p, i)).join('');
    this.observeProgressBars();
  }

  createCard(project, index) {
    const techs = (project.tech || [])
      .map(t => `<span class="tech">${this.escape(t)}</span>`)
      .join('');

    const links = [];
    if (project.url) {
      links.push(`
        <a href="${this.escape(project.url)}" target="_blank" rel="noopener" class="project-link" data-magnetic>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          DEMO
        </a>
      `);
    }
    if (project.repo) {
      links.push(`
        <a href="${this.escape(project.repo)}" target="_blank" rel="noopener" class="project-link" data-magnetic>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
          CÓDIGO
        </a>
      `);
    }

    const progress = project.progress || 0;
    const statusClass = progress >= 100 ? 'complete' : (progress > 0 ? 'in-progress' : 'planning');
    const statusLabel = progress >= 100 ? 'CONCLUÍDO' : (progress > 0 ? 'EM ANDAMENTO' : 'PLANEJAMENTO');

    const icon = project.icon || '⌬';

    return `
      <article class="project-item" data-project-index="${index}">
        <div class="project-main">
          <div class="project-thumb">
            <span class="project-icon">${this.escape(icon)}</span>
          </div>
          <div class="project-info">
            <div class="project-header">
              <h3 class="project-title">${this.escape(project.title)}</h3>
              <span class="project-status ${statusClass}">${statusLabel}</span>
            </div>
            <p class="project-desc">${this.escape(project.desc)}</p>
            <div class="project-tech">${techs}</div>
            <div class="project-progress">
              <div class="progress-header">
                <span class="progress-label">Progresso</span>
                <span class="progress-value" data-target="${progress}">${progress}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" data-progress="${progress}"></div>
              </div>
            </div>
            <div class="project-links">${links.join('')}</div>
          </div>
        </div>
      </article>
    `;
  }

  observeProgressBars() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fills = entry.target.querySelectorAll('.progress-fill');
          fills.forEach(fill => {
            const progress = parseInt(fill.dataset.progress, 10);
            const valueEl = fill.closest('.project-progress').querySelector('.progress-value');
            fill.style.width = progress + '%';
            if (valueEl && !valueEl.dataset.animated) {
              valueEl.dataset.animated = 'true';
              new Counter(valueEl, progress, { duration: 1200 }).run();
            }
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.project-item').forEach(item => observer.observe(item));
  }

  escape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/* ========================================
   6. STACK CLOUD — Animated tech tags
   ======================================== */
class StackCloud {
  constructor(containerId, technologies) {
    this.container = document.getElementById(containerId);
    this.technologies = technologies;
    if (this.container) this.render();
  }

  render() {
    this.container.innerHTML = this.technologies
      .map((tech, i) => `<span class="stack-item" style="animation-delay: ${0.1 + i * 0.05}s">${this.escape(tech)}</span>`)
      .join('');
  }

  escape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/* ========================================
   7. MAGNETIC BUTTONS — Organic cursor follow
   ======================================== */
class MagneticButtons {
  constructor() {
    this.buttons = document.querySelectorAll('[data-magnetic]');
    this.init();
  }

  init() {
    this.buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => this.onMouseMove(e, btn));
      btn.addEventListener('mouseleave', (e) => this.onMouseLeave(e, btn));
    });
  }

  onMouseMove(e, btn) {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }

  onMouseLeave(e, btn) {
    btn.style.transform = 'translate(0, 0)';
  }
}

/* ========================================
   8. SIDE NAV — Scroll spy
   ======================================== */
class SideNav {
  constructor() {
    this.dots = document.querySelectorAll('.nav-dot');
    this.sections = document.querySelectorAll('section[data-section]');
    this.init();
  }

  init() {
    // Click to scroll
    this.dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const section = document.getElementById(dot.dataset.section);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Scroll spy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setActive(entry.target.dataset.section);
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    this.sections.forEach(section => observer.observe(section));
  }

  setActive(sectionId) {
    this.dots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.section === sectionId);
    });
  }
}

/* ========================================
   9. TOP PROGRESS BAR — Scroll progress
   ======================================== */
class TopProgress {
  constructor() {
    this.bar = document.getElementById('top-progress-fill');
    this.init();
  }

  init() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.update();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    this.bar.style.transform = `scaleX(${progress})`;
  }
}

/* ========================================
   10. SCROLL REVEAL — Section animations
   ======================================== */
class ScrollReveal {
  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  }

  observe(selector) {
    document.querySelectorAll(selector).forEach(el => this.observer.observe(el));
  }
}

/* ========================================
   11. CONTACT FORM — Formspree handling
   ======================================== */
class ContactForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (!this.form) return;
    this.submitBtn = this.form.querySelector('.form-submit');
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.submitBtn.disabled) return;

    const originalText = this.submitBtn.querySelector('.btn-text').textContent;
    this.submitBtn.disabled = true;
    this.submitBtn.querySelector('.btn-text').textContent = 'ENVIANDO...';

    try {
      const formData = new FormData(this.form);
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        this.submitBtn.querySelector('.btn-text').textContent = 'ENVIADO ✓';
        this.submitBtn.style.background = 'var(--accent)';
        this.submitBtn.style.borderColor = 'var(--accent)';
        this.form.reset();
        setTimeout(() => this.resetButton(originalText), 3000);
      } else {
        throw new Error('Erro no envio');
      }
    } catch (err) {
      this.submitBtn.querySelector('.btn-text').textContent = 'ERRO — TENTE NOVAMENTE';
      this.submitBtn.style.background = 'var(--accent-red, #ff4444)';
      this.submitBtn.style.borderColor = 'var(--accent-red, #ff4444)';
      setTimeout(() => this.resetButton(originalText), 3000);
    }
  }

  resetButton(text) {
    this.submitBtn.disabled = false;
    this.submitBtn.querySelector('.btn-text').textContent = text;
    this.submitBtn.style.background = '';
    this.submitBtn.style.borderColor = '';
  }
}

/* ========================================
   12. AUDIO BEEP — Subtle interaction sounds
   ======================================== */
class AudioBeep {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {
    if (this.enabled) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.enabled = true;
    } catch (e) { /* no audio */ }
  }

  play(freq = 520, duration = 0.06, type = 'sine') {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}

/* ========================================
   13. SMOOTH SCROLL — Anchor links
   ======================================== */
function initSmoothScroll(audio) {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (audio) audio.play(660, 0.04);
      }
    });
  });
}

/* ========================================
   14. INITIALIZATION — Main entry point
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Ambient canvas
  new AmbientCanvas('ambient-canvas');

  // 2. Floating particles
  new FloatingParticles('particles-container');

  // 3. Audio beep (init on first interaction)
  const audioBeep = new AudioBeep();
  window.audioBeep = audioBeep;
  const initAudio = () => {
    audioBeep.init();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);

  // 4. Hero greeting typewriter
  const greetingEl = document.getElementById('greeting-text');
  if (greetingEl) {
    const greetings = [
      'Olá, sou desenvolvedor fullstack.',
      'Construo coisas que funcionam.',
      'Automações • Sites • Plugins',
      'Código limpo. Entrega real.'
    ];
    new Typewriter(greetingEl, greetings, {
      typeSpeed: 50,
      deleteSpeed: 25,
      pauseTime: 2800
    }).start();
  }

  // 5. Hero stats counters
  const stats = document.querySelectorAll('.meta-value:not(.status-active)');
  const statTargets = [21, 2]; // idade, anos exp (ajuste conforme necessário)
  stats.forEach((stat, i) => {
    if (statTargets[i]) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            new Counter(stat, statTargets[i], { duration: 1500 }).run();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(stat);
    }
  });

  // 6. Stack cloud
  const stackTechs = [
    'TypeScript', 'JavaScript', 'React', 'Next.js',
    'Node.js', 'Python', 'Go', 'PostgreSQL',
    'Docker', 'Linux', 'Git', 'AWS'
  ];
  new StackCloud('stack-cloud', stackTechs);

  // 7. Bio text typewriter
  const bioEl = document.getElementById('bio-text');
  if (bioEl) {
    const bioText = 'Desenvolvedor fullstack focado em criar soluções práticas: automações que eliminam trabalho manual, sites performáticos e plugins que estendem ferramentas. Formação técnica pelo SENAI e cursando Engenharia da Computação na UNIJORGE. Acredito que código bom é código que resolve problema de verdade, sem firula.';
    let i = 0;
    const typeBio = () => {
      if (i < bioText.length) {
        bioEl.textContent += bioText[i];
        i++;
        setTimeout(typeBio, 12 + Math.random() * 8);
      }
    };
    const bioObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(typeBio, 300);
          bioObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    bioObserver.observe(bioEl);
  }

  // 8. Focus list
  const focusEl = document.getElementById('focus-list');
  if (focusEl) {
    const focuses = [
      { icon: '⚡', title: 'Automações Inteligentes', desc: 'Scripts e bots que eliminam tarefas repetitivas. Python, Node.js, Selenium, Playwright.' },
      { icon: '🌐', title: 'Sites & Landing Pages', desc: 'React, Next.js, Astro. Performance, SEO, acessibilidade. Deploy em Vercel, Netlify, AWS.' },
      { icon: '🔌', title: 'Plugins & Extensões', desc: 'VS Code, Chrome, Figma. TypeScript, APIs nativas, publicação nas stores.' },
      { icon: '⚙️', title: 'APIs & Backend', desc: 'FastAPI, Express, Go. PostgreSQL, Redis, Docker. Arquitetura limpa, testes, CI/CD.' }
    ];
    focusEl.innerHTML = focuses.map(f => `
      <li class="focus-item">
        <div class="focus-icon">${f.icon}</div>
        <div class="focus-content">
          <div class="focus-title">${f.title}</div>
          <div class="focus-desc">${f.desc}</div>
        </div>
      </li>
    `).join('');
  }

  // 9. Freelance intro
  const freelanceEl = document.getElementById('freelance-intro');
  if (freelanceEl) {
    freelanceEl.textContent = 'Precisa de automação pra eliminar trabalho manual? Um site que converte? Um plugin pra sua ferramenta favorita? Uma API robusta? Me chama. Entrego código limpo, documentado e no prazo.';
  }

  // 10. Services
  const servicesEl = document.getElementById('services-grid');
  if (servicesEl) {
    const services = [
      { icon: '⚡', title: 'Automações & Scripts', desc: 'RPA, web scraping, bots, integrações entre sistemas. Python, Node.js, Playwright, n8n.', tags: ['Python', 'Node.js', 'Playwright', 'n8n'] },
      { icon: '🌐', title: 'Sites & Landing Pages', desc: 'Sites institucionais, landing pages, dashboards, blogs. React, Next.js, Astro, Tailwind.', tags: ['React', 'Next.js', 'Tailwind', 'TypeScript'] },
      { icon: '🔌', title: 'Plugins & Extensões', desc: 'Extensões Chrome, plugins VS Code, plugins Figma. Publicação nas stores incluída.', tags: ['TypeScript', 'Chrome API', 'VS Code API'] },
      { icon: '⚙️', title: 'APIs & Backend', desc: 'REST, GraphQL, WebSockets. Auth, database, cache, deploy. FastAPI, Express, Go.', tags: ['FastAPI', 'PostgreSQL', 'Redis', 'Docker'] },
      { icon: '🔧', title: 'Integrações & Webhooks', desc: 'Conectar sistemas: ERPs, CRMs, gateways de pagamento, WhatsApp, e-mail.', tags: ['REST', 'Webhooks', 'WhatsApp API', 'Stripe'] },
      { icon: '📊', title: 'Dashboards & Data Viz', desc: 'Painéis admin, métricas em tempo real, relatórios. Recharts, D3, TanStack Query.', tags: ['Recharts', 'D3.js', 'TanStack Query', 'WebSockets'] }
    ];
    servicesEl.innerHTML = services.map(s => `
      <article class="service-card">
        <div class="service-icon">${s.icon}</div>
        <h3 class="service-title">${s.title}</h3>
        <p class="service-desc">${s.desc}</p>
        <div class="service-tags">${s.tags.map(t => `<span class="service-tag">${t}</span>`).join('')}</div>
      </article>
    `).join('');
  }

  // 11. Projects
  const projectsEl = document.getElementById('projects-list');
  const projectsManager = new ProjectsManager();
  window.projectsManager = projectsManager;

  // Sample projects — replace with yours
  projectsManager.addBatch([
    {
      title: 'E² Hub',
      desc: 'Este portfolio. Canvas orgânico, partículas fluidas, typewriter, progress bars, magnetic buttons. Zero frameworks — vanilla JS + CSS moderno.',
      tech: ['Vanilla JS', 'CSS Custom Props', 'Canvas API', 'IntersectionObserver'],
      progress: 100,
      status: 'complete',
      icon: '🌌',
      url: 'https://e2dev.me',
      repo: 'https://github.com/Eli2Dev/e2-hub'
    },
    {
      title: 'Automação WhatsApp Business',
      desc: 'Bot completo para atendimento automatizado: fluxos de conversa, integração com CRM, envio de mídia, webhooks para pagamento.',
      tech: ['Node.js', 'TypeScript', 'Baileys', 'PostgreSQL', 'Redis'],
      progress: 85,
      status: 'in-progress',
      icon: '💬',
      repo: 'https://github.com/Eli2Dev/whatsapp-bot'
    },
    {
      title: 'Plugin VS Code — Code Metrics',
      desc: 'Extensão que mostra complexidade ciclomática, linhas de código e dependências direto no editor. Publicada no Marketplace.',
      tech: ['TypeScript', 'VS Code API', 'ESLint', 'Webpack'],
      progress: 100,
      status: 'complete',
      icon: '📊',
      url: 'https://marketplace.visualstudio.com/items?itemName=Eli2Dev.code-metrics',
      repo: 'https://github.com/Eli2Dev/vscode-code-metrics'
    },
    {
      title: 'Dashboard Financeiro Pessoal',
      desc: 'App fullstack para controle de finanças: categorização automática via ML, gráficos interativos, metas, relatórios PDF.',
      tech: ['Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'Recharts', 'Tailwind'],
      progress: 60,
      status: 'in-progress',
      icon: '💰',
      repo: 'https://github.com/Eli2Dev/finance-dashboard'
    },
    {
      title: 'Scraper Inteligente E-commerce',
      desc: 'Pipeline de coleta de preços em larga escala: rotação de proxies, bypass de anti-bot, normalização de dados, alertas de queda.',
      tech: ['Python', 'Playwright', 'Redis', 'Celery', 'PostgreSQL'],
      progress: 100,
      status: 'complete',
      icon: '🕷️',
      repo: 'https://github.com/Eli2Dev/ecommerce-scraper'
    },
    {
      title: 'Sistema de Agendamento SaaS',
      desc: 'Multi-tenant: calendário, lembrete WhatsApp/E-mail, pagamento Stripe, painel admin. Em desenvolvimento ativo.',
      tech: ['Next.js', 'Go', 'PostgreSQL', 'Stripe', 'Twilio', 'Docker'],
      progress: 30,
      status: 'planning',
      icon: '📅',
      repo: 'https://github.com/Eli2Dev/saas-scheduler'
    }
  ]);

  // 12. Projects intro
  const projectsIntroEl = document.getElementById('projects-intro');
  if (projectsIntroEl) {
    projectsIntroEl.textContent = 'Alguns projetos que construí — acadêmicos, pessoais e freelance. Cada barra mostra o progresso real. Clique em "CÓDIGO" pra ver a implementação.';
  }

  // 13. Contact form
  new ContactForm('contact-form');

  // 14. Contact desc
  const contactDescEl = document.getElementById('contact-desc');
  if (contactDescEl) {
    contactDescEl.textContent = 'Manda uma mensagem direta pelo formulário ou chama no GitHub/LinkedIn. Respondo em até 24h nos dias úteis. Vamos construir algo junto?';
  }

  // 15. Side nav
  new SideNav();

  // 16. Top progress bar
  new TopProgress();

  // 17. Magnetic buttons
  new MagneticButtons();

  // 18. Smooth scroll
  initSmoothScroll(audioBeep);

  // 19. Scroll reveal for sections (backup)
  const reveal = new ScrollReveal();
  reveal.observe('.section');

  // 20. Console easter egg
  console.log(
    '%c E² ',
    'background: #6fc77a; color: #080a0c; font-weight: bold; padding: 4px 12px; border-radius: 6px; font-family: monospace;'
  );
  console.log('%c E² - Projetos e Portfolio — Eliel Reinan', 'color: #6fc77a; font-size: 12px;');
  console.log('%c https://e2dev.me', 'color: #a8a49c; font-size: 11px;');
  console.log('%c [DICA] Inspecione o canvas — particles.orgânicas', 'color: #6fc77a; font-size: 11px;');
});

/* ========================================
   EXPORT FOR MODULE USE
   ======================================== */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AmbientCanvas,
    FloatingParticles,
    Typewriter,
    Counter,
    ProjectsManager,
    StackCloud,
    MagneticButtons,
    SideNav,
    TopProgress,
    ScrollReveal,
    ContactForm,
    AudioBeep
  };
}