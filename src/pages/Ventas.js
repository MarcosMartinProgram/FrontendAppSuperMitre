import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboard } from '../hooks/useKeyboard';
import { productosAPI, ticketsAPI, clientesAPI } from '../services/api';
import QRModal from '../components/QRModal';
import WhatsAppButton from '../components/WhatsAppButton';

const Ventas = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [productosVenta, setProductosVenta] = useState([]);
  const [total, setTotal] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [pago, setPago] = useState(0);
  const [cambio, setCambio] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [showTickets, setShowTickets] = useState(false);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [tipoPago, setTipoPago] = useState('contado');
  const [listaPrecios, setListaPrecios] = useState('1');
  const [showQR, setShowQR] = useState(false);
  const [entregaEfectivo, setEntregaEfectivo] = useState(0);
  const [whatsappData, setWhatsappData] = useState(null);
  const listaRef = useRef(null);
  const lineIdCounter = useRef(1);

  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [productosVenta]);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodsRes, ticketsRes, clientesRes] = await Promise.all([
          productosAPI.getAll(),
          ticketsAPI.getAll(),
          clientesAPI.getAll(),
        ]);
        setProductos(prodsRes.data);
        setTickets(ticketsRes.data);
        setClientes(clientesRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    load();
  }, []);

  const recalcularTotal = useCallback((prods, desc) => {
    const sub = prods.reduce((acc, p) => acc + parseFloat(p.precio_venta || p.precio) * p.cantidad, 0);
    const conDesc = sub - (sub * (parseFloat(desc) / 100));
    setTotal(conDesc);
  }, []);

  const precioProducto = (p) => parseFloat(p.precio_venta || p.precio);

  const agregarProducto = useCallback((producto) => {
    const precioVenta = listaPrecios === '2'
      ? parseFloat(producto.precio_lista2 || producto.precio)
      : parseFloat(producto.precio);
    setProductosVenta((prev) => {
      const existente = producto.es_variable
        ? null
        : prev.find((p) => p.codigo_barras === producto.codigo_barras);
      let nuevos;
      if (existente) {
        nuevos = prev.map((p) =>
          p.codigo_barras === producto.codigo_barras
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      } else {
        nuevos = [...prev, { ...producto, cantidad: 1, precio_venta: precioVenta, lineId: lineIdCounter.current++ }];
      }
      recalcularTotal(nuevos, descuento);
      return nuevos;
    });
  }, [listaPrecios, descuento, recalcularTotal]);

  const buscarYAgregar = useCallback(async () => {
    const termino = busqueda.trim();
    if (!termino) return;

    const porCodigo = productos.filter((p) => String(p.codigo_barras) === termino);
    if (porCodigo.length === 1) {
      agregarProducto(porCodigo[0]);
      setBusqueda('');
      setResultadosBusqueda([]);
      return;
    }

    const porNombre = productos.filter((p) =>
      p.nombre.toLowerCase().includes(termino.toLowerCase())
    );

    if (porNombre.length === 1) {
      agregarProducto(porNombre[0]);
      setBusqueda('');
      setResultadosBusqueda([]);
    } else     if (porNombre.length > 1) {
      setResultadosBusqueda(porNombre.slice(0, 8));
    } else {
      setResultadosBusqueda([]);
      alert('No se encontró producto con ese código o nombre');
    }
  }, [busqueda, productos, agregarProducto]);

  const seleccionarResultado = useCallback((producto) => {
    agregarProducto(producto);
    setBusqueda('');
    setResultadosBusqueda([]);
  }, [agregarProducto]);

  const cambiarCantidad = useCallback((lineId, nuevaCantidad) => {
    setProductosVenta((prev) => {
      const actualizados = prev.map((p) =>
        p.lineId === lineId ? { ...p, cantidad: Math.max(1, nuevaCantidad) } : p
      );
      recalcularTotal(actualizados, descuento);
      return actualizados;
    });
  }, [descuento, recalcularTotal]);

  const cambiarPrecio = useCallback((lineId, nuevoPrecio) => {
    setProductosVenta((prev) => {
      const actualizados = prev.map((p) =>
        p.lineId === lineId ? { ...p, precio_venta: parseFloat(nuevoPrecio) || 0 } : p
      );
      recalcularTotal(actualizados, descuento);
      return actualizados;
    });
  }, [descuento, recalcularTotal]);

  const eliminarProducto = useCallback((lineId) => {
    setProductosVenta((prev) => {
      const filtrados = prev.filter((p) => p.lineId !== lineId);
      recalcularTotal(filtrados, descuento);
      return filtrados;
    });
  }, [descuento, recalcularTotal]);

  const calcularCambio = useCallback(() => {
    setCambio(pago - total);
  }, [pago, total]);

  const generarTicketHTML = useCallback((prods, desc, tot, cliente, tipo, pagoInfo, nroTicket) => {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-AR');
    const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const sub = prods.reduce((acc, p) => acc + parseFloat(p.precio_venta || p.precio) * p.cantidad, 0);

    const esParcial = pagoInfo && pagoInfo.parcial;
    const montoPagado = esParcial ? pagoInfo.pagado : (tipo === 'contado' ? tot : 0);
    const montoCC = esParcial ? pagoInfo.cc : (tipo === 'cuenta_corriente' ? tot : 0);
    const saldoAnterior = esParcial && cliente ? parseFloat(cliente.saldo_cuenta_corriente) : 0;
    const saldoNuevo = esParcial && cliente ? saldoAnterior + montoCC : 0;
    const falta = esParcial ? (tot - montoPagado - montoCC) : 0;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: 80mm auto; margin: 0; }
  @media print {
    html, body { width: 80mm; margin: 0; padding: 0; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.3; width: 80mm; color: #000; background: #fff; }
  .ticket { width: 80mm; padding: 2mm 3mm 5mm 3mm; }
  .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 2mm; margin-bottom: 2mm; }
  .header h1 { font-size: 14px; font-weight: bold; letter-spacing: 1px; margin-bottom: 1mm; }
  .header .sub { font-size: 10px; color: #333; }
  .info-line { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 1mm; }
  .client-line { font-size: 10px; margin-bottom: 1mm; font-weight: bold; }
  .divider { border-top: 1px dashed #000; margin: 2mm 0; }
  .item { margin-bottom: 1.5mm; }
  .item-name { font-weight: bold; font-size: 11px; }
  .item-detail { font-size: 10px; color: #333; display: flex; justify-content: space-between; }
  .totals { border-top: 1px dashed #000; padding-top: 2mm; margin-top: 2mm; }
  .total-line { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 1mm; }
  .total-final { font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 1mm; margin-top: 1mm; }
  .footer { text-align: center; border-top: 1px dashed #000; padding-top: 2mm; margin-top: 3mm; font-size: 10px; }
  .footer p { margin-bottom: 0.5mm; }
  .badge { background: #000; color: #fff; padding: 1px 4px; font-size: 9px; font-weight: bold; }
  .partial-line { font-size: 10px; margin-bottom: 0.5mm; }
</style>
</head>
<body>
<div class="ticket">
  <div class="header">
    <h1>SUPER MITRE</h1>
    <div class="sub">Ticket de Venta</div>
  </div>
  <div class="info-line">
    <span>Fecha: ${fecha}</span>
    <span>Hora: ${hora}</span>
  </div>
  <div class="info-line">
    <span><strong>Ticket N° ${nroTicket}</strong></span>
  </div>
  ${cliente ? `<div class="client-line">Cliente: ${cliente.nombre}</div>` : ''}
  ${esParcial ? '<div class="info-line"><span class="badge">PAGO PARCIAL</span></div>' : ''}
  ${tipo === 'cuenta_corriente' && !esParcial ? '<div class="info-line"><span class="badge">CUENTA CORRIENTE</span></div>' : ''}
  ${tipo === 'mercadopago_qr' ? '<div class="info-line"><span class="badge">MERCADOPAGO QR</span></div>' : ''}
  <div class="divider"></div>
  <div>
    ${prods.map((p) => `
    <div class="item">
      <div class="item-name">${p.nombre}</div>
      <div class="item-detail">
        <span>${p.cantidad} x $${parseFloat(p.precio_venta || p.precio).toFixed(2)}</span>
        <span>$${(parseFloat(p.precio_venta || p.precio) * p.cantidad).toFixed(2)}</span>
      </div>
    </div>`).join('')}
  </div>
  <div class="totals">
    <div class="total-line"><span>Subtotal:</span><span>$${sub.toFixed(2)}</span></div>
    ${desc > 0 ? `<div class="total-line"><span>Descuento (${desc}%):</span><span>-$${(sub * desc / 100).toFixed(2)}</span></div>` : ''}
    <div class="total-line total-final"><span>TOTAL:</span><span>$${parseFloat(tot).toFixed(2)}</span></div>
    ${esParcial ? `
    <div class="divider"></div>
    <div class="partial-line"><strong>Pagado en efectivo:</strong> $${montoPagado.toFixed(2)}</div>
    ${montoCC > 0 ? `<div class="partial-line"><strong>A cuenta corriente:</strong> $${montoCC.toFixed(2)}</div>` : ''}
    ${falta > 0 ? `<div class="partial-line" style="font-size:12px;font-weight:bold;"><strong>SALDO PENDIENTE:</strong> $${falta.toFixed(2)}</div>` : ''}
    ${cliente ? `
    <div class="divider"></div>
    <div class="partial-line">Saldo anterior: $${saldoAnterior.toFixed(2)}</div>
    <div class="partial-line"><strong>Nuevo saldo CC:</strong> $${saldoNuevo.toFixed(2)}</div>
    ` : ''}
    ` : ''}
    ${!esParcial && tipo === 'cuenta_corriente' && cliente ? `
    <div class="divider"></div>
    <div class="partial-line">Saldo anterior: $${parseFloat(cliente.saldo_cuenta_corriente).toFixed(2)}</div>
    <div class="partial-line"><strong>Nuevo saldo CC:</strong> $${(parseFloat(cliente.saldo_cuenta_corriente) + parseFloat(tot)).toFixed(2)}</div>
    ` : ''}
  </div>
  <div class="footer">
    <p>¡Gracias por su compra!</p>
    <p>Super Mitre</p>
  </div>
</div>
</body>
</html>`;
  }, []);

  const PRINT_SERVER = 'http://localhost:3210';

  const imprimirTicket = useCallback(async (ticketHTML) => {
    // 1. Intentar Electron
    if (window.electronAPI && window.electronAPI.send) {
      window.electronAPI.send('print-ticket', ticketHTML);
      return;
    }

    // 2. Intentar servidor de impresión local (sin diálogo)
    try {
      const res = await fetch(`${PRINT_SERVER}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: ticketHTML }),
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) return;
      }
    } catch {
      // Servidor no disponible, continuar con fallback
    }

    // 3. Fallback: impresión del navegador (con diálogo)
    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (printWindow) {
      printWindow.document.write(ticketHTML);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    } else {
      const blob = new Blob([ticketHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  const handlePagoAprobado = useCallback(async ({ orderId, paymentId }) => {
    const ticket = {
      productos: JSON.stringify(productosVenta.map((p) => ({ ...p, precio: p.precio_venta || p.precio }))),
      descuento: parseFloat(descuento),
      total: parseFloat(total),
      id_cliente: clienteSeleccionado?.id_cliente || null,
      tipo_pago: 'mercadopago_qr',
      pago_recibido: parseFloat(total),
      vuelto: 0,
      mp_order_id: orderId,
      mp_payment_id: paymentId
    };

    try {
      const { data } = await ticketsAPI.create(ticket);
      const nroTicket = data?.ticket?.id_ticket || '---';
      const ticketHTML = generarTicketHTML(productosVenta, descuento, total, clienteSeleccionado, 'mercadopago_qr', null, nroTicket);
      imprimirTicket(ticketHTML);

      setProductosVenta([]);
      setTotal(0);
      setDescuento(0);
      setPago(0);
      setCambio(0);
      setClienteSeleccionado(null);
      setTipoPago('contado');
      setShowQR(false);

      const resTickets = await ticketsAPI.getAll();
      setTickets(resTickets.data);
    } catch (err) {
      console.error('Error al emitir ticket:', err);
      alert('Error al emitir el ticket');
    }
  }, [productosVenta, descuento, total, clienteSeleccionado, generarTicketHTML, imprimirTicket]);

  const emitirTicket = useCallback(async () => {
    if (productosVenta.length === 0) {
      alert('No hay productos en la venta');
      return;
    }
    if (tipoPago === 'cuenta_corriente' && !clienteSeleccionado) {
      alert('Seleccioná un cliente para cuenta corriente');
      return;
    }

    const esParcialContado = tipoPago === 'contado' && Number(pago) > 0 && Number(pago) < total;
    const esParcialCC = tipoPago === 'cuenta_corriente' && Number(entregaEfectivo) > 0;
    const esParcial = esParcialContado || esParcialCC;

    const montoPagado = esParcialContado ? Number(pago) : 0;
    const montoEntregaCC = esParcialCC ? Number(entregaEfectivo) : 0;
    const montoCC = esParcialCC ? (total - montoEntregaCC) : (tipoPago === 'cuenta_corriente' ? total : 0);

    if (esParcialCC && montoEntregaCC >= total) {
      alert('La entrega en efectivo no puede ser mayor o igual al total. Use Contado.');
      return;
    }

    const pagoInfo = esParcial ? { parcial: true, pagado: montoPagado + montoEntregaCC, cc: montoCC } : null;

    const ticket = {
      productos: JSON.stringify(productosVenta.map((p) => ({ ...p, precio: p.precio_venta || p.precio }))),
      descuento: parseFloat(descuento),
      total: parseFloat(total),
      id_cliente: clienteSeleccionado?.id_cliente || null,
      tipo_pago: esParcialCC ? 'cuenta_corriente_parcial' : (esParcialContado ? 'contado_parcial' : tipoPago),
      pago_recibido: montoPagado + montoEntregaCC,
      vuelto: tipoPago === 'contado' && !esParcialContado ? parseFloat(cambio) : 0,
    };

    try {
      const { data } = await ticketsAPI.create(ticket);
      const nroTicket = data?.ticket?.id_ticket || data?.ticket?.id_ticket || '---';
      const ticketHTML = generarTicketHTML(productosVenta, descuento, total, clienteSeleccionado, tipoPago, pagoInfo, nroTicket);
      imprimirTicket(ticketHTML);

      if ((tipoPago === 'cuenta_corriente' || esParcialCC) && clienteSeleccionado?.telefono) {
        const productos = productosVenta.map(p => `• ${p.cantidad}x ${p.nombre} $${(p.precio_venta || p.precio) * p.cantidad}`).join('\n');
        const saldoCC = data?.ticket?.cliente?.saldo_cuenta_corriente || (parseFloat(clienteSeleccionado.saldo_cuenta_corriente) + saldoPendienteCC);
        const mensaje = `🧾 *Super Mitre* - Ticket #${nroTicket}\n\n${productos}\n\n💰 Total: $${total.toFixed(2)}\n📋 Tipo: Cuenta Corriente\n📈 Nuevo saldo: $${parseFloat(saldoCC).toFixed(2)}\n\n¡Gracias por tu compra!`;
        setWhatsappData({ telefono: clienteSeleccionado.telefono, mensaje });
      } else {
        setWhatsappData(null);
      }

      setProductosVenta([]);
      setTotal(0);
      setDescuento(0);
      setPago(0);
      setCambio(0);
      setClienteSeleccionado(null);
      setTipoPago('contado');
      setEntregaEfectivo(0);

      const resTickets = await ticketsAPI.getAll();
      setTickets(resTickets.data);
    } catch (err) {
      console.error('Error al emitir ticket:', err);
      alert('Error al emitir el ticket');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productosVenta, descuento, total, pago, cambio, tipoPago, clienteSeleccionado, entregaEfectivo, generarTicketHTML, imprimirTicket]);

  const reimprimirTicket = useCallback((ticket) => {
    const prods = JSON.parse(ticket.productos);
    let pagoInfo = null;
    if (ticket.tipo_pago === 'cuenta_corriente_parcial') {
      pagoInfo = { parcial: true, pagado: ticket.pago_recibido || 0, cc: ticket.total - (ticket.pago_recibido || 0) };
    } else if (ticket.tipo_pago === 'contado_parcial') {
      pagoInfo = { parcial: true, pagado: ticket.pago_recibido || 0, cc: 0 };
    }
    const ticketHTML = generarTicketHTML(prods, ticket.descuento, ticket.total, ticket.cliente, ticket.tipo_pago, pagoInfo, ticket.id_ticket);
    imprimirTicket(ticketHTML);
  }, [generarTicketHTML, imprimirTicket]);

  const keyMap = useMemo(() => ({
    F1: () => document.querySelector('.busqueda-input')?.focus(),
    F3: () => calcularCambio(),
    F4: () => emitirTicket(),
    F5: () => { if (tickets.length > 0) reimprimirTicket(tickets[tickets.length - 1]); },
  }), [calcularCambio, emitirTicket, tickets, reimprimirTicket]);

  useKeyboard(keyMap);

  const saldoPendienteCC = tipoPago === 'cuenta_corriente' && Number(entregaEfectivo) > 0
    ? total - Number(entregaEfectivo)
    : (tipoPago === 'cuenta_corriente' ? total : 0);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header} className="ventas-header">
        <div>
          <h1 style={styles.title}>Punto de Venta</h1>
          <p style={styles.shortcutHint}>F1: Buscar · F3: Cambio · F4: Emitir · F5: Reimprimir</p>
        </div>
        <div style={styles.headerRight} className="ventas-header-right">
          <div style={styles.listaSelector}>
            <span style={styles.listaLabel}>Lista</span>
            <div style={styles.listaBtns}>
              <button onClick={() => setListaPrecios('1')}
                style={listaPrecios === '1' ? styles.listaBtnActive : styles.listaBtnInactive}>1</button>
              <button onClick={() => setListaPrecios('2')}
                style={listaPrecios === '2' ? styles.listaBtnActive : styles.listaBtnInactive}>2</button>
            </div>
          </div>
          <button onClick={() => navigate('/panel')} style={styles.backBtn}>← Panel</button>
        </div>
      </div>

      {/* Barra de búsqueda unificada */}
      <div style={styles.searchBar}>
        <div style={styles.searchInputWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            className="busqueda-input"
            type="text"
            placeholder="Escanear código de barras o buscar por nombre..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setResultadosBusqueda([]); }}
            onKeyDown={(e) => { if (e.key === 'Enter') buscarYAgregar(); }}
            style={styles.searchInput}
            autoFocus
          />
          <span style={styles.searchHint}>Enter para buscar</span>
        </div>
        {resultadosBusqueda.length > 0 && (
          <div style={styles.dropdown}>
            {resultadosBusqueda.map((p, i) => (
              <button key={i} onClick={() => seleccionarResultado(p)} style={styles.dropdownItem}>
                <span style={styles.dropdownName}>{p.nombre}</span>
                <span style={styles.dropdownPrice}>
                  ${listaPrecios === '2' ? parseFloat(p.precio_lista2 || p.precio).toFixed(2) : parseFloat(p.precio).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.mainLayout}>
        {/* COLUMNA CENTRAL - Productos (grande, para que vea el cliente) */}
        <div style={styles.centerCol}>
          <div style={styles.productCard}>
            <div style={styles.productCardHeader}>
              <h3 style={styles.productCardTitle}>Productos ({productosVenta.length})</h3>
              {productosVenta.length > 0 && (
                <button onClick={() => { setProductosVenta([]); setTotal(0); setDescuento(0); }}
                  style={styles.clearBtn}>Limpiar</button>
              )}
            </div>
            {productosVenta.length === 0 ? (
              <div style={styles.emptyProductList}>
                <span style={styles.emptyIcon}>🛒</span>
                <p style={styles.emptyText}>Escaneá o buscá un producto</p>
              </div>
            ) : (
              <div style={styles.bigProductList} ref={listaRef}>
                {productosVenta.map((p, i) => {
                  const precio = precioProducto(p);
                  return (
                    <div key={p.lineId} style={styles.bigProductRow}>
                      <div style={styles.bigProductInfo}>
                        <span style={styles.bigProductName}>{p.nombre}</span>
                        <div style={styles.bigProductMeta}>
                          {p.es_variable && <span style={styles.variableBadge}>variable</span>}
                          <input type="number" min="0" step="0.01" value={p.precio_venta || p.precio}
                            onChange={(e) => cambiarPrecio(p.lineId, e.target.value)}
                            style={styles.priceInput} />
                          <span style={styles.xLabel}>x</span>
                          <input type="number" min="1" value={p.cantidad}
                            onChange={(e) => cambiarCantidad(p.lineId, parseInt(e.target.value) || 1)}
                            style={styles.qtyInput} />
                        </div>
                      </div>
                      <div style={styles.bigProductRight}>
                        <span style={styles.bigProductSubtotal}>${(precio * p.cantidad).toFixed(2)}</span>
                        <button onClick={() => eliminarProducto(p.lineId)} style={styles.removeBtn}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA - Pago */}
        <div style={styles.rightCol} className="ventas-right">
          {/* Tipo de pago */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Tipo de pago</h3>
            <div style={styles.radioRow}>
              <button onClick={() => { setTipoPago('contado'); setClienteSeleccionado(null); setEntregaEfectivo(0); }}
                style={tipoPago === 'contado' ? styles.radioActive : styles.radioInactive}>
                💵 Contado
              </button>
              <button onClick={() => { setTipoPago('cuenta_corriente'); setEntregaEfectivo(0); }}
                style={tipoPago === 'cuenta_corriente' ? styles.radioActiveCC : styles.radioInactive}>
                📋 CC
              </button>
              <button onClick={() => { setTipoPago('qr'); setClienteSeleccionado(null); setEntregaEfectivo(0); }}
                style={tipoPago === 'qr' ? styles.radioActiveQR : styles.radioInactive}>
                📱 QR
              </button>
            </div>

            {tipoPago === 'cuenta_corriente' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Cliente</label>
                <select value={clienteSeleccionado?.id_cliente || ''} onChange={(e) => {
                  const cli = clientes.find((c) => c.id_cliente === parseInt(e.target.value));
                  setClienteSeleccionado(cli || null);
                }} style={styles.select}>
                  <option value="">-- Elegir cliente --</option>
                  {clientes.filter((c) => c.es_cuenta_corriente).map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre} (Saldo: ${parseFloat(c.saldo_cuenta_corriente).toFixed(0)})
                    </option>
                  ))}
                </select>
                {clienteSeleccionado && (
                  <div style={styles.clientInfo}>
                    <p><strong>{clienteSeleccionado.nombre}</strong></p>
                    <p>Saldo: ${parseFloat(clienteSeleccionado.saldo_cuenta_corriente).toFixed(2)} / Límite: ${parseFloat(clienteSeleccionado.limite_credito).toFixed(2)}</p>
                    {parseFloat(clienteSeleccionado.saldo_cuenta_corriente) + saldoPendienteCC > parseFloat(clienteSeleccionado.limite_credito) && (
                      <p style={{ color: '#E53935', fontWeight: '600', fontSize: '0.75rem' }}>⚠ Excede límite de crédito</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resumen */}
          <div style={{ ...styles.card, ...styles.summaryCard }}>
            <h3 style={styles.cardTitle}>Resumen</h3>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${productosVenta.reduce((a, p) => a + precioProducto(p) * p.cantidad, 0).toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Descuento (%)</span>
              <input type="number" min="0" max="100" value={descuento}
                onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                onBlur={() => recalcularTotal(productosVenta, descuento)}
                style={styles.descInput} />
            </div>
            <div style={styles.summaryRowTotal}>
              <span>Total</span>
              <span style={styles.totalAmount}>${total.toFixed(2)}</span>
            </div>

            {/* Contado */}
            {tipoPago === 'contado' && (
              <>
                <div style={styles.summaryRow}>
                  <span>Pagó con</span>
                  <input type="number" min="0" value={pago}
                    onChange={(e) => setPago(parseFloat(e.target.value) || 0)}
                    onBlur={calcularCambio} style={styles.descInput} />
                </div>
                {pago > 0 && (
                  <div style={styles.summaryRow}>
                    <span>{cambio >= 0 ? 'Cambio' : 'Falta'}</span>
                    <span style={{ color: cambio >= 0 ? '#1294F2' : '#E53935', fontWeight: '600' }}>
                      ${Math.abs(cambio).toFixed(2)}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* CC con entrega parcial */}
            {tipoPago === 'cuenta_corriente' && (
              <>
                <div style={styles.summaryRow}>
                  <span>Entrega efectivo</span>
                  <input type="number" min="0" max={total} step="0.01" value={entregaEfectivo}
                    onChange={(e) => setEntregaEfectivo(parseFloat(e.target.value) || 0)}
                    style={styles.descInput} />
                </div>
                {Number(entregaEfectivo) > 0 && (
                  <div style={styles.summaryRow}>
                    <span>A CC</span>
                    <span style={{ color: '#FF6B35', fontWeight: '600' }}>
                      ${(total - Number(entregaEfectivo)).toFixed(2)}
                    </span>
                  </div>
                )}
                {clienteSeleccionado && (
                  <div style={styles.summaryRow}>
                    <span>Nuevo saldo CC</span>
                    <span style={{ color: '#FF6B35', fontWeight: '600' }}>
                      ${(parseFloat(clienteSeleccionado.saldo_cuenta_corriente) + saldoPendienteCC).toFixed(2)}
                    </span>
                  </div>
                )}
              </>
            )}

            <div style={styles.actionBtns}>
              {tipoPago === 'qr' ? (
                <button onClick={() => setShowQR(true)}
                  style={styles.qrBtn} disabled={productosVenta.length === 0 || total <= 0}>
                  📱 Pagar con QR (${total.toFixed(2)})
                </button>
              ) : (
                <button onClick={emitirTicket} style={styles.emitBtn}>
                  Emitir Ticket (F4)
                </button>
              )}
              <button onClick={() => setShowTickets(true)} style={styles.secondaryBtn}>Ver Tickets</button>
              {whatsappData && (
                <div style={{ marginTop: '0.5rem' }}>
                  <WhatsAppButton telefono={whatsappData.telefono} mensaje={whatsappData.mensaje} texto="Enviar por WhatsApp" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tickets */}
      {showTickets && (
        <div style={styles.modalOverlay} onClick={() => setShowTickets(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Tickets Emitidos</h3>
              <button onClick={() => setShowTickets(false)} style={styles.modalClose}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {tickets.length === 0 ? (
                <p style={styles.emptyMsg}>No hay tickets emitidos</p>
              ) : (
                tickets.map((t, i) => (
                  <div key={i} style={styles.ticketRow}>
                    <div>
                      <p style={styles.ticketDate}>{new Date(t.fecha).toLocaleString('es-AR')}</p>
                      <p style={styles.ticketTotal}>${parseFloat(t.total).toFixed(2)}</p>
                      {t.tipo_pago === 'cuenta_corriente' && <span style={styles.ccBadge}>CC</span>}
                      {t.tipo_pago === 'mercadopago_qr' && <span style={styles.mpBadge}>MP</span>}
                      {t.tipo_pago === 'cuenta_corriente_parcial' && <span style={styles.partialBadge}>CC PARCIAL</span>}
                      {t.tipo_pago === 'contado_parcial' && <span style={styles.partialBadge}>CONTADO PARCIAL</span>}
                    </div>
                    <button onClick={() => reimprimirTicket(t)} style={styles.reprintBtn}>Reimprimir</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {showQR && (
        <QRModal
          total={total}
          productos={productosVenta}
          onPagoAprobado={handlePagoAprobado}
          onCancelar={() => setShowQR(false)}
        />
      )}
    </div>
  );
};

const styles = {
  page: { padding: '0.75rem 1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#273444', margin: 0 },
  shortcutHint: { fontSize: '0.6875rem', color: '#667085', marginTop: '0.125rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  listaSelector: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' },
  listaLabel: { fontSize: '0.625rem', fontWeight: '600', color: '#667085', textTransform: 'uppercase' },
  listaBtns: { display: 'flex', gap: '0.25rem' },
  listaBtnActive: { padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: '2px solid #1294F2', background: '#E8F4FD', color: '#1294F2', fontWeight: '700', fontSize: '0.8125rem', cursor: 'pointer' },
  listaBtnInactive: { padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: '2px solid #E6EDF5', background: 'white', color: '#667085', fontWeight: '500', fontSize: '0.8125rem', cursor: 'pointer' },
  backBtn: { padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid #E6EDF5', background: 'white', color: '#667085', fontSize: '0.8125rem', fontWeight: '500', cursor: 'pointer' },

  /* Búsqueda unificada */
  searchBar: { position: 'relative', marginBottom: '1rem' },
  searchInputWrap: { display: 'flex', alignItems: 'center', background: 'white', border: '2px solid #E6EDF5', borderRadius: '20px', padding: '0 1.25rem', transition: 'border-color 0.2s' },
  searchIcon: { fontSize: '1.5rem', marginRight: '0.75rem', color: '#667085' },
  searchInput: { flex: 1, padding: '1rem 0', border: 'none', fontSize: '1.125rem', outline: 'none', background: 'transparent' },
  searchHint: { fontSize: '0.6875rem', color: '#667085', whiteSpace: 'nowrap', marginLeft: '0.5rem' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #E6EDF5', borderRadius: '0 0 20px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: '300px', overflowY: 'auto' },
  dropdownItem: { display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem', background: 'white', border: 'none', borderBottom: '1px solid #F5F8FC', fontSize: '0.875rem', cursor: 'pointer', textAlign: 'left' },
  dropdownName: { color: '#273444' },
  dropdownPrice: { color: '#1294F2', fontWeight: '700' },

  /* Layout principal */
  mainLayout: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0.75rem', alignItems: 'start' },
  centerCol: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '72px' },

  /* Productos grandes (centro) */
  productCard: { background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '1rem', minHeight: '300px' },
  productCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  productCardTitle: { fontSize: '0.9375rem', fontWeight: '600', color: '#273444', margin: 0 },
  clearBtn: { fontSize: '0.6875rem', padding: '0.25rem 0.5rem', background: '#fef2f2', color: '#E53935', border: '1px solid #fecaca', borderRadius: '0.25rem', cursor: 'pointer' },
  emptyProductList: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', color: '#667085' },
  emptyIcon: { fontSize: '3rem', marginBottom: '0.75rem' },
  emptyText: { fontSize: '1rem', margin: 0 },
  bigProductList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', scrollBehavior: 'smooth', paddingRight: '0.25rem' },
  bigProductRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: '#F5F8FC', borderRadius: '14px', border: '1px solid #f0f0f0' },
  bigProductInfo: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  bigProductName: { fontWeight: '700', fontSize: '1.25rem', color: '#273444' },
  bigProductMeta: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  bigProductRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', marginLeft: '1rem' },
  bigProductSubtotal: { fontWeight: '800', fontSize: '1.375rem', color: '#1294F2' },
  priceInput: { width: '90px', padding: '0.5rem 0.625rem', border: '1px solid #E6EDF5', borderRadius: '0.375rem', fontSize: '1rem', outline: 'none', background: 'white', textAlign: 'right' },
  xLabel: { fontSize: '0.875rem', color: '#667085' },
  qtyInput: { width: '56px', padding: '0.5rem', border: '1px solid #E6EDF5', borderRadius: '0.375rem', fontSize: '1rem', textAlign: 'center', outline: 'none' },
  variableBadge: { fontSize: '0.5625rem', background: '#fef3c7', color: '#92400e', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: '600', textTransform: 'uppercase' },
  removeBtn: { width: '32px', height: '32px', borderRadius: '0.375rem', border: 'none', background: '#fef2f2', color: '#E53935', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  /* Cards genéricas */
  card: { background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '0.875rem' },
  cardTitle: { fontSize: '0.8125rem', fontWeight: '600', color: '#273444', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.025em' },

  /* Pago */
  fieldGroup: { marginBottom: '0.75rem' },
  label: { display: 'block', fontSize: '0.6875rem', fontWeight: '600', color: '#667085', marginBottom: '0.375rem', textTransform: 'uppercase' },
  radioRow: { display: 'flex', gap: '0.375rem' },
  radioActive: { flex: 1, padding: '0.5rem', border: '2px solid #1294F2', borderRadius: '14px', background: '#E8F4FD', color: '#1294F2', fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer' },
  radioActiveCC: { flex: 1, padding: '0.5rem', border: '2px solid #FF6B35', borderRadius: '14px', background: '#fff7ed', color: '#E55A2B', fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer' },
  radioActiveQR: { flex: 1, padding: '0.5rem', border: '2px solid #1294F2', borderRadius: '14px', background: '#eff6ff', color: '#0B89FF', fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer' },
  radioInactive: { flex: 1, padding: '0.5rem', border: '2px solid #E6EDF5', borderRadius: '14px', background: 'white', color: '#667085', fontWeight: '500', fontSize: '0.8125rem', cursor: 'pointer' },
  select: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #E6EDF5', borderRadius: '14px', fontSize: '0.8125rem', outline: 'none', background: 'white' },
  clientInfo: { marginTop: '0.5rem', padding: '0.5rem', background: '#F5F8FC', borderRadius: '0.375rem', fontSize: '0.75rem', color: '#273444' },

  /* Resumen */
  summaryCard: { border: '2px solid #1294F2' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0', borderBottom: '1px solid #F5F8FC', fontSize: '0.8125rem', color: '#667085' },
  summaryRowTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '2px solid #E6EDF5', fontSize: '1rem', fontWeight: '600', color: '#273444' },
  totalAmount: { fontSize: '1.75rem', fontWeight: '800', color: '#1294F2' },
  descInput: { width: '80px', padding: '0.25rem 0.5rem', border: '1px solid #E6EDF5', borderRadius: '0.375rem', fontSize: '0.8125rem', textAlign: 'right', outline: 'none' },
  actionBtns: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' },
  emitBtn: { width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #1294F2, #1294F2)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(18, 148, 242, 0.3)' },
  qrBtn: { width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #1294F2, #0B89FF)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(18, 148, 242, 0.3)' },
  secondaryBtn: { width: '100%', padding: '0.5rem', background: 'white', color: '#667085', border: '1px solid #E6EDF5', borderRadius: '14px', fontWeight: '500', fontSize: '0.75rem', cursor: 'pointer' },

  /* Modal */
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
  modal: { background: 'white', borderRadius: '20px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #E6EDF5' },
  modalTitle: { fontSize: '1rem', fontWeight: '600', color: '#273444', margin: 0 },
  modalClose: { width: '32px', height: '32px', borderRadius: '0.375rem', border: 'none', background: '#F5F8FC', color: '#667085', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: '1rem 1.25rem', overflowY: 'auto', maxHeight: '60vh' },
  ticketRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '14px', border: '1px solid #F5F8FC', marginBottom: '0.5rem' },
  ticketDate: { fontSize: '0.75rem', color: '#667085', margin: 0 },
  ticketTotal: { fontSize: '1rem', fontWeight: '700', color: '#273444', margin: '0.125rem 0 0' },
  ccBadge: { display: 'inline-block', fontSize: '0.5625rem', background: '#FF6B35', color: 'white', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: '700', marginTop: '0.25rem' },
  mpBadge: { display: 'inline-block', fontSize: '0.5625rem', background: '#1294F2', color: 'white', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: '700', marginTop: '0.25rem' },
  partialBadge: { display: 'inline-block', fontSize: '0.5625rem', background: '#8b5cf6', color: 'white', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: '700', marginTop: '0.25rem' },
  reprintBtn: { padding: '0.375rem 0.75rem', background: '#E8F4FD', color: '#1294F2', border: '1px solid #D0ECFF', borderRadius: '0.375rem', fontSize: '0.6875rem', fontWeight: '600', cursor: 'pointer' },
  emptyMsg: { color: '#667085', fontSize: '0.8125rem', textAlign: 'center', padding: '1.5rem 0' },
};

export default Ventas;
