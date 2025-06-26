import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

interface SSLDiagnosticResult {
  url: string;
  success: boolean;
  error?: string;
  responseTime: number;
  library: string;
  statusCode?: number;
  details?: any;
}

interface SSLDiagnosticReport {
  totalTests: number;
  successCount: number;
  failureCount: number;
  results: SSLDiagnosticResult[];
  recommendations: string[];
  platformInfo: {
    os: string;
    version: string | number;
  };
}

export const useSSLDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<SSLDiagnosticReport | null>(null);

  // URLs de teste baseadas na plataforma
  const getTestUrls = useCallback(() => {
    const baseUrls = [
      'https://localhost:8443',
      'https://127.0.0.1:8443',
      'https://192.168.0.18:8443', // IP local comum
    ];

    if (Platform.OS === 'android') {
      baseUrls.unshift('https://10.0.2.2:8443'); // Android emulator
      baseUrls.push('https://10.0.3.2:8443'); // Android emulator alternativo
    }

    return baseUrls;
  }, []);

  // Teste básico de conectividade (sem SSL)
  const testBasicConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[SSL Diagnostic] Testando conectividade básica...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await fetch('https://www.google.com', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response.ok;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('[SSL Diagnostic] Conectividade básica falhou:', error);
      return false;
    }
  }, []);

  // Teste de SSL para uma URL específica
  const testSSLUrl = useCallback(async (
    url: string, 
    library: 'fetch' | 'axios' = 'fetch'
  ): Promise<SSLDiagnosticResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`[SSL Diagnostic] Testando ${library.toUpperCase()}: ${url}`);
      
      let response: any;
      
      if (library === 'fetch') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        try {
          response = await fetch(`${url}/api/test`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': 'SSL-Diagnostic-Fetch',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          const data = await response.text();
          let parsedData;
          try {
            parsedData = JSON.parse(data);
          } catch {
            parsedData = data;
          }
          
          return {
            url,
            success: response.ok,
            responseTime: Date.now() - startTime,
            library: 'fetch',
            statusCode: response.status,
            details: parsedData,
          };
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } else {
        // Teste com Axios (se disponível)
        try {
          // Import condicional para evitar erro se axios não estiver disponível
          let axios: any;
          try {
            axios = require('axios');
          } catch {
            throw new Error('Axios não está disponível');
          }
          
          const axiosResponse = await axios.get(`${url}/api/test`, {
            timeout: 15000,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'SSL-Diagnostic-Axios',
            },
            validateStatus: (status: number) => status < 600,
          });
          
          return {
            url,
            success: axiosResponse.status < 400,
            responseTime: Date.now() - startTime,
            library: 'axios',
            statusCode: axiosResponse.status,
            details: axiosResponse.data,
          };
        } catch (axiosError: any) {
          if (axiosError.response) {
            return {
              url,
              success: false,
              error: `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
              responseTime: Date.now() - startTime,
              library: 'axios',
              statusCode: axiosError.response.status,
            };
          }
          throw axiosError;
        }
      }
    } catch (error: any) {
      console.error(`[SSL Diagnostic] Erro em ${url}:`, error);
      
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout - Servidor não respondeu';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Falha de rede - Servidor inacessível';
        } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
          errorMessage = 'Erro de certificado SSL - Certificado rejeitado';
        } else if (error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Conexão recusada - Servidor offline';
        } else if (error.message.includes('ETIMEDOUT')) {
          errorMessage = 'Timeout de conexão';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        url,
        success: false,
        error: errorMessage,
        responseTime: Date.now() - startTime,
        library,
      };
    }
  }, []);

  // Executa diagnóstico completo
  const runDiagnostic = useCallback(async (): Promise<SSLDiagnosticReport> => {
    setIsRunning(true);
    console.log('[SSL Diagnostic] Iniciando diagnóstico completo...');
    
    try {
      const results: SSLDiagnosticResult[] = [];
      const recommendations: string[] = [];
      
      // Teste de conectividade básica
      const hasBasicConnectivity = await testBasicConnectivity();
      if (!hasBasicConnectivity) {
        recommendations.push('⚠️ Sem conectividade básica com a internet');
        recommendations.push('🔧 Verifique sua conexão de rede');
      }
      
      // Testa todas as URLs com fetch
      const testUrls = getTestUrls();
      for (const url of testUrls) {
        try {
          console.log(`[SSL Diagnostic] Testando ${url} com Fetch...`);
          const fetchResult = await testSSLUrl(url, 'fetch');
          results.push(fetchResult);
          console.log(`[SSL Diagnostic] Fetch resultado:`, fetchResult);
        } catch (error) {
          console.error(`[SSL Diagnostic] Erro no teste Fetch para ${url}:`, error);
          results.push({
            url,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido no Fetch',
            responseTime: 0,
            library: 'fetch',
          });
        }
        
        // Também testa com Axios se disponível
        try {
          console.log(`[SSL Diagnostic] Testando ${url} com Axios...`);
          const axiosResult = await testSSLUrl(url, 'axios');
          results.push(axiosResult);
          console.log(`[SSL Diagnostic] Axios resultado:`, axiosResult);
        } catch (error) {
          console.log(`[SSL Diagnostic] Axios não disponível ou falhou para ${url}:`, error);
          // Não adiciona erro para Axios se não estiver disponível
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      // Gera recomendações baseadas nos resultados
      if (failureCount > 0) {
        recommendations.push('🔒 Problemas de SSL detectados');
        
        const sslErrors = results.filter(r => r.error?.includes('SSL') || r.error?.includes('certificate'));
        if (sslErrors.length > 0) {
          recommendations.push('📱 Execute: npx expo prebuild --clean');
          recommendations.push('🔧 Verifique se o plugin SSL bypass está ativo');
          if (Platform.OS === 'android') {
            recommendations.push('🤖 Android: Verifique network_security_config.xml');
          } else {
            recommendations.push('🍎 iOS: Verifique configurações ATS no Info.plist');
          }
        }
        
        const networkErrors = results.filter(r => r.error?.includes('rede') || r.error?.includes('inacessível'));
        if (networkErrors.length > 0) {
          recommendations.push('🌐 Verifique se o servidor de teste está rodando');
          recommendations.push('▶️ Execute: npm run test-server');
        }
        
        const timeoutErrors = results.filter(r => r.error?.includes('Timeout'));
        if (timeoutErrors.length > 0) {
          recommendations.push('⏱️ Problema de timeout - servidor muito lento');
          recommendations.push('🔄 Tente aumentar o timeout nas configurações');
        }
      } else {
        recommendations.push('✅ Todas as conexões SSL funcionando corretamente!');
        recommendations.push('🎉 Plugin SSL bypass configurado com sucesso');
      }
      
      const report: SSLDiagnosticReport = {
        totalTests: results.length,
        successCount,
        failureCount,
        results,
        recommendations,
        platformInfo: {
          os: Platform.OS,
          version: Platform.Version,
        },
      };
      
      setReport(report);
      console.log('[SSL Diagnostic] Diagnóstico concluído:', report);
      
      return report;
    } finally {
      setIsRunning(false);
    }
  }, [testBasicConnectivity, testSSLUrl, getTestUrls]);

  // Gera relatório formatado
  const generateReport = useCallback((report: SSLDiagnosticReport): string => {
    let output = '🔍 RELATÓRIO DE DIAGNÓSTICO SSL\n\n';
    
    output += `📱 Plataforma: ${report.platformInfo.os} ${report.platformInfo.version}\n`;
    output += `📊 Testes: ${report.successCount}/${report.totalTests} sucessos\n\n`;
    
    // Resultados por URL
    const urlGroups = report.results.reduce((groups, result) => {
      if (!groups[result.url]) groups[result.url] = [];
      groups[result.url].push(result);
      return groups;
    }, {} as Record<string, SSLDiagnosticResult[]>);
    
    Object.entries(urlGroups).forEach(([url, results]) => {
      output += `🌐 ${url}\n`;
      results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        const time = `${result.responseTime}ms`;
        const lib = result.library.toUpperCase();
        output += `   ${status} ${lib} (${time})`;
        if (result.error) {
          output += ` - ${result.error}`;
        } else if (result.statusCode) {
          output += ` - HTTP ${result.statusCode}`;
        }
        output += '\n';
      });
      output += '\n';
    });
    
    // Recomendações
    output += '💡 RECOMENDAÇÕES:\n';
    report.recommendations.forEach(rec => {
      output += `${rec}\n`;
    });
    
    return output;
  }, []);

  return {
    isRunning,
    report,
    runDiagnostic,
    generateReport,
    testSSLUrl,
  };
};

export default useSSLDiagnostic;