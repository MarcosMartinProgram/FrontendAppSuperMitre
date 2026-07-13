import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const brandRef = useRef(null);
  const brandIconRef = useRef(null);
  const linksContainerRef = useRef(null);
  const logoutBtnRef = useRef(null);
  const token = localStorage.getItem('authToken');
  let user = null;

  try {
    if (token) user = jwtDecode(token);
  } catch {}

  const handleLogout = () => {
    gsap.to(navRef.current, {
      opacity: 0.5,
      duration: 0.2,
      onComplete: () => {
        localStorage.removeItem('authToken');
        navigate('/');
      }
    });
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(brandRef.current, { opacity: 0, x: -30 });
      gsap.set(brandIconRef.current, { scale: 0, rotation: -90 });

      const navLinks = linksContainerRef.current?.querySelectorAll('.navbar-link-item');
      if (navLinks?.length) gsap.set(navLinks, { opacity: 0, y: -15 });

      if (logoutBtnRef.current) gsap.set(logoutBtnRef.current, { opacity: 0, x: 20 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(brandRef.current, { opacity: 1, x: 0, duration: 0.5 })
        .to(brandIconRef.current, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3');

      if (navLinks?.length) {
        tl.to(navLinks, { opacity: 1, y: 0, stagger: 0.06, duration: 0.3 }, '-=0.2');
      }
      if (logoutBtnRef.current) {
        tl.to(logoutBtnRef.current, { opacity: 1, x: 0, duration: 0.3 }, '-=0.2');
      }

      if (brandRef.current) {
        brandRef.current.addEventListener('mouseenter', () => {
          gsap.to(brandIconRef.current, { rotation: 15, scale: 1.1, duration: 0.3, ease: 'back.out(1.7)' });
        });
        brandRef.current.addEventListener('mouseleave', () => {
          gsap.to(brandIconRef.current, { rotation: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
        });
      }

      if (navLinks?.length) {
        navLinks.forEach((link) => {
          link.addEventListener('mouseenter', () => {
            gsap.to(link, { scale: 1.05, duration: 0.2 });
          });
          link.addEventListener('mouseleave', () => {
            gsap.to(link, { scale: 1, duration: 0.2 });
          });
        });
      }

      if (logoutBtnRef.current) {
        logoutBtnRef.current.addEventListener('mouseenter', () => {
          gsap.to(logoutBtnRef.current, { backgroundColor: '#FEF2F2', color: '#E53935', borderColor: '#FECACA', duration: 0.2 });
        });
        logoutBtnRef.current.addEventListener('mouseleave', () => {
          gsap.to(logoutBtnRef.current, { backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)', duration: 0.2 });
        });
      }
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav style={styles.nav} ref={navRef}>
      <div style={styles.inner} className="navbar-inner">
        <Link to="/" style={styles.brand} className="navbar-brand" ref={brandRef}>
          <span style={styles.brandIcon} ref={brandIconRef}>S</span>
          <span style={styles.brandText}>Super Mitre</span>
        </Link>

        <div style={styles.links} className="navbar-links" ref={linksContainerRef}>
          <Link
            to="/"
            className="navbar-link-item"
            style={{
              ...styles.link,
              ...(isActive('/') ? styles.linkActive : {}),
            }}
          >
            Inicio
          </Link>

          {!user ? (
            <Link
              to="/login"
              className="navbar-link-item"
              style={{
                ...styles.link,
                ...(isActive('/login') ? styles.linkActive : {}),
              }}
            >
              Ingresar
            </Link>
          ) : (
            <>
              {user.rol === 'master' && (
                <Link
                  to="/panel"
                  className="navbar-link-item"
                  style={{
                    ...styles.link,
                    ...(isActive('/panel') ? styles.linkActive : {}),
                  }}
                >
                  Panel
                </Link>
              )}
              {user.rol === 'master' && (
                <Link
                  to="/pedidos-online"
                  className="navbar-link-item"
                  style={{
                    ...styles.link,
                    ...(isActive('/pedidos-online') ? styles.linkActive : {}),
                  }}
                >
                  Pedidos
                </Link>
              )}
              {user.rol === 'vendedor' && (
                <Link
                  to="/ventas"
                  className="navbar-link-item"
                  style={{
                    ...styles.link,
                    ...(isActive('/ventas') ? styles.linkActive : {}),
                  }}
                >
                  Ventas
                </Link>
              )}
              {user.rol === 'cliente' && (
                <Link
                  to="/tienda"
                  className="navbar-link-item"
                  style={{
                    ...styles.link,
                    ...(isActive('/tienda') ? styles.linkActive : {}),
                  }}
                >
                  Tienda
                </Link>
              )}
              <button onClick={handleLogout} style={styles.logoutBtn} ref={logoutBtnRef}>
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'linear-gradient(90deg, #081B2E, #0E2238, #163554)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 1px 3px rgba(9,30,66,.08)',
  },
  inner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '56px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  brandIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(180deg, #24A2FF, #0076E6)',
    color: 'white',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1rem',
  },
  brandText: {
    fontWeight: '700',
    fontSize: '1.125rem',
    color: '#FFFFFF',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  link: {
    padding: '0.5rem 0.875rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  linkActive: {
    color: '#1294F2',
    backgroundColor: 'rgba(18, 148, 242, 0.1)',
  },
  logoutBtn: {
    marginLeft: '0.5rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default Navbar;
