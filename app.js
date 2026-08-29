/* ========================================
   E² HUB - JavaScript / Animações Hacker
   ======================================== */

'use strict';

/* ========================================
   1. MATRIX RAIN CANVAS
   ======================================== */
class MatrixRain {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFｦｧｨｩｪｫｬｭｮｯABCDEFﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ#$%&@{}[]<>*+=/\\';
    this.columns = [];
    this.drops = [];
    this.fontSize = 14;
    this.speed = 0.5;
    this.lastTime = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const columnCount = Math.floor(this.canvas.width / this.fontSize);
    this.columns = new Array(columnCount).fill(0);
    this.drops = new Array(columnCount)
      .fill(0)
      .map(() => Math.random() * -100);
  }

  animate(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.ctx.fillStyle = 'rgba(10, 15, 10, 0.08)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = `${this.fontSize}px 'JetBrains Mono', monospace`;

    for (let i = 0; i < this.columns.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      // Head of the column is brighter
      if (Math.random() > 0.975) {
        this.ctx.fillStyle = '#39ff14';
        this.ctx.shadowColor = '#00ff41';
        this.ctx.shadowBlur = 8;
      } else {
        this.ctx.fillStyle = '#00ff41';
        this.ctx.shadowBlur = 0;
      }

      this.ctx.fillText(char, x, y);

      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i] += this.speed;
    }

    this.ctx.shadowBlur = 0;
    requestAnimationFrame(this.animate);
  }
}

/* ========================================
   2. TYPEWRITER EFFECT
   ======================================== */
class Typewriter {
  constructor(element, text, speed = 50) {
    this.element = element;
    this.text = text;
    this.speed = speed;
    this.index = 0;
    this.timer = null;
  }

  start() {
    this.element.textContent = '';
    this.type();
  }

  type() {
    if (this.index < this.text.length) {
      this.element.textContent += this.text.charAt(this.index);
      this.index++;
      this.timer = setTimeout(() => this.type(), this.speed);
    }
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

/* ========================================
   3. COUNTER ANIMATION
   ======================================== */
class Counter {
  constructor(element, target, duration = 2000) {
    this.element = element;
    this.target = target;
    this.duration = duration;
    this.start = null;
  }

  animate(timestamp) {
    if (!this.start) this.start = timestamp;
    const progress = Math.min((timestamp - this.start) / this.duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    this.element.textContent = Math.floor(eased * this.target);
    if (progress < 1) {
      requestAnimationFrame((t) => this.animate(t));
    } else {
      this.element.textContent = this.target;
    }
  }

  run() {
    requestAnimationFrame((t) => this.animate(t));
  }
}

/* ========================================
   4. PROJECTS DATA MANAGER
   ======================================== */
class ProjectsManager {
  constructor() {
    this.grid = document.getElementById('projects-grid');
    this.placeholder = document.getElementById('projects-placeholder');
    this.projects = [];
  }

  add(project) {
    this.projects.push(project);
    this.render();
  }

  addBatch(projects) {
    this.projects.push(...projects);
    this.render();
  }

  clear() {
    this.projects = [];
    this.render();
  }

  render() {
    if (!this.grid) return;

    if (this.projects.length === 0) {
      if (this.placeholder) this.placeholder.style.display = 'block';
      this.grid.innerHTML = '';
      return;
    }

    if (this.placeholder) this.placeholder.style.display = 'none';

    this.grid.innerHTML = this.projects.map((p) => this.createCard(p)).join('');
    this.attachLinkListeners();
  }

  createCard(project) {
    const techs = project.tech
      .map((t) => `<span class="tech">${this.escape(t)}</span>`)
      .join('');

    const links = [];
    if (project.url) {
      links.push(`
        <a href="${this.escape(project.url)}" target="_blank" rel="noopener" class="project-link" data-url>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          ABRIR
        </a>
      `);
    }
    if (project.repo) {
      links.push(`
        <a href="${this.escape(project.repo)}" target="_blank" rel="noopener" class="project-link" data-url>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
          REPO
        </a>
      `);
    }

    const icon = project.icon || '⌬';

    return `
      <article class="project-card" data-project>
        <div class="project-thumb">
          <span class="project-placeholder-icon">${this.escape(icon)}</span>
        </div>
        <div class="project-info">
          <h3 class="project-title">${this.escape(project.title)}</h3>
          <p class="project-desc">${this.escape(project.desc)}</p>
          <div class="project-tech">${techs}</div>
          <div class="project-links">${links.join('')}</div>
        </div>
      </article>
    `;
  }

  attachLinkListeners() {
    const links = this.grid.querySelectorAll('[data-url]');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        if (window.audioBeep) window.audioBeep.play();
        e.currentTarget.style.opacity = '0.7';
        setTimeout(() => (e.currentTarget.style.opacity = '1'), 150);
      });
    });
  }

  escape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/* ========================================
   5. AUDIO BEEP (Hacker Sounds)
   ======================================== */
