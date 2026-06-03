import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const RUNES = [
  { size: 320, x: 10, y: 15, speed: 40, dir: 1, opacity: 0.05 },
  { size: 220, x: 75, y: 8, speed: 28, dir: -1, opacity: 0.07 },
  { size: 180, x: 55, y: 45, speed: 18, dir: 1, opacity: 0.06 },
  { size: 140, x: 20, y: 65, speed: 12, dir: -1, opacity: 0.09 },
  { size: 260, x: 82, y: 60, speed: 35, dir: 1, opacity: 0.04 },
  { size: 100, x: 40, y: 80, speed: 8, dir: -1, opacity: 0.1 },
  { size: 160, x: 65, y: 25, speed: 22, dir: 1, opacity: 0.06 },
  { size: 80, x: 30, y: 35, speed: 6, dir: -1, opacity: 0.12 },
];

const RuneSVG = ({ size, opacity }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    style={{ color: 'var(--gold)', opacity, display: 'block', willChange: 'transform' }}
  >
    <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="0.6" />
    <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 3" />
    <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.5" />
    <polygon points="50,8 90,72 10,72" stroke="currentColor" strokeWidth="0.6" fill="none" />
    <polygon points="50,92 10,28 90,28" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.6" />
    <circle cx="50" cy="50" r="5" stroke="currentColor" strokeWidth="0.8" />
    <line x1="50" y1="3" x2="50" y2="97" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
    <line x1="3" y1="50" x2="97" y2="50" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
    <line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
    <line x1="85" y1="15" x2="15" y2="85" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
  </svg>
);

export default function RuneBackground() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animId;
    const gsapLoader = () => {
      const runeEls = containerRef.current?.querySelectorAll('.rune-circle');
      if (!runeEls) return;

      // Individual rotation + drift timelines
      runeEls.forEach((el, i) => {
        const cfg = RUNES[i];
        if (!cfg) return;
        gsap.to(el, {
          rotation: cfg.dir * 360,
          duration: cfg.speed,
          ease: 'none',
          repeat: -1
        });
        // Scroll-linked Y parallax
        gsap.to(el, {
          y: cfg.dir * -120,
          ease: 'none',
          scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2
          }
        });
      });

      // Mouse parallax via rAF
      const onMouseMove = (e) => {
        mouseRef.current = {
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2
        };
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      const tick = () => {
        posRef.current.x += (mouseRef.current.x - posRef.current.x) * 0.05;
        posRef.current.y += (mouseRef.current.y - posRef.current.y) * 0.05;
        if (containerRef.current) {
          containerRef.current.style.transform = `translate(${posRef.current.x * 8}px, ${posRef.current.y * 8}px)`;
        }
        animId = requestAnimationFrame(tick);
      };
      animId = requestAnimationFrame(tick);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(animId);
      };
    };

    gsapLoader();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: '-5%', width: '110%', height: '110%' }}>
        {RUNES.map((cfg, i) => (
          <div
            key={i}
            className="rune-circle"
            style={{
              position: 'absolute',
              left: `${cfg.x}%`,
              top: `${cfg.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <RuneSVG size={cfg.size} opacity={cfg.opacity} />
          </div>
        ))}
      </div>

      {/* Ambient void glow — reacts to section */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 60% 50% at 30% 20%, rgba(200,146,58,0.06) 0%, transparent 70%),
                     radial-gradient(ellipse 40% 60% at 80% 70%, rgba(74,45,143,0.05) 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />
    </div>
  );
}