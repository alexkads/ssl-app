#!/usr/bin/env node

const https = require('https');
const axios = require('axios');

// Configuração para aceitar certificados auto-assinados (APENAS PARA DESENVOLVIMENTO)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Configuração do axios para SSL bypass
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 5000
});

async function testFetch() {
  console.log('\n🔍 Testando com FETCH...');
  try {
    const response = await fetch('https://localhost:8443/api/test', {
      agent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    const data = await response.json();
    console.log('✅ Fetch successful:', data);
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
}

async function testAxios() {
  console.log('\n🔍 Testando com AXIOS...');
  try {
    const response = await axiosInstance.get('https://localhost:8443/api/test');
    console.log('✅ Axios successful:', response.data);
  } catch (error) {
    console.error('❌ Axios error:', error.message);
  }
}

async function testPost() {
  console.log('\n🔍 Testando POST com ambos...');
  
  // Test Fetch POST
  try {
    const fetchResponse = await fetch('https://localhost:8443/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Usuario Fetch',
        email: 'fetch@test.com'
      }),
      agent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    const fetchData = await fetchResponse.json();
    console.log('✅ Fetch POST successful:', fetchData);
  } catch (error) {
    console.error('❌ Fetch POST error:', error.message);
  }

  // Test Axios POST
  try {
    const axiosResponse = await axiosInstance.post('https://localhost:8443/api/users', {
      name: 'Usuario Axios',
      email: 'axios@test.com'
    });
    console.log('✅ Axios POST successful:', axiosResponse.data);
  } catch (error) {
    console.error('❌ Axios POST error:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Testando conexões SSL com certificado auto-assinado...');
  
  await testFetch();
  await testAxios();
  await testPost();
  
  console.log('\n✨ Testes concluídos!');
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testFetch, testAxios, testPost }; 