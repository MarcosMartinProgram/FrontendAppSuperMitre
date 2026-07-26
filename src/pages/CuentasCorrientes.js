import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesAPI, ticketsAPI } from '../services/api';
import WhatsAppButton from '../components/WhatsAppButton';

const initialClienteForm = {
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
  es_cuenta_corriente: true,
  limite_credito: '',
};

const CuentasCorrientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [ticketsPendientes, setTicketsPendientes] = useState([]);
  const [ticketsSeleccionados, setTicketsSeleccionados] = useState([]);
  const [montoPago, setMontoPago] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargandoTickets, setCargandoTickets] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [clienteForm, setClienteForm] = useState(initialClienteForm);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [whatsappData, setWhatsappData] = useState(null);
  const [editingCliente, setEditingCliente] = useState(null);
  const [showAsociar, setShowAsociar] = useState(false);
  const [busquedaTickets, setBusquedaTickets] = useState('');
  const [ticketsDisponibles, setTicketsDisponibles] = useState([]);
  const [cargandoDisponibles, setCargandoDisponibles] = useState(false);
  const [asociandoTicket, setAsociandoTicket] = useState(null);
  const [saldando, setSaldando] = useState(false);

  useEffect(() => {
    clientesAPI.getAll()
      .then(({ data }) => setClientes(data))
      .catch(console.error);
  }, []);

  const cargarTicketsPendientes = useCallback(async (idCliente) => {
    setCargandoTickets(true);
    try {
      const { data } = await clientesAPI.getTicketsPendientes(idCliente);
      setTicketsPendientes(data);
      setTicketsSeleccionados([]);
    } catch (err) {
      console.error('Error al cargar tickets:', err);
      setTicketsPendientes([]);
    } finally {
      setCargandoTickets(false);
    }
  }, []);

  const seleccionarCliente = useCallback((cliente) => {
    setClienteSeleccionado(cliente);
    setMontoPago('');
    setDescripcion('');
    setTicketsSeleccionados([]);
    setShowAsociar(false);
    setBusquedaTickets('');
    setTicketsDisponibles([]);
    if (cliente.es_cuenta_corriente) {
      cargarTicketsPendientes(cliente.id_cliente);
    }
  }, [cargarTicketsPendientes]);

  const buscarTicketsDisponibles = useCallback(async (q) => {
    setBusquedaTickets(q);
    if (q.length < 1) {
      setTicketsDisponibles([]);
      return;
    }
    setCargandoDisponibles(true);
    try {
      const { data } = await ticketsAPI.getDisponibles({ busqueda: q, limite: 10 });
      setTicketsDisponibles(data.tickets || data || []);
    } catch (err) {
      console.error('Error al buscar tickets:', err);
      setTicketsDisponibles([]);
    } finally {
      setCargandoDisponibles(false);
    }
  }, []);

  const asociarTicket = useCallback(async (ticket) => {
    if (!clienteSeleccionado) return;
    setAsociandoTicket(ticket.id_ticket);
    try {
      await clientesAPI.asociarTicket(clienteSeleccionado.id_cliente, {
        id_ticket: ticket.id_ticket,
        descripcion: `Ticket #${ticket.id_ticket} asociado manualmente`,
      });
      await cargarTicketsPendientes(clienteSeleccionado.id_cliente);
      const { data: clienteActualizado } = await clientesAPI.getById(clienteSeleccionado.id_cliente);
      setClienteSeleccionado(clienteActualizado.cliente || clienteActualizado);
      setTicketsDisponibles((prev) => prev.filter((t) => t.id_ticket !== ticket.id_ticket));
      setBusquedaTickets('');
    } catch (err) {
      console.error('Error al asociar ticket:', err);
      alert(err.response?.data?.error || 'Error al asociar el ticket');
    } finally {
      setAsociandoTicket(null);
    }
  }, [clienteSeleccionado, cargarTicketsPendientes]);

  const saldarCuenta = useCallback(async () => {
    if (!clienteSeleccionado) return;
    if (!window.confirm(`¿Saldar la cuenta de ${clienteSeleccionado.nombre}? Se pondrá el saldo en $0.`)) return;
    setSaldando(true);
    try {
      await clientesAPI.saldar(clienteSeleccionado.id_cliente, {
        descripcion: 'Saldado manual desde Cuentas Corrientes',
      });
      const { data: clienteActualizado } = await clientesAPI.getById(clienteSeleccionado.id_cliente);
      setClienteSeleccionado(clienteActualizado.cliente || clienteActualizado);
      setClientes((prev) => prev.map((c) =>
        c.id_cliente === clienteSeleccionado.id_cliente
          ? { ...c, saldo_cuenta_corriente: 0 }
          : c
      ));
      setTicketsPendientes([]);
    } catch (err) {
      console.error('Error al saldar cuenta:', err);
      alert(err.response?.data?.error || 'Error al saldar la cuenta');
    } finally {
      setSaldando(false);
    }
  }, [clienteSeleccionado]);

  const toggleTicket = useCallback((idTicket) => {
    setTicketsSeleccionados((prev) =>
      prev.includes(idTicket) ? prev.filter((id) => id !== idTicket) : [...prev, idTicket]
    );
  }, []);

  const seleccionarTodos = useCallback(() => {
    const todos = ticketsPendientes.map((t) => t.id_ticket);
    setTicketsSeleccionados(todos);
    const total = ticketsPendientes.reduce((acc, t) => acc + t.total, 0);
    setMontoPago(total.toFixed(2));
  }, [ticketsPendientes]);

  const deseleccionarTodos = useCallback(() => {
    setTicketsSeleccionados([]);
    setMontoPago('');
  }, []);

  const totalSeleccionado = ticketsPendientes
    .filter((t) => ticketsSeleccionados.includes(t.id_ticket))
    .reduce((acc, t) => acc + t.total, 0);

  const registrarPago = useCallback(async () => {
    const monto = parseFloat(montoPago);
    if (!monto || monto <= 0) {
      alert('Ingresá un monto válido');
      return;
    }
    if (ticketsSeleccionados.length === 0) {
      alert('Seleccioná al menos un ticket para pagar');
      return;
    }

    setProcesando(true);
    try {
      const { data } = await clientesAPI.registrarPago(clienteSeleccionado.id_cliente, {
        monto,
        descripcion: descripcion || `Pago de ${clienteSeleccionado.nombre}`,
        tickets_pagados: ticketsSeleccionados,
      });

      const comprobante = generarComprobante(
        clienteSeleccionado,
        monto,
        data.saldo_anterior,
        data.saldo_actual,
        ticketsSeleccionados,
        ticketsPendientes,
        data.numeroRecibo
      );
      imprimirComprobante(comprobante);

      if (clienteSeleccionado.telefono) {
        const ticketsInfo = ticketsPendientes.filter((t) => ticketsSeleccionados.includes(t.id_ticket));
        const ticketsLines = ticketsInfo.map(t => `• Ticket #${t.id_ticket} - $${parseFloat(t.total).toFixed(2)}`).join('\n');
        const mensaje = `✅ *Super Mitre* - Comprobante de Pago\n\nCliente: ${clienteSeleccionado.nombre}\nRecibo: ${data.numeroRecibo}\n\nTickets pagados:\n${ticketsLines}\n\n💵 Pago: $${monto.toFixed(2)}\n📈 Saldo anterior: $${data.saldo_anterior.toFixed(2)}\n📉 Nuevo saldo: $${data.saldo_actual.toFixed(2)}\n\n¡Gracias!`;
        setWhatsappData({ telefono: clienteSeleccionado.telefono, mensaje });
      } else {
        setWhatsappData(null);
      }

      const clienteActualizado = { ...clienteSeleccionado, saldo_cuenta_corriente: data.saldo_actual };
      setClienteSeleccionado(clienteActualizado);
      setClientes((prev) => prev.map((c) => c.id_cliente === clienteActualizado.id_cliente ? clienteActualizado : c));
      setMontoPago('');
      setDescripcion('');
      setTicketsSeleccionados([]);

      await cargarTicketsPendientes(clienteSeleccionado.id_cliente);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      alert(err.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setProcesando(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montoPago, descripcion, ticketsSeleccionados, ticketsPendientes, clienteSeleccionado, cargarTicketsPendientes]);

  const generarComprobante = (cliente, monto, saldoAnt, saldoNue, ticketsIds, tickets, nroRecibo) => {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-AR');
    const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const ticketsInfo = tickets.filter((t) => ticketsIds.includes(t.id_ticket));

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @page { size: 80mm auto; margin: 0; }
  @media print { html, body { width: 80mm; margin: 0; padding: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.3; width: 80mm; color: #000; background: #fff; }
  .ticket { width: 80mm; padding: 2mm 3mm; }
  .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 2mm; margin-bottom: 2mm; }
  .header h1 { font-size: 14px; font-weight: bold; letter-spacing: 1px; margin-bottom: 1mm; }
  .header .sub { font-size: 10px; color: #333; }
  .info-line { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 1mm; }
  .badge { background: #000; color: #fff; padding: 1px 4px; font-size: 9px; font-weight: bold; }
  .divider { border-top: 1px dashed #000; margin: 2mm 0; }
  .item { margin-bottom: 1.5mm; }
  .item-name { font-weight: bold; font-size: 11px; }
  .item-detail { font-size: 10px; color: #333; display: flex; justify-content: space-between; }
  .totals { border-top: 1px dashed #000; padding-top: 2mm; margin-top: 2mm; }
  .total-line { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 1mm; }
  .total-final { font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 1mm; margin-top: 1mm; }
  .footer { text-align: center; border-top: 1px dashed #000; padding-top: 2mm; margin-top: 3mm; font-size: 10px; }
</style></head>
<body>
<div class="ticket">
  <div class="header">
    <h1>SUPER MITRE</h1>
    <div class="sub">Comprobante de Pago</div>
  </div>
  <div class="info-line"><span>Fecha: ${fecha}</span><span>Hora: ${hora}</span></div>
  <div class="info-line"><span class="badge">RECIBO DE PAGO</span></div>
  ${nroRecibo ? `<div class="info-line"><span>N° ${nroRecibo}</span></div>` : ''}
  <div class="divider"></div>
  <div class="info-line"><span>Cliente:</span><span>${cliente.nombre}</span></div>
  ${cliente.email ? `<div class="info-line"><span>Email:</span><span>${cliente.email}</span></div>` : ''}
  <div class="divider"></div>
  <div><strong style="font-size:11px;">Tickets cancelados:</strong></div>
  ${ticketsInfo.map((t) => `
  <div class="item">
    <div class="item-detail">
      <span>Ticket #${t.id_ticket} - ${new Date(t.fecha).toLocaleDateString('es-AR')}</span>
      <span>$${parseFloat(t.total).toFixed(2)}</span>
    </div>
  </div>`).join('')}
  <div class="totals">
    <div class="total-line"><span>Tickets cancelados (${ticketsInfo.length}):</span><span>$${totalSeleccionado.toFixed(2)}</span></div>
    <div class="total-line total-final"><span>PAGO RECIBIDO:</span><span>$${monto.toFixed(2)}</span></div>
    <div class="divider"></div>
    <div class="total-line"><span>Saldo anterior:</span><span>$${saldoAnt.toFixed(2)}</span></div>
    <div class="total-line"><span>Nuevo saldo:</span><span>$${saldoNue.toFixed(2)}</span></div>
  </div>
  <div class="footer">
    <p>¡Gracias por su pago!</p>
    <p>Super Mitre</p>
  </div>
</div>
</body></html>`;
  };

  const PRINT_SERVER = 'http://localhost:3210';

  const imprimirComprobante = async (html) => {
    // 1. Intentar servidor de impresión local (sin diálogo)
    try {
      const res = await fetch(`${PRINT_SERVER}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) return;
      }
    } catch {
      // Servidor no disponible, continuar con fallback
    }

    // 2. Fallback: impresión del navegador (con diálogo)
    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 500);
    } else {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  );

  const totalDeuda = clientes.reduce((acc, c) => acc + parseFloat(c.saldo_cuenta_corriente || 0), 0);

  const abrirFormulario = () => {
    setEditingCliente(null);
    setClienteForm(initialClienteForm);
    setShowForm(true);
  };

  const abrirEditarCliente = (cliente) => {
    setEditingCliente(cliente);
    setClienteForm({
      nombre: cliente.nombre || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      es_cuenta_corriente: cliente.es_cuenta_corriente || false,
      limite_credito: cliente.limite_credito || '',
    });
    setShowForm(true);
  };

  const guardarCliente = async () => {
    if (!clienteForm.nombre.trim()) {
      alert('Ingresá el nombre del cliente');
      return;
    }
    setGuardandoCliente(true);
    try {
      const payload = {
        ...clienteForm,
        limite_credito: parseFloat(clienteForm.limite_credito) || 0,
      };
      if (editingCliente) {
        const { data } = await clientesAPI.update(editingCliente.id_cliente, payload);
        const clienteActualizado = data.cliente || data;
        setClientes((prev) => prev.map((c) => c.id_cliente === editingCliente.id_cliente ? clienteActualizado : c));
        if (clienteSeleccionado?.id_cliente === editingCliente.id_cliente) {
          setClienteSeleccionado(clienteActualizado);
        }
      } else {
        const { data } = await clientesAPI.create(payload);
        setClientes((prev) => [...prev, data]);
      }
      setShowForm(false);
      setEditingCliente(null);
      setClienteForm(initialClienteForm);
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      alert(err.response?.data?.error || 'Error al guardar el cliente');
    } finally {
      setGuardandoCliente(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header} className="cc-header">
        <div>
          <h1 style={styles.title}>Cuentas Corrientes</h1>
          <p style={styles.subtitle}>{clientes.length} clientes &middot; Deuda total: ${totalDeuda.toFixed(2)}</p>
        </div>
        <button onClick={() => navigate('/panel')} style={styles.backBtn}>← Panel</button>
      </div>

      <div style={styles.card}>
        <div style={styles.searchRow} className="cc-search-row">
          <input type="text" placeholder="Buscar por nombre, email o teléfono..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} style={styles.searchInput} />
          <button onClick={abrirFormulario} style={styles.newClientBtn}>+ Nuevo Cliente</button>
        </div>
      </div>

      <div style={styles.layout} className="cc-layout">
        <div style={styles.listCard}>
          <h3 style={styles.cardTitle}>Clientes ({clientesFiltrados.length})</h3>
          <div style={styles.list}>
            {clientesFiltrados.map((c) => (
              <div key={c.id_cliente}
                onClick={() => seleccionarCliente(c)}
                style={{
                  ...styles.clientRow,
                  ...(clienteSeleccionado?.id_cliente === c.id_cliente ? styles.clientRowActive : {}),
                }}>
                <div style={styles.clientMain}>
                  <span style={styles.clientName}>{c.nombre}</span>
                  <span style={styles.clientPhone}>{c.telefono || c.email}</span>
                </div>
                <div style={styles.clientRight}>
                  <span style={styles.clientDebt}>${parseFloat(c.saldo_cuenta_corriente).toFixed(0)}</span>
                  {parseFloat(c.saldo_cuenta_corriente) >= parseFloat(c.limite_credito) * 0.9 && (
                    <span style={styles.warningDot}>!</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); abrirEditarCliente(c); }}
                    style={styles.editBtn} title="Editar cliente">
                    ✏️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {clienteSeleccionado && (
          <div style={styles.detailCard} className="cc-detail-card">
            <h3 style={styles.cardTitle}>Detalle del Cliente</h3>
            <div style={styles.detailGrid}>
              <div style={styles.detailField}>
                <span style={styles.detailLabel}>Nombre</span>
                <span style={styles.detailValue}>{clienteSeleccionado.nombre}</span>
              </div>
              <div style={styles.detailField}>
                <span style={styles.detailLabel}>Email</span>
                <span style={styles.detailValue}>{clienteSeleccionado.email}</span>
              </div>
              <div style={styles.detailField}>
                <span style={styles.detailLabel}>Teléfono</span>
                <span style={styles.detailValue}>{clienteSeleccionado.telefono || '—'}</span>
              </div>
              <div style={styles.detailField}>
                <span style={styles.detailLabel}>Dirección</span>
                <span style={styles.detailValue}>{clienteSeleccionado.direccion || '—'}</span>
              </div>
            </div>

            <div style={styles.balanceSection}>
              <div style={styles.balanceRow}>
                <span>Saldo actual</span>
                <span style={styles.balanceAmount}>${parseFloat(clienteSeleccionado.saldo_cuenta_corriente).toFixed(2)}</span>
              </div>
              <div style={styles.balanceRow}>
                <span>Límite de crédito</span>
                <span style={styles.balanceLimit}>${parseFloat(clienteSeleccionado.limite_credito).toFixed(2)}</span>
              </div>
              <div style={styles.balanceRow}>
                <span>Crédito disponible</span>
                <span style={{
                  color: (parseFloat(clienteSeleccionado.limite_credito) - parseFloat(clienteSeleccionado.saldo_cuenta_corriente)) > 0 ? '#1294F2' : '#E53935',
                  fontWeight: '600',
                }}>
                  ${(parseFloat(clienteSeleccionado.limite_credito) - parseFloat(clienteSeleccionado.saldo_cuenta_corriente)).toFixed(2)}
                </span>
              </div>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${Math.min(100, (parseFloat(clienteSeleccionado.saldo_cuenta_corriente) / parseFloat(clienteSeleccionado.limite_credito)) * 100)}%`,
                  background: (parseFloat(clienteSeleccionado.saldo_cuenta_corriente) / parseFloat(clienteSeleccionado.limite_credito)) > 0.9 ? '#E53935' : '#1294F2',
                }} />
              </div>
              {parseFloat(clienteSeleccionado.saldo_cuenta_corriente) >= parseFloat(clienteSeleccionado.limite_credito) && (
                <div style={styles.alertBox}>⚠ Este cliente alcanzó su límite de crédito</div>
              )}
            </div>

            {/* SECCIÓN DE PAGO */}
            {clienteSeleccionado.es_cuenta_corriente && parseFloat(clienteSeleccionado.saldo_cuenta_corriente) > 0 && (
              <div style={styles.paySection}>
                <h3 style={styles.cardTitle}>Registrar Pago</h3>

                {cargandoTickets ? (
                  <p style={styles.loadingText}>Cargando tickets pendientes...</p>
                ) : ticketsPendientes.length === 0 ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={styles.emptyText}>No hay tickets pendientes</p>
                    <button onClick={saldarCuenta} disabled={saldando}
                      style={{ ...styles.payBtn, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', marginTop: '0.5rem' }}>
                      {saldando ? 'Saldando...' : 'Saldar Cuenta'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={styles.ticketHeader}>
                      <span style={styles.ticketHeaderText}>Tickets pendientes ({ticketsPendientes.length})</span>
                      <div style={styles.ticketActions}>
                        <button onClick={seleccionarTodos} style={styles.selectBtn}>Todos</button>
                        <button onClick={deseleccionarTodos} style={styles.selectBtn}>Ninguno</button>
                      </div>
                    </div>

                    <div style={styles.ticketList}>
                      {ticketsPendientes.map((t) => (
                        <label key={t.id_ticket} style={styles.ticketRow}>
                          <input
                            type="checkbox"
                            checked={ticketsSeleccionados.includes(t.id_ticket)}
                            onChange={() => toggleTicket(t.id_ticket)}
                            style={styles.checkbox}
                          />
                          <div style={styles.ticketInfo}>
                            <span style={styles.ticketId}>Ticket #{t.id_ticket}</span>
                            <span style={styles.ticketDate}>{new Date(t.fecha).toLocaleDateString('es-AR')}</span>
                          </div>
                          <span style={styles.ticketTotal}>${parseFloat(t.total).toFixed(2)}</span>
                        </label>
                      ))}
                    </div>

                    {ticketsSeleccionados.length > 0 && (
                      <div style={styles.totalRow}>
                        <span>Total seleccionado:</span>
                        <span style={styles.totalAmount}>${totalSeleccionado.toFixed(2)}</span>
                      </div>
                    )}

                    <div style={styles.payField}>
                      <label style={styles.payLabel}>Monto a pagar</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={montoPago}
                        onChange={(e) => setMontoPago(e.target.value)}
                        placeholder="$ 0.00"
                        style={styles.payInput}
                      />
                    </div>

                    <div style={styles.payField}>
                      <label style={styles.payLabel}>Descripción (opcional)</label>
                      <input
                        type="text"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Ej: Pago en efectivo"
                        style={styles.payInput}
                      />
                    </div>

                    {montoPago && parseFloat(montoPago) > 0 && (
                      <div style={styles.paySummary}>
                        <div style={styles.paySummaryRow}>
                          <span>Saldo actual:</span>
                          <span>${parseFloat(clienteSeleccionado.saldo_cuenta_corriente).toFixed(2)}</span>
                        </div>
                        <div style={styles.paySummaryRow}>
                          <span>Pago:</span>
                          <span style={{ color: '#1294F2' }}>-${parseFloat(montoPago).toFixed(2)}</span>
                        </div>
                        <div style={styles.paySummaryRowTotal}>
                          <span>Nuevo saldo:</span>
                          <span style={{ color: (parseFloat(clienteSeleccionado.saldo_cuenta_corriente) - parseFloat(montoPago)) < 0 ? '#E53935' : '#1294F2' }}>
                            ${(parseFloat(clienteSeleccionado.saldo_cuenta_corriente) - parseFloat(montoPago)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <button onClick={registrarPago} disabled={procesando}
                      style={procesando ? styles.payBtnDisabled : styles.payBtn}>
                      {procesando ? 'Procesando...' : `Registrar Pago ($${montoPago || '0.00'})`}
                    </button>
                    {whatsappData && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <WhatsAppButton telefono={whatsappData.telefono} mensaje={whatsappData.mensaje} texto="Enviar comprobante por WhatsApp" />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* SECCIÓN ASOCIAR TICKET */}
            {clienteSeleccionado.es_cuenta_corriente && (
              <div style={styles.paySection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ ...styles.cardTitle, margin: 0 }}>Asociar Ticket</h3>
                  <button onClick={() => { setShowAsociar(!showAsociar); setBusquedaTickets(''); setTicketsDisponibles([]); }}
                    style={styles.selectBtn}>
                    {showAsociar ? 'Cerrar' : 'Buscar tickets'}
                  </button>
                </div>
                {showAsociar && (
                  <>
                    <div style={styles.payField}>
                      <input
                        type="text"
                        value={busquedaTickets}
                        onChange={(e) => buscarTicketsDisponibles(e.target.value)}
                        placeholder="Buscar por N° de ticket, monto o producto..."
                        style={styles.payInput}
                        autoFocus
                      />
                    </div>
                    {cargandoDisponibles && (
                      <p style={styles.loadingText}>Buscando tickets...</p>
                    )}
                    {!cargandoDisponibles && busquedaTickets && ticketsDisponibles.length === 0 && (
                      <p style={styles.emptyText}>No se encontraron tickets disponibles</p>
                    )}
                    {ticketsDisponibles.map((t) => (
                      <div key={t.id_ticket} style={styles.asociarTicketRow}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.8125rem' }}>
                            Ticket #{t.id_ticket} — ${parseFloat(t.total).toFixed(2)}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#667085', marginTop: '0.125rem' }}>
                            {new Date(t.fecha).toLocaleDateString('es-AR')} — {t.productos_info || 'Ver productos'}
                          </div>
                        </div>
                        <button
                          onClick={() => asociarTicket(t)}
                          disabled={asociandoTicket === t.id_ticket}
                          style={asociandoTicket === t.id_ticket ? styles.payBtnDisabled : styles.asociarBtn}>
                          {asociandoTicket === t.id_ticket ? '...' : 'Asociar'}
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            <button onClick={() => navigate('/ventas')} style={styles.sellBtn}>
              Ir a Ventas →
            </button>
          </div>
        )}
      </div>

      {/* MODAL NUEVO CLIENTE */}
      {showForm && (
        <div style={styles.overlay} onClick={() => { setShowForm(false); setEditingCliente(null); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => setShowForm(false)} style={styles.modalClose}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formRow} className="cc-form-row">
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Nombre *</label>
                  <input
                    type="text"
                    value={clienteForm.nombre}
                    onChange={(e) => setClienteForm({ ...clienteForm, nombre: e.target.value })}
                    placeholder="Nombre del cliente"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    value={clienteForm.email}
                    onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })}
                    placeholder="cliente@email.com"
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow} className="cc-form-row">
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Teléfono</label>
                  <input
                    type="text"
                    value={clienteForm.telefono}
                    onChange={(e) => setClienteForm({ ...clienteForm, telefono: e.target.value })}
                    placeholder="11-1234-5678"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Dirección</label>
                  <input
                    type="text"
                    value={clienteForm.direccion}
                    onChange={(e) => setClienteForm({ ...clienteForm, direccion: e.target.value })}
                    placeholder="Dirección del cliente"
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow} className="cc-form-row">
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Límite de crédito ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={clienteForm.limite_credito}
                    onChange={(e) => setClienteForm({ ...clienteForm, limite_credito: e.target.value })}
                    placeholder="0"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Cuenta Corriente</label>
                  <div style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={clienteForm.es_cuenta_corriente}
                      onChange={(e) => setClienteForm({ ...clienteForm, es_cuenta_corriente: e.target.checked })}
                      style={styles.formCheckbox}
                    />
                    <span style={styles.checkboxLabel}>Habilitar cuenta corriente</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => { setShowForm(false); setEditingCliente(null); }} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={guardarCliente} disabled={guardandoCliente}
                style={guardandoCliente ? styles.saveBtnDisabled : styles.saveBtn}>
                {guardandoCliente ? 'Guardando...' : (editingCliente ? 'Guardar Cambios' : 'Guardar Cliente')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '1rem 1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#273444', margin: 0 },
  subtitle: { fontSize: '0.875rem', color: '#667085', marginTop: '0.25rem' },
  backBtn: { padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid #E6EDF5', background: 'white', color: '#667085', fontSize: '0.8125rem', fontWeight: '500', cursor: 'pointer' },
  card: { background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '1rem', marginBottom: '1rem' },
  searchInput: { flex: 1, padding: '0.625rem 0.875rem', border: '1px solid #E6EDF5', borderRadius: '14px', fontSize: '0.875rem', outline: 'none' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1rem', alignItems: 'start' },
  listCard: { background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '1.25rem' },
  cardTitle: { fontSize: '0.8125rem', fontWeight: '600', color: '#273444', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.025em' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '500px', overflowY: 'auto' },
  clientRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '14px', border: '1px solid #f5f5f5', background: 'white', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s ease' },
  clientRowActive: { borderColor: '#1294F2', background: '#E8F4FD' },
  clientMain: { display: 'flex', flexDirection: 'column', gap: '0.125rem' },
  clientName: { fontWeight: '600', fontSize: '0.875rem', color: '#273444' },
  clientPhone: { fontSize: '0.75rem', color: '#667085' },
  clientRight: { display: 'flex', alignItems: 'center', gap: '0.375rem' },
  clientDebt: { fontWeight: '700', fontSize: '0.9375rem', color: '#FF6B35' },
  warningDot: { width: '20px', height: '20px', borderRadius: '50%', background: '#fef2f2', color: '#E53935', fontSize: '0.6875rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  editBtn: { width: '28px', height: '28px', borderRadius: '0.375rem', border: '1px solid #E6EDF5', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', flexShrink: 0 },
  detailCard: { background: 'white', borderRadius: '20px', border: '1px solid #E6EDF5', padding: '1.25rem', position: 'sticky', top: '72px' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' },
  detailField: { display: 'flex', flexDirection: 'column', gap: '0.125rem' },
  detailLabel: { fontSize: '0.6875rem', color: '#667085', textTransform: 'uppercase', fontWeight: '600' },
  detailValue: { fontSize: '0.875rem', color: '#273444', fontWeight: '500' },
  balanceSection: { padding: '1rem', background: '#fafafa', borderRadius: '14px', marginBottom: '1rem' },
  balanceRow: { display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.875rem', color: '#667085' },
  balanceAmount: { fontWeight: '700', color: '#FF6B35', fontSize: '1.125rem' },
  balanceLimit: { fontWeight: '600', color: '#273444' },
  progressBar: { height: '6px', background: '#E6EDF5', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
  alertBox: { marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem', color: '#E53935', fontSize: '0.8125rem', fontWeight: '600' },
  sellBtn: { width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #1294F2, #1294F2)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', marginTop: '0.75rem' },

  /* Pago */
  paySection: { padding: '1rem', background: '#E8F4FD', borderRadius: '14px', border: '1px solid #D0ECFF', marginBottom: '1rem' },
  loadingText: { fontSize: '0.8125rem', color: '#667085', textAlign: 'center', padding: '1rem 0' },
  emptyText: { fontSize: '0.8125rem', color: '#667085', textAlign: 'center', padding: '1rem 0' },
  ticketHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  ticketHeaderText: { fontSize: '0.75rem', fontWeight: '600', color: '#273444' },
  ticketActions: { display: 'flex', gap: '0.375rem' },
  selectBtn: { fontSize: '0.625rem', padding: '0.25rem 0.5rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '0.25rem', cursor: 'pointer', color: '#667085' },
  ticketList: { display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '160px', overflowY: 'auto', marginBottom: '0.75rem', background: 'white', borderRadius: '0.375rem', border: '1px solid #E6EDF5', padding: '0.25rem' },
  ticketRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.625rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8125rem', borderBottom: '1px solid #f5f5f5' },
  checkbox: { width: '16px', height: '16px', accentColor: '#1294F2', flexShrink: 0 },
  ticketInfo: { flex: 1, display: 'flex', justifyContent: 'space-between' },
  ticketId: { fontWeight: '600', color: '#273444' },
  ticketDate: { color: '#667085', fontSize: '0.75rem' },
  ticketTotal: { fontWeight: '700', color: '#FF6B35' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid #D0ECFF', fontSize: '0.875rem', fontWeight: '600', color: '#273444' },
  totalAmount: { fontWeight: '800', color: '#1294F2', fontSize: '1rem' },
  payField: { marginBottom: '0.625rem' },
  payLabel: { display: 'block', fontSize: '0.6875rem', fontWeight: '600', color: '#273444', marginBottom: '0.25rem', textTransform: 'uppercase' },
  payInput: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' },
  paySummary: { padding: '0.625rem', background: 'white', borderRadius: '0.375rem', border: '1px solid #E6EDF5', marginBottom: '0.75rem' },
  paySummaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#667085', padding: '0.125rem 0' },
  paySummaryRowTotal: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', fontWeight: '700', color: '#273444', borderTop: '1px solid #E6EDF5', paddingTop: '0.375rem', marginTop: '0.25rem' },
  payBtn: { width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #1294F2, #1294F2)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(18, 148, 242, 0.3)' },
  payBtnDisabled: { width: '100%', padding: '0.75rem', background: '#667085', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '0.875rem', cursor: 'not-allowed' },

  /* Búsqueda + Nuevo Cliente */
  searchRow: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  newClientBtn: {
    padding: '0.625rem 1rem', background: 'linear-gradient(135deg, #1294F2, #1294F2)',
    color: 'white', border: 'none', borderRadius: '14px', fontWeight: '600',
    fontSize: '0.8125rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  },

  /* Modal */
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'white', borderRadius: '20px', width: '90%', maxWidth: '520px',
    overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.25rem', borderBottom: '1px solid #E6EDF5',
  },
  modalTitle: { fontSize: '1rem', fontWeight: '600', color: '#273444', margin: 0 },
  modalClose: {
    width: '32px', height: '32px', borderRadius: '0.375rem', border: 'none',
    background: '#f5f5f5', color: '#667085', fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modalBody: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' },
  formField: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  formLabel: { fontSize: '0.6875rem', fontWeight: '600', color: '#273444', textTransform: 'uppercase' },
  formInput: {
    padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem',
    fontSize: '0.875rem', outline: 'none', color: '#273444',
  },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem' },
  formCheckbox: { width: '16px', height: '16px', accentColor: '#1294F2' },
  checkboxLabel: { fontSize: '0.8125rem', color: '#667085' },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
    padding: '1rem 1.25rem', borderTop: '1px solid #E6EDF5',
  },
  cancelBtn: {
    padding: '0.5rem 1rem', background: 'white', color: '#667085',
    border: '1px solid #d1d5db', borderRadius: '0.375rem', fontWeight: '500',
    fontSize: '0.8125rem', cursor: 'pointer',
  },
  saveBtn: {
    padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #1294F2, #1294F2)',
    color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '600',
    fontSize: '0.8125rem', cursor: 'pointer',
  },
  saveBtnDisabled: {
    padding: '0.5rem 1.25rem', background: '#667085',
    color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '600',
    fontSize: '0.8125rem', cursor: 'not-allowed',
  },
  asociarTicketRow: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem',
    background: 'white', borderRadius: '0.375rem', border: '1px solid #E6EDF5',
    marginBottom: '0.375rem',
  },
  asociarBtn: {
    padding: '0.375rem 0.75rem', background: '#1294F2', color: 'white',
    border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem',
    fontWeight: '600', cursor: 'pointer', flexShrink: 0,
  },
};

export default CuentasCorrientes;
