import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { gsap } from '../gsap';
import { pedidosOnlineAPI } from '../services/api';

const API_MP = '/api/mercadopago';

const QRModal = ({ total, productos, onPagoAprobado, onCancelar }) => {
  const [qrData, setQrData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [estado, setEstado] = useState('creando');
  const [error, setError] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(900);
  const pollingRef = useRef(null);
  const timerRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const qrRef = useRef(null);

  const crearOrden = useCallback(async () => {
    try {
      setEstado('creando');
      setError(null);

      const body = {
        total_amount: total,
        description: `Venta Super Mitre - $${total}`,
        productos: productos.map(p => ({
          nombre: p.nombre,
          precio: p.precio_venta || p.precio,
          cantidad: p.cantidad,
          codigo_barras: p.codigo_barras
        }))
      };

      const res = await fetch(`${API_MP}/crear-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Error al crear QR');

      setOrderId(data.order_id);
      setPaymentId(data.payment_id);
      setQrData(data.qr_data);
      setEstado('esperando_pago');
    } catch (err) {
      console.error('Error creando QR:', err);
      setError(err.message);
      setEstado('error');
    }
  }, [total, productos]);

  useEffect(() => {
    if (overlayRef.current) {
      gsap.fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
    }
    if (modalRef.current) {
      gsap.fromTo(modalRef.current,
        { scale: 0.85, y: 30, autoAlpha: 0 },
        { scale: 1, y: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.4)' }
      );
    }
    crearOrden();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [crearOrden]);

  useEffect(() => {
    if (qrRef.current && estado === 'esperando_pago') {
      gsap.fromTo(qrRef.current,
        { scale: 0.7, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
      gsap.to(qrRef.current, {
        scale: 1.03,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, [estado, qrData]);

  useEffect(() => {
    if (estado !== 'esperando_pago' || !orderId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_MP}/consultar-qr/${orderId}`);
        const data = await res.json();

        if (data.success && data.payment_status) {
          if (data.payment_status === 'approved' || data.payment_status === 'processed' || data.payment_status === 'accredited') {
            setEstado('aprobado');
            clearInterval(pollingRef.current);
            clearInterval(timerRef.current);

            pedidosOnlineAPI.registrar({
              order_id: orderId,
              payment_id: paymentId,
              total: total,
              productos: productos.map(p => ({
                nombre: p.nombre,
                precio: p.precio_venta || p.precio,
                cantidad: p.cantidad,
              })),
            }).catch(err => console.error('Error registrando pedido online:', err));

            setTimeout(() => onPagoAprobado({ orderId, paymentId }), 1500);
          } else if (data.payment_status === 'canceled' || data.payment_status === 'expired') {
            setEstado('rechazado');
            clearInterval(pollingRef.current);
            clearInterval(timerRef.current);
          }
        }
      } catch (err) {
        console.error('Error polling:', err);
      }
    }, 5000);

    timerRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          setEstado('expirado');
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [estado, orderId, paymentId, onPagoAprobado]);

  useEffect(() => {
    if (estado === 'aprobado' && modalRef.current) {
      gsap.killTweensOf(qrRef.current);
      gsap.to(modalRef.current, {
        scale: 1.05,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  }, [estado]);

  const cancelar = async () => {
    if (orderId) {
      try {
        await fetch(`${API_MP}/cancelar-qr/${orderId}`, { method: 'POST' });
      } catch (err) {
        console.error('Error cancelando:', err);
      }
    }
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { scale: 0.85, y: 30, autoAlpha: 0, duration: 0.3 });
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.3,
        onComplete: onCancelar,
      });
    } else {
      onCancelar();
    }
  };

  const formatTiempo = (seg) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const estadoColor = {
    creando: '#FFC107',
    esperando_pago: '#1294F2',
    aprobado: '#1FB954',
    rechazado: '#E53935',
    expirado: '#667085',
    error: '#E53935'
  };

  const estadoLabel = {
    creando: 'Generando QR...',
    esperando_pago: 'Escaneá el código QR',
    aprobado: '¡Pago aprobado!',
    rechazado: 'Pago rechazado',
    expirado: 'QR expirado',
    error: 'Error'
  };

  return (
    <div style={styles.overlay} ref={overlayRef} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modal} ref={modalRef}>
        <div style={styles.header}>
          <h3 style={styles.title}>Pago con Mercado Pago</h3>
          <button onClick={cancelar} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          <div style={styles.montoRow}>
            <span style={styles.montoLabel}>Total a pagar</span>
            <span style={styles.montoValor}>${Number(total).toFixed(2)}</span>
          </div>

          <div style={styles.estadoBar}>
            <div style={{ ...styles.estadoDot, background: estadoColor[estado] }} />
            <span style={{ ...styles.estadoTexto, color: estadoColor[estado] }}>
              {estadoLabel[estado]}
            </span>
          </div>

          {estado === 'creando' && (
            <div style={styles.spinner}>⏳</div>
          )}

          {estado === 'esperando_pago' && qrData && (
            <div style={styles.qrContainer} ref={qrRef}>
              <QRCodeSVG
                value={qrData}
                size={260}
                level="M"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
              <p style={styles.qrHint}>Escaneá con la app de Mercado Pago</p>
              <div style={styles.timer}>
                <span style={styles.timerText}>
                  Expira en {formatTiempo(tiempoRestante)}
                </span>
                <div style={{ ...styles.timerBar, width: `${(tiempoRestante / 900) * 100}%` }} />
              </div>
            </div>
          )}

          {estado === 'aprobado' && (
            <div style={styles.successBox}>
              <span style={styles.successIcon}>✓</span>
              <p style={styles.successText}>¡Pago confirmado!</p>
            </div>
          )}

          {estado === 'rechazado' && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>El pago fue rechazado o cancelado</p>
            </div>
          )}

          {estado === 'expirado' && (
            <div style={styles.expiredBox}>
              <p style={styles.expiredText}>El código QR expiró</p>
              <button onClick={crearOrden} style={styles.retryBtn}>Generar nuevo QR</button>
            </div>
          )}

          {estado === 'error' && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
              <button onClick={crearOrden} style={styles.retryBtn}>Reintentar</button>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          {estado === 'esperando_pago' && (
            <button onClick={cancelar} style={styles.cancelBtn}>Cancelar</button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, backdropFilter: 'blur(4px)'
  },
  modal: {
    background: 'white', borderRadius: '20px', width: '90%', maxWidth: '400px',
    overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.25rem', borderBottom: '1px solid #E6EDF5'
  },
  title: { fontSize: '1rem', fontWeight: '600', color: '#273444', margin: 0 },
  closeBtn: {
    width: '32px', height: '32px', borderRadius: '14px', border: 'none',
    background: '#F5F8FC', color: '#667085', fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  body: { padding: '1.5rem 1.25rem', textAlign: 'center' },
  montoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 1rem', background: '#E8F4FD', borderRadius: '14px',
    border: '1px solid #D0ECFF', marginBottom: '1rem'
  },
  montoLabel: { fontSize: '0.875rem', color: '#1294F2', fontWeight: '500' },
  montoValor: { fontSize: '1.5rem', fontWeight: '800', color: '#1294F2' },
  estadoBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    marginBottom: '1.25rem'
  },
  estadoDot: { width: '10px', height: '10px', borderRadius: '50%' },
  estadoTexto: { fontSize: '0.875rem', fontWeight: '600' },
  spinner: { fontSize: '3rem', margin: '1rem 0' },
  qrContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' },
  qrHint: { fontSize: '0.75rem', color: '#667085', marginTop: '0.5rem' },
  timer: { width: '100%', marginTop: '0.5rem' },
  timerText: { fontSize: '0.75rem', color: '#667085' },
  timerBar: {
    height: '3px', background: '#1294F2', borderRadius: '2px',
    transition: 'width 1s linear', marginTop: '0.25rem'
  },
  successBox: { padding: '2rem 0' },
  successIcon: {
    fontSize: '3rem', color: '#1FB954', fontWeight: '700',
    display: 'block', marginBottom: '0.5rem'
  },
  successText: { fontSize: '1.125rem', fontWeight: '600', color: '#1FB954', margin: 0 },
  errorBox: { padding: '1.5rem 0' },
  errorText: { fontSize: '0.875rem', color: '#E53935', margin: 0 },
  expiredBox: { padding: '1.5rem 0' },
  expiredText: { fontSize: '0.875rem', color: '#667085', margin: '0 0 1rem' },
  retryBtn: {
    padding: '0.625rem 1.5rem', background: 'linear-gradient(180deg, #24A2FF, #0076E6)', color: 'white',
    border: 'none', borderRadius: '14px', fontWeight: '600', fontSize: '0.875rem',
    cursor: 'pointer'
  },
  footer: { padding: '0 1.25rem 1.25rem' },
  cancelBtn: {
    width: '100%', padding: '0.625rem', background: 'white', color: '#667085',
    border: '1px solid #E6EDF5', borderRadius: '14px', fontWeight: '500',
    fontSize: '0.8125rem', cursor: 'pointer'
  }
};

export default QRModal;
