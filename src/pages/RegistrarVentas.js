import React from 'react';
import { useNavigate } from 'react-router-dom';
import Ventas from './Ventas';

const RegistrarVentas = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1>Registrar Ventas</h1>
      <button onClick={() => navigate('/panel')} style={styles.button}>
        Volver al Panel Principal
      </button>
      <Ventas />
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
  },
  button: {
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default RegistrarVentas;