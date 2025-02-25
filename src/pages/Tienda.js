// pages/Tienda.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css'; // Importar estilos de slick-carousel
import 'slick-carousel/slick/slick-theme.css'; // Importar estilos del tema

const Tienda = () => {
  const [rubros, setRubros] = useState([]); // Estado para los rubros
  const [productos, setProductos] = useState([]); // Estado para los productos
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null); // Estado para el rubro seleccionado
  const [carrito, setCarrito] = useState([]); // Estado para el carrito de compras
  const [total, setTotal] = useState(0); // Estado para el total de la compra

  // Obtener los rubros al cargar el componente
  useEffect(() => {
    axios.get('https://cacmarcos.alwaysdata.net/api/rubros')
      .then(response => setRubros(response.data))
      .catch(error => console.error('Error al obtener rubros:', error));
  }, []);

  // Obtener los productos cuando se selecciona un rubro
  useEffect(() => {
    if (rubroSeleccionado) {
      axios.get(`https://cacmarcos.alwaysdata.net/api/productos/por-rubro/${rubroSeleccionado}`)
        .then(response => setProductos(response.data))
        .catch(error => console.error('Error al obtener productos:', error));
    }
  }, [rubroSeleccionado]);

  // Función para agregar un producto al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
    setTotal(total + producto.precio);
  };

  // Función para finalizar la compra
  const finalizarCompra = () => {
    alert(
      `Compra realizada:\n${carrito
        .map((prod) => `${prod.nombre} - $${prod.precio}`)
        .join('\n')}\nTotal: $${total}`
    );
    setCarrito([]);
    setTotal(0);
  };

  // Configuración del carrusel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };

  return (
    <div style={styles.container}>
      <h1>Tienda</h1>

      {/* Carrusel de Rubros */}
      <Slider {...settings}>
        {rubros.map(rubro => (
          <div key={rubro.id_rubro} onClick={() => setRubroSeleccionado(rubro.id_rubro)} style={styles.rubro}>
            <h3>{rubro.nombre}</h3>
          </div>
        ))}
      </Slider>

      {/* Lista de Productos */}
      <div style={styles.productos}>
        {productos.map(producto => (
          <div key={producto.codigo_barras} style={styles.producto}>
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre} style={styles.imagen} />
            ) : (
              <p>Sin imagen</p>
            )}
            <h3>{producto.nombre}</h3>
            <p>Precio: ${producto.precio}</p>
            <button onClick={() => agregarAlCarrito(producto)} style={styles.button}>
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>

      {/* Detalle del Carrito */}
      <h2>Carrito de Compras</h2>
      {carrito.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <div>
          {carrito.map((item, index) => (
            <p key={index}>{item.nombre} - ${item.precio}</p>
          ))}
          <h3>Total: ${total}</h3>
          <button onClick={finalizarCompra} style={styles.button}>
            Finalizar Compra
          </button>
        </div>
      )}
    </div>
  );
};

// Estilos
const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: 'auto',
  },
  rubro: {
    textAlign: 'center',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  productos: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginTop: '20px',
  },
  producto: {
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '5px',
    width: '200px',
    textAlign: 'center',
  },
  imagen: {
    width: '100%', // Ajustar al tamaño del contenedor
    height: '150px', // Altura fija para uniformidad
    objectFit: 'cover', // Mantiene proporciones y rellena el espacio
    borderRadius: '5px',
  },
  button: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Tienda;