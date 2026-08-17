const express = require('express');
const { ThermalPrinter, CharacterSet } = require('node-thermal-printer');
const cors = require('cors');
const { execSync } = require('child_process');
const fs = require('fs');

const app = express();

const API_KEY = process.env.PRINT_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ PRINT_API_KEY no configurada. El servidor de impresión no tiene autenticación.');
}

function verificarAuth(req, res, next) {
  if (!API_KEY) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'API key requerida (Authorization: Bearer <api_key>)' });
  }

  const key = authHeader.replace('Bearer ', '').trim();
  if (key !== API_KEY) {
    return res.status(403).json({ error: 'API key inválida' });
  }

  next();
}

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5000'] }));
app.use(express.json({ limit: '5mb' }));

const PORT = process.env.PRINT_PORT || 3210;
const TIPO_IMPRESORA = 'epson';

function detectarImpresorasLinux() {
  const impresoras = [];

  try {
    const devs = fs.readdirSync('/dev').filter(f => f.startsWith('lp'));
    devs.forEach(d => {
      impresoras.push({ id: `/dev/${d}`, nombre: d, tipo: 'usb-lp' });
    });
  } catch {}

  try {
    if (fs.existsSync('/dev/usb/lp0') && !impresoras.find(p => p.id === '/dev/usb/lp0')) {
      impresoras.push({ id: '/dev/usb/lp0', nombre: 'usb/lp0', tipo: 'usb' });
    }
  } catch {}

  try {
    const stdout = execSync('lpstat -p 2>/dev/null', { encoding: 'utf-8', timeout: 3000 });
    stdout.split('\n').forEach(line => {
      const match = line.match(/^printer\s+(\S+)\s+/);
      if (match) {
        impresoras.push({ id: match[1], nombre: match[1], tipo: 'cups' });
      }
    });
  } catch {}

  try {
    const stdout = execSync(
      `lsusb 2>/dev/null | grep -iE "epson|star|bixolon|ceipt|pos|thermal|0x04b8|0x0525|0x0416" || true`,
      { encoding: 'utf-8', timeout: 3000 }
    );
    stdout.split('\n').filter(Boolean).forEach(line => {
      const match = line.match(/ID\s+([0-9a-f:]+)\s+(.+)/i);
      if (match) {
        const id = match[1];
        const nombre = match[2].trim();
        if (!impresoras.find(p => p.id === id)) {
          impresoras.push({ id, nombre, tipo: 'usb-raw' });
        }
      }
    });
  } catch {}

  return impresoras;
}

let configActiva = null;

function buildConfig(interfaz) {
  const base = {
    type: TIPO_IMPRESORA,
    characterSet: CharacterSet.ISO8859_15_LATIN,
    options: { timeout: 3000 },
  };

  if (!interfaz || interfaz === 'auto') {
    const impresoras = detectarImpresorasLinux();
    const preferida = impresoras.find(p => p.id === '/dev/usb/lp0')
      || impresoras.find(p => p.id === '/dev/lp0')
      || impresoras.find(p => p.tipo === 'usb-lp')
      || impresoras.find(p => p.tipo === 'cups')
      || impresoras[0];

    if (preferida) {
      base.interface = preferida.id;
    } else {
      base.interface = 'usb';
    }
  } else {
    base.interface = interfaz;
  }

  return base;
}

function htmlATexto(html) {
  let texto = html;

  const ticketMatch = texto.match(/<div class="ticket">([\s\S]*?)<\/div>\s*\n?<\/body>/);
  if (ticketMatch) texto = ticketMatch[1];

  texto = texto
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/span>/gi, '')
    .replace(/<\/strong>/gi, '')
    .replace(/<\/b>/gi, '')
    .replace(/<strong>/gi, '')
    .replace(/<b>/gi, '')
    .replace(/<[^>]+>/gi, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));

  texto = texto
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  return texto;
}

