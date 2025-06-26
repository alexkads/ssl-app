# SSL App - Solução para Certificados Autoassinados

## ✅ Problemas Resolvidos

Esta aplicação React Native Expo 53 foi configurada para funcionar com certificados SSL autoassinados em desenvolvimento.

### 🔧 Soluções Implementadas

1. **Plugin SSL Bypass** (`plugins/ssl-bypass/app.plugin.js`)
   - Configuração Android: `network_security_config.xml` e `usesCleartextTraffic`
   - Configuração iOS: Exceções ATS no `Info.plist`
   - Suporte a múltiplos IPs de desenvolvimento

2. **Hooks SSL Especializados**
   - `useSSLRequest.ts`: Fetch nativo com tratamento SSL
   - `useAxiosSSLRequest.ts`: Axios configurado para desenvolvimento
   - `useCrossFetch.ts`: Cross-fetch com suporte SSL
   - `useSSLDiagnostic.ts`: Diagnóstico automático com recomendações

3. **Interface de Teste**
   - Botão "SSL" para diagnóstico completo
   - Testes separados por biblioteca (Fetch, Axios, CrossFetch)
   - Relatórios detalhados com soluções

### 📱 Como Usar

#### 1. Iniciar o Servidor de Teste
```bash
npm run test-server
```

#### 2. Executar o App
```bash
# Android
npm run android

# iOS
npm run ios
```

#### 3. Testar SSL
- Abra o app no emulador/dispositivo
- Clique no botão "SSL" para diagnóstico completo
- Use os outros botões para testes específicos

### 🌐 URLs Testadas

O app testa automaticamente estas URLs:
- `https://localhost:8443` (padrão)
- `https://127.0.0.1:8443`
- `https://10.0.2.2:8443` (Android emulator)
- `https://10.0.3.2:8443` (Android emulator alternativo)
- `https://192.168.0.18:8443` (dispositivos físicos)

### 🔍 Comandos Úteis

```bash
# Rebuild com configurações SSL
npx expo prebuild --clean

# Verificar tipos
npx tsc --noEmit

# Lint
npm run lint

# Testar servidor
npm run test-server

# Testar cliente
npm run test-client
```

### 📊 Configurações Aplicadas

#### Android (`network_security_config.xml`)
- `cleartextTrafficPermitted="true"`
- Dominios permitidos: localhost, 127.0.0.1, 10.0.2.2, 10.0.3.2, 192.168.0.18
- Trust anchors: system + user certificates
- Debug overrides habilitados

#### iOS (`Info.plist`)
- `NSAllowsArbitraryLoads: true`
- `NSAllowsLocalNetworking: true`
- Exceções específicas para localhost e IPs locais
- TLS mínimo 1.0 para desenvolvimento

### 🚨 Importante

⚠️ **Esta configuração é APENAS para desenvolvimento!**

Para produção:
- Remova o plugin SSL bypass
- Use certificados válidos assinados por CA
- Configure HTTPS adequadamente
- Teste em ambiente de produção

### 🧪 Endpoints de Teste

O servidor de teste (`test-server/server.js`) fornece:

- `GET /api/test` - Teste básico de conectividade SSL
- `POST /api/users` - Teste de POST com dados JSON

### 📝 Logs e Debug

- Console do React Native: Logs detalhados de cada biblioteca
- Servidor: Logs de requisições recebidas
- App: Relatórios de diagnóstico com recomendações

### 🔄 Troubleshooting

Se houver problemas:

1. Execute `npx expo prebuild --clean`
2. Reinicie o servidor de teste
3. Use o botão "SSL" para diagnóstico
4. Verifique os logs do console
5. Teste conectividade básica primeiro

O diagnóstico automático identifica problemas comuns e oferece soluções específicas.