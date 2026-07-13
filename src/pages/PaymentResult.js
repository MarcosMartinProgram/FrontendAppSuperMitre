import React, { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import gsap from 'gsap';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  const status = searchParams.get('status') || searchParams.get('collection_status');
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const externalRef = searchParams.get('external_reference');

  const isSuccess = status === 'approved';
  const isPending = status === 'pending' || status === 'in_process';

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, scale: 0.85, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)' }
      );
    }
  }, []);

  return (
    <div style={styles.page} ref={containerRef}>
      <div style={styles.card} ref={cardRef}>
        <div style={{
          ...styles.iconWrap,
          background: isSuccess ? 'linear-gradient(135deg, #D0ECFF, #D0ECFF)' : isPending
            ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
            : 'linear-gradient(135deg, #fee2e2, #fecaca)',
        }}>
          <span style={styles.icon}>
            {isSuccess ? '✓' : isPending ? '⏳' : '✕'}
          </span>
        </div>

        <h1 style={styles.title}>
          {isSuccess ? '¡Pago aprobado!' : isPending ? 'Pago pendiente' : 'Pago no completado'}
        </h1>

        <p style={styles.desc}>
          {isSuccess
            ? 'Tu compra fue procesada exitosamente. Te notificaremos por WhatsApp cuando esté lista para retirar.'
            : isPending
              ? 'Tu pago está siendo procesado. Te notificaremos cuando se acredite.'
              : 'El pago no pudo ser procesado. Podés intentar nuevamente desde la tienda.'}
        </p>

        {isSuccess && (
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>📱</span>
            <p style={styles.infoText}>
              Te enviaremos un WhatsApp con el detalle de tu pedido cuando esté listo.
            </p>
          </div>
        )}

        <div style={styles.details}>
          {paymentId && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>ID de pago</span>
              <span style={styles.detailValue}>{paymentId}</span>
            </div>
          )}
          {externalRef && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Referencia</span>
              <span style={styles.detailValue}>{externalRef}</span>
            </div>
          )}
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Estado</span>
            <span style={{
              ...styles.detailValue,
              color: isSuccess ? '#1294F2' : isPending ? '#FFC107' : '#E53935',
            }}>
              {isSuccess ? 'Aprobado' : isPending ? 'Pendiente' : 'Rechazado'}
            </span>
          </div>
        </div>

        <Link to="/tienda" style={styles.btn}>
          Volver a la Tienda
        </Link>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    background: '#F5F8FC',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '3rem 2rem',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0',
  },
  iconWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  icon: { fontSize: '2.5rem' },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#273444',
    marginBottom: '0.5rem',
  },
  desc: {
    fontSize: '0.9rem',
    color: '#667085',
    lineHeight: '1.6',
    marginBottom: '1rem',
    maxWidth: '340px',
    margin: '0 auto 1rem',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: '#E8F4FD',
    border: '1px solid #D0ECFF',
    borderRadius: '12px',
    padding: '0.8rem 1rem',
    marginBottom: '1.5rem',
    maxWidth: '340px',
    margin: '0 auto 1.5rem',
  },
  infoIcon: { fontSize: '1.5rem' },
  infoText: { fontSize: '0.8rem', color: '#081B2E', textAlign: 'left', margin: 0, lineHeight: '1.4' },
  details: {
    background: '#F5F8FC',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.75rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.4rem 0',
    fontSize: '0.85rem',
  },
  detailLabel: { color: '#667085' },
  detailValue: { fontWeight: '600', color: '#273444' },
  btn: {
    display: 'inline-block',
    padding: '0.8rem 2rem',
    background: 'linear-gradient(135deg, #1294F2, #1294F2)',
    color: 'white',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.9rem',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(18,148,242,0.3)',
  },
};

export default PaymentResult;
