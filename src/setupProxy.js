const { createProxyMiddleware } = require('http-proxy-middleware');

const remoteBackend = 'https://cacmarcos.alwaysdata.net';
const localBackend = 'http://localhost:5000';

module.exports = function (app) {
  // MP QR va al backend local
  app.use(
    '/api/mercadopago',
    createProxyMiddleware({
      target: localBackend,
      changeOrigin: true,
      secure: false,
    })
  );

  // Facturación electrónica AFIP va al backend local
  app.use(
    '/api/facturacion',
    createProxyMiddleware({
      target: localBackend,
      changeOrigin: true,
      secure: false,
    })
  );

  // Endpoints nuevos de CC van al backend local (aún no deployados en remoto)
  app.use(
    '/api/clientes/tickets-disponibles',
    createProxyMiddleware({
      target: localBackend,
      changeOrigin: true,
      secure: false,
    })
  );

  app.use(
    '/api/clientes/buscar',
    createProxyMiddleware({
      target: localBackend,
      changeOrigin: true,
      secure: false,
    })
  );

  // Todo lo demás va al backend remoto (DB)
  app.use(
    '/api',
    createProxyMiddleware({
      target: remoteBackend,
      changeOrigin: true,
      secure: false,
    })
  );
};
