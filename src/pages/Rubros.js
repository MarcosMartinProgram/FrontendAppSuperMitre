import React, { useState, useEffect } from 'react';

const Rubros = () => {
  const [rubros, setRubros] = useState([]);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRubros();
  }, []);

  const fetchRubros = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://cacmarcos.alwaysdata.net'}/api/rubros`);
      const data = await response.json();
      setRubros(data);
    } catch (error) {
      setError('Error al cargar los rubros');
    }
  };

  const handleAddRubro = async (e) => {
    e.preventDefault();
    if (!nombre) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://cacmarcos.alwaysdata.net'}/api/rubros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      
      if (!response.ok) throw new Error('Error al crear el rubro');

      setNombre('');
      setSuccess('Rubro creado exitosamente');
      fetchRubros();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestión de Rubros</h1>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <form onSubmit={handleAddRubro} style={styles.form}>
        <input
          type="text"
          placeholder="Nombre del Rubro"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Agregar Rubro</button>
      </form>

      <h2 style={styles.subtitle}>Listado de Rubros</h2>
      <ul style={styles.list}>
        {rubros.map((rubro) => (
          <li key={rubro.id_rubro} style={styles.listItem}>{rubro.nombre}</li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: { padding: '20px' },
  title: { textAlign: 'center' },
  subtitle: { marginTop: '20px' },
  form: { marginBottom: '20px' },
  input: { padding: '10px', marginRight: '10px' },
  button: { padding: '10px' },
  list: { listStyleType: 'none', padding: 0 },
  listItem: { padding: '10px 0', borderBottom: '1px solid #ccc' },
  error: { color: 'red' },
  success: { color: 'green' },
};

export default Rubros;
