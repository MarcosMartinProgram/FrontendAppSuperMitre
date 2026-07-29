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

## Facturación electrónica AFIP/ARCA (julio 2026) ✅ FUNCIONANDO EN PRODUCCIÓN
- **Estado**: CAE aprobado en producción. Primer comprobante autorizado: Factura C N° 5
- **CAE de prueba**: `86290616377865` (vence 20260730)
- **Bug crítico resuelto**: `parseXmlSimple` no leía tags sin namespace. AFIP devuelve `<CbteNro>4</CbteNro>` sin prefijo `ar:`, regex solo matcheaba `<ar:CbteNro>` → siempre leía 0 → enviaba comprobante #1 → error 10016
- **Fix**: regex adicional para tags `<Tag>valor</Tag>` sin namespace, con protección para no sobreescribir versión namespaced
- **Timezone**: `formatFechaComp()` y `formatFechaQR()` reciben `new Date()` (UTC) y restan 3h internamente. NUNCA pre-restar en el route
- **URL WSFE producción**: `https://servicios1.afip.gov.ar/wsfev1/service.asmx` (NO es `wsfe.afip.gov.ar` que da ENOTFOUND)
- **URL WSFE homologación**: `https://wswhomo.afip.gov.ar/wsfev1/service.asmx`
- **URL WSAA producción**: `https://wsaa.afip.gov.ar/ws/services/LoginCms`
- **QR AFIP**: generado con `qrcode` npm como data URL PNG embebido (no depende de servidor externo arca.gob.ar). Paquete `qrcode` instalado en Alwaysdata con `npm install`
- **Backend afipService.js**: TRA, WSAA auth, WSFE FECompUltimoAutorizado + FECAESolicitar, QR data URL, TA cache en disco
- **Backend routes/facturacion.js**: endpoints config, ultimo-comprobante, solicitar-cae, anular, test-wsaa
- **Frontend Ventas.js**: botón "Facturar (CAE)", ticket con CAE + QR AFIP embebido, badge CAE en modal
- **Proxy**: `/api/facturacion` → backend local (setupProxy.js)
- **Certificados homologación**: `/home/cacmarcos/www/appsupermitre/certs/homologacion/` (supermitre.crt + privada.key)
- **Certificados producción**: `/home/cacmarcos/www/appsupermitre/certs/produccion/` (supermitre_183515000a1d65eb.crt + privada.key)
- **Variables de entorno Alwaysdata** (producción activa):
  - `AFIP_CUIT=20304684012`
  - `AFIP_PTO_VTA=5` (punto de venta 5 para webservice)
  - `AFIP_MODE=produccion`
- **Habilitación en ARCA portal**: certificado `supermitre` (serie `183515000a1d65eb`) habilitado para WSFE en punto de venta 5
- **Cómo volver a homologación**: cambiar `AFIP_MODE=homologacion` y `AFIP_PTO_VTA=1` en Alwaysdata
- **Pendiente**: pasar a producción permanente cuando se confirme que todo funciona (ya está en produc)

### Plantilla Factura C (julio 2026) - Formato ticketera 80mm
- **Separador**: `generarTicketHTML` tiene 2 caminos: si `datosAfip` → Factura C (ARCA), si no → ticket genérico
- **Factura C SECCIÓN 1 - Encabezado Emisor**: "SUPER MITRE de MARTIN Marcos", Av. Bartolomé Mitre 430, "FACTURA (cod. 011) C" (C en recuadro), CUIT 20-30468401-2, Ing. Brutos, Inicio Actividades 01-09-2003, Condición IVA: Monotributo
- **Factura C SECCIÓN 2 - Datos Comprobante**: "FACTURA (cod. 011)", N° FAC-C-00005-00000008, Fecha DD/MM/AAAA
- **Factura C SECCIÓN 3 - Detalle Productos**: colDescripción | Tasa Iva | Subtotal. Fila: "Cant x P.Unitario" como auxiliar. Cada ítem: nombre, luego "Cant x $Precio | (21,00) | Subtotal"
- **Factura C SECCIÓN 4 - Totales**: Importe Total (negrita, derecha), Pagos: [medio], pagos parciales si aplica
- **Factura C SECCIÓN 5 - Pie ARCA**: QR embebido (data URL), CAE N°, Fecha Vto CAE, "ARCA" + "Comprobante Autorizado"
- **Régimen Transparencia Fiscal**: columna "Tasa Iva" obligatoria, formato `(21,00)` usando `alicuota_iva` del producto (default 21%)
- **Thermal printer fallback**: `print-server.js` `textoAEscpos` detecta headers "FACTURA (cod" y badges "ARCA", "Comprobante Autorizado" para formato ESC/POS
- **Reimprimir**: `reimprimirTicket` pasa `ptoVta: ticket.pto_venta || 5` (default PV 5 = producción)

## Pendiente para el domingo
- Verificar que los tickets creados con `tipo_pago: 'cuenta_corriente_parcial'` se guarden bien en la BD (el ENUM de Ticket solo tiene `contado` y `cuenta_corriente`)
- Posiblemente necesitar agregar `cuenta_corriente_parcial` y `contado_parcial` al ENUM de `tipo_pago` en el backend
- Testear flujo completo: venta CC parcial → pago parcial en Cuentas Corrientes → comprobante
- Deploy del frontend actualizado

