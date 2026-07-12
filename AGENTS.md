# Proyecto FrontendAppSuperMitre

## Stack
- React 19, react-scripts 5, MUI legacy, axios, jwt-decode, swiper, react-slick, qrcode.react
- API backend: `https://cacmarcos.alwaysdata.net` (remoto, lento ~30s)
- Backend local: `D:\Sistema-negocio\backendsupermitre` (solo para MercadoPago QR)
- Proxy en `src/setupProxy.js`: `/api/mercadopago` → localhost:5000, resto → Alwaysdata
- Branch: `feature/nuevos-cambios`

## Credenciales MercadoPago (producción)
- Access Token: `APP_USR-7412192151785251-071015-42ef68b274cb4226dfe5d935d03f6546-198809197`
- Public Key: `APP_USR-2095eb65-2212-48e1-b229-f5e0182d6414`
- User ID: `198809197` (MAMA4607975, Marcos Martin)
- Sucursal: `84636706` (Super Mitre, La Matanza)
- POS: `CAJA001` (pos_id `134993255`)

## Qué se hizo hoy (jueves 10 de julio 2026)

### Ventas (src/pages/Ventas.js)
- **Búsqueda unificada**: un solo input para código de barras y nombre. Enter busca, F1 enfoca.
- **Fix código de barras**: `String(p.codigo_barras) === termino` (era número vs string)
- **Alerta "no encontrado"**: cuando el código/nombre no matchea ningún producto
- **Productos al centro grandes**: nombre 1.25rem, precio 1.375rem, inputs más anchos
- **Layout full width**: eliminado `maxWidth: 1400px`, columna derecha 300px
- **Auto-scroll productos**: lista con `maxHeight: calc(100vh - 260px)` y `scrollBehavior: smooth`, ref para scroll automático al último producto
- **Pagos parciales contado**: si paga menos del total, muestra "Falta" y tipo `contado_parcial`
- **Pagos parciales CC**: campo "Entrega efectivo" para dividir entre efectivo y cuenta corriente
- **Ticket mejorado**: muestra N° de ticket (`Ticket N° 123`), badge `CONTADO PARCIAL` / `CC PARCIAL`, desglose de pago, saldo pendiente
- **Fix corte inferior ticket**: padding bottom `5mm` en `.ticket`
- **Bug fix `data` duplicada**: renombrado a `resTickets` en `handlePagoAprobado` y `emitirTicket`

### Cuentas Corrientes (src/pages/CuentasCorrientes.js) - REESCRITO COMPLETO
- **Tickets pendientes**: al seleccionar cliente, trae tickets con `GET /api/clientes/:id/tickets-pendientes`
- **Selección de tickets**: checkboxes para elegir qué tickets cancela el pago
- **Botones Todos/Ninguno**: selección rápida
- **Monto parcial o total**: input para monto a pagar
- **Preview de saldo**: muestra saldo actual, pago, nuevo saldo
- **Registrar pago**: `POST /api/clientes/:id/pago` con `tickets_pagados` array
- **Comprobante de pago**: imprime recibo térmico 80mm con: datos cliente, tickets cancelados, monto, saldo anterior/nuevo, N° recibo

### API (src/services/api.js)
- Agregado `clientesAPI.getResumen`, `clientesAPI.getTicketsPendientes`, `clientesAPI.registrarPago`

### GestionProductos (src/pages/GestionProductos.js)
- **Fix búsqueda**: `String(p.codigo_barras).includes(busqueda)` (mismo bug tipo)
- **Fix overflow**: eliminado `overflow: hidden` de page, formCard y inputs que cortaba botones

### Backend (D:\Sistema-negocio\backendsupermitre)
- Endpoints ya existentes y funcionales:
  - `GET /api/clientes/:id/tickets-pendientes` - filtra por `tipo_pago: 'cuenta_corriente'` y `estado: ['pendiente', 'pagado_parcial']`
  - `POST /api/clientes/:id/pago` - registra pago, actualiza saldo, marca tickets como `pagado_total`, genera N° recibo
  - `GET /api/clientes/:id/resumen` - resumen con movimientos
- Modelo Ticket: `tipo_pago` ENUM solo tiene `contado` y `cuenta_corriente` (no `cuenta_corriente_parcial`)
- Modelo Ticket: campo `estado` con ENUM `pendiente`, `pagado_parcial`, `pagado_total`
- Modelo MovimientoCuentaCorriente: campos `numero_recibo`, `tickets_pagados` (JSON)

## Pendiente para el domingo
- Verificar que los tickets creados con `tipo_pago: 'cuenta_corriente_parcial'` se guarden bien en la BD (el ENUM de Ticket solo tiene `contado` y `cuenta_corriente`)
- Posiblemente necesitar agregar `cuenta_corriente_parcial` y `contado_parcial` al ENUM de `tipo_pago` en el backend
- Testear flujo completo: venta CC parcial → pago parcial en Cuentas Corrientes → comprobante
- Deploy del frontend actualizado

## Archivos clave
- `src/pages/Ventas.js` - punto de venta (755 líneas)
- `src/pages/CuentasCorrientes.js` - gestión de CC con pagos (~340 líneas)
- `src/pages/GestionProductos.js` - ABM productos
- `src/services/api.js` - capa de API centralizada
- `src/components/QRModal.js` - modal pago QR MercadoPago
- `src/setupProxy.js` - proxy split backend local/remoto
- `backendsupermitre/routes/clientes.js` - rutas CC (pago, tickets-pendientes, resumen)
- `backendsupermitre/routes/tickets.js` - CRUD tickets
- `backendsupermitre/models/Ticket.js` - modelo ticket
- `backendsupermitre/models/MovimientoCuentaCorriente.js` - modelo movimientos CC
