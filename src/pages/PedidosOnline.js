import React, { useState, useEffect, useRef } from 'react';
import { pedidosOnlineAPI } from '../services/api';
import gsap from 'gsap';

const PedidosOnline = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('pendiente');
  const [cargando, setCargando] = useState(true);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const { data } = await pedidosOnlineAPI.getAll(filtro);
      setPedidos(data);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  useEffect(() => {
    if (listRef.current && pedidos.length > 0) {
      const cards = listRef.current.querySelectorAll('.pedido-card');
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 30 });
        gsap.to(cards, { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out' });
      }
    }
  }, [pedidos]);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await pedidosOnlineAPI.updateEstado(id, nuevoEstado);
      setPedidos((prev) => prev.map((p) => p.id_pedido === id ? { ...p, estado: nuevoEstado } : p));
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const reenviarWhatsApp = async (id) => {
    try {
      const { data } = await pedidosOnlineAPI.reenviarWhatsApp(id);
      if (data.url_whatsapp) {
        window.open(data.url_whatsapp, '_blank');
      }
    } catch (err) {
      alert('Error al generar notificación');
    }
  };

  const estadoColor = (estado) => {
    const colors = {
      pendiente: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
      en_preparacion: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
      entregado: { bg: '#D0ECFF', text: '#081B2E', border: '#46B6FF' },
      cancelado: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    };
    return colors[estado] || colors.pendiente;
  };

  const estadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      en_preparacion: 'En preparación',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return labels[estado] || estado;
  };

  return (
    <div style={styles.page} ref={containerRef}>
      <div style={styles.header}>
        <h1 style={styles.title}>Pedidos Online</h1>
        <button onClick={cargarPedidos} style={styles.refreshBtn}>Actualizar</button>
      </div>

      <div style={styles.filtros}>
        {['pendiente', 'en_preparacion', 'entregado', 'cancelado'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              ...styles.filtroBtn,
              ...(filtro === f ? styles.filtroActivo : {}),
            }}
          >
            {estadoLabel(f)}
            {f === 'pendiente' && (
              <span style={styles.badge}>{pedidos.filter((p) => p.estado === 'pendiente').length || ''}</span>
            )}
          </button>
        ))}
      </div>

      {cargando ? (
        <p style={styles.empty}>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p style={styles.empty}>No hay pedidos {estadoLabel(filtro).toLowerCase()}</p>
      ) : (
        <div style={styles.list} ref={listRef}>
          {pedidos.map((pedido) => {
            const items = typeof pedido.items === 'string' ? JSON.parse(pedido.items) : pedido.items;
            const ec = estadoColor(pedido.estado);
            return (
              <div key={pedido.id_pedido} style={styles.card} className="pedido-card">
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.pedidoId}>#{pedido.id_pedido}</span>
                    <span style={styles.pedidoFecha}>
                      {new Date(pedido.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span style={{ ...styles.estadoBadge, background: ec.bg, color: ec.text, borderColor: ec.border }}>
                    {estadoLabel(pedido.estado)}
                  </span>
                </div>

                <div style={styles.clienteInfo}>
                  <p style={styles.clienteNombre}>{pedido.cliente_nombre || 'Sin nombre'}</p>
                  <p style={styles.clienteContacto}>{pedido.cliente_email || ''}</p>
                  {pedido.cliente_telefono && (
                    <p style={styles.clienteContacto}>📱 {pedido.cliente_telefono}</p>
                  )}
                </div>

                <div style={styles.itemsList}>
                  {items.map((item, i) => (
                    <div key={i} style={styles.itemRow}>
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span style={styles.itemPrecio}>${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={styles.totalRow}>
                  <span>Total</span>
                  <span style={styles.totalAmount}>${parseFloat(pedido.total).toFixed(2)}</span>
                </div>

                <div style={styles.actions}>
                  {pedido.estado === 'pendiente' && (
                    <>
                      <button onClick={() => cambiarEstado(pedido.id_pedido, 'en_preparacion')} style={styles.actionBtn}>
                        Preparar
                      </button>
                      <button onClick={() => reenviarWhatsApp(pedido.id_pedido)} style={styles.whatsappBtn}>
                        📱 WhatsApp
                      </button>
                    </>
                  )}
                  {pedido.estado === 'en_preparacion' && (
                    <button onClick={() => cambiarEstado(pedido.id_pedido, 'entregado')} style={styles.actionBtn}>
                      Marcar entregado
                    </button>
                  )}
                  {(pedido.estado === 'pendiente' || pedido.estado === 'en_preparacion') && (
                    <button onClick={() => cambiarEstado(pedido.id_pedido, 'cancelado')} style={styles.cancelBtn}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '1.5rem', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#273444' },
  refreshBtn: {
    padding: '0.5rem 1rem', background: 'white', border: '1px solid #E6EDF5',
    borderRadius: '8px', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer',
  },
  filtros: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filtroBtn: {
    padding: '0.5rem 1rem', background: 'white', border: '1.5px solid #E6EDF5',
    borderRadius: '8px', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
  filtroActivo: { borderColor: '#1294F2', background: '#E8F4FD', color: '#1294F2' },
  badge: {
    background: '#1294F2', color: 'white', borderRadius: '999px',
    fontSize: '0.65rem', fontWeight: '700', padding: '0.1rem 0.4rem',
  },
  empty: { color: '#667085', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: {
    background: 'white', borderRadius: '14px', border: '1px solid #E6EDF5',
    padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem',
  },
  pedidoId: { fontWeight: '700', fontSize: '1rem', color: '#273444', marginRight: '0.5rem' },
  pedidoFecha: { fontSize: '0.75rem', color: '#667085' },
  estadoBadge: {
    fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.6rem',
    borderRadius: '999px', border: '1px solid',
  },
  clienteInfo: { marginBottom: '0.75rem' },
  clienteNombre: { fontWeight: '600', fontSize: '0.9rem', color: '#273444', margin: 0 },
  clienteContacto: { fontSize: '0.75rem', color: '#667085', margin: '0.15rem 0 0' },
  itemsList: { background: '#F5F8FC', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.75rem' },
  itemRow: {
    display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem',
    color: '#273444', padding: '0.2rem 0',
  },
  itemPrecio: { fontWeight: '600' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', fontWeight: '700',
    fontSize: '1rem', color: '#273444', padding: '0.5rem 0',
    borderTop: '1.5px solid #f0f0f0', marginBottom: '0.75rem',
  },
  totalAmount: { color: '#1294F2' },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  actionBtn: {
    padding: '0.4rem 1rem', background: 'linear-gradient(135deg, #1294F2, #1294F2)',
    color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600',
    fontSize: '0.78rem', cursor: 'pointer',
  },
  whatsappBtn: {
    padding: '0.4rem 1rem', background: '#25d366', color: 'white', border: 'none',
    borderRadius: '8px', fontWeight: '600', fontSize: '0.78rem', cursor: 'pointer',
  },
  cancelBtn: {
    padding: '0.4rem 1rem', background: 'white', color: '#E53935',
    border: '1px solid #fecaca', borderRadius: '8px', fontWeight: '500',
    fontSize: '0.78rem', cursor: 'pointer',
  },
};

export default PedidosOnline;
