const http = require('http');
const httpProxy = require('http-proxy');
const FormData = require('form-data');

const proxy = httpProxy.createProxyServer({});
const server = http.createServer((req, res) => {
  if (req.url === '/upload' && req.method === 'POST') {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      // Forward file chunks to another server
      const formData = new FormData();
      formData.append('file', data);
      const requestOptions = {
        host: 'another-server.com',
        port: 80,
        path: '/upload',
        method: 'POST',
        headers: formData.getHeaders(),
      };

      const proxyReq = http.request(requestOptions, (proxyRes) => {
        proxyRes.pipe(res);
      });

      formData.pipe(proxyReq);

      proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      });

      req.pipe(formData);
    });
  } else {
    proxy.web(req, res, { target: 'http://localhost:8081' });
  }
});

server.listen(8080, () => {
  console.log('Server running at http://localhost:8080/');
});
