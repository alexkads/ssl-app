# SSL App - Plugin de Bypass SSL

Aplicação React Native/Expo demonstrando como fazer requisições HTTPS para servidores com certificados auto-assinados.

## 🔧 Funcionalidades

- ✅ Plugin personalizado para bypass de SSL
- ✅ Suporte completo para Android e iOS
- ✅ Hook React customizado para requisições SSL
- ✅ Servidor de teste incluído
- ✅ Interface demonstrativa

## 🚀 Instalação

1. Clone o repositório e instale as dependências:
```bash
npm install
```

2. Instale as dependências do plugin:
```bash
npm install @expo/config-plugins axios
```

3. Faça o prebuild do projeto:
```bash
npm run prebuild-clean
```

## 📱 Executando o App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Servidor de Teste
Em um terminal separado, execute:
```bash
npm run test-server
```

O servidor rodará em `https://localhost:8443` com certificado auto-assinado.

## 🔌 Plugin SSL Bypass

O plugin está localizado em `plugins/ssl-bypass/` e configura automaticamente:

### Android
- `android:usesCleartextTraffic="true"`
- Arquivo `network_security_config.xml`
- Permissões para localhost e IPs locais

### iOS
- `NSAllowsArbitraryLoads: true`
- `NSAllowsLocalNetworking: true`

## 💻 Uso dos Hooks

### Com Fetch (nativo)
```typescript
import useSSLRequest from '../plugins/ssl-bypass/src/useSSLRequest';

function MyComponent() {
  const { get, post } = useSSLRequest();

  const handleRequest = async () => {
    try {
      const response = await get('https://localhost:8443/api/test');
      console.log(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };
}
```

### Com Axios
```typescript
import useAxiosSSLRequest from '../plugins/ssl-bypass/src/useAxiosSSLRequest';

function MyComponent() {
  const { get, post } = useAxiosSSLRequest();

  const handleAxiosRequest = async () => {
    try {
      const response = await get('https://localhost:8443/api/test');
      console.log(response.data);
    } catch (error) {
      console.error('Erro Axios:', error);
    }
  };
}
```

## 🧪 Testando

1. Inicie o servidor de teste:
```bash
npm run test-server
```

2. Execute o app no emulador/dispositivo
3. Teste ambas as implementações:
   - **Fetch**: "Teste GET SSL (Fetch)" e "Teste POST SSL (Fetch)"
   - **Axios**: "Teste GET SSL (Axios)" e "Teste POST SSL (Axios)"
4. Compare as respostas e performance entre Fetch e Axios

## ⚠️ Aviso de Segurança

**IMPORTANTE**: Este plugin permite conexões SSL não seguras e deve ser usado apenas em:
- Desenvolvimento
- Ambientes de teste
- Redes controladas

**NÃO use em produção** sem entender completamente os riscos de segurança.

## 🛠️ Estrutura do Projeto

```
ssl-app/
├── plugins/ssl-bypass/          # Plugin customizado
│   ├── app.plugin.js           # Configuração principal
│   ├── src/                    
│   │   ├── useSSLRequest.ts    # Hook Fetch para requisições
│   │   ├── useAxiosSSLRequest.ts # Hook Axios para requisições
│   │   └── withAndroidNetworkConfig.js
│   └── README.md               # Documentação do plugin
├── test-server/                # Servidor de teste SSL
│   ├── server.js              # Servidor Node.js
│   └── package.json
├── app/                       # App Expo
└── ...
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o Expo
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run test-server` - Inicia servidor de teste SSL
- `npm run test-client` - Testa fetch e axios no servidor (Node.js)
- `npm run prebuild-clean` - Rebuild completo

## 🔍 Endpoints de Teste

- `GET /api/test` - Teste básico (disponível para Fetch e Axios)
- `POST /api/users` - Teste com dados (disponível para Fetch e Axios)

## 🆚 Fetch vs Axios

O app inclui testes comparativos entre duas implementações:

| Método | Vantagens | Desvantagens |
|--------|----------|-------------|
| **Fetch** | • Nativo (sem deps extras)<br>• Menor bundle<br>• Padrão web | • Mais código boilerplate<br>• Sem interceptors<br>• Tratamento manual de JSON |
| **Axios** | • Interceptors automáticos<br>• Melhor tratamento de erros<br>• JSON automático<br>• Timeout nativo | • Dependência externa (+13KB)<br>• Configuração extra |

## 📚 Documentação Adicional

- [Plugin SSL Bypass](./plugins/ssl-bypass/README.md) - Documentação detalhada do plugin
- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/) - Documentação oficial
