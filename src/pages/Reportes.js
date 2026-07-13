import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportesAPI } from '../services/api';

const Reportes = () => {
  const navigate = useNavigate();
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [datosReporte, setDatosReporte] = useState([]);
  const [loading, setLoading] = useState(false);

  const tiposReporte = [
    { key: 'ventas-por-vendedor', label: 'Ventas por Vendedor', icon: '👤' },
    { key: 'ventas-por-usuario', label: 'Ventas por Comprador', icon: '🛒' },
    { key: 'ventas-por-rubro', label: 'Ventas por Rubro', icon: '🏷️' },
    { key: 'productos-mas-vendidos', label: 'Más Vendidos', icon: '🔥' },
  ];

  const obtenerDatos = async (tipo) => {
    setLoading(true);
    try {
      const { data } = await reportesAPI.get(tipo);
      setDatosReporte(data);
      setReporteSeleccionado(tipo);
    } catch (err) {
      console.error('Error al obtener reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Reportes</h1>
          <p style={styles.subtitle}>Consultá las estadísticas del negocio</p>
        </div>
        <button onClick={() => navigate('/panel')} style={styles.backBtn}>← Panel</button>
      </div>

      <div style={styles.grid}>
        {tiposReporte.map((t) => (
          <button
            key={t.key}
            onClick={() => obtenerDatos(t.key)}
            style={{
              ...styles.reportCard,
              ...(reporteSeleccionado === t.key ? styles.reportActive : {}),
            }}
          >
            <span style={styles.reportIcon}>{t.icon}</span>
            <span style={styles.reportLabel}>{t.label}</span>
          </button>
        ))}
      </div>

      {loading && <p style={styles.loading}>Cargando...</p>}

      {reporteSeleccionado && !loading && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>{tiposReporte.find((t) => t.key === reporteSeleccionado)?.label}</h3>
          {datosReporte.length === 0 ? (
            <p style={styles.empty}>No hay datos para este reporte</p>
          ) : (
            <div style={styles.resultList}>
              {datosReporte.map((item, i) => (
                <div key={i} style={styles.resultRow}>
                  <span style={styles.resultName}>
                    {item.vendedor || item.usuario || item.rubro || item.producto}
                  </span>
                  <span style={styles.resultValue}>
                    {item.totalVentas || item.totalVendido}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#273444', margin: 0 },
  subtitle: { fontSize: '0.875rem', color: '#667085', marginTop: '0.25rem' },
  backBtn: {
    padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid #E6EDF5',
    background: 'white', color: '#667085', fontSize: '0.8125rem', fontWeight: '500', cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  reportCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1.25rem 1rem',
    background: 'white',
    border: '2px solid #E6EDF5',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  reportActive: {
    borderColor: '#1294F2',
    background: '#E8F4FD',
  },
  reportIcon: { fontSize: '1.5rem' },
  reportLabel: { fontSize: '0.8125rem', fontWeight: '600', color: '#273444' },
  loading: {
    textAlign: 'center', color: '#667085', padding: '2rem', fontSize: '0.875rem',
  },
  resultCard: {
    background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '1.25rem',
  },
  resultTitle: {
    fontSize: '1rem', fontWeight: '600', color: '#273444', marginBottom: '1rem',
    textTransform: 'capitalize',
  },
  empty: { color: '#667085', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' },
  resultList: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  resultRow: {
    display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.75rem',
    borderRadius: '0.375rem', background: '#F5F8FC', border: '1px solid #E6EDF5',
  },
  resultName: { fontSize: '0.875rem', color: '#273444', fontWeight: '500' },
  resultValue: { fontSize: '0.875rem', color: '#1294F2', fontWeight: '700' },
};

export default Reportes;
