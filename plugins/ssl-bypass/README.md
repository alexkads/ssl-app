# SSL Bypass Plugin (ESM)

Plugin moderno usando **ECMAScript modules (.mjs)** para permitir requisições SSL com certificados auto-assinados em aplicações Expo/React Native.

## 🎯 **Características**
- ✅ **ECMAScript Modules**: Sintaxe moderna `import/export`
- ✅ **Zero Dependencies**: Sem TypeScript ou ferramentas extras
- ✅ **Limpo e Simples**: Apenas um arquivo `.mjs`
- ✅ **Node.js Moderno**: Compatível com Node 14+

## Instalação

1. Certifique-se de que o plugin está na pasta `plugins/ssl-bypass/`
2. Adicione o plugin ao seu `app.json`:

```json
{
  "expo": {
    "plugins": [
      "./plugins/ssl-bypass/app.plugin.mjs"
    ]
  }
}
```

## Configuração

### Android
O plugin configura automaticamente:
- `android:usesCleartextTraffic="true"` no AndroidManifest.xml
- Arquivo `network_security_config.xml` com configurações para aceitar certificados auto-assinados
- Permissões para localhost e IPs locais

### iOS
O plugin configura automaticamente:
- `NSAllowsArbitraryLoads: true` no Info.plist
- `NSAllowsLocalNetworking: true` no Info.plist

## Uso

### Hook useSSLRequest (Fetch)

```typescript
import { useSSLRequest } from '../plugins/ssl-bypass/src/useSSLRequest';

function MyComponent() {
  const { get, post, makeRequest } = useSSLRequest();

  const handleRequest = async () => {
    try {
      // GET request
      const response = await get('https://localhost:8443/api/data');
      console.log(response.data);

      // POST request
      const postResponse = await post('https://localhost:8443/api/users', {
        name: 'João',
        email: 'joao@example.com'
      });

      // Request customizada
      const customResponse = await makeRequest({
        url: 'https://localhost:8443/api/custom',
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer token123',
          'Custom-Header': 'value'
        },
        body: { data: 'exemplo' },
        timeout: 5000
      });
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };
}
```

### Hook useAxiosSSLRequest (Axios)

```typescript
import { useAxiosSSLRequest } from '../plugins/ssl-bypass/src/useAxiosSSLRequest';

function MyComponent() {
  const { get, post, axiosInstance } = useAxiosSSLRequest();

  const handleAxiosRequest = async () => {
    try {
      // GET request
      const response = await get('https://localhost:8443/api/data');
      console.log(response.data);

      // POST request
      const postResponse = await post('https://localhost:8443/api/users', {
        name: 'João',
        email: 'joao@example.com'
      });

      // Usando instância axios diretamente
      const directResponse = await axiosInstance({
        url: 'https://localhost:8443/api/custom',
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer token123'
        },
        data: { example: 'data' }
      });
    } catch (error) {
      console.error('Erro na requisição Axios:', error);
    }
  };
}
```

### Métodos disponíveis

#### useSSLRequest (Fetch)
- `get(url, headers?)` - Requisição GET
- `post(url, body?, headers?)` - Requisição POST
- `put(url, body?, headers?)` - Requisição PUT
- `delete(url, headers?)` - Requisição DELETE
- `makeRequest(options)` - Requisição customizada

#### useAxiosSSLRequest (Axios)
- `get(url, headers?)` - Requisição GET
- `post(url, data?, headers?)` - Requisição POST
- `put(url, data?, headers?)` - Requisição PUT
- `delete(url, headers?)` - Requisição DELETE
- `patch(url, data?, headers?)` - Requisição PATCH
- `makeRequest(options)` - Requisição customizada
- `axiosInstance` - Instância axios configurada

### Opções de makeRequest

```typescript
interface SSLRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number; // em milissegundos, padrão: 10000
}
```

## Instalação do Axios (Opcional)

Para usar o hook Axios, instale a dependência:

```bash
npm install axios
```

## Rebuild

Após adicionar o plugin, você precisa fazer rebuild do projeto:

```bash
# Instalar dependências
npm install

# Limpar cache
expo prebuild --clean

# Para Android
expo run:android

# Para iOS
expo run:ios
```

## Aviso de Segurança

⚠️ **ATENÇÃO**: Este plugin permite conexões SSL não seguras e deve ser usado apenas em desenvolvimento ou em ambientes controlados. Não use em produção sem entender os riscos de segurança envolvidos.

## Comparação: Fetch vs Axios

| Característica | Fetch (nativo) | Axios (biblioteca) |
|---|---|---|
| **Tamanho** | Nativo (0 KB) | ~13 KB |
| **Interceptors** | ❌ | ✅ |
| **Timeout automático** | ❌ | ✅ |
| **JSON automático** | Manual | Automático |
| **Tratamento de erro** | Manual | Automático |
| **Request/Response transform** | ❌ | ✅ |
| **Cancelamento** | AbortController | CancelToken |

## Domínios permitidos por padrão

- `localhost`
- `127.0.0.1`
- `10.0.2.2` (Android emulator)
- `10.0.3.2` (Android emulator alternative)

Para adicionar outros domínios, modifique o arquivo `app.plugin.mjs`.

## 🚀 **Plugin ESM Moderno**

### **Vantagens da abordagem ESM:**
- ✅ **Sintaxe moderna** `import/export`
- ✅ **Sem dependências extras** (TypeScript, ts-node, etc.)
- ✅ **Compatibilidade nativa** com Node.js 14+
- ✅ **Código limpo** em um único arquivo
- ✅ **Performance melhor** com carregamento assíncrono

### **Estrutura Simplificada:**
```
plugins/ssl-bypass/
├── 🎯 app.plugin.mjs       # Plugin principal ESM
├── 📦 index.mjs            # Exportações
├── 📦 package.json         # Config ESM
├── src/
│   ├── 🔧 useSSLRequest.ts     # Hook Fetch
│   └── 🔧 useAxiosSSLRequest.ts # Hook Axios  
└── 📚 README.md
```

### **Saída do Plugin:**
```
🎯 SSL Plugin: Carregando versão ESM (.mjs)
``` 