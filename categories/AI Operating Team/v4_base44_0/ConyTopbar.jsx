import { useEffect, useRef, useState } from 'react';

export default function ConyTopbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('#hero');
  const barRef = useRef(null);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      // scroll progress
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, (window.scrollY / max) * 100);
      document.documentElement.style.setProperty('--scroll-pct', `${pct}%`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = ['hero', 'motion-blueprint', 'hierarchy'];
    const observer = new IntersectionObserver((entries) => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (vis) setActiveHash(`#${vis.target.id}`);
    }, { threshold: 0.3 });
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const links = [
    { href: '#motion-blueprint', label: 'Motion blueprint' },
    { href: '#hierarchy', label: 'Team structure' }
  ];

  return (
    <>
      <div className="scroll-progress" />
      <header
        id="topbar"
        ref={barRef}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          padding: '0 2rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.5s, border-color 0.5s',
          background: scrolled ? 'rgba(5,4,10,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'rgba(200,146,58,0.3)' : 'transparent'}`,
        }}
      >
        {scrolled && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            height: '1px',
            background: 'linear-gradient(90deg, var(--gold), var(--gold-bright))',
            width: 'var(--scroll-pct, 0%)',
            transition: 'width 0.1s linear',
            opacity: 0.8
          }} />
        )}

        <a href="index.html" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="font-cinzel" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.15em' }}>CONY</span>
          <span className="font-mono" style={{ fontSize: '0.65rem', color: 'rgba(232,220,200,0.45)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Team Atlas</span>
        </a>

        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: activeHash === link.href ? 'var(--gold)' : 'rgba(232,220,200,0.55)',
                borderBottom: activeHash === link.href ? '1px solid var(--gold)' : '1px solid transparent',
                paddingBottom: '2px',
                transition: 'color 0.3s, border-color 0.3s'
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>
    </>
  );
}