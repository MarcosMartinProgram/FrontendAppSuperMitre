// /pages/GestionProductos.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    codigo_barras: '',
    nombre: '',
    precio: '',
    stock: '',
    id_rubro: '',
    descripcion: '',
    imagen_url: '',

  });
  const [editarProducto, setEditarProducto] = useState(null);
  const navigate = useNavigate();

  // Obtener todos los productos
  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const response = await axios.get('https://cacmarcos.alwaysdata.net/api/productos');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };

    obtenerProductos();
  }, []);

  // Agregar un nuevo producto
  const agregarProducto = async () => {
    try {
      await axios.post('https://cacmarcos.alwaysdata.net/api/productos', nuevoProducto);
      setNuevoProducto({
        codigo_barras: '',
        nombre: '',
        precio: '',
        stock: '',
        id_rubro: '',
        descripcion: '',
        imagen_url: '',
      });
      // Actualizar la lista de productos
      const response = await axios.get('https://cacmarcos.alwaysdata.net/api/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  };

  // Eliminar un producto
  const eliminarProducto = async (codigo_barras) => {
    try {
      await axios.delete(`https://cacmarcos.alwaysdata.net/api/productos/${codigo_barras}`);
      // Actualizar la lista de productos
      const response = await axios.get('https://cacmarcos.alwaysdata.net/api/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  // Editar un producto
  const editar = (producto) => {
    setEditarProducto(producto);
  };

  const guardarEdicion = async () => {
    try {
      await axios.put(`https://cacmarcos.alwaysdata.net/api/productos/${editarProducto.codigo_barras}`, editarProducto);
      setEditarProducto(null);
      // Actualizar la lista de productos
      const response = await axios.get('https://cacmarcos.alwaysdata.net/api/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al editar el producto:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Gestión de Productos</h1>
      <button onClick={() => navigate('/panel')} style={styles.button}>
        Volver al Panel Principal
      </button>

      {/* Formulario para agregar un nuevo producto */}
      <div style={styles.form}>
        <h2>Agregar Nuevo Producto</h2>
        <input
          type="text"
          placeholder="Código de Barras"
          value={nuevoProducto.codigo_barras}
          onChange={(e) => setNuevoProducto({ ...nuevoProducto, codigo_barras: e.target.value })}
        />
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoProducto.nombre}
          onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
        />
        <input
          type="number"
          placeholder="Precio"
          value={nuevoProducto.precio}
          onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          value={nuevoProducto.stock}
          onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })}
        />
        <input
          type="number"
          placeholder="ID Rubro"
          value={nuevoProducto.id_rubro}
          onChange={(e) => setNuevoProducto({ ...nuevoProducto, id_rubro: e.target.value })}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={nuevoProducto.descripcion}
          onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
        />
        <input 
          type="text" 
          placeholder="URL de la Imagen" 
          value={nuevoProducto.imagen_url} 
          onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagen_url: e.target.value })} 
        />
        <button onClick={agregarProducto}>Agregar Producto</button>
      </div>

      {/* Lista de productos */}
      <div style={styles.lista}>
        <h2>Lista de Productos</h2>
        {productos.map((producto) => (
          <div key={producto.codigo_barras} style={styles.producto}>
            <p>{producto.nombre} - ${producto.precio}</p>
            <button onClick={() => eliminarProducto(producto.codigo_barras)}>Eliminar</button>
            <button onClick={() => editar(producto)}>Editar</button>
          </div>
        ))}
      </div>

      {/* Formulario de edición */}
      {editarProducto && (
        <div style={styles.form}>
          <h2>Editar Producto</h2>
          <input
            type="text"
            placeholder="Nombre"
            value={editarProducto.nombre}
            onChange={(e) => setEditarProducto({ ...editarProducto, nombre: e.target.value })}
          />
          <input
            type="number"
            placeholder="Precio"
            value={editarProducto.precio}
            onChange={(e) => setEditarProducto({ ...editarProducto, precio: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock"
            value={editarProducto.stock}
            onChange={(e) => setEditarProducto({ ...editarProducto, stock: e.target.value })}
          />
          <input
            type="number"
            placeholder="ID Rubro"
            value={editarProducto.id_rubro}
            onChange={(e) => setEditarProducto({ ...editarProducto, id_rubro: e.target.value })}
          />
          <input
            type="text"
            placeholder="Descripción"
            value={editarProducto.descripcion}
            onChange={(e) => setEditarProducto({ ...editarProducto, descripcion: e.target.value })}
          />
          <input 
            type="text" 
            placeholder="URL de la Imagen" 
            value={nuevoProducto.imagen_url} 
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagen_url: e.target.value })} 
          />
          <button onClick={guardarEdicion}>Guardar Cambios</button>
          <button onClick={() => setEditarProducto(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
  },
  form: {
    marginBottom: '2rem',
  },
  lista: {
    marginTop: '2rem',
  },
  producto: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
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

export default GestionProductos;