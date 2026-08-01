"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const scenes = [
  { id: "origin", number: "00", label: "起点" },
  { id: "about", number: "01", label: "关于渺核" },
  { id: "focus", number: "02", label: "技术方向" },
  { id: "culture", number: "03", label: "我们的方式" },
  { id: "contact", number: "04", label: "开始连接" },
];

const pixelShape = [
  "0000011110000000",
  "0001111111100000",
  "0011100111110000",
  "0111000011111000",
  "1110011001111100",
  "1100111100111100",
  "1101111110011100",
  "1111100110011100",
  "0111000110111000",
  "0011101111110000",
  "0001111111100000",
  "0000111111000000",
  "0000011110000000",
  "0000001100000000",
];

function PixelRain({
  token,
  onCovered,
  onComplete,
}: {
  token: number;
  onCovered: () => void;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coveredRef = useRef(onCovered);
  const completeRef = useRef(onComplete);

  useEffect(() => { coveredRef.current = onCovered; }, [onCovered]);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (!token) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      coveredRef.current();
      completeRef.current();
      return;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const cell = width < 700 ? 14 : 18;
    const columns = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    const glyphs = "01<>[]{}#*+=/MIAOKERNEL渺核未来价值";
    const palette = ["#90dbf2", "#ff72b6", "#9d7dff", "#d9fbff"];
    const hash = (x: number, y: number) => {
      const value = Math.sin(x * 12.9898 + y * 78.233 + token * 4.17) * 43758.5453;
      return value - Math.floor(value);
    };

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    canvas.style.visibility = "visible";
    let switched = false;
    let raf = 0;
    const start = performance.now();
    const duration = 1180;

    const draw = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#050507";
      context.fillRect(0, 0, width, height);

      if (progress < 0.5) {
        const fill = progress / 0.5;
        for (let y = 0; y < rows; y += 1) {
          for (let x = 0; x < columns; x += 1) {
            const threshold = fill * 1.45 - y / rows * 0.46;
            if (hash(x, y) < threshold) {
              context.fillStyle = hash(x + 9, y) > 0.93 ? palette[(x + y) % palette.length] : "#050507";
              context.fillRect(x * cell, y * cell, cell + 1, cell + 1);
            } else {
              context.clearRect(x * cell, y * cell, cell + 1, cell + 1);
            }
          }
        }
      } else {
        if (!switched) {
          switched = true;
          coveredRef.current();
        }
        const reveal = (progress - 0.5) / 0.5;
        for (let y = 0; y < rows; y += 1) {
          for (let x = 0; x < columns; x += 1) {
            if (hash(x, y) < reveal * 1.32 - (rows - y) / rows * 0.34) {
              context.clearRect(x * cell, y * cell, cell + 1, cell + 1);
            }
          }
        }
      }

      context.font = `${cell - 4}px "Pixel Mono", monospace`;
      context.textAlign = "center";
      context.textBaseline = "top";
      for (let x = 0; x < columns; x += 1) {
        const head = ((progress * rows * 2.8 + hash(x, token) * rows) % (rows + 8)) - 5;
        for (let trail = 0; trail < 5; trail += 1) {
          const y = head - trail;
          if (y < 0 || y > rows) continue;
          context.globalAlpha = Math.max(0, 1 - trail * 0.21);
          context.fillStyle = palette[(x + trail) % palette.length];
          const glyph = glyphs[Math.floor(hash(x + trail, y + token) * glyphs.length)];
          context.fillText(glyph, x * cell + cell / 2, y * cell);
        }
      }
      context.globalAlpha = 1;

      if (progress < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        canvas.style.visibility = "hidden";
        completeRef.current();
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [token]);

  return <canvas ref={canvasRef} className="pixel-rain" aria-hidden="true" />;
}

function PixelMark() {
  return (
    <div className="pixel-mark" aria-hidden="true">
      {pixelShape.flatMap((row, y) =>
        [...row].map((cell, x) => (
          <i className={cell === "1" ? "on" : ""} key={`${x}-${y}`} />
        )),
      )}
    </div>
  );
}

export default function Home() {
  const [scene, setScene] = useState(0);
  const [token, setToken] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const pendingRef = useRef(0);
  const sceneRef = useRef(0);
  const transitionRef = useRef(false);
  const touchRef = useRef<number | null>(null);

  useEffect(() => { sceneRef.current = scene; }, [scene]);

  const goTo = useCallback((target: number) => {
    const next = Math.max(0, Math.min(scenes.length - 1, target));
    if (next === sceneRef.current || transitionRef.current) return;
    pendingRef.current = next;
    transitionRef.current = true;
    setTransitioning(true);
    setToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let wheelLocked = false;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 12 || wheelLocked) return;
      wheelLocked = true;
      goTo(sceneRef.current + (event.deltaY > 0 ? 1 : -1));
      window.setTimeout(() => { wheelLocked = false; }, 760);
    };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goTo(sceneRef.current + 1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goTo(sceneRef.current - 1);
      }
      if (event.key === "Home") goTo(0);
      if (event.key === "End") goTo(scenes.length - 1);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [goTo]);

  const covered = useCallback(() => {
    sceneRef.current = pendingRef.current;
    setScene(pendingRef.current);
  }, []);

  const completed = useCallback(() => {
    transitionRef.current = false;
    setTransitioning(false);
  }, []);

  return (
    <main
      className={`site-shell scene-${scene}`}
      onTouchStart={(event) => { touchRef.current = event.touches[0]?.clientY ?? null; }}
      onTouchEnd={(event) => {
        const start = touchRef.current;
        const end = event.changedTouches[0]?.clientY;
        if (start !== null && end !== undefined && Math.abs(start - end) > 45) {
          goTo(sceneRef.current + (start > end ? 1 : -1));
        }
        touchRef.current = null;
      }}
    >
      <div className="scanlines" aria-hidden="true" />
      <div className="screen-noise" aria-hidden="true" />

      <header className="site-header">
        <button className="brand" type="button" onClick={() => goTo(0)} aria-label="返回首页">
          <img src="/miaokernel-logo.svg" alt="" aria-hidden="true" />
          <span>渺核科技<small>MIAOKERNEL TECHNOLOGY</small></span>
        </button>
        <div className="system-readout" aria-hidden="true">
          <span>MK/SYSTEM : ONLINE</span>
          <span className="blink">■</span>
          <span>DG · CN / 2026</span>
        </div>
        <a className="header-contact" href="mailto:hello@miaohe.tech">CONTACT ↗</a>
      </header>

      <div className="scene-stage" aria-live="polite">
        <section className={`scene hero-scene ${scene === 0 ? "is-active" : ""}`} aria-hidden={scene !== 0}>
          <div className="matrix-field" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, index) => <i key={index}>{index % 3 === 0 ? "0110" : "1001"}</i>)}
          </div>
          <div className="hero-status pixel-window">
            <span>CORE_00</span><span>INITIALIZING FUTURE</span><b>●</b>
          </div>
          <div className="hero-mark">
            <div className="logo-pixels"><img src="/miaokernel-logo-pixel.png" alt="渺核科技标志" /></div>
            <span>MI·AO / KER·NEL</span>
          </div>
          <div className="hero-title">
            <p>东莞市渺核科技有限公司</p>
            <h1><span>渺见未来</span><span>核聚价值</span></h1>
          </div>
          <div className="hero-footer">
            <p>从微小信号出发<br />构建真实世界的智能协同</p>
            <button type="button" onClick={() => goTo(1)}>ENTER SYSTEM <b>↓</b></button>
          </div>
        </section>

        <section className={`scene about-scene ${scene === 1 ? "is-active" : ""}`} aria-hidden={scene !== 1}>
          <div className="scene-code">01 / ABOUT_MIAOKERNEL</div>
          <div className="about-copy">
            <p className="kicker">A SMALL SIGNAL CAN<br />CHANGE THE SYSTEM.</p>
            <h2>真正的改变<br />始于<span>微小</span></h2>
            <p className="body-copy">渺核科技以工程的严谨与产品的想象力，探索真实世界中的智能协同。我们从细节出发，把复杂技术凝结成简单、可靠、可持续的体验。</p>
          </div>
          <div className="about-visual">
            <div className="pixel-coordinate"><span>X 076.42</span><span>Y 113.08</span></div>
            <PixelMark />
            <div className="crosshair"><i /><i /></div>
            <p>MICRO / KERNEL<br />SIGNAL OBJECT #01</p>
          </div>
        </section>

        <section className={`scene focus-scene ${scene === 2 ? "is-active" : ""}`} aria-hidden={scene !== 2}>
          <div className="scene-code">02 / WHAT_WE_BUILD</div>
          <div className="focus-head">
            <p>FROM SIGNAL<br />TO SYSTEM</p>
            <h2>让技术<br />自然发生</h2>
          </div>
          <div className="module-grid">
            {[
              ["01", "感知", "SENSE", "捕捉真实世界的微小变化"],
              ["02", "连接", "CONNECT", "让设备、数据与场景彼此理解"],
              ["03", "决策", "DECIDE", "把复杂留给系统，把清晰交给人"],
            ].map(([number, title, en, copy]) => (
              <article className="pixel-window module" key={number}>
                <div><span>MOD_{number}</span><b>■</b></div>
                <strong>{title}</strong>
                <em>{en}</em>
                <p>{copy}</p>
                <div className="module-bars" aria-hidden="true">{Array.from({ length: 10 }).map((_, index) => <i key={index} />)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className={`scene culture-scene ${scene === 3 ? "is-active" : ""}`} aria-hidden={scene !== 3}>
          <div className="scene-code">03 / HOW_WE_WORK</div>
          <div className="culture-title"><p>VALUES / 03</p><h2>保持好奇<br /><span>保持锋利</span></h2></div>
          <div className="culture-list">
            {[
              ["01", "深入本质", "穿过噪声，找到真正值得解决的问题。"],
              ["02", "快速验证", "让想法尽早进入现实，在反馈中持续进化。"],
              ["03", "彼此成就", "让不同视角相互碰撞，让每个人拥有创造空间。"],
            ].map(([number, title, copy]) => (
              <article key={number}>
                <span>[{number}]</span><h3>{title}</h3><p>{copy}</p><b>↗</b>
              </article>
            ))}
          </div>
          <div className="culture-cursor" aria-hidden="true"><span>+</span><i /></div>
        </section>

        <section className={`scene contact-scene ${scene === 4 ? "is-active" : ""}`} aria-hidden={scene !== 4}>
          <div className="scene-code">04 / OPEN_CHANNEL</div>
          <div className="contact-backdrop" aria-hidden="true"><img src="/miaokernel-logo-pixel.png" alt="" /></div>
          <div className="contact-copy">
            <p>一个微小想法<br />也许就是改变的起点</p>
            <h2>一起连接<br /><span>下一个可能</span></h2>
            <a href="mailto:hello@miaohe.tech"><span>发送信号 / SEND A SIGNAL</span><b>↗</b></a>
          </div>
          <footer>
            <span>东莞市渺核科技有限公司</span>
            <span>渺见未来，核聚价值</span>
            <span>© 2026 MIAOKERNEL</span>
          </footer>
        </section>
      </div>

      <aside className="scene-nav" aria-label="场景导航">
        <div className="nav-track"><i style={{ height: `${((scene + 1) / scenes.length) * 100}%` }} /></div>
        {scenes.map((item, index) => (
          <button className={scene === index ? "is-active" : ""} type="button" key={item.id} onClick={() => goTo(index)} disabled={transitioning}>
            <span>{item.number}</span><small>{item.label}</small>
          </button>
        ))}
      </aside>

      <div className="corner-readout" aria-hidden="true"><span>{String(scene + 1).padStart(2, "0")}</span> / 05</div>
      <PixelRain token={token} onCovered={covered} onComplete={completed} />
    </main>
  );
}
