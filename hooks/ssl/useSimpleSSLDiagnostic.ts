import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

interface SimpleTestResult {
  url: string;
  success: boolean;
  error?: string;
  responseTime: number;
  statusCode?: number;
}

export const useSimpleSSLDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimpleTestResult[]>([]);

  const getTestUrls = useCallback(() => {
    const urls = [
      'https://localhost:8443',
      'https://127.0.0.1:8443',
      'https://192.168.0.18:8443',
    ];

    if (Platform.OS === 'android') {
      urls.unshift('https://10.0.2.2:8443');
    }

    return urls;
  }, []);

  const testSingleUrl = useCallback(async (url: string): Promise<SimpleTestResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`[Simple Diagnostic] Testando: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`[Simple Diagnostic] Timeout para: ${url}`);
        controller.abort();
      }, 10000);

      const response = await fetch(`${url}/api/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      console.log(`[Simple Diagnostic] ${url} respondeu em ${responseTime}ms com status ${response.status}`);

      return {
        url,
        success: response.ok,
        responseTime,
        statusCode: response.status,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error(`[Simple Diagnostic] Erro em ${url}:`, error);
      
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout (10s)';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Falha de rede';
        } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
          errorMessage = 'Erro de certificado SSL';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        url,
        success: false,
        error: errorMessage,
        responseTime,
      };
    }
  }, []);

  const runSimpleDiagnostic = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      console.log('[Simple Diagnostic] Iniciando diagnóstico simples...');
      const testUrls = getTestUrls();
      const testResults: SimpleTestResult[] = [];

      // Testa uma URL por vez para melhor debugging
      for (const url of testUrls) {
        const result = await testSingleUrl(url);
        testResults.push(result);
        setResults(prev => [...prev, result]); // Atualiza em tempo real
      }

      console.log('[Simple Diagnostic] Diagnóstico concluído:', testResults);
      return testResults;
    } catch (error) {
      console.error('[Simple Diagnostic] Erro geral:', error);
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, [getTestUrls, testSingleUrl]);

  const generateSimpleReport = useCallback((results: SimpleTestResult[]): string => {
    let report = '🔍 DIAGNÓSTICO SSL SIMPLES\n\n';
    
    report += `📱 Plataforma: ${Platform.OS}\n`;
    report += `📊 URLs testadas: ${results.length}\n\n`;

    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = `${result.responseTime}ms`;
      
      report += `${status} ${result.url} (${time})`;
      
      if (result.statusCode) {
        report += ` - HTTP ${result.statusCode}`;
      }
      
      if (result.error) {
        report += ` - ${result.error}`;
      }
      
      report += '\n';
    });

    const successCount = results.filter(r => r.success).length;
    report += `\n📈 Sucessos: ${successCount}/${results.length}\n`;

    if (successCount === 0) {
      report += '\n💡 POSSÍVEIS SOLUÇÕES:\n';
      report += '1. Verifique se o servidor está rodando: npm run test-server\n';
      report += '2. Execute: npx expo prebuild --clean\n';
      report += '3. Reinicie o app\n';
      
      if (Platform.OS === 'android') {
        report += '4. Android: Verifique network_security_config.xml\n';
      } else {
        report += '4. iOS: Verifique configurações ATS\n';
      }
    } else if (successCount < results.length) {
      report += '\n💡 Algumas URLs falharam - isso é normal\n';
      report += 'Use a URL que funcionou para seus testes\n';
    } else {
      report += '\n🎉 Todas as URLs funcionando!\n';
      report += 'SSL bypass configurado corretamente\n';
    }

    return report;
  }, []);

  return {
    isRunning,
    results,
    runSimpleDiagnostic,
    generateSimpleReport,
    testSingleUrl,
  };
};

export default useSimpleSSLDiagnostic;