import { useCallback } from 'react';

interface SSLRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface SSLRequestResponse {
  data: any;
  status: number;
  headers: Record<string, string>;
}

export const useSSLRequest = () => {
  const makeRequest = useCallback(async (options: SSLRequestOptions): Promise<SSLRequestResponse> => {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      timeout = 30000 // Aumentado para 30 segundos
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[Fetch] Timeout atingido para ${url} após ${timeout}ms`);
      controller.abort();
    }, timeout);

    try {
      console.log(`[Fetch] Iniciando ${method} ${url}`);
      
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      };

      if (body && method !== 'GET') {
        config.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(url, config);
      
      clearTimeout(timeoutId);
      console.log(`[Fetch] Resposta recebida: ${response.status} de ${url}`);

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
      console.error(`[Fetch] Erro detalhado:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Fetch timeout após ${timeout}ms para ${url}`);
        } else if (error.message.includes('Network request failed')) {
          throw new Error(`Erro de rede: Verifique se o servidor está acessível em ${url}`);
        } else if (error.message.includes('SSL')) {
          throw new Error(`Erro SSL: Certificado rejeitado para ${url}`);
        }
      }
      
      throw new Error(`Fetch falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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

export default useSSLRequest; 