import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rubrosAPI } from '../services/api';

const Rubros = () => {
  const navigate = useNavigate();
  const [rubros, setRubros] = useState([]);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRubros();
  }, []);

  const fetchRubros = async () => {
    try {
      const { data } = await rubrosAPI.getAll();
      setRubros(data);
    } catch {
      setError('Error al cargar los rubros');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    try {
      await rubrosAPI.create({ nombre });
      setNombre('');
      setSuccess('Rubro creado exitosamente');
      fetchRubros();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al crear el rubro');
    }
  };

  return (
    <div style={styles.page} className="rubros-page">
      <div style={styles.header} className="rubros-header">
        <div>
          <h1 style={styles.title}>Gestión de Rubros</h1>
          <p style={styles.subtitle}>{rubros.length} rubros registrados</p>
        </div>
        <button onClick={() => navigate('/panel')} style={styles.backBtn}>← Panel</button>
      </div>

      <div style={styles.layout} className="rubros-layout">
        <div style={styles.formCard}>
          <h3 style={styles.cardTitle}>Nuevo Rubro</h3>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
          <form onSubmit={handleSubmit} style={styles.form} className="rubros-form">
            <input
              type="text"
              placeholder="Nombre del rubro"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.primaryBtn}>Agregar</button>
          </form>
        </div>

        <div style={styles.listCard}>
          <h3 style={styles.cardTitle}>Listado de Rubros</h3>
          {rubros.length === 0 ? (
            <p style={styles.empty}>No hay rubros registrados</p>
          ) : (
            <div style={styles.list}>
              {rubros.map((rubro) => (
                <div key={rubro.id_rubro} style={styles.listItem}>
                  <div style={styles.rubroDot} />
                  <span style={styles.rubroName}>{rubro.nombre}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  formCard: {
    background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '1.25rem',
  },
  listCard: {
    background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '1.25rem',
  },
  cardTitle: {
    fontSize: '0.875rem', fontWeight: '600', color: '#273444', marginBottom: '1rem',
    textTransform: 'uppercase', letterSpacing: '0.025em',
  },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#E53935',
    padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.75rem',
  },
  success: {
    background: '#E8F4FD', border: '1px solid #D0ECFF', color: '#1294F2',
    padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.75rem',
  },
  form: { display: 'flex', gap: '0.5rem' },
  input: {
    flex: 1, padding: '0.625rem 0.875rem', border: '1px solid #E6EDF5', borderRadius: '14px',
    fontSize: '0.875rem', outline: 'none',
  },
  primaryBtn: {
    padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #1294F2, #1294F2)',
    color: 'white', border: 'none', borderRadius: '14px', fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer',
  },
  empty: { color: '#667085', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  listItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem',
    borderRadius: '14px', background: '#F5F8FC', border: '1px solid #E6EDF5',
  },
  rubroDot: {
    width: '8px', height: '8px', borderRadius: '50%', background: '#1294F2', flexShrink: 0,
  },
  rubroName: { fontSize: '0.875rem', color: '#273444', fontWeight: '500' },
};

export default Rubros;
