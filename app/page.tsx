"use client";

import { useEffect, useRef, useState } from "react";

const capabilities = [
  {
    index: "01",
    title: "感知",
    en: "SENSE",
    copy: "从真实世界捕捉微小变化，让每一次输入都成为可计算的信号。",
  },
  {
    index: "02",
    title: "连接",
    en: "CONNECT",
    copy: "让设备、数据与场景彼此理解，建立稳定而灵活的协同网络。",
  },
  {
    index: "03",
    title: "决策",
    en: "DECIDE",
    copy: "把复杂留给系统，把清晰交给用户，让技术自然地融入日常。",
  },
];

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0.68;
    let pointerY = 0.48;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      phase: number;
      alpha: number;
    }> = [];

    const build = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(420, Math.max(160, Math.round(width * height / 3800)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: index % 9 === 0 ? 2.4 : Math.random() * 1.35 + 0.35,
        speed: Math.random() * 0.32 + 0.05,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.65 + 0.15,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const targetX = width * pointerX;
      const targetY = height * pointerY;

      for (const particle of particles) {
        const dx = particle.x - targetX;
        const dy = particle.y - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        if (distance < 180) {
          const push = (180 - distance) / 180;
          particle.x += (dx / distance) * push * 0.8;
          particle.y += (dy / distance) * push * 0.8;
        }
        particle.y -= particle.speed;
        particle.x += Math.sin(frame * 0.004 + particle.phase) * 0.12;
        if (particle.y < -8) {
          particle.y = height + 8;
          particle.x = Math.random() * width;
        }
        const glow = Math.max(0, 1 - distance / Math.max(width, height));
        ctx.fillStyle = `rgba(188, 255, 45, ${particle.alpha * (0.55 + glow)})`;
        ctx.fillRect(
          Math.round(particle.x),
          Math.round(particle.y),
          particle.size,
          particle.size,
        );
      }
      frame += 1;
      frame = requestAnimationFrame(draw);
    };

    const move = (event: PointerEvent) => {
      pointerX = event.clientX / Math.max(window.innerWidth, 1);
      pointerY = event.clientY / Math.max(window.innerHeight, 1);
    };

    build();
    draw();
    window.addEventListener("resize", build);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 },
    );
    elements.forEach((element) => observer.observe(element));

    const steps = document.querySelectorAll<HTMLElement>("[data-step]");
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveStep(Number(entry.target.dataset.step));
        });
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );
    steps.forEach((step) => stepObserver.observe(step));

    return () => {
      observer.disconnect();
      stepObserver.disconnect();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="渺核科技首页" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            渺核科技
            <small>MIAOHE TECHNOLOGY</small>
          </span>
        </a>
        <button
          className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav className={menuOpen ? "is-open" : ""} aria-label="主导航">
          <a href="#about" onClick={closeMenu}>关于我们</a>
          <a href="#focus" onClick={closeMenu}>技术方向</a>
          <a href="#culture" onClick={closeMenu}>我们的方式</a>
          <a className="nav-cta" href="#contact" onClick={closeMenu}>联系我们 ↗</a>
        </nav>
      </header>

      <section id="top" className="hero">
        <ParticleField />
        <div className="hero-grid" aria-hidden="true" />
        <div className="orbital-core" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="core-dot" />
        </div>
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span>东莞 · 中国</span>
            <span>科技，让微小产生巨大</span>
          </div>
          <h1>
            <span>微小之核</span>
            <span className="outline-text">无限协同</span>
          </h1>
          <div className="hero-bottom">
            <p>
              从一个细微的信号开始，连接感知、计算与行动。<br />
              我们让技术更轻、更近，也更有力量。
            </p>
            <a className="round-link" href="#about" aria-label="向下了解更多">
              <span>SCROLL</span>
              <b>↓</b>
            </a>
          </div>
        </div>
        <div className="ticker" aria-hidden="true">
          <div>
            THINK SMALL / BUILD DEEP / MOVE TOGETHER / THINK SMALL / BUILD DEEP / MOVE TOGETHER /
          </div>
        </div>
      </section>

      <section id="about" className="statement section-light">
        <div className="section-label" data-reveal>
          <span>[ 01 ]</span>
          <span>ABOUT MIAOHE</span>
          <span>关于渺核</span>
        </div>
        <div className="statement-title" data-reveal>
          <span>我们相信</span>
          <span>真正的改变</span>
          <span>始于<span className="lime">微小</span></span>
        </div>
        <div className="statement-foot" data-reveal>
          <p className="pixel-note">ONE SIGNAL<br />CAN CHANGE<br />THE SYSTEM.</p>
          <p>
            渺核科技，以工程的严谨与产品的想象力，探索真实世界中的智能协同。我们从细节出发，把复杂技术凝结为简单、可靠、可持续的体验。
          </p>
        </div>
      </section>

      <section id="focus" className="system-section">
        <div className="system-sticky">
          <div className="system-grid" aria-hidden="true" />
          <div className={`system-core step-${activeStep}`} aria-hidden="true">
            <div className="core-halo" />
            <div className="core-cube">
              {Array.from({ length: 25 }).map((_, index) => <i key={index} />)}
            </div>
            <div className="core-cross cross-x" />
            <div className="core-cross cross-y" />
          </div>
          <div className="system-status">
            <span>CORE SYSTEM</span>
            <span>0{activeStep + 1} / 03</span>
          </div>
          <div className="system-active-copy">
            <span>{capabilities[activeStep].en}</span>
            <strong>{capabilities[activeStep].title}</strong>
          </div>
        </div>
        <div className="system-steps">
          {capabilities.map((item, index) => (
            <article key={item.index} data-step={index}>
              <span>{item.index}</span>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="culture" className="principles section-light">
        <div className="section-label" data-reveal>
          <span>[ 02 ]</span>
          <span>HOW WE WORK</span>
          <span>我们的方式</span>
        </div>
        <div className="principles-head" data-reveal>
          <h2>保持好奇<br />保持锋利</h2>
          <p>我们珍视问题胜过标准答案，珍视长期价值胜过短暂声量。</p>
        </div>
        <div className="principle-list">
          {[
            ["01", "深入本质", "穿过噪声，找到真正值得解决的问题。"],
            ["02", "快速验证", "让想法尽早进入现实，在反馈中持续进化。"],
            ["03", "彼此成就", "让不同视角相互碰撞，让每个人拥有创造空间。"],
          ].map(([number, title, copy]) => (
            <article key={number} data-reveal>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <b aria-hidden="true">↗</b>
            </article>
          ))}
        </div>
      </section>

      <section className="marquee-section" aria-label="品牌宣言">
        <div className="marquee-line">MIAOHE · FROM SIGNAL TO SYSTEM · 渺核科技 · FROM SIGNAL TO SYSTEM ·&nbsp;</div>
        <div className="marquee-line reverse">BUILD THE UNSEEN · CREATE THE POSSIBLE · 构建未见 · 创造可能 ·&nbsp;</div>
      </section>

      <section id="contact" className="contact">
        <div className="contact-glow" aria-hidden="true" />
        <div className="contact-top" data-reveal>
          <span>[ 03 ]</span>
          <span>START A CONVERSATION</span>
        </div>
        <div className="contact-main" data-reveal>
          <p>一个微小想法，<br />也许就是下一次改变的起点。</p>
          <a href="mailto:hello@miaohe.tech">
            <span>开始对话</span>
            <b>↗</b>
          </a>
        </div>
        <footer>
          <div className="brand footer-brand">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>渺核科技<small>MIAOHE TECHNOLOGY</small></span>
          </div>
          <div>
            <span>东莞市渺核科技有限公司</span>
            <span>© 2026 MIAOHE TECHNOLOGY</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
