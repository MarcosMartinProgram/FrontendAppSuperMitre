// pages/Productos.js
import React, { useState, useEffect } from 'react';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    codigo_barras: '',
    nombre: '',
    precio: '',
    stock: '',
    id_rubro: '',
  });
  const [editing, setEditing] = useState(false);

  const fetchProductos = async () => {
    try {
      const response = await fetch('https://cacmarcos.alwaysdata.net/api/productos');
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing
        ? `https://cacmarcos.alwaysdata.net/api/productos/${formData.codigo_barras}`
        : 'https://cacmarcos.alwaysdata.net/api/productos';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setFormData({ codigo_barras: '', nombre: '', precio: '', stock: '', id_rubro: '' });
      setEditing(false);
      fetchProductos();
    } catch (error) {
      console.error('Error al guardar el producto:', error);
    }
  };

  const handleEdit = (producto) => {
    setFormData(producto);
    setEditing(true);
  };

  const handleDelete = async (codigo_barras) => {
    try {
      await fetch(`https://cacmarcos.alwaysdata.net/api/productos/${codigo_barras}`, { method: 'DELETE' });
      fetchProductos();
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return (
    <div>
      <h1>Gestión de Productos</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="codigo_barras"
          placeholder="Código de Barras"
          value={formData.codigo_barras}
          onChange={handleInputChange}
          required
          disabled={editing}
        />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={formData.precio}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="id_rubro"
          placeholder="ID Rubro"
          value={formData.id_rubro}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="imagen"
          placeholder="URL de la Imagen"
          value={formData.imagen}
          onChange={handleInputChange}
        />
        <button type="submit">{editing ? 'Actualizar' : 'Agregar'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Código Barras</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>ID Rubro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.codigo_barras}>
              <td>{producto.codigo_barras}</td>
              <td>{producto.nombre}</td>
              <td>{producto.precio}</td>
              <td>{producto.stock}</td>
              <td>{producto.id_rubro}</td>
              <td>
                {producto.imagen ? (
                  <img src={producto.imagen} alt={producto.nombre} style={{ width: '50px', height: '50px' }} />
                ) : (
                  "Sin imagen"
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(producto)}>Editar</button>
                <button onClick={() => handleDelete(producto.codigo_barras)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Productos;
