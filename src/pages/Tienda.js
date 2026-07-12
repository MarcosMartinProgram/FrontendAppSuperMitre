import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { rubrosAPI, productosAPI } from '../services/api';
import gsap from 'gsap';

const Tienda = () => {
  const [rubros, setRubros] = useState([]);
  const [productos, setProductos] = useState([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const carouselRef = useRef(null);
  const productsRef = useRef(null);
  const cartSectionRef = useRef(null);
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
      if (cartSectionRef.current) gsap.set(cartSectionRef.current, { opacity: 0, x: 30 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.5 });
      if (carouselRef.current) {
        tl.to(carouselRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.3');
      }
      if (cartSectionRef.current) {
        tl.to(cartSectionRef.current, { opacity: 1, x: 0, duration: 0.4 }, '-=0.2');
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find((p) => p.codigo_barras === producto.codigo_barras);
    if (existente) {
      setCarrito(carrito.map((p) =>
        p.codigo_barras === producto.codigo_barras
          ? { ...p, cantidad: (p.cantidad || 1) + 1 }
          : p
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    setTotal((prev) => prev + parseFloat(producto.precio));

    if (cartSectionRef.current) {
      gsap.fromTo(cartSectionRef.current,
        { scale: 0.97 },
        { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  };

  const quitarDelCarrito = (index) => {
    const item = carrito[index];
    setTotal((prev) => prev - parseFloat(item.precio) * (item.cantidad || 1));

    if (cartItemsRef.current) {
      const cartItem = cartItemsRef.current.children[index];
      if (cartItem) {
        gsap.to(cartItem, {
          x: -30, opacity: 0, height: 0, padding: 0, marginBottom: 0,
          duration: 0.3, ease: 'power2.in',
          onComplete: () => setCarrito(carrito.filter((_, i) => i !== index)),
        });
        return;
      }
    }
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const finalizarCompra = () => {
    if (cartItemsRef.current) {
      gsap.to(cartItemsRef.current.children, {
        x: 30, opacity: 0, stagger: 0.05, duration: 0.3, ease: 'power2.in',
      });
    }
    setTimeout(() => {
      alert(
        `Compra realizada:\n${carrito
          .map((p) => `${p.nombre} x${p.cantidad || 1} - $${(p.precio * (p.cantidad || 1)).toFixed(2)}`)
          .join('\n')}\n\nTotal: $${total.toFixed(2)}`
      );
      setCarrito([]);
      setTotal(0);
    }, 400);
  };

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
    <div style={styles.page} ref={containerRef}>
      <h1 style={styles.title} ref={titleRef}>Tienda</h1>

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

      {rubroSeleccionado && (
        <div style={styles.productGrid} ref={productsRef}>
          {productos.length === 0 ? (
            <p style={styles.empty}>No hay productos en esta categoría</p>
          ) : (
            productos.map((producto) => (
              <div key={producto.codigo_barras} style={styles.productCard} className="tienda-product-card">
                {producto.imagen ? (
                  <img src={producto.imagen} alt={producto.nombre} style={styles.productImg} />
                ) : (
                  <div style={styles.imgPlaceholder}>📦</div>
                )}
                <div style={styles.productBody}>
                  <h3 style={styles.productName}>{producto.nombre}</h3>
                  <p style={styles.productPrice}>${parseFloat(producto.precio).toFixed(2)}</p>
                  <button onClick={() => agregarAlCarrito(producto)} style={styles.addBtn}>
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div style={styles.cartSection} ref={cartSectionRef}>
        <h2 style={styles.cartTitle}>Carrito ({carrito.length})</h2>
        {carrito.length === 0 ? (
          <p style={styles.empty}>El carrito está vacío</p>
        ) : (
          <>
            <div style={styles.cartItems} ref={cartItemsRef}>
              {carrito.map((item, index) => (
                <div key={index} style={styles.cartItem}>
                  <div>
                    <p style={styles.cartItemName}>{item.nombre}</p>
                    <p style={styles.cartItemDetail}>
                      {item.cantidad || 1} x ${parseFloat(item.precio).toFixed(2)}
                    </p>
                  </div>
                  <div style={styles.cartItemRight}>
                    <span style={styles.cartItemTotal}>
                      ${((item.cantidad || 1) * parseFloat(item.precio)).toFixed(2)}
                    </span>
                    <button onClick={() => quitarDelCarrito(index)} style={styles.removeBtn}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.cartTotal}>
              <span>Total</span>
              <span style={styles.totalAmount}>${total.toFixed(2)}</span>
            </div>
            <button onClick={finalizarCompra} style={styles.checkoutBtn}>
              Finalizar Compra
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#171717', marginBottom: '1.5rem' },
  carouselWrap: { marginBottom: '2rem', padding: '0 0.5rem' },
  rubroCard: {
    width: '100%', padding: '1rem', background: 'white', border: '2px solid #e5e5e5',
    borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9375rem',
    color: '#404040', transition: 'all 0.2s ease', textAlign: 'center',
  },
  rubroActive: { borderColor: '#22c55e', background: '#f0fdf4', color: '#16a34a' },
  productGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem', marginBottom: '2rem',
  },
  productCard: {
    background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e5e5',
    overflow: 'hidden', transition: 'box-shadow 0.2s ease',
  },
  productImg: { width: '100%', height: '160px', objectFit: 'cover' },
  imgPlaceholder: {
    width: '100%', height: '160px', background: '#f5f5f5',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
  },
  productBody: { padding: '1rem' },
  productName: { fontSize: '0.9375rem', fontWeight: '600', color: '#171717', marginBottom: '0.25rem' },
  productPrice: { fontSize: '1.125rem', fontWeight: '700', color: '#16a34a', marginBottom: '0.75rem' },
  addBtn: {
    width: '100%', padding: '0.5rem', background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600',
    fontSize: '0.8125rem', cursor: 'pointer',
  },
  empty: { color: '#a3a3a3', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' },
  cartSection: {
    background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e5e5', padding: '1.5rem',
  },
  cartTitle: { fontSize: '1.125rem', fontWeight: '600', color: '#171717', marginBottom: '1rem' },
  cartItems: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' },
  cartItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem', background: '#fafafa', borderRadius: '0.5rem',
  },
  cartItemName: { fontWeight: '600', fontSize: '0.875rem', color: '#171717', margin: 0 },
  cartItemDetail: { fontSize: '0.75rem', color: '#737373', margin: '0.125rem 0 0' },
  cartItemRight: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  cartItemTotal: { fontWeight: '600', fontSize: '0.875rem' },
  removeBtn: {
    width: '24px', height: '24px', borderRadius: '0.25rem', border: 'none',
    background: '#fef2f2', color: '#dc2626', fontSize: '0.6875rem', cursor: 'pointer',
  },
  cartTotal: {
    display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0',
    borderTop: '2px solid #e5e5e5', fontWeight: '700', fontSize: '1.125rem', color: '#171717',
  },
  totalAmount: { color: '#16a34a', fontSize: '1.25rem' },
  checkoutBtn: {
    width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '700',
    fontSize: '0.9375rem', cursor: 'pointer', marginTop: '0.5rem',
  },
};

export default Tienda;
