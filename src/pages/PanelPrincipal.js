import React, { useRef, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './PanelPrincipal.css';

const PanelPrincipal = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const logoutRef = useRef(null);
  const gridRef = useRef(null);
  const token = localStorage.getItem('authToken');
  let user = null;

  try {
    user = jwtDecode(token);
  } catch {}

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const cards = [
    { title: 'Gestión de Productos', desc: 'Agregar, editar y eliminar productos del catálogo', icon: '📦', path: '/gestion-productos', color: '#1294F2' },
    { title: 'Registrar Ventas', desc: 'Emitir tickets y gestionar ventas del día', icon: '🧾', path: '/registrar-ventas', color: '#FF6B35' },
    { title: 'Ver Reportes', desc: 'Consultar estadísticas y reportes de ventas', icon: '📊', path: '/reportes', color: '#1294F2' },
    { title: 'Gestión de Rubros', desc: 'Administrar categorías de productos', icon: '🏷️', path: '/rubros', color: '#8B5CF6' },
    { title: 'Cuentas Corrientes', desc: 'Consultar saldos y clientes con crédito', icon: '📋', path: '/cuentas-corrientes', color: '#FFC107' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, { opacity: 0, y: 30 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
      gsap.set(logoutRef.current, { opacity: 0, x: 20 });

      const panelCards = gridRef.current?.querySelectorAll('.panel-card');
      if (panelCards?.length) {
        gsap.set(panelCards, { opacity: 0, y: 50, scale: 0.92 });
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.5 })
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')
        .to(logoutRef.current, { opacity: 1, x: 0, duration: 0.4 }, '-=0.3');

      if (panelCards?.length) {
        tl.to(panelCards, {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: { each: 0.08, from: 'start' },
          duration: 0.5,
        }, '-=0.2');

        panelCards.forEach((card) => {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              y: -6,
              scale: 1.02,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              duration: 0.3,
              ease: 'power2.out',
            });
            const arrow = card.querySelector('.panel-card-arrow');
            const icon = card.querySelector('.panel-card-icon');
            if (arrow) gsap.to(arrow, { x: 4, duration: 0.3 });
            if (icon) gsap.to(icon, { scale: 1.2, duration: 0.3 });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              duration: 0.3,
              ease: 'power2.out',
            });
            const arrow = card.querySelector('.panel-card-arrow');
            const icon = card.querySelector('.panel-card-icon');
            if (arrow) gsap.to(arrow, { x: 0, duration: 0.3 });
            if (icon) gsap.to(icon, { scale: 1, duration: 0.3 });
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="panel-page" ref={containerRef}>
      <div className="panel-header">
        <div>
          <h1 className="panel-title" ref={titleRef}>Panel Principal</h1>
          <p className="panel-subtitle" ref={subtitleRef}>
            {user ? `Bienvenido, ${user.nombre || 'Usuario'}` : 'Bienvenido'}
          </p>
        </div>
        <button onClick={handleLogout} className="panel-logout" ref={logoutRef}>
          Cerrar Sesión
        </button>
      </div>

      <div className="panel-grid" ref={gridRef}>
        {cards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="panel-card"
            style={{ borderTop: `3px solid ${card.color}` }}
          >
            <span className="panel-card-icon">{card.icon}</span>
            <h3 className="panel-card-title">{card.title}</h3>
            <p className="panel-card-desc">{card.desc}</p>
            <span className="panel-card-arrow" style={{ color: card.color }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PanelPrincipal;
