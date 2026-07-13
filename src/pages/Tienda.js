import React, { useState, useEffect, useRef, useCallback } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { rubrosAPI, productosAPI, mpAPI } from '../services/api';
import QRModal from '../components/QRModal';
import gsap from 'gsap';

const Tienda = () => {
  const [rubros, setRubros] = useState([]);
  const [productos, setProductos] = useState([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const carouselRef = useRef(null);
  const productsRef = useRef(null);
  const cartRef = useRef(null);
  const cartItemsRef = useRef(null);

  useEffect(() => {
    rubrosAPI.getAll().then(({ data }) => setRubros(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (rubroSeleccionado) {
      productosAPI.getByRubro(rubroSeleccionado)
        .then(({ data }) => setProductos(data))
        .catch(console.error);
    }
  }, [rubroSeleccionado]);

  useEffect(() => {
    if (productos.length > 0 && productsRef.current) {
      const cards = productsRef.current.querySelectorAll('.tienda-product-card');
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 40, scale: 0.92 });
        gsap.to(cards, {
          opacity: 1, y: 0, scale: 1,
          stagger: 0.06, duration: 0.5, ease: 'power3.out',
        });
      }
    }
  }, [productos]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, { opacity: 0, y: 30 });
      if (carouselRef.current) gsap.set(carouselRef.current, { opacity: 0, y: 20 });
      if (cartRef.current) gsap.set(cartRef.current, { opacity: 0, x: 30 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.5 });
      if (carouselRef.current) tl.to(carouselRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.3');
      if (cartRef.current) tl.to(cartRef.current, { opacity: 1, x: 0, duration: 0.4 }, '-=0.2');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const total = carrito.reduce((acc, item) => acc + (parseFloat(item.precio) * (item.cantidad || 1)), 0);

  const agregarAlCarrito = useCallback((producto) => {
    setCarrito((prev) => {
      const existente = prev.find((p) => p.codigo_barras === producto.codigo_barras);
      if (existente) {
        return prev.map((p) =>
          p.codigo_barras === producto.codigo_barras
            ? { ...p, cantidad: (p.cantidad || 1) + 1 }
            : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });

    if (cartRef.current) {
      gsap.fromTo(cartRef.current, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
    }
  }, []);

  const cambiarCantidad = useCallback((codigo, delta) => {
    setCarrito((prev) =>
      prev.map((p) => {
        if (p.codigo_barras !== codigo) return p;
        const nuevaCant = (p.cantidad || 1) + delta;
        return nuevaCant > 0 ? { ...p, cantidad: nuevaCant } : p;
      }).filter((p) => (p.cantidad || 1) > 0)
    );
  }, []);

  const quitarDelCarrito = useCallback((codigo) => {
    if (cartItemsRef.current) {
      const items = cartItemsRef.current.querySelectorAll('.cart-item');
      const idx = carrito.findIndex((p) => p.codigo_barras === codigo);
      if (items[idx]) {
        gsap.to(items[idx], {
          x: -30, opacity: 0, height: 0, padding: 0, margin: 0,
          duration: 0.3, ease: 'power2.in',
          onComplete: () => setCarrito((prev) => prev.filter((p) => p.codigo_barras !== codigo)),
        });
        return;
      }
    }
    setCarrito((prev) => prev.filter((p) => p.codigo_barras !== codigo));
  }, [carrito]);

  const finalizarCompra = async () => {
    if (carrito.length === 0 || procesando) return;
    setProcesando(true);
    try {
      const { data } = await mpAPI.crearPreferencia(carrito);
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('No se pudo iniciar el pago. Intentá de nuevo.');
      }
    } catch (err) {
      console.error('Error al crear preferencia:', err);
      alert('Error al procesar el pago. Intentá más tarde.');
    } finally {
      setProcesando(false);
    }
  };

  const handlePagoAprobado = (pagoData) => {
    setShowQRModal(false);
    setCarrito([]);
    alert('¡Pago aprobado! Tu compra fue registrada.');
  };

  const handleCancelarQR = () => {
    setShowQRModal(false);
  };

  const productosFiltrados = busqueda.trim()
    ? productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : productos;

  const sliderSettings = {
    dots: true,
    infinite: rubros.length > 3,
    speed: 400,
    slidesToShow: Math.min(rubros.length, 4),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div style={styles.page} ref={containerRef} className="tienda-layout">
      <h1 style={styles.title} ref={titleRef}>Tienda</h1>

      {/* RUBROS */}
      {rubros.length > 0 && (
        <div style={styles.carouselWrap} ref={carouselRef}>
          <Slider {...sliderSettings}>
            {rubros.map((rubro) => (
              <div key={rubro.id_rubro} style={{ padding: '0 0.5rem' }}>
                <button
                  onClick={() => setRubroSeleccionado(rubro.id_rubro)}
                  style={{
                    ...styles.rubroCard,
                    ...(rubroSeleccionado === rubro.id_rubro ? styles.rubroActive : {}),
                  }}
                >
                  {rubro.nombre}
                </button>
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* COLUMNA IZQUIERDA - Productos */}
      <div style={styles.leftCol}>
        {rubroSeleccionado ? (
          <>
            <div style={styles.searchBar}>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.productGrid} ref={productsRef}>
              {productosFiltrados.length === 0 ? (
                <p style={styles.empty}>No hay productos{busqueda ? ' que coincidan' : ' en esta categoría'}</p>
              ) : (
                productosFiltrados.map((producto) => {
                  const enCarrito = carrito.find((p) => p.codigo_barras === producto.codigo_barras);
                  return (
                    <div key={producto.codigo_barras} style={styles.productCard} className="tienda-product-card">
                      {producto.imagen_url ? (
                        <img src={producto.imagen_url} alt={producto.nombre} style={styles.productImg}
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      ) : null}
                      <div style={{
                        ...styles.imgPlaceholder,
                        display: producto.imagen_url ? 'none' : 'flex',
                      }}>📦</div>
                      <div style={styles.productBody}>
                        <h3 style={styles.productName}>{producto.nombre}</h3>
                        <p style={styles.productPrice}>${parseFloat(producto.precio).toFixed(2)}</p>
                        {enCarrito ? (
                          <div style={styles.qtyControl}>
                            <button onClick={() => cambiarCantidad(producto.codigo_barras, -1)} style={styles.qtyBtn}>−</button>
                            <span style={styles.qtyValue}>{enCarrito.cantidad}</span>
                            <button onClick={() => cambiarCantidad(producto.codigo_barras, 1)} style={styles.qtyBtn}>+</button>
                          </div>
                        ) : (
                          <button onClick={() => agregarAlCarrito(producto)} style={styles.addBtn}>
                            Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <p style={styles.selectCategory}>Elegí una categoría para ver los productos</p>
        )}
      </div>

      {/* COLUMNA DERECHA - Carrito */}
      <div style={styles.cartSection} ref={cartRef}>
        <h2 style={styles.cartTitle}>
          🛒 Carrito
          {carrito.length > 0 && <span style={styles.cartBadge}>{carrito.reduce((a, p) => a + (p.cantidad || 1), 0)}</span>}
        </h2>
        {carrito.length === 0 ? (
          <p style={styles.empty}>Agregá productos para empezar</p>
        ) : (
          <>
            <div style={styles.cartItems} ref={cartItemsRef}>
              {carrito.map((item) => (
                <div key={item.codigo_barras} style={styles.cartItem} className="cart-item">
                  <div style={styles.cartItemLeft}>
                    <p style={styles.cartItemName}>{item.nombre}</p>
                    <p style={styles.cartItemDetail}>
                      {item.cantidad || 1} x ${parseFloat(item.precio).toFixed(2)}
                    </p>
                  </div>
                  <div style={styles.cartItemRight}>
                    <span style={styles.cartItemTotal}>
                      ${((item.cantidad || 1) * parseFloat(item.precio)).toFixed(2)}
                    </span>
                    <button onClick={() => quitarDelCarrito(item.codigo_barras)} style={styles.removeBtn}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.cartTotal}>
              <span>Total</span>
              <span style={styles.totalAmount}>${total.toFixed(2)}</span>
            </div>
            <div style={styles.paymentBtns}>
              <button
                onClick={() => setShowQRModal(true)}
                style={styles.qrBtn}
              >
                Pagar con QR
              </button>
              <button
                onClick={finalizarCompra}
                style={{ ...styles.checkoutBtn, opacity: procesando ? 0.6 : 1 }}
                disabled={procesando}
              >
                {procesando ? 'Procesando...' : 'Pagar con MercadoPago'}
              </button>
            </div>
            <p style={styles.mpNote}>Elegí tu método de pago preferido</p>
          </>
        )}
      </div>

      {showQRModal && (
        <QRModal
          total={total}
          productos={carrito}
          onPagoAprobado={handlePagoAprobado}
          onCancelar={handleCancelarQR}
        />
      )}
    </div>
  );
};

const styles = {
  page: { padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' },
  title: { gridColumn: '1 / -1', fontSize: '1.5rem', fontWeight: '700', color: '#273444', marginBottom: '0.5rem' },
  carouselWrap: { gridColumn: '1 / -1', marginBottom: '1rem', padding: '0 0.5rem' },
  rubroCard: {
    width: '100%', padding: '1rem', background: 'white', border: '2px solid #E6EDF5',
    borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9375rem',
    color: '#404040', transition: 'all 0.2s ease', textAlign: 'center',
  },
  rubroActive: { borderColor: '#1294F2', background: '#E8F4FD', color: '#1294F2' },
  leftCol: {},
  searchBar: { marginBottom: '1rem' },
  searchInput: {
    width: '100%', padding: '0.7rem 1rem', border: '2px solid #E6EDF5',
    borderRadius: '14px', fontSize: '0.875rem', outline: 'none', background: 'white',
  },
  productGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '1rem',
  },
  productCard: {
    background: 'white', borderRadius: '14px', border: '1px solid #E6EDF5',
    overflow: 'hidden', transition: 'box-shadow 0.2s ease',
  },
  productImg: { width: '100%', height: '180px', objectFit: 'contain', background: '#f8f8f8', padding: '0.5rem' },
  imgPlaceholder: {
    width: '100%', height: '180px', background: '#f5f5f5',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
  },
  productBody: { padding: '0.85rem' },
  productName: { fontSize: '0.85rem', fontWeight: '600', color: '#273444', marginBottom: '0.25rem', lineHeight: '1.3' },
  productPrice: { fontSize: '1rem', fontWeight: '700', color: '#1294F2', marginBottom: '0.6rem' },
  addBtn: {
    width: '100%', padding: '0.45rem', background: 'linear-gradient(135deg, #1294F2, #0B89FF)',
    color: 'white', border: 'none', borderRadius: '14px', fontWeight: '600',
    fontSize: '0.8rem', cursor: 'pointer',
  },
  qtyControl: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
    background: '#E8F4FD', borderRadius: '14px', padding: '0.35rem',
  },
  qtyBtn: {
    width: '30px', height: '30px', borderRadius: '14px', border: '1.5px solid #D0ECFF',
    background: 'white', color: '#1294F2', fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyValue: { fontWeight: '700', fontSize: '0.9rem', color: '#1294F2', minWidth: '20px', textAlign: 'center' },
  selectCategory: { gridColumn: '1', color: '#667085', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' },
  empty: { color: '#667085', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' },

  /* CARRITO */
  cartSection: {
    background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5',
    padding: '1.25rem', position: 'sticky', top: '80px',
  },
  cartTitle: {
    fontSize: '1rem', fontWeight: '700', color: '#273444', marginBottom: '0.75rem',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  cartBadge: {
    background: '#1294F2', color: 'white', borderRadius: '999px',
    fontSize: '0.7rem', fontWeight: '700', padding: '0.15rem 0.5rem',
    minWidth: '20px', textAlign: 'center',
  },
  cartItems: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem', maxHeight: '300px', overflowY: 'auto' },
  cartItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.6rem 0.7rem', background: '#fafafa', borderRadius: '10px',
  },
  cartItemLeft: { flex: 1, minWidth: 0 },
  cartItemName: { fontWeight: '600', fontSize: '0.8rem', color: '#273444', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cartItemDetail: { fontSize: '0.7rem', color: '#667085', margin: '0.1rem 0 0' },
  cartItemRight: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 },
  cartItemTotal: { fontWeight: '700', fontSize: '0.8rem', color: '#273444' },
  removeBtn: {
    width: '22px', height: '22px', borderRadius: '6px', border: 'none',
    background: '#FEF2F2', color: '#E53935', fontSize: '0.65rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cartTotal: {
    display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0',
    borderTop: '2px solid #f0f0f0', fontWeight: '700', fontSize: '1rem', color: '#273444',
  },
  totalAmount: { color: '#1294F2', fontSize: '1.1rem' },
  paymentBtns: {
    display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem',
  },
  qrBtn: {
    width: '100%', padding: '0.7rem', background: 'white',
    color: '#1294F2', border: '2px solid #1294F2', borderRadius: '14px',
    fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  checkoutBtn: {
    width: '100%', padding: '0.7rem', background: 'linear-gradient(135deg, #009ee3, #007eb5)',
    color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700',
    fontSize: '0.875rem', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0,158,227,0.3)',
  },
  mpNote: {
    fontSize: '0.7rem', color: '#667085', textAlign: 'center', marginTop: '0.4rem',
  },
};

export default Tienda;
