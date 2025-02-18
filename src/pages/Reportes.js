import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Reportes = () => {
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [datosReporte, setDatosReporte] = useState([]);
  const navigate = useNavigate();

  // Obtener datos del reporte seleccionado
  const obtenerDatosReporte = async (tipoReporte) => {
    try {
      const response = await axios.get(`https://cacmarcos.alwaysdata.net/api/reportes/${tipoReporte}`);
      setDatosReporte(response.data);
      setReporteSeleccionado(tipoReporte);
    } catch (error) {
      console.error('Error al obtener el reporte:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Reportes</h1>
      <button onClick={() => navigate('/panel')} style={styles.button}>
        Volver al Panel Principal
      </button>

      {/* Botones para seleccionar el tipo de reporte */}
      <div style={styles.botones}>
        <button onClick={() => obtenerDatosReporte('ventas-por-vendedor')}>
          Ventas por Vendedor
        </button>
        <button onClick={() => obtenerDatosReporte('ventas-por-usuario')}>
          Ventas por Usuario Comprador
        </button>
        <button onClick={() => obtenerDatosReporte('ventas-por-rubro')}>
          Ventas por Rubro
        </button>
        <button onClick={() => obtenerDatosReporte('productos-mas-vendidos')}>
          Productos Más Vendidos
        </button>
      </div>

      {/* Mostrar los datos del reporte seleccionado */}
      {reporteSeleccionado && (
        <div style={styles.reporte}>
          <h2>{reporteSeleccionado}</h2>
          <ul>
            {datosReporte.map((item, index) => (
              <li key={index}>
                {item.vendedor || item.usuario || item.rubro || item.producto}: {item.totalVentas || item.totalVendido}
              </li>
            ))}
          </ul>
        </div>
      )}
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
  botones: {
    marginBottom: '2rem',
  },
  reporte: {
    marginTop: '2rem',
  },
};

export default Reportes;