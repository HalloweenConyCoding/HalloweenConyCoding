import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroSection() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const kickerRef = useRef(null);
  const copyRef = useRef(null);
  const actionsRef = useRef(null);
  const ornamentRef = useRef(null);

  useEffect(() => {
    const init = () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(ornamentRef.current?.children || [], {
        opacity: 0, scale: 0.8, stagger: 0.1, duration: 1.2
      })
      .from(kickerRef.current, { opacity: 0, y: 20, duration: 0.8 }, '-=0.6')
      .from(titleRef.current?.children || [], { opacity: 0, y: 40, stagger: 0.12, duration: 1.0 }, '-=0.4')
      .from(copyRef.current, { opacity: 0, y: 30, duration: 0.9 }, '-=0.5')
      .from(actionsRef.current?.children || [], { opacity: 0, y: 20, stagger: 0.15, duration: 0.7 }, '-=0.4');
    };
    init();
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      data-section="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '7rem 2rem 5rem',
        textAlign: 'center',
        zIndex: 10,
      }}
    >
      {/* Corner ornaments */}
      <div ref={ornamentRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <CornerOrnament position="tl" />
        <CornerOrnament position="tr" />
        <CornerOrnament position="bl" />
        <CornerOrnament position="br" />
      </div>

      <p ref={kickerRef} className="font-mono" style={{
        fontSize: '0.7rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'var(--gold)',
        opacity: 0.8,
        marginBottom: '1.5rem'
      }}>
        Scroll-reactive operating atlas
      </p>

      <h1 ref={titleRef} className="font-cinzel" style={{
        fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
        fontWeight: 800,
        letterSpacing: '0.2em',
        lineHeight: 1.1,
        color: 'var(--parchment)',
        marginBottom: '2rem',
        maxWidth: '900px'
      }}>
        <span style={{ display: 'block' }}>CONY</span>
        <span style={{ display: 'block', color: 'var(--gold)', fontSize: '0.6em', letterSpacing: '0.35em', fontWeight: 500 }}>Operating Team</span>
      </h1>

      <div className="gold-rule" style={{ width: '200px', marginBottom: '2rem', opacity: 0.5 }} />

      <p ref={copyRef} className="font-cormorant" style={{
        fontSize: '1.2rem',
        lineHeight: 1.7,
        color: 'rgba(232,220,200,0.75)',
        maxWidth: '600px',
        marginBottom: '3rem'
      }}>
        CONY leads the visible structure. Below that, the team fans into core, execution, review, and domain lanes, while the page layers light, depth, and motion that respond smoothly to your scroll.
      </p>

      <div ref={actionsRef} style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <HeroLink href="#motion-blueprint" primary>See motion</HeroLink>
        <HeroLink href="#hierarchy">Open cards</HeroLink>
      </div>

      {/* ME marker */}
      <div className="font-mono" style={{
        position: 'absolute',
        top: '5.5rem',
        left: '2rem',
        fontSize: '0.6rem',
        letterSpacing: '0.2em',
        color: 'var(--gold)',
        opacity: 0.5,
        textTransform: 'uppercase'
      }}>
        <span style={{ border: '1px solid currentColor', padding: '2px 6px' }}>ME</span>
        <span style={{ marginLeft: '0.5rem' }}>Base44-guided motion atlas</span>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: 0.45
      }}>
        <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--gold)' }}>DESCEND</span>
        <div style={{
          width: '1px',
          height: '40px',
          background: 'linear-gradient(to bottom, var(--gold), transparent)',
          animation: 'scrollPulse 2s ease-in-out infinite'
        }} />
        <style>{`@keyframes scrollPulse { 0%,100%{opacity:0.3;transform:scaleY(0.8)} 50%{opacity:1;transform:scaleY(1)} }`}</style>
      </div>
    </section>
  );
}

function HeroLink({ href, children, primary }) {
  return (
    <a
      href={href}
      className="font-cinzel chamfer"
      style={{
        display: 'inline-block',
        padding: '0.75rem 2rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        background: primary ? 'linear-gradient(135deg, rgba(200,146,58,0.2), rgba(212,175,55,0.1))' : 'transparent',
        border: `1px solid ${primary ? 'var(--gold)' : 'rgba(232,220,200,0.25)'}`,
        color: primary ? 'var(--gold)' : 'rgba(232,220,200,0.7)',
        transition: 'all 0.4s cubic-bezier(0.7,0,0.3,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200,146,58,0.3), rgba(212,175,55,0.15))';
        e.currentTarget.style.color = '#d4af37';
        e.currentTarget.style.borderColor = 'var(--gold-bright)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = primary ? 'linear-gradient(135deg, rgba(200,146,58,0.2), rgba(212,175,55,0.1))' : 'transparent';
        e.currentTarget.style.color = primary ? 'var(--gold)' : 'rgba(232,220,200,0.7)';
        e.currentTarget.style.borderColor = primary ? 'var(--gold)' : 'rgba(232,220,200,0.25)';
      }}
    >
      {children}
    </a>
  );
}

function CornerOrnament({ position }) {
  const isRight = position.includes('r');
  const isBottom = position.includes('b');
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      style={{
        position: 'absolute',
        width: '80px',
        height: '80px',
        color: 'var(--gold)',
        opacity: 0.35,
        ...(isRight ? { right: '1rem' } : { left: '1rem' }),
        ...(isBottom ? { bottom: '1rem' } : { top: '4.5rem' }),
        transform: `scale(${isRight ? -1 : 1}, ${isBottom ? -1 : 1})`
      }}
    >
      <path d="M0 0L40 0L40 3L3 3L3 40L0 40Z" fill="currentColor" />
      <path d="M0 0L22 0C10 10 10 10 0 22Z" fill="currentColor" opacity="0.3" />
      <line x1="6" y1="6" x2="28" y2="6" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <line x1="6" y1="6" x2="6" y2="28" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
    </svg>
  );
}