## Rediseño de identidad visual (julio 2026)
- **Fuente**: Poppins (reemplaza DM Sans)
- **Paleta**: Azul como color principal (reemplaza verde)
  - Primary: `#1294F2`, Hover: `#0B89FF`
  - Navy: `#081B2E`, Secondary: `#163554`
  - Background: `#F5F8FC`, Card: `#FFFFFF`
  - Text: `#273444`, Text Light: `#667085`, Border: `#E6EDF5`
  - Éxito: `#1FB954`, Error: `#E53935`, Oferta: `#FF6B35`
- **Navbar**: fondo azul oscuro gradient, links blancos, brand icon azul
- **Footer**: fondo azul oscuro gradient, links azul claro
- **Cards**: border-radius 20px, sombra sutil azul
- **Botones**: gradient azul, border-radius 14px
- **Theme file**: `src/theme.js` con tokens centralizados
- **Logo**: `public/logo-sm.png`, **Favicon**: `public/favicon.png`
- **Video hero**: `public/video-institucional.mp4` (autoplay muted loop)

## Auditoría de seguridad y limpieza de logs (julio 2026)

### Auditoría completa (BackendAppSuperMitre)
- **Auth middleware**: `middleware/authMiddleware.js` con `verificarToken` y `verificarRol`
- **SQL injection**: corregido en `routes/reportes.js` (parámetros Sequelize), `migrate-tipo-pogo.js` (sin fallbacks hardcodeados)
- **Auth faltante**: agregado en `routes/productos.js`, `routes/clientes.js`, `routes/tickets.js`
- **Webhook FIRMA**: `controllers/webhookController.js` verifica HMAC-SHA256
- **Security headers**: CORS consolidado en `index.js`, sin helmet, headers manuales
- **Print server**: `print-server.js` protegido con `Authorization: Bearer <PRINT_API_KEY>`
- **Secrets**: credenciales nunca se commitean, `.env` ignorado, migrado a variables de entorno Alwaysdata

### Limpieza de logs sensibles (lunes 28 julio 2026) - commit `f1d2df0`
- **CRÍTICO - `services/afipService.js`**: eliminados dumps de XML SOAP con `Token`+`Sign` de AFIP (líneas 355, 461, 482, 499, 528). También eliminado `DocNro` en log de solicitud CAE y `Respuesta completa` en error WSAA.
- **`config/database.js`**: ya no logea `DB_HOST`, `DB_NAME`, `DB_USER` (solo muestra si password está configurada)
- **`routes/pedidosOnline.js`**: ya no logea `req.body` completo (solo `order_id`)
- **`routes/clientes.js`**: eliminadas ~50 líneas de debug verbose en `asociar-ticket` que exponían nombres, saldos, IDs. Demás logs reemplazados por `id_cliente` en vez de `cliente.nombre`
- **`controllers/mercadoPagoController.js`**: ya no logea `orderBody` completo (solo cantidad de items)
- **AGENTS.md y `.agents/`**: ignorados por git (`.gitignore`), no se suben a GitHub

### Variables de entorno Alwaysdata (producción)
| Variable | Valor | Dónde se usa |
|---|---|---|
| `SECRET_KEY` | Generada con `crypto.randomBytes(32).toString('hex')` | JWT auth |
| `ADMIN_CODE` | (sin definir aún) | Register de roles especiales |
| `AFIP_CUIT` | `20304684012` | WSFE |
| `AFIP_PTO_VTA` | `5` | Facturación |
| `AFIP_MODE` | `produccion` | AFIP |
| `MP_ONLINE_ACCESS_TOKEN` | (token prod) | MercadoPago online |
| `MP_QR_ACCESS_TOKEN` | (token prod) | MercadoPago QR |
| `DB_PASSWORD` | (password BD) | Conexión MySQL |
| `PRINT_API_KEY` | (clave print-server) | Print server auth |

### Cómo deployar cambios en Alwaysdata
```bash
# Backend
ssh cacmarcos@ssh-cacmarcos.alwaysdata.net
cd ~/www/appsupermitre
git pull
pm2 restart appsupermitre  # o reiniciar desde el panel

# Frontend
# Build local y subir a Alwaysdata via FTP / panel
```

## Archivos clave
- `src/pages/Ventas.js` - punto de venta (755 líneas)
- `src/pages/CuentasCorrientes.js` - gestión de CC con pagos (~340 líneas)
- `src/pages/GestionProductos.js` - ABM productos
- `src/services/api.js` - capa de API centralizada
- `src/components/QRModal.js` - modal pago QR MercadoPago
- `src/theme.js` - tokens de diseño centralizados (colores, fuentes, radios, sombras)
- `src/setupProxy.js` - proxy split backend local/remoto
- `backendsupermitre/routes/clientes.js` - rutas CC (pago, tickets-pendientes, resumen)
- `backendsupermitre/routes/tickets.js` - CRUD tickets
- `backendsupermitre/routes/facturacion.js` - rutas AFIP (solicitar-cae, ultimo-comprobante, anular)
- `backendsupermitre/services/afipService.js` - servicio AFIP (TRA, WSAA, WSFE, QR)
- `backendsupermitre/models/Ticket.js` - modelo ticket
- `backendsupermitre/models/MovimientoCuentaCorriente.js` - modelo movimientos CC
