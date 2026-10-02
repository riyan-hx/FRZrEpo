import { useState } from 'react';
import { useReveal } from './useReveal.js';
import { site, nav, services, work, process, faqs } from './content.js';

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, shown] = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <a className="logo" href="#top" onClick={() => setOpen(false)}>
        <span className="logo-mark" aria-hidden="true">L</span>{site.name}
      </a>
      <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
        {nav.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
        ))}
        <a className="btn small nav-cta" href="#contact" onClick={() => setOpen(false)}>Start a project</a>
      </nav>
      <button className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span /><span />
      </button>
    </header>
  );
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <Reveal as="p" className="eyebrow"><span className="dot" /> Booking new projects</Reveal>
      <Reveal as="h1" delay={80}>{site.tagline}<br /><em>Thoughtfully.</em></Reveal>
      <Reveal as="p" className="lead" delay={160}>{site.intro}</Reveal>
      <Reveal className="hero-actions" delay={240}>
        <a className="btn" href="#contact">Start a project <Arrow /></a>
        <a className="btn ghost" href="#work">See our work</a>
      </Reveal>
      <Reveal className="hero-art" delay={320} aria-hidden="true">
        <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />
        <div className="hero-card"><span>Brand</span><span>Web</span><span>Product</span></div>
      </Reveal>
    </section>
  );
}

export function Marquee() {
  const items = ['Brand identity', 'Websites', 'Product design', 'Design systems', 'Launch assets'];
  const row = [...items, ...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => <span key={i}>{t}<i /></span>)}
      </div>
    </div>
  );
}

export function Services() {
  return (
    <section className="section" id="services">
      <Reveal as="p" className="eyebrow">Services</Reveal>
      <Reveal as="h2" delay={60}>Everything a young brand needs, under one roof.</Reveal>
      <div className="service-grid">
        {services.map((s, i) => (
          <Reveal key={s.title} className="service" delay={i * 70}>
            <span className="service-n">0{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Cover({ hue, index }) {
  return (
    <svg className="cover" viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`g${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 85% 66%)`} />
          <stop offset="1" stopColor={`hsl(${(hue + 40) % 360} 70% 38%)`} />
        </linearGradient>
      </defs>
      <rect width="600" height="420" fill={`url(#g${index})`} />
      <circle cx={430} cy={120} r={140} fill="#fff" opacity=".14" />
      <circle cx={140} cy={330} r={190} fill="#000" opacity=".1" />
      <rect x="170" y="130" width="260" height="160" rx="22" fill="#fff" opacity=".92" />
      <rect x="196" y="158" width="110" height="12" rx="6" fill={`hsl(${hue} 60% 30%)`} />
      <rect x="196" y="184" width="190" height="8" rx="4" fill="#14140f" opacity=".25" />
      <rect x="196" y="204" width="150" height="8" rx="4" fill="#14140f" opacity=".25" />
      <rect x="196" y="238" width="72" height="28" rx="14" fill={`hsl(${hue} 70% 45%)`} />
    </svg>
  );
}

export function Work() {
  return (
    <section className="section" id="work">
      <Reveal as="p" className="eyebrow">Selected work</Reveal>
      <Reveal as="h2" delay={60}>Recent projects.</Reveal>
      <div className="work-grid">
        {work.map((w, i) => (
          <Reveal as="article" key={w.title} className={`work-card ${i % 3 === 0 ? 'wide' : ''}`} delay={(i % 2) * 90}>
            <div className="work-media"><Cover hue={w.hue} index={i} /></div>
            <div className="work-meta">
              <div><h3>{w.title}</h3><p>{w.kind}</p></div>
              <span>{w.year}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="section dark" id="process">
      <Reveal as="p" className="eyebrow">How we work</Reveal>
      <Reveal as="h2" delay={60}>Four steps, no surprises.</Reveal>
      <div className="steps">
        {process.map((s, i) => (
          <Reveal key={s.n} className="step" delay={i * 80}>
            <span className="step-n">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section narrow" id="faq">
      <Reveal as="p" className="eyebrow">FAQ</Reveal>
      <Reveal as="h2" delay={60}>Questions, answered.</Reveal>
      <div className="faq">
        {faqs.map((f, i) => (
          <div key={f.q} className={`faq-item ${open === i ? 'open' : ''}`}>
            <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
              <span>{f.q}</span><i aria-hidden="true" />
            </button>
            <div className="faq-body"><p>{f.a}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`Project enquiry from ${d.get('name')}`);
    const body = encodeURIComponent(`${d.get('message')}\n\n— ${d.get('name')} (${d.get('email')})`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };
  return (
    <section className="section contact" id="contact">
      <div>
        <Reveal as="p" className="eyebrow">Contact</Reveal>
        <Reveal as="h2" delay={60}>Have a project in mind?</Reveal>
        <Reveal as="p" className="lead" delay={120}>Tell us a little about it. We reply within two working days.</Reveal>
        <Reveal as="p" delay={160}><a className="mail" href={`mailto:${site.email}`}>{site.email}</a></Reveal>
      </div>
      <Reveal as="form" className="form" onSubmit={submit} delay={100}>
        <label>Your name<input name="name" required autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>About the project<textarea name="message" rows="4" required /></label>
        <button className="btn" type="submit">{sent ? 'Opening your email app…' : 'Send message'} <Arrow /></button>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} {site.name}</span>
      <a href={`mailto:${site.email}`}>{site.email}</a>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
