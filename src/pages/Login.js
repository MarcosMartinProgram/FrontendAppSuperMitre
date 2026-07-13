import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import gsap from 'gsap';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [numero_whatsapp, setNumero_whatsapp] = useState('');
  const [direccion, setDireccion] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const { login, register, loading, error } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const formRef = useRef(null);
  const submitRef = useRef(null);
  const toggleRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      gsap.set(cardRef.current, { opacity: 0, scale: 0.85, y: 40 });
      gsap.set(logoRef.current, { scale: 0, rotation: -180 });
      gsap.set(titleRef.current, { opacity: 0, y: 20 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 15 });

      const inputGroups = formRef.current?.querySelectorAll('.input-group');
      if (inputGroups?.length) gsap.set(inputGroups, { opacity: 0, x: -30 });

      if (submitRef.current) gsap.set(submitRef.current, { opacity: 0, y: 20, scale: 0.9 });
      if (toggleRef.current) gsap.set(toggleRef.current, { opacity: 0 });
      if (backRef.current) gsap.set(backRef.current, { opacity: 0 });

      tl.to(cardRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.7 })
        .to(logoRef.current, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.3')
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');

      if (inputGroups?.length) {
        tl.to(inputGroups, { opacity: 1, x: 0, stagger: 0.08, duration: 0.4 }, '-=0.2');
      }
      if (submitRef.current) {
        tl.to(submitRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, '-=0.1');
      }
      if (toggleRef.current) {
        tl.to(toggleRef.current, { opacity: 1, duration: 0.3 }, '-=0.1');
      }
      if (backRef.current) {
        tl.to(backRef.current, { opacity: 1, duration: 0.3 }, '-=0.2');
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    gsap.to(cardRef.current, {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });

    try {
      let user;
      if (isNewUser) {
        user = await register({ email, password, nombre, numero_whatsapp, direccion });
      } else {
        user = await login(email, password);
      }

      gsap.to(cardRef.current, {
        scale: 0.9,
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          switch (user.rol) {
            case 'master': navigate('/panel'); break;
            case 'cliente': navigate('/tienda'); break;
            case 'vendedor': navigate('/ventas'); break;
            default: navigate('/');
          }
        }
      });
    } catch {}
  };

  const toggleMode = () => {
    gsap.to(cardRef.current, {
      scale: 0.97,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => setIsNewUser(!isNewUser),
    });
  };

  return (
    <div className="login-page" ref={containerRef}>
      <div className="login-bg-pattern" />
      <div className="login-card" ref={cardRef}>
        <div className="login-header">
          <div className="login-logo" ref={logoRef}>S</div>
          <h2 ref={titleRef}>{isNewUser ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
          <p className="login-subtitle" ref={subtitleRef}>
            {isNewUser
              ? 'Registrate para acceder a la tienda'
              : 'Accedé a tu panel de control'}
          </p>
          {isNewUser && (
            <p style={{ fontSize: '0.8125rem', color: '#667085', margin: '-0.5rem 0 0', textAlign: 'center' }}>
              Complete los datos correctos para su envío
            </p>
          )}
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form" ref={formRef}>
          <div className="input-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isNewUser && (
            <>
              <div className="input-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input
                  id="whatsapp"
                  type="text"
                  placeholder="Número de contacto"
                  value={numero_whatsapp}
                  onChange={(e) => setNumero_whatsapp(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                  id="direccion"
                  type="text"
                  placeholder="Tu dirección"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="login-submit" ref={submitRef} disabled={loading}>
            {loading ? 'Cargando...' : isNewUser ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-toggle" ref={toggleRef}>
          {isNewUser ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
          <span onClick={toggleMode}>
            {isNewUser ? 'Iniciar sesión' : 'Registrate'}
          </span>
        </div>

        <Link to="/" className="login-back" ref={backRef}>
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default Login;
