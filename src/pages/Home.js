import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import Carousel from './Carousel';

const Home = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const btnRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      const heroImg = containerRef.current?.querySelector('.home-image');
      const featureCards = featuresRef.current?.querySelectorAll('.home-feature-card');

      if (heroImg) gsap.set(heroImg, { opacity: 0, scale: 1.1 });
      gsap.set(titleRef.current, { opacity: 0, y: 40 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 30 });
      gsap.set(btnRef.current, { opacity: 0, y: 20, scale: 0.9 });
      if (featureCards?.length) gsap.set(featureCards, { opacity: 0, y: 60, scale: 0.9 });

      if (heroImg) {
        tl.to(heroImg, { opacity: 1, scale: 1, duration: 1 });
      }
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.7 }, heroImg ? '-=0.5' : 0)
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(btnRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, '-=0.3');

      if (featureCards?.length) {
        tl.to(featureCards, {
          opacity: 1, y: 0, scale: 1,
          stagger: 0.12, duration: 0.6,
        }, '-=0.2');

        featureCards.forEach((card) => {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -6, scale: 1.03, duration: 0.3, ease: 'power2.out' });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
          });
        });
      }

      if (btnRef.current) {
        btnRef.current.addEventListener('mouseenter', () => {
          gsap.to(btnRef.current, { scale: 1.05, boxShadow: '0 6px 20px rgba(22, 163, 74, 0.5)', duration: 0.3 });
        });
        btnRef.current.addEventListener('mouseleave', () => {
          gsap.to(btnRef.current, { scale: 1, boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)', duration: 0.3 });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-container" ref={containerRef}>
      <img src="/portada.png" alt="Super Mitre" className="home-image" />

      <div style={styles.hero} className="home-hero" ref={heroRef}>
        <h1 style={styles.heroTitle} ref={titleRef}>Bienvenido a Super Mitre</h1>
        <p style={styles.heroSubtitle} ref={subtitleRef}>
          Comprá lo que necesitás de manera rápida y sencilla.
        </p>
        <Link to="/login" style={styles.heroBtn} ref={btnRef}>
          Ingresar
        </Link>
      </div>

      <div style={styles.carouselSection}>
        <Carousel />
      </div>

      <div style={styles.features} className="home-features" ref={featuresRef}>
        {[
          { icon: '🛒', title: 'Comprá Online', desc: 'Elegí tus productos desde casa' },
          { icon: '⚡', title: 'Rápido y Fácil', desc: 'Recibí tu pedido sin demora' },
          { icon: '💚', title: 'Los Mejores Precios', desc: 'Ofertas todos los días' },
        ].map((f, i) => (
          <div key={i} className="home-feature-card" style={styles.feature}>
            <span style={styles.featureIcon}>{f.icon}</span>
            <h3 style={styles.featureTitle}>{f.title}</h3>
            <p style={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  hero: {
    padding: '3rem 1.5rem 2rem',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#171717',
    marginBottom: '0.5rem',
  },
  heroSubtitle: {
    fontSize: '1.0625rem',
    color: '#737373',
    marginBottom: '1.5rem',
    maxWidth: '480px',
    margin: '0 auto 1.5rem',
    lineHeight: '1.5',
  },
  heroBtn: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9375rem',
    textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
  },
  carouselSection: {
    padding: '0 1rem',
    marginBottom: '3rem',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    padding: '0 2rem 3rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  feature: {
    textAlign: 'center',
    padding: '1.5rem 1rem',
    background: 'white',
    borderRadius: '0.75rem',
    border: '1px solid #e5e5e5',
    cursor: 'default',
  },
  featureIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
  featureTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#171717',
    marginBottom: '0.25rem',
  },
  featureDesc: {
    fontSize: '0.8125rem',
    color: '#737373',
  },
};

export default Home;
