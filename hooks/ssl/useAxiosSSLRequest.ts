import { useCallback, useMemo } from 'react';

// Import condicional do axios - será instalado via npm
let axios: any;
try {
  axios = require('axios');
} catch {
  console.warn('Axios não encontrado. Execute: npm install axios');
}

// Tipos básicos para axios
type AxiosInstance = any;
type AxiosRequestConfig = any;
type AxiosResponse = any;

interface AxiosSSLRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

interface AxiosSSLRequestResponse {
  data: any;
  status: number;
  headers: Record<string, string>;
  statusText: string;
}

export const useAxiosSSLRequest = () => {
  // Configuração personalizada do axios para SSL bypass
  const axiosInstance: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      timeout: 30000, // Aumentado para 30 segundos
      // Configurações específicas para desenvolvimento com SSL bypass
      validateStatus: (status: number) => status < 600, // Aceita qualquer status < 600
      maxRedirects: 5,
      // Headers padrão para melhor compatibilidade
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'ReactNative-Axios/SSL-Bypass'
      },
      // Configurações específicas para React Native
      // No React Native, o SSL bypass é feito via configurações nativas (Info.plist/network_security_config.xml)
    });

    // Interceptor de requisição
    instance.interceptors.request.use(
      (config: any) => {
        console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: any) => {
        console.error('[Axios] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor de resposta
    instance.interceptors.response.use(
      (response: any) => {
        console.log(`[Axios] Response ${response.status} from ${response.config.url}`);
        return response;
      },
      (error: any) => {
        if (error.response) {
          console.error(`[Axios] Response error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
          console.error('[Axios] No response received:', error.request);
        } else {
          console.error('[Axios] Request setup error:', error.message);
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  const makeRequest = useCallback(async (options: AxiosSSLRequestOptions): Promise<AxiosSSLRequestResponse> => {
    const {
      url,
      method = 'GET',
      headers = {},
      data,
      timeout = 10000
    } = options;

    try {
      const config: AxiosRequestConfig = {
        url,
        method: method.toLowerCase() as any,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout,
        data: data && method !== 'GET' ? data : undefined,
      };

      const response: AxiosResponse = await axiosInstance.request(config);

      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
        statusText: response.statusText,
      };
    } catch (error: any) {
      if (error.response) {
        // Erro com resposta do servidor
        throw new Error(`Axios SSL Request failed [${error.response.status}]: ${error.response.statusText}`);
      } else if (error.request) {
        // Erro de rede/conexão
        throw new Error(`Axios Network error: ${error.message}`);
      } else {
        // Erro de configuração
        throw new Error(`Axios Request setup error: ${error.message}`);
      }
    }
  }, [axiosInstance]);

  const get = useCallback((url: string, headers?: Record<string, string>) => 
    makeRequest({ url, method: 'GET', headers }), [makeRequest]);

  const post = useCallback((url: string, data?: any, headers?: Record<string, string>) => 
    makeRequest({ url, method: 'POST', data, headers }), [makeRequest]);

  const put = useCallback((url: string, data?: any, headers?: Record<string, string>) => 
    makeRequest({ url, method: 'PUT', data, headers }), [makeRequest]);

  const del = useCallback((url: string, headers?: Record<string, string>) => 
    makeRequest({ url, method: 'DELETE', headers }), [makeRequest]);

  const patch = useCallback((url: string, data?: any, headers?: Record<string, string>) => 
    makeRequest({ url, method: 'PATCH', data, headers }), [makeRequest]);

  return {
    makeRequest,
    get,
    post,
    put,
    delete: del,
    patch,
    // Instância axios diretamente para uso avançado
    axiosInstance,
  };
};

export default useAxiosSSLRequest; 