function textoAEscpos(printer, texto) {
  const lineas = texto.split('\n');
  const ANCHO = 48;

  lineas.forEach(linea => {
    const esHeader = /^SUPER MITRE/i.test(linea) ||
                     /^Ticket de Venta$/i.test(linea) ||
                     /^Comprobante de Pago$/i.test(linea) ||
                     /^FACTURA\s*\(cod/i.test(linea) ||
                     /^¡Gracias/i.test(linea);

    const esBadge = /PAGO PARCIAL|CUENTA CORRIENTE|MERCADOPAGO QR|RECIBO DE PAGO|^ARCA$|Comprobante Autorizado/i.test(linea);

    const esTotal = /^TOTAL:/i.test(linea) ||
                    /^Importe Total:/i.test(linea) ||
                    /^PAGO RECIBIDO:/i.test(linea) ||
                    /^SALDO PENDIENTE:/i.test(linea);

    const esSeparador = /^-{3,}$/.test(linea) || /^={3,}$/.test(linea);

    if (esSeparador) {
      printer.drawLine();
    } else if (esHeader) {
      printer.alignCenter();
      printer.bold(true);
      printer.setTextSize(1, 1);
      printer.println(linea);
      printer.setTextSize(0, 0);
      printer.bold(false);
      printer.alignLeft();
    } else if (esBadge) {
      printer.alignCenter();
      printer.bold(true);
      printer.invert(true);
      printer.println(` ${linea} `);
      printer.invert(false);
      printer.bold(false);
      printer.alignLeft();
    } else if (esTotal) {
      printer.bold(true);
      printer.setTextSize(1, 0);
      printer.println(linea);
      printer.setTextSize(0, 0);
      printer.bold(false);
    } else {
      const match = linea.match(/^(.{2,})(\s{2,})(.{2,})$/);
      if (match) {
        const izq = match[1].trim();
        const der = match[3].trim();
        const espacios = ANCHO - izq.length - der.length;
        printer.println(`${izq}${' '.repeat(Math.max(1, espacios))}${der}`);
      } else {
        printer.println(linea);
      }
    }
  });
}

app.get('/print/detect', verificarAuth, (req, res) => {
  const impresoras = detectarImpresorasLinux();
  res.json({
    impresoras,
    configActual: configActiva?.interface || 'auto',
  });
});

app.get('/print/health', verificarAuth, (req, res) => {
  res.json({
    status: 'ok',
    interface: configActiva?.interface || 'auto',
    type: configActiva?.type || TIPO_IMPRESORA,
  });
});

app.post('/print/set', verificarAuth, (req, res) => {
  const { interfaz } = req.body;
  if (!interfaz) {
    return res.status(400).json({ error: 'Se requiere "interfaz" (ej: "/dev/usb/lp0", "cups", "auto")' });
  }
  configActiva = buildConfig(interfaz);
  res.json({ success: true, interface: configActiva.interface });
});

app.post('/print', verificarAuth, async (req, res) => {
  const { html, texto } = req.body;

  if (!html && !texto) {
    return res.status(400).json({ error: 'Se requiere "html" o "texto"' });
  }

  try {
    if (!configActiva) {
      configActiva = buildConfig('auto');
    }

    const printer = new ThermalPrinter(configActiva);
    const isConnected = await printer.isReady();

    if (!isConnected) {
      return res.status(503).json({
        error: 'Impresora no conectada',
        interface: configActiva.interface,
        hint: 'Verificá permisos y conexión USB. GET /print/detect para ver opciones.',
      });
    }

    const contenido = texto || htmlATexto(html);

    printer.clear();
    printer.feed(1);
    textoAEscpos(printer, contenido);
    printer.cut();

    const execute = await printer.execute();
    if (execute) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Error al enviar a la impresora' });
    }
  } catch (err) {
    console.error('[PRINT] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║      SERVIDOR DE IMPRESIÓN - SUPER MITRE    ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Puerto: ${String(PORT).padEnd(36)}║`);
  console.log(`║  SO:     Linux                                ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  AUTH:   ${API_KEY ? 'API Key configurada'.padEnd(34) : '⚠ SIN AUTH'.padEnd(37)}║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  const impresoras = detectarImpresorasLinux();
  if (impresoras.length > 0) {
    console.log(' Impresoras encontradas:');
    impresoras.forEach(p => console.log(`   → ${p.nombre} [${p.id}] (${p.tipo})`));
  } else {
    console.log(' ⚠ No se detectaron impresoras.');
  }

  console.log('');
});
