import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { rubrosAPI } from '../services/api';

const GestionProductos = () => {
  const navigate = useNavigate();
  const { productos, fetchProductos, addProducto, updateProducto, deleteProducto } = useProducts();
  const [rubros, setRubros] = useState([]);
  const [form, setForm] = useState({
    codigo_barras: '',
    nombre: '',
    precio: '',
    precio_lista2: '',
    stock: '',
    id_rubro: '',
    descripcion: '',
  });
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchProductos();
    rubrosAPI.getAll()
      .then(({ data }) => setRubros(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [fetchProductos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await updateProducto(editando.codigo_barras, form);
        setEditando(null);
      } else {
        await addProducto(form);
      }
      setForm({ codigo_barras: '', nombre: '', precio: '', precio_lista2: '', stock: '', id_rubro: '', descripcion: '' });
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  };

  const handleEdit = (producto) => {
    setForm(producto);
    setEditando(producto);
  };

  const handleDelete = async (codigo) => {
    if (window.confirm('¿Eliminar este producto?')) {
      await deleteProducto(codigo);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.codigo_barras).includes(busqueda)
  );

  return (
    <div style={styles.page} className="gestion-page">
      <div style={styles.header} className="gestion-header">
        <div>
          <h1 style={styles.title}>Gestión de Productos</h1>
          <p style={styles.subtitle}>{productos.length} productos registrados</p>
        </div>
        <button onClick={() => navigate('/panel')} style={styles.backBtn}>← Panel</button>
      </div>

      <div style={styles.layout} className="gestion-layout">
        <div style={styles.formCard} className="gestion-form">
          <h3 style={styles.cardTitle}>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <form onSubmit={handleSubmit} style={styles.form} className="gestion-form-inner">
            <input
              type="text"
              placeholder="Código de barras"
              value={form.codigo_barras}
              onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
              style={styles.input}
              required
              disabled={!!editando}
            />
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              style={styles.input}
              required
            />
            <div style={styles.inputRow} className="gestion-input-row">
              <input
                type="number"
                placeholder="Precio lista 1"
                value={form.precio}
                onChange={(e) => {
                  const precio = e.target.value;
                  const precioL2 = precio ? Math.ceil(parseFloat(precio) * 1.05) : '';
                  setForm({ ...form, precio, precio_lista2: precioL2 });
                }}
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder="Precio lista 2"
                value={form.precio_lista2}
                onChange={(e) => setForm({ ...form, precio_lista2: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputRow} className="gestion-input-row">
              <input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                style={styles.input}
                required
              />
              <select
                value={form.id_rubro}
                onChange={(e) => setForm({ ...form, id_rubro: e.target.value })}
                style={styles.input}
                required
              >
                <option value="">Seleccionar rubro</option>
                {rubros.map((r) => (
                  <option key={r.id_rubro} value={r.id_rubro}>{r.nombre}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              style={styles.input}
            />
            <div style={styles.formBtns}>
              <button type="submit" style={styles.primaryBtn}>
                {editando ? 'Guardar Cambios' : 'Agregar'}
              </button>
              {editando && (
                <button type="button" onClick={() => { setEditando(null); setForm({ codigo_barras: '', nombre: '', precio: '', precio_lista2: '', stock: '', id_rubro: '', descripcion: '' }); }} style={styles.secondaryBtn}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.listCard}>
          <div style={styles.listHeader} className="gestion-list-header">
            <h3 style={styles.cardTitle}>Productos</h3>
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Código</th>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>P. Lista 1</th>
                  <th style={styles.th}>P. Lista 2</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p) => (
                  <tr key={p.codigo_barras} style={styles.tr}>
                    <td style={styles.td}>{p.codigo_barras}</td>
                    <td style={styles.td}>{p.nombre}</td>
                    <td style={styles.td}>${parseFloat(p.precio).toFixed(2)}</td>
                    <td style={styles.td}>${parseFloat(p.precio_lista2 || 0).toFixed(2)}</td>
                    <td style={styles.td}>{p.stock}</td>
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
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: '1rem 1.5rem',
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
    gridTemplateColumns: '380px 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  formCard: {
    background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '1.25rem',
    position: 'sticky', top: '72px',
  },
  listCard: {
    background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '1.25rem',
  },
  cardTitle: { fontSize: '0.875rem', fontWeight: '600', color: '#273444', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.025em' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' },
  inputRow: { display: 'flex', gap: '0.5rem', overflow: 'hidden' },
  input: {
    flex: 1, padding: '0.625rem 0.875rem', border: '1px solid #E6EDF5', borderRadius: '14px',
    fontSize: '0.8125rem', outline: 'none', background: '#fafafa', minWidth: 0,
  },
  formBtns: { display: 'flex', gap: '0.5rem', marginTop: '0.25rem' },
  primaryBtn: {
    flex: 1, padding: '0.625rem', background: 'linear-gradient(135deg, #1294F2, #0B89FF)',
    color: 'white', border: 'none', borderRadius: '14px', fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer',
  },
  secondaryBtn: {
    flex: 1, padding: '0.625rem', background: 'white', color: '#667085',
    border: '1px solid #E6EDF5', borderRadius: '14px', fontWeight: '500', fontSize: '0.8125rem', cursor: 'pointer',
  },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  searchInput: {
    padding: '0.5rem 0.75rem', border: '1px solid #E6EDF5', borderRadius: '14px',
    fontSize: '0.8125rem', outline: 'none', width: '200px',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '0.625rem 0.75rem', fontSize: '0.75rem', fontWeight: '600',
    color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '2px solid #E6EDF5',
  },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '0.625rem 0.75rem', fontSize: '0.8125rem', color: '#273444' },
  actions: { display: 'flex', gap: '0.375rem' },
  editBtn: {
    padding: '0.25rem 0.5rem', background: '#E8F4FD', color: '#1294F2', border: '1px solid #D0ECFF',
    borderRadius: '0.25rem', fontSize: '0.6875rem', fontWeight: '600', cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.25rem 0.5rem', background: '#FEF2F2', color: '#E53935', border: '1px solid #FECACA',
    borderRadius: '0.25rem', fontSize: '0.6875rem', fontWeight: '600', cursor: 'pointer',
  },
};

export default GestionProductos;
