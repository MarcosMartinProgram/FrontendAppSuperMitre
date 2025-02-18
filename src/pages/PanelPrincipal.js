import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const PanelPrincipal = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  let user = null;

  // Decodifica el token JWT
  try {
    user = jwtDecode(token); // user ahora contiene el payload decodificado
  } catch (error) {
    console.error('Token inválido:', error);
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); // Redirige al login
  };

  return (
    <div style={styles.container}>
      <h1>Panel Principal</h1>
      {user ? (
        <p>Bienvenido, {user.nombre || 'Usuario'}</p>
      ) : (
        <p>No se pudo cargar la información del usuario.</p>
      )}
      <nav style={styles.nav}>
        <button
          style={styles.button}
          onClick={() => navigate('/gestion-productos')}
        >
          Gestión de Productos
        </button>
        <button
          style={styles.button}
          onClick={() => navigate('/registrar-ventas')}
        >
          Registrar Ventas
        </button>
        <button
          style={styles.button}
          onClick={() => navigate('/reportes')}
        >
          Ver Reportes
        </button>
      </nav>
      <button style={styles.logoutButton} onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
  },
  nav: {
    marginTop: '1rem',
  },
  button: {
    margin: '0.5rem',
    padding: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  logoutButton: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default PanelPrincipal;