class AudioBeep {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.enabled) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  play(freq = 880, duration = 0.08, type = 'square') {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}

/* ========================================
   6. INTERSECTION OBSERVER (Scroll Animations)
   ======================================== */
class ScrollReveal {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleEntries(entries),
      { threshold: 0.2 }
    );
  }

  observe(element) {
    this.observer.observe(element);
  }

  handleEntries(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        this.observer.unobserve(entry.target);
      }
    });
  }
}

/* ========================================
   7. TERMINAL PROMPT ANIMATION
   ======================================== */
class TerminalPrompt {
  constructor() {
    this.cursor = document.querySelector('.prompt-cursor');
    this.commands = [
      'whoami',
      'ls -la ~/projects',
      'cat README.md',
      'git status',
      './run_hub.sh',
    ];
    this.commandIndex = 0;
    this.promptSpan = document.querySelector('.terminal-prompt');
    this.typeIndex = 0;
    this.currentCmd = '';
    this.isDeleting = false;
  }

  start() {
    // Simple blinking handled by CSS; here we can add dynamic commands
    // For now, keep it simple with blinking cursor
  }
}

/* ========================================
   8. INITIALIZATION
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Matrix Rain
  new MatrixRain('matrix-rain');

  // 2. Audio Beep
  const audioBeep = new AudioBeep();
  window.audioBeep = audioBeep;
  // Initialize on first user interaction (browser autoplay policy)
  const initAudio = () => {
    audioBeep.init();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);

  // 3. Projects Manager
  const projectsManager = new ProjectsManager();
  window.projectsManager = projectsManager;

  // Sample projects (remove when you add real ones)
  // projectsManager.addBatch([
  //   {
  //     title: 'Nome do Projeto',
  //     desc: 'Descrição do projeto',
  //     tech: ['React', 'Node.js'],
  //     url: 'https://...',
  //     repo: 'https://github.com/...',
  //     icon: '⚡'
  //   }
  // ]);

  // 4. Animate hero stats on load
  const stats = document.querySelectorAll('.stat-value');
  const statTargets = [8, 12, 3]; // Projetos, Tecnologias, Anos
  stats.forEach((stat, i) => {
    stat.dataset.target = statTargets[i];
    setTimeout(() => {
      new Counter(stat, statTargets[i]).run();
    }, 500 + i * 200);
  });

  // 5. Skill bars animation on scroll
  const reveal = new ScrollReveal();
  document.querySelectorAll('.section').forEach((section) => {
    reveal.observe(section);
  });

  // Animate skill bars when skills section is visible
  const skillsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.fill').forEach((fill) => {
            const level = fill.dataset.level;
            if (level) fill.style.width = level + '%';
          });
          skillsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const skillsSection = document.querySelector('.skills');
  if (skillsSection) skillsObserver.observe(skillsSection);

  // 6. Terminal prompt typing effect
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    // Keep static for now, typing effect on demand
  }

  // 7. Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (audioBeep) audioBeep.play(660, 0.05);
      }
    });
  });

  // 8. Glitch effect on hero title (random glitches)
  const heroGlitch = document.querySelector('.hero-glitch');
  if (heroGlitch) {
    setInterval(() => {
      if (Math.random() > 0.7) {
        heroGlitch.style.transform = `translateX(${(Math.random() - 0.5) * 8}px)`;
        setTimeout(() => {
          heroGlitch.style.transform = 'translateX(0)';
        }, 100);
      }
    }, 2000);
  }

  // 9. Easter egg: Konami code
  const konami = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let konamiIndex = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key === konami[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konami.length) {
        konamiIndex = 0;
        activateMatrixMode();
      }
    } else {
      konamiIndex = 0;
    }
  });

  function activateMatrixMode() {
    document.documentElement.style.setProperty('--matrix-green', '#39ff14');
    const canvas = document.getElementById('matrix-rain');
    if (canvas) {
      canvas.style.opacity = '0.4';
      canvas.style.transition = 'opacity 1s ease';
    }
    audioBeep.play(1200, 0.2, 'sawtooth');
    setTimeout(() => {
      document.documentElement.style.setProperty('--matrix-green', '#00ff41');
      if (canvas) canvas.style.opacity = '0.15';
    }, 3000);
  }

  // 10. Console welcome message
  console.log(
    '%c E² HUB ',
    'background: #00ff41; color: #0a0f0a; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
  );
  console.log('%c Sistema operacional inicializado. Bem-vindo, operador.', 'color: #00ff41;');
  console.log('%c [DICA] Tente o código Konami: ↑↑↓↓←→←→BA', 'color: #00ff41; font-size: 11px;');

  // 11. Typewriter for terminal prompt (optional)
  // Uncomment to enable dynamic command typing
  // const tp = new TerminalPrompt();
  // tp.start();
});

/* ========================================
   EXPORT FOR MODULE USE
   ======================================== */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MatrixRain, ProjectsManager, Counter, AudioBeep };
}