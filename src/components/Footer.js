import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './footer.css';

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(footerRef.current, { opacity: 0, y: 20 });
      gsap.to(footerRef.current, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top bottom-=50',
          toggleActions: 'play none none none',
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">S</span>
          <span className="footer-name">Super Mitre</span>
        </div>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Super Mitre &mdash; Todos los derechos reservados.
        </p>
        <p className="footer-disclaimer">Imágenes a modo ilustrativo</p>
        <div className="footer-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <span className="footer-sep">&middot;</span>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
