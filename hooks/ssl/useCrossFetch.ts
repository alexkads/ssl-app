import { useCallback } from 'react';

// Import condicional do cross-fetch
let fetch: any;
try {
  fetch = require('cross-fetch');
  console.log('[CrossFetch] Biblioteca cross-fetch carregada com sucesso');
} catch {
  console.warn('cross-fetch não encontrado. Execute: npm install cross-fetch');
  // Fallback para fetch nativo
  fetch = global.fetch;
}

interface CrossFetchRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface CrossFetchRequestResponse {
  data: any;
  status: number;
  headers: Record<string, string>;
}

export const useCrossFetch = () => {
  const makeRequest = useCallback(async (options: CrossFetchRequestOptions): Promise<CrossFetchRequestResponse> => {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      timeout = 30000 // Aumentado para 30 segundos
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[CrossFetch] Timeout atingido para ${url} após ${timeout}ms`);
      controller.abort();
    }, timeout);

    try {
      console.log(`[CrossFetch] Iniciando ${method} ${url}`);
      
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'CrossFetch/ReactNative',
          ...headers,
        },
        signal: controller.signal,
      };

      if (body && method !== 'GET') {
        config.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(url, config);
      
      clearTimeout(timeoutId);
      console.log(`[CrossFetch] Resposta recebida: ${response.status} de ${url}`);

      const responseData = await response.text();
      let parsedData;
      
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      return {
        data: parsedData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[CrossFetch] Erro detalhado:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`CrossFetch timeout após ${timeout}ms para ${url}`);
        } else if (error.message.includes('Network request failed')) {
          throw new Error(`CrossFetch: Erro de rede para ${url}`);
        } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
          throw new Error(`CrossFetch: Erro de certificado SSL para ${url}`);
        } else if (error.message.includes('ECONNREFUSED')) {
          throw new Error(`CrossFetch: Conexão recusada para ${url}`);
        } else if (error.message.includes('ETIMEDOUT')) {
          throw new Error(`CrossFetch: Timeout de conexão para ${url}`);
        }
      }
      
      throw new Error(`CrossFetch falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, []);

  const get = useCallback((url: string, headers?: Record<string, string>) => 
    makeRequest({ url, method: 'GET', headers }), [makeRequest]);

  const post = useCallback((url: string, body?: any, headers?: Record<string, string>) => 
    makeRequest({ url, method: 'POST', body, headers }), [makeRequest]);

  const put = useCallback((url: string, body?: any, headers?: Record<string, string>) => 
    makeRequest({ url, method: 'PUT', body, headers }), [makeRequest]);

  const del = useCallback((url: string, headers?: Record<string, string>) => 
    makeRequest({ url, method: 'DELETE', headers }), [makeRequest]);

  return {
    makeRequest,
    get,
    post,
    put,
    delete: del,
  };
};

export default useCrossFetch; 