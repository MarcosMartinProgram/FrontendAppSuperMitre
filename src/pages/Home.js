import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import Carousel from './Carousel';

const Home = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroOverlay = containerRef.current?.querySelector('.hero-overlay');
      const heroTitle = containerRef.current?.querySelector('.hero-title');
      const heroSub = containerRef.current?.querySelector('.hero-subtitle');
      const heroCta = containerRef.current?.querySelector('.hero-cta');
      const heroBadge = containerRef.current?.querySelector('.hero-badge');
      const sectionTitles = containerRef.current?.querySelectorAll('.section-title-wrap');
      const catCards = containerRef.current?.querySelectorAll('.cat-card');
      const featureCards = containerRef.current?.querySelectorAll('.feat-card');
      const ctaBox = containerRef.current?.querySelector('.final-cta');

      gsap.set(heroOverlay, { opacity: 0 });
      gsap.set(heroTitle, { opacity: 0, y: 60, skewY: 3 });
      gsap.set(heroSub, { opacity: 0, y: 40 });
      gsap.set(heroCta, { opacity: 0, y: 30, scale: 0.9 });
      gsap.set(heroBadge, { opacity: 0, x: -30 });
      if (sectionTitles) gsap.set(sectionTitles, { opacity: 0, y: 40 });
      if (catCards) gsap.set(catCards, { opacity: 0, y: 50, scale: 0.92 });
      if (featureCards) gsap.set(featureCards, { opacity: 0, y: 40 });
      if (ctaBox) gsap.set(ctaBox, { opacity: 0, y: 30, scale: 0.95 });

      const tlHero = gsap.timeline();
      tlHero
        .to(heroOverlay, { opacity: 1, duration: 1.2 })
        .to(heroBadge, { opacity: 1, x: 0, duration: 0.5 }, '-=0.6')
        .to(heroTitle, { opacity: 1, y: 0, skewY: 0, duration: 0.8 }, '-=0.3')
        .to(heroSub, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(heroCta, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, '-=0.3');

      if (sectionTitles?.length) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              gsap.to(e.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
              obs.unobserve(e.target);
            }
          });
        }, { threshold: 0.2 });
        sectionTitles.forEach((el) => obs.observe(el));
      }

      if (catCards?.length) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const idx = Array.from(catCards).indexOf(e.target);
              gsap.to(e.target, { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: idx * 0.1, ease: 'back.out(1.2)' });
              obs.unobserve(e.target);
            }
          });
        }, { threshold: 0.15 });
        catCards.forEach((el) => obs.observe(el));

        catCards.forEach((card) => {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, scale: 1.03, duration: 0.35, ease: 'power2.out' });
            gsap.to(card.querySelector('.cat-img'), { scale: 1.08, duration: 0.4, ease: 'power2.out' });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
            gsap.to(card.querySelector('.cat-img'), { scale: 1, duration: 0.4, ease: 'power2.out' });
          });
        });
      }

      if (featureCards?.length) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const idx = Array.from(featureCards).indexOf(e.target);
              gsap.to(e.target, { opacity: 1, y: 0, duration: 0.6, delay: idx * 0.12, ease: 'power3.out' });
              obs.unobserve(e.target);
            }
          });
        }, { threshold: 0.2 });
        featureCards.forEach((el) => obs.observe(el));

        featureCards.forEach((card) => {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -6, duration: 0.3, ease: 'power2.out' });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
          });
        });
      }

      if (ctaBox) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              gsap.to(e.target, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.3)' });
              obs.unobserve(e.target);
            }
          });
        }, { threshold: 0.3 });
        obs.observe(ctaBox);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={styles.page}>
      {/* HERO */}
      <section style={styles.heroSection}>
        <video
          src="/video-institucional.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={styles.heroVideo}
        />
        <div className="hero-overlay" style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <span className="hero-badge" style={styles.heroBadge}>
            <span style={styles.badgeDot} /> Tu supermercado de confianza
          </span>
          <h1 className="hero-title" style={styles.heroTitle}>
            Super<br />Mitre
          </h1>
          <p className="hero-subtitle" style={styles.heroSubtitle}>
            Comprá lo que necesitás de manera rápida, simple y con los mejores precios del barrio.
          </p>
          <Link to="/login" className="hero-cta" style={styles.heroBtn}>
            <span>Ingresar al sistema</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* CAROUSEL */}
      <section style={styles.carouselWrap}>
        <div style={styles.carouselInner}>
          <Carousel />
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section style={styles.section}>
        <div className="section-title-wrap" style={styles.sectionTitleWrap}>
          <span style={styles.sectionLabel}>Explorá</span>
          <h2 style={styles.sectionTitle}>Nuestras categorías</h2>
        </div>
        <div style={styles.catGrid}>
          {[
            { img: '/cervezas.png', name: 'Cervezas', color: '#FF6B35' },
            { img: '/gaseosas.png', name: 'Gaseosas', color: '#1294F2' },
            { img: '/comestibles.png', name: 'Comestibles', color: '#1FB954' },
            { img: '/lacteos.png', name: 'Lácteos', color: '#8B5CF6' },
          ].map((cat, i) => (
            <div key={i} className="cat-card" style={styles.catCard}>
              <div style={{ ...styles.catImgWrap, borderTopColor: cat.color }}>
                <img src={cat.img} alt={cat.name} className="cat-img" style={styles.catImg} />
              </div>
              <div style={styles.catInfo}>
                <h3 style={styles.catName}>{cat.name}</h3>
                <div style={{ ...styles.catDot, background: cat.color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section style={styles.section}>
        <div className="section-title-wrap" style={styles.sectionTitleWrap}>
          <span style={styles.sectionLabel}>Por qué elegirnos</span>
          <h2 style={styles.sectionTitle}>La mejor experiencia</h2>
        </div>
        <div style={styles.featGrid}>
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1294F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              ),
              title: 'Comprá Online',
              desc: 'Elegí todos tus productos favoritos desde la comodidad de tu casa.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1294F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              ),
              title: 'Rápido y Fácil',
              desc: 'Pedidos ágiles para que no pierdas tiempo en filas.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1294F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              ),
              title: 'Los Mejores Precios',
              desc: 'Ofertas imperdibles todos los días para tu bolsillo.',
            },
          ].map((f, i) => (
            <div key={i} className="feat-card" style={styles.featCard}>
              <div style={styles.featIcon}>{f.icon}</div>
              <h3 style={styles.featTitle}>{f.title}</h3>
              <p style={styles.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={styles.ctaSection}>
        <div className="final-cta" style={styles.ctaBox}>
          <h2 style={styles.ctaTitle}>¿Listo para comprar?</h2>
          <p style={styles.ctaSub}>Entrá y descubrí todo lo que tenemos para vos.</p>
          <Link to="/login" style={styles.ctaBtn}>
            Empezar ahora
          </Link>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: {
    background: '#F5F8FC',
  },
  /* HERO */
  heroSection: {
    position: 'relative',
    width: '100%',
    height: 'min(85vh, 680px)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
  },
  heroVideo: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(8,27,46,0.55) 0%, rgba(18,148,242,0.35) 55%, rgba(70,182,255,0.55) 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    padding: '3rem 2.5rem 3.5rem',
    maxWidth: '640px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '999px',
    padding: '0.4rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: '1.25rem',
    letterSpacing: '0.01em',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#46B6FF',
    boxShadow: '0 0 6px #46B6FF',
  },
  heroTitle: {
    fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
    fontWeight: '900',
    color: 'white',
    lineHeight: '0.95',
    letterSpacing: '-0.03em',
    marginBottom: '1rem',
    textShadow: '0 2px 30px rgba(0,0,0,0.2)',
  },
  heroSubtitle: {
    fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: '1.6',
    marginBottom: '1.75rem',
    maxWidth: '440px',
  },
  heroBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.85rem 2rem',
    background: 'linear-gradient(180deg, #24A2FF, #0076E6)',
    color: 'white',
    borderRadius: '14px',
    fontWeight: '600',
    fontSize: '0.95rem',
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(18, 148, 242, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
  },
  /* CAROUSEL */
  carouselWrap: {
    padding: '2.5rem 0',
    width: '100%',
  },
  carouselInner: {
    overflow: 'hidden',
  },
  /* SECTIONS */
  section: {
    padding: '2rem 1.5rem 3rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  sectionTitleWrap: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  sectionLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#1294F2',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '0.4rem',
  },
  sectionTitle: {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: '800',
    color: '#273444',
    letterSpacing: '-0.02em',
  },
  /* CATEGORÍAS */
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.25rem',
  },
  catCard: {
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid #E6EDF5',
    boxShadow: '0 10px 35px rgba(9,30,66,.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  catImgWrap: {
    width: '100%',
    aspectRatio: '4/3',
    overflow: 'hidden',
    borderTop: '3px solid',
    background: '#F5F8FC',
  },
  catImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  catInfo: {
    padding: '0.85rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#273444',
  },
  catDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  /* FEATURES */
  featGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
  },
  featCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '1.75rem 1.5rem',
    border: '1px solid #E6EDF5',
    boxShadow: '0 10px 35px rgba(9,30,66,.08)',
    cursor: 'default',
  },
  featIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #E8F4FD, #D0ECFF)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  featTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#273444',
    marginBottom: '0.4rem',
  },
  featDesc: {
    fontSize: '0.85rem',
    color: '#667085',
    lineHeight: '1.55',
  },
  /* CTA */
  ctaSection: {
    padding: '2rem 1.5rem 4rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  ctaBox: {
    background: 'linear-gradient(135deg, #0B6DDA 0%, #1294F2 55%, #46B6FF 100%)',
    borderRadius: '20px',
    padding: '3.5rem 2rem',
    textAlign: 'center',
    boxShadow: '0 12px 40px rgba(18, 148, 242, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaTitle: {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: '800',
    color: 'white',
    marginBottom: '0.5rem',
    position: 'relative',
  },
  ctaSub: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '1.75rem',
    position: 'relative',
  },
  ctaBtn: {
    display: 'inline-block',
    padding: '0.85rem 2.5rem',
    background: 'white',
    color: '#1294F2',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '0.95rem',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
};

/* Responsive overrides */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    .cat-card { grid-column: span 2; }
  }
  @media (max-width: 480px) {
    .cat-card { grid-column: span 2; }
  }
  @media (max-width: 600px) {
    .hero-title { font-size: 2.5rem !important; }
  }
`;
document.head.appendChild(styleSheet);

export default Home;
