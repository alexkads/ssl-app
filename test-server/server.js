const https = require('https');
const fs = require('fs');
const path = require('path');

// Lendo certificados SSL reais
const privateKey = fs.readFileSync('./key.pem', 'utf8');
const certificate = fs.readFileSync('./cert.pem', 'utf8');

const options = {
  key: privateKey,
  cert: certificate
};

const server = https.createServer(options, (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;
  const method = req.method;

  console.log(`${method} ${url}`);

  res.setHeader('Content-Type', 'application/json');

  if (url === '/api/test' && method === 'GET') {
    const userAgent = req.headers['user-agent'] || '';
    const isAxios = userAgent.includes('axios');
    const library = isAxios ? 'Axios' : 'Fetch';
    
    res.writeHead(200);
    res.end(JSON.stringify({
      message: `Conexão SSL com certificado auto-assinado funcionando via ${library}!`,
      timestamp: new Date().toISOString(),
      method: 'GET',
      library: library,
      ssl_info: {
        certificate: 'self-signed',
        protocol: 'TLS 1.2',
        cipher: 'ECDHE-RSA-AES256-GCM-SHA384'
      },
      headers_received: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      }
    }));
  } else if (url === '/api/users' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        const library = userData.name?.includes('Axios') ? 'Axios' : 'Fetch';
        res.writeHead(200);
        res.end(JSON.stringify({
          message: `Usuário criado com sucesso via ${library}!`,
          user: userData,
          id: Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
          method: 'POST',
          library: library,
          ssl_info: {
            certificate: 'self-signed',
            protocol: 'TLS 1.2',
            cipher: 'ECDHE-RSA-AES256-GCM-SHA384'
          }
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          error: 'Invalid JSON'
        }));
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Endpoint não encontrado',
      url: url,
      method: method
    }));
  }
});

const PORT = 8443;
server.listen(PORT, () => {
  console.log(`🔒 Servidor SSL de teste rodando em https://localhost:${PORT}`);
  console.log('📝 Endpoints disponíveis:');
  console.log('   GET  /api/test');
  console.log('   POST /api/users');
  console.log('⚠️  Certificado auto-assinado - apenas para desenvolvimento!');
  console.log('📄 Certificados: key.pem, cert.pem');
});

module.exports = server; 