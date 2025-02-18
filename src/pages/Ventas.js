import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Paper, Grid, Modal, Box, List, ListItem, ListItemText } from '@mui/material';

const Ventas = () => {
  const [codigoBarras, setCodigoBarras] = useState('');
  const [nombreBusqueda, setNombreBusqueda] = useState('');
  const [productosVenta, setProductosVenta] = useState([]);
  const [total, setTotal] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [pago, setPago] = useState(0);
  const [cambio, setCambio] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [productos, setProductos] = useState([]); // Lista de productos disponibles
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]); // Resultados de búsqueda

  // Función para cambiar la cantidad de un producto
  const cambiarCantidad = useCallback((codigoBarras, nuevaCantidad) => {
    const nuevosProductos = productosVenta.map((p) =>
      p.codigo_barras === codigoBarras ? { ...p, cantidad: nuevaCantidad } : p
    );
    setProductosVenta(nuevosProductos);

    // Recalcular el total
    const nuevoTotal = nuevosProductos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    setTotal(nuevoTotal);
  }, [productosVenta]);
  // Obtener la lista de productos al cargar el componente
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
  // Función para buscar productos por nombre
  const buscarPorNombre = () => {
    if (nombreBusqueda.trim() === '') {
      setResultadosBusqueda([]); // Limpiar resultados si la búsqueda está vacía
      return;
    }

    const resultados = productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(nombreBusqueda.toLowerCase())
    );
    setResultadosBusqueda(resultados);
  };

  // Función para agregar un producto a la venta
  const agregarProducto = (producto) => {
    setProductosVenta([...productosVenta, { ...producto, cantidad: 1 }]);
    setTotal(total + parseFloat(producto.precio));
    setNombreBusqueda(''); // Limpiar la búsqueda
    setResultadosBusqueda([]); // Limpiar los resultados
  };

  // Manejar la tecla Enter en el campo de búsqueda por nombre
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarPorNombre();
    }
  };

  // Efecto para manejar atajos de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'F1':
          buscarProducto();
          break;
        case 'F2':
          aplicarDescuento();
          break;
        case 'F3':
          calcularCambio();
          break;
        case 'F4':
          emitirTicket();
          break;
        case 'F5':
          if (tickets.length > 0) {
            reimprimirTicket(tickets[tickets.length - 1]);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [codigoBarras, productosVenta, total, descuento, pago, cambio, tickets]);

  // Obtener los tickets al cargar el componente
  useEffect(() => {
    const obtenerTickets = async () => {
      try {
        const response = await axios.get('https://cacmarcos.alwaysdata.net/api/tickets');
        setTickets(response.data);
      } catch (error) {
        console.error('Error al obtener los tickets:', error);
      }
    };

    obtenerTickets();
  }, []);

  // Función para buscar un producto por código de barras
  const buscarProducto = async () => {
    try {
      const response = await axios.get(`https://cacmarcos.alwaysdata.net/api/productos/${codigoBarras}`);
      const producto = response.data;

      if (producto) {
        setProductosVenta([...productosVenta, { ...producto, cantidad: 1 }]);
        setTotal(total + parseFloat(producto.precio));
        setCodigoBarras('');
      } else {
        alert('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error al buscar el producto:', error);
      alert('Error al buscar el producto');
    }
  };

  // Función para aplicar descuento
  const aplicarDescuento = () => {
    const totalConDescuento = total - (total * (parseFloat(descuento) / 100));
    setTotal(totalConDescuento);
  };

  // Función para calcular el cambio
  const calcularCambio = () => {
    setCambio(pago - total);
  };

  // Función para emitir el ticket
  const emitirTicket = async () => {
    const ticket = {
      productos: JSON.stringify(productosVenta),
      descuento: parseFloat(descuento),
      total: parseFloat(total),
    };

    try {
      await axios.post('https://cacmarcos.alwaysdata.net/api/tickets', ticket);

      const ticketHTML = generarTicketHTML(productosVenta, descuento, total);
      imprimirTicket(ticketHTML);

      setProductosVenta([]);
      setTotal(0);
      setDescuento(0);
      setPago(0);
      setCambio(0);

      const response = await axios.get('https://cacmarcos.alwaysdata.net/api/tickets');
      setTickets(response.data);

      alert('Ticket emitido y guardado correctamente');
    } catch (error) {
      console.error('Error al emitir el ticket:', error);
      alert('Error al emitir el ticket');
    }
  };

  // Función para reimprimir un ticket
  const reimprimirTicket = (ticket) => {
    const productos = JSON.parse(ticket.productos);
    const ticketHTML = generarTicketHTML(productos, ticket.descuento, ticket.total);
    imprimirTicket(ticketHTML);
  };

  // Función para generar el HTML del ticket
  const generarTicketHTML = (productos, descuento, total) => {
    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .ticket {
              width: 300px;
              margin: 0 auto;
              border: 1px solid #000;
              padding: 10px;
            }
            .ticket h1 {
              text-align: center;
              font-size: 18px;
              margin: 0 0 10px;
            }
            .ticket p {
              margin: 5px 0;
            }
            .ticket .producto {
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h1>TICKET DE VENTA</h1>
            ${productos.map((prod) => `
              <div class="producto">
                <p>${prod.nombre}</p>
                <p>$${prod.precio} x ${prod.cantidad}</p>
              </div>
            `).join('')}
            <hr>
            <p><strong>Descuento:</strong> ${descuento}%</p>
            <p><strong>Total:</strong> $${parseFloat(total).toFixed(2)}</p>
            <p>Gracias por su compra!</p>
          </div>
        </body>
      </html>
    `;
  };

  // Función para imprimir el ticket
  const imprimirTicket = (ticketHTML) => {
    if (window.electronAPI && window.electronAPI.send) {
      // Enviar el ticket a Electron para imprimir
      window.electronAPI.send('print-ticket', ticketHTML);
    } else {
      // Imprimir en la web
      const printWindow = window.open('', '_blank');
      printWindow.document.write(ticketHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Abrir y cerrar el modal
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

   // Estilos para el modal
   const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600, // Ancho fijo
    maxHeight: '80vh', // Altura máxima del 80% de la ventana
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto', // Scroll vertical
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Ventas
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Escanear código de barras"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && buscarProducto()}
          />
          <Button variant="contained" color="primary" onClick={buscarProducto}>
            Buscar por Código
          </Button>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Buscar producto por nombre"
            value={nombreBusqueda}
            onChange={(e) => setNombreBusqueda(e.target.value)}
            onKeyPress={handleKeyPress} // Buscar al presionar Enter
          />
          <Button variant="contained" color="primary" onClick={buscarPorNombre} style={{ marginTop: '10px' }}>
            Buscar por Nombre
          </Button>
          {resultadosBusqueda.length > 0 && (
            <Paper elevation={3} style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              <List>
                {resultadosBusqueda.map((producto, index) => (
                  <ListItem button key={index} onClick={() => agregarProducto(producto)}>
                    <ListItemText primary={producto.nombre} secondary={`Precio: $${producto.precio}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">Productos en la Venta</Typography>
            {productosVenta.map((producto, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <Typography>{producto.nombre}</Typography>
                <Typography>Precio: ${producto.precio}</Typography>
                <TextField
                  type="number"
                  value={producto.cantidad}
                  onChange={(e) => cambiarCantidad(producto.codigo_barras, parseInt(e.target.value))}
                />
              </div>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Descuento (%)"
            type="number"
            value={descuento}
            onChange={(e) => setDescuento(parseFloat(e.target.value))}
          />
          <Button variant="contained" color="secondary" onClick={aplicarDescuento}>
            Aplicar Descuento
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
          <TextField
            label="Pagó con"
            type="number"
            value={pago}
            onChange={(e) => setPago(parseFloat(e.target.value))}
          />
          <Button variant="contained" color="primary" onClick={calcularCambio}>
            Calcular Cambio
          </Button>
          <Typography variant="h6">Cambio: ${cambio.toFixed(2)}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="success" onClick={emitirTicket}>
            Emitir Ticket
          </Button>
          <Button variant="contained" onClick={handleOpenModal}>
            Ver Tickets Emitidos
          </Button>
        </Grid>
      </Grid>

      {/* Modal para mostrar los tickets */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-tickets"
        aria-describedby="modal-tickets-emitidos"
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" id="modal-tickets" gutterBottom>
            Tickets Emitidos
          </Typography>
          {tickets.length === 0 ? (
            <Typography>No hay tickets emitidos.</Typography>
          ) : (
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {tickets.map((ticket, index) => (
                <div key={index} style={{ marginBottom: '10px', padding: '10px', borderBottom: '1px solid #ccc' }}>
                  <Typography><strong>Fecha:</strong> {new Date(ticket.fecha).toLocaleString()}</Typography>
                  <Typography><strong>Total:</strong> ${parseFloat(ticket.total).toFixed(2)}</Typography>
                  <Button variant="contained" color="primary" onClick={() => reimprimirTicket(ticket)}>
                    Reimprimir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default Ventas;