import { useState } from 'react';
import { Alert, Button, Image, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAxiosSSLRequest } from '../../hooks/ssl/useAxiosSSLRequest';
import { useCrossFetch } from '../../hooks/ssl/useCrossFetch';
import { useSSLRequest } from '../../hooks/ssl/useSSLRequest';
import { useSSLDiagnostic } from '../../hooks/ssl/useSSLDiagnostic';
import { useSimpleSSLDiagnostic } from '../../hooks/ssl/useSimpleSSLDiagnostic';

export default function HomeScreen() {
  const { get, post } = useSSLRequest();
  const axiosSSL = useAxiosSSLRequest();
  const crossFetch = useCrossFetch();
  const { isRunning: diagnosticRunning, report, runDiagnostic, generateReport } = useSSLDiagnostic();
  const { 
    isRunning: simpleDiagnosticRunning, 
    results: simpleResults, 
    runSimpleDiagnostic, 
    generateSimpleReport 
  } = useSimpleSSLDiagnostic();
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState<string>('');

  // Função para obter a URL base correta dependendo da plataforma
  const getBaseUrl = () => {
    if (Platform.OS === 'android') {
      // Android emulador usa 10.0.2.2 para acessar o host
      return 'https://10.0.2.2:8443';
    } else if (Platform.OS === 'ios') {
      // iOS simulator pode usar localhost
      return 'https://localhost:8443';
    } else {
      // Web ou outras plataformas
      return 'https://localhost:8443';
    }
  };

  // URLs alternativas para teste
  const getAlternativeUrls = () => {
    const urls = [
      'https://localhost:8443',
      'https://127.0.0.1:8443',
      'https://10.0.2.2:8443',
      'https://10.0.3.2:8443',
      'https://192.168.0.18:8443' // IP da máquina host para dispositivos físicos
    ];
    return urls;
  };

  // Teste de conectividade HTTP simples (sem SSL) primeiro
  const testBasicConnectivity = async () => {
    setLoading(true);
    setRequestType('Conectividade Básica');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('[DEBUG] Timeout atingido (10s)');
    }, 10000); // 10 segundos timeout
    
    try {
      console.log('[DEBUG] Testando conectividade básica...');
      
      // Teste com Google para verificar conectividade geral (mais simples e confiável)
      const testUrl = 'https://www.google.com';
      console.log(`[DEBUG] Testando: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.text();
      setResponse(`✅ Conectividade OK!\n\nTeste em: ${testUrl}\n\nStatus: ${response.status}\n\nTamanho da resposta: ${data.length} bytes`);
      Alert.alert('Sucesso', 'Conectividade básica funcionando!');
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[DEBUG] Erro de conectividade:', error);
      
      let errorMsg = 'Erro desconhecido';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMsg = 'Timeout - Sem resposta em 10 segundos';
        } else {
          errorMsg = error.message;
        }
      }
      
      setResponse(`❌ Erro de conectividade: ${errorMsg}`);
      Alert.alert('Erro', `Problema de conectividade: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithUrl = async (url: string, endpoint: string, method: 'GET' | 'POST', useAxios: boolean = false, useCross: boolean = false) => {
    try {
      const library = useCross ? 'CrossFetch' : (useAxios ? 'Axios' : 'Fetch');
      console.log(`[DEBUG] Testando ${method} em ${url}${endpoint} com ${library}`);
      
      if (useCross) {
        if (method === 'GET') {
          const result = await crossFetch.get(`${url}${endpoint}`);
          return result;
        } else {
          const result = await crossFetch.post(`${url}${endpoint}`, {
            name: 'Usuário CrossFetch',
            email: 'crossfetch@example.com'
          });
          return result;
        }
      } else if (useAxios) {
        if (method === 'GET') {
          const result = await axiosSSL.get(`${url}${endpoint}`);
          return result;
        } else {
          const result = await axiosSSL.post(`${url}${endpoint}`, {
            name: 'Usuário Axios',
            email: 'axios@example.com'
          });
          return result;
        }
      } else {
        if (method === 'GET') {
          const result = await get(`${url}${endpoint}`);
          return result;
        } else {
          const result = await post(`${url}${endpoint}`, {
            name: 'Usuário Teste',
            email: 'teste@example.com'
          });
          return result;
        }
      }
    } catch (error) {
      console.error(`[DEBUG] Erro em ${url}:`, error);
      throw error;
    }
  };

  const testSSLRequest = async () => {
    setLoading(true);
    setRequestType('Fetch GET');
    const urls = getAlternativeUrls();
    
    for (const url of urls) {
      try {
        console.log(`[DEBUG] Tentando conectar em: ${url}`);
        const result = await testWithUrl(url, '/api/test', 'GET', false, false);
        setResponse(`✅ Conectado em ${url}\n\n${JSON.stringify(result, null, 2)}`);
        Alert.alert('Sucesso', `Conectado via Fetch em ${url}`);
        setLoading(false);
        return;
      } catch (error) {
        console.log(`[DEBUG] Falha em ${url}:`, error);
        continue;
      }
    }
    
    const errorMsg = 'Falha em conectar em todas as URLs testadas';
    setResponse(`❌ ${errorMsg}\n\nURLs testadas:\n${urls.join('\n')}`);
    Alert.alert('Erro', errorMsg);
    setLoading(false);
  };

  const testPostRequest = async () => {
    setLoading(true);
    setRequestType('Fetch POST');
    const baseUrl = getBaseUrl();
    
    try {
      const result = await testWithUrl(baseUrl, '/api/users', 'POST', false, false);
      setResponse(JSON.stringify(result, null, 2));
      Alert.alert('Sucesso', 'POST SSL com Fetch realizado com sucesso!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setResponse(`Erro: ${errorMsg}`);
      Alert.alert('Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const testAxiosSSLRequest = async () => {
    setLoading(true);
    setRequestType('Axios GET');
    const urls = getAlternativeUrls();
    
    for (const url of urls) {
      try {
        console.log(`[DEBUG] Tentando conectar em: ${url} com Axios`);
        const result = await testWithUrl(url, '/api/test', 'GET', true, false);
        setResponse(`✅ Conectado em ${url} via Axios\n\n${JSON.stringify(result, null, 2)}`);
        Alert.alert('Sucesso', `Conectado via Axios em ${url}`);
        setLoading(false);
        return;
      } catch (error) {
        console.log(`[DEBUG] Falha Axios em ${url}:`, error);
        continue;
      }
    }
    
    const errorMsg = 'Falha em conectar com Axios em todas as URLs testadas';
    setResponse(`❌ ${errorMsg}\n\nURLs testadas:\n${urls.join('\n')}`);
    Alert.alert('Erro', errorMsg);
    setLoading(false);
  };

  const testAxiosPostRequest = async () => {
    setLoading(true);
    setRequestType('Axios POST');
    const baseUrl = getBaseUrl();
    
    try {
      const result = await testWithUrl(baseUrl, '/api/users', 'POST', true, false);
      setResponse(JSON.stringify(result, null, 2));
      Alert.alert('Sucesso', 'POST SSL com Axios realizado com sucesso!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setResponse(`Erro: ${errorMsg}`);
      Alert.alert('Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const testCrossFetchRequest = async () => {
    setLoading(true);
    setRequestType('CrossFetch GET');
    const urls = getAlternativeUrls();
    
    for (const url of urls) {
      try {
        console.log(`[DEBUG] Tentando conectar em: ${url} com CrossFetch`);
        const result = await testWithUrl(url, '/api/test', 'GET', false, true);
        setResponse(`✅ Conectado em ${url} via CrossFetch\n\n${JSON.stringify(result, null, 2)}`);
        Alert.alert('Sucesso', `Conectado via CrossFetch em ${url}`);
        setLoading(false);
        return;
      } catch (error) {
        console.log(`[DEBUG] Falha CrossFetch em ${url}:`, error);
        continue;
      }
    }
    
    const errorMsg = 'Falha em conectar com CrossFetch em todas as URLs testadas';
    setResponse(`❌ ${errorMsg}\n\nURLs testadas:\n${urls.join('\n')}`);
    Alert.alert('Erro', errorMsg);
    setLoading(false);
  };

  const testCrossFetchPostRequest = async () => {
    setLoading(true);
    setRequestType('CrossFetch POST');
    const baseUrl = getBaseUrl();
    
    try {
      const result = await testWithUrl(baseUrl, '/api/users', 'POST', false, true);
      setResponse(JSON.stringify(result, null, 2));
      Alert.alert('Sucesso', 'POST SSL com CrossFetch realizado com sucesso!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setResponse(`Erro: ${errorMsg}`);
      Alert.alert('Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const runFullDiagnostic = async () => {
    setLoading(true);
    setRequestType('Diagnóstico SSL');
    
    try {
      const diagnosticReport = await runDiagnostic();
      const reportText = generateReport(diagnosticReport);
      setResponse(reportText);
      
      if (diagnosticReport.successCount > 0) {
        Alert.alert('Diagnóstico Concluído', `${diagnosticReport.successCount}/${diagnosticReport.totalTests} testes passaram!`);
      } else {
        Alert.alert('Problemas Detectados', 'Verifique o relatório para soluções');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setResponse(`Erro no diagnóstico: ${errorMsg}`);
      Alert.alert('Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const runSimpleDiagnosticTest = async () => {
    setLoading(true);
    setRequestType('Diagnóstico Simples');
    
    try {
      console.log('[HomeScreen] Iniciando diagnóstico simples...');
      const results = await runSimpleDiagnostic();
      const reportText = generateSimpleReport(results);
      setResponse(reportText);
      
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        Alert.alert('Sucesso!', `${successCount}/${results.length} URLs funcionando`);
      } else {
        Alert.alert('Problemas Encontrados', 'Verifique o relatório para soluções');
      }
    } catch (error) {
      console.error('[HomeScreen] Erro no diagnóstico simples:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setResponse(`❌ Erro no diagnóstico: ${errorMsg}\n\nTente:\n1. Verifique se o servidor está rodando\n2. Execute: npm run test-server\n3. Reinicie o app`);
      Alert.alert('Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">SSL Test App</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Teste SSL com Certificados Auto-assinados</ThemedText>
        <ThemedText style={styles.urlText}>
          🌐 URL Principal: {getBaseUrl()}
        </ThemedText>
        <ThemedText style={styles.debugText}>
          📱 Plataforma: {Platform.OS} | Versão: {Platform.Version}
        </ThemedText>
      </ThemedView>

      {/* Teste de Conectividade e Diagnóstico */}
      <ThemedView style={styles.testSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>🔗 Diagnóstico e Conectividade</ThemedText>
        <View style={styles.buttonRow}>
          <View style={styles.buttonQuarter}>
            <Button 
              title={loading ? "..." : "Internet"} 
              onPress={testBasicConnectivity}
              disabled={loading || diagnosticRunning}
              color="#28a745"
            />
          </View>
          <View style={styles.buttonQuarter}>
            <Button 
              title={loading ? "..." : "Servidor"} 
              onPress={() => testWithUrl('https://192.168.0.18:8443', '/api/test', 'GET', false, false).then(result => {
                setResponse(`✅ Servidor Local OK!\n\n${JSON.stringify(result, null, 2)}`);
                Alert.alert('Sucesso', 'Servidor local respondendo!');
              }).catch(error => {
                const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
                setResponse(`❌ Erro no servidor: ${errorMsg}`);
                Alert.alert('Erro', errorMsg);
              })}
              disabled={loading || diagnosticRunning}
              color="#dc3545"
            />
          </View>
          <View style={styles.buttonQuarter}>
            <Button 
              title={simpleDiagnosticRunning ? "..." : "SSL"} 
              onPress={runSimpleDiagnosticTest}
              disabled={loading || simpleDiagnosticRunning || diagnosticRunning}
              color="#ff6b35"
            />
          </View>
          <View style={styles.buttonQuarter}>
            <Button 
              title={loading ? "..." : "Debug"} 
              onPress={async () => {
                setLoading(true);
                setRequestType('Diagnóstico Rápido');
                const urls = getAlternativeUrls();
                let results = '🔍 Diagnóstico Rápido:\n\n';
                
                for (const url of urls) {
                  try {
                    console.log(`[DEBUG] Testando conectividade para: ${url}`);
                    const start = Date.now();
                    const result = await testWithUrl(url, '/api/test', 'GET', false, false);
                    const elapsed = Date.now() - start;
                    results += `✅ ${url}: OK (${elapsed}ms)\n`;
                  } catch (error) {
                    results += `❌ ${url}: ${error instanceof Error ? error.message : 'Erro'}\n`;
                  }
                }
                
                setResponse(results);
                setLoading(false);
              }}
              disabled={loading || diagnosticRunning}
              color="#6f42c1"
            />
          </View>
        </View>
        <ThemedText style={styles.diagnosticHint}>
          💡 SSL = Diagnóstico simples e rápido | Debug = Teste manual de URLs
        </ThemedText>
      </ThemedView>

      {/* Seção Fetch */}
      <ThemedView style={styles.testSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>🌐 Fetch API</ThemedText>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <Button 
              title={loading ? "..." : "GET"} 
              onPress={testSSLRequest}
              disabled={loading}
            />
          </View>
          <View style={styles.buttonHalf}>
            <Button 
              title={loading ? "..." : "POST"} 
              onPress={testPostRequest}
              disabled={loading}
            />
          </View>
        </View>
      </ThemedView>

      {/* Seção CrossFetch */}
      <ThemedView style={styles.testSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>🔄 CrossFetch</ThemedText>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <Button 
              title={loading ? "..." : "GET"} 
              onPress={testCrossFetchRequest}
              disabled={loading}
              color="#17a2b8"
            />
          </View>
          <View style={styles.buttonHalf}>
            <Button 
              title={loading ? "..." : "POST"} 
              onPress={testCrossFetchPostRequest}
              disabled={loading}
              color="#17a2b8"
            />
          </View>
        </View>
      </ThemedView>

      {/* Seção Axios */}
      <ThemedView style={styles.testSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>📦 Axios</ThemedText>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <Button 
              title={loading ? "..." : "GET"} 
              onPress={testAxiosSSLRequest}
              disabled={loading}
              color="#007ACC"
            />
          </View>
          <View style={styles.buttonHalf}>
            <Button 
              title={loading ? "..." : "POST"} 
              onPress={testAxiosPostRequest}
              disabled={loading}
              color="#007ACC"
            />
          </View>
        </View>
      </ThemedView>

      {response && (
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Resposta ({requestType})</ThemedText>
          <ScrollView style={styles.responseContainer}>
            <ThemedText style={styles.responseText}>{response}</ThemedText>
          </ScrollView>
        </ThemedView>
      )}

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold">🔧 Bibliotecas de Teste:</ThemedText>
        <ThemedText style={styles.infoText}>
          • 🌐 Fetch: API nativa do React Native{'\n'}
          • 🔄 CrossFetch: Biblioteca universal para fetch{'\n'}
          • 📦 Axios: Cliente HTTP com recursos avançados{'\n'}
          {'\n'}🔍 Debug: Verifique o console para logs detalhados
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  testSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonThird: {
    flex: 1,
  },
  buttonQuarter: {
    flex: 1,
  },
  diagnosticHint: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  responseContainer: {
    maxHeight: 150,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
  responseText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    marginTop: 4,
  },
  urlText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#007ACC',
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
});
