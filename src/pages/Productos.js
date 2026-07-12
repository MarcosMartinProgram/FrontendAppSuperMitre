import React, { useState, useEffect } from 'react';
import { productosAPI } from '../services/api';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    codigo_barras: '', nombre: '', precio: '', stock: '', id_rubro: '', imagen: '',
  });
  const [editing, setEditing] = useState(false);

  const fetchProductos = async () => {
    try {
      const { data } = await productosAPI.getAll();
      setProductos(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await productosAPI.update(formData.codigo_barras, formData);
      } else {
        await productosAPI.create(formData);
      }
      setFormData({ codigo_barras: '', nombre: '', precio: '', stock: '', id_rubro: '', imagen: '' });
      setEditing(false);
      fetchProductos();
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const handleEdit = (producto) => {
    setFormData(producto);
    setEditing(true);
  };

  const handleDelete = async (codigo) => {
    if (window.confirm('¿Eliminar este producto?')) {
      await productosAPI.delete(codigo);
      fetchProductos();
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Gestión de Productos</h1>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" name="codigo_barras" placeholder="Código de Barras" value={formData.codigo_barras} onChange={handleInputChange} style={styles.input} required disabled={editing} />
          <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleInputChange} style={styles.input} required />
          <input type="number" name="precio" placeholder="Precio" value={formData.precio} onChange={handleInputChange} style={styles.input} required />
          <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleInputChange} style={styles.input} required />
          <input type="text" name="id_rubro" placeholder="ID Rubro" value={formData.id_rubro} onChange={handleInputChange} style={styles.input} required />
          <input type="text" name="imagen" placeholder="URL Imagen" value={formData.imagen || ''} onChange={handleInputChange} style={styles.input} />
          <button type="submit" style={styles.primaryBtn}>{editing ? 'Actualizar' : 'Agregar'}</button>
        </form>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Código</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Precio</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Rubro</th>
              <th style={styles.th}>Imagen</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.codigo_barras} style={styles.tr}>
                <td style={styles.td}>{p.codigo_barras}</td>
                <td style={styles.td}>{p.nombre}</td>
                <td style={styles.td}>${parseFloat(p.precio).toFixed(2)}</td>
                <td style={styles.td}>{p.stock}</td>
                <td style={styles.td}>{p.id_rubro}</td>
                <td style={styles.td}>
                  {p.imagen ? <img src={p.imagen} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} /> : '—'}
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button onClick={() => handleEdit(p)} style={styles.editBtn}>Editar</button>
                    <button onClick={() => handleDelete(p.codigo_barras)} style={styles.deleteBtn}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#171717', marginBottom: '1.5rem' },
  formCard: { background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e5e5', padding: '1.25rem', marginBottom: '1.5rem' },
  form: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' },
  input: {
    flex: '1 1 180px', padding: '0.625rem 0.875rem', border: '1px solid #e5e5e5', borderRadius: '0.5rem',
    fontSize: '0.8125rem', outline: 'none',
  },
  primaryBtn: {
    padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer',
    flex: '0 0 auto',
  },
  tableCard: { background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e5e5', padding: '1.25rem', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '0.625rem 0.75rem', fontSize: '0.75rem', fontWeight: '600',
    color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e5e5e5',
  },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '0.625rem 0.75rem', fontSize: '0.8125rem', color: '#404040' },
  actions: { display: 'flex', gap: '0.375rem' },
  editBtn: {
    padding: '0.25rem 0.5rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
    borderRadius: '0.25rem', fontSize: '0.6875rem', fontWeight: '600', cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.25rem 0.5rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: '0.25rem', fontSize: '0.6875rem', fontWeight: '600', cursor: 'pointer',
  },
};

export default Productos;
