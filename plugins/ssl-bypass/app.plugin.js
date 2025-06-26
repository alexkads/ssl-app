const { withAndroidManifest, withInfoPlist, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Configuração de rede Android
function withAndroidNetworkConfig(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const resXmlDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      
      // Cria o diretório xml se não existir
      if (!fs.existsSync(resXmlDir)) {
        fs.mkdirSync(resXmlDir, { recursive: true });
      }

      const networkConfigPath = path.join(resXmlDir, 'network_security_config.xml');
      
      const networkConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">10.0.3.2</domain>
        <domain includeSubdomains="true">192.168.0.18</domain>
        <domain includeSubdomains="true">192.168.1.0</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
            <certificates src="user"/>
        </trust-anchors>
    </base-config>
    <debug-overrides>
        <trust-anchors>
            <certificates src="system"/>
            <certificates src="user"/>
        </trust-anchors>
    </debug-overrides>
</network-security-config>`;

      fs.writeFileSync(networkConfigPath, networkConfig);
      
      return config;
    },
  ]);
}

// Plugin principal SSL Bypass
function withSSLBypass(config) {
  console.log('🎯 SSL Plugin: CommonJS moderno carregado');
  
  // Configuração para Android
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    
    // Garantir que a estrutura do manifest existe
    if (!manifest.manifest) {
      manifest.manifest = {};
    }
    
    if (!manifest.manifest.application) {
      manifest.manifest.application = [{}];
    }
    
    if (!manifest.manifest.application[0]) {
      manifest.manifest.application[0] = {};
    }
    
    if (!manifest.manifest.application[0].$) {
      manifest.manifest.application[0].$ = {};
    }
    
    // Adiciona permissão de rede clara (cleartext)
    manifest.manifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    manifest.manifest.application[0].$['android:networkSecurityConfig'] = '@xml/network_security_config';
    
    return config;
  });

  // Adiciona configuração de rede personalizada para Android
  config = withAndroidNetworkConfig(config);

  // Configuração para iOS
  config = withInfoPlist(config, (config) => {
    const plist = config.modResults;
    
    if (!plist.NSAppTransportSecurity) {
      plist.NSAppTransportSecurity = {};
    }
    
    plist.NSAppTransportSecurity.NSAllowsArbitraryLoads = true;
    plist.NSAppTransportSecurity.NSAllowsLocalNetworking = true;
    plist.NSAppTransportSecurity.NSExceptionDomains = {
      'localhost': {
        NSExceptionAllowsInsecureHTTPLoads: true,
        NSExceptionMinimumTLSVersion: '1.0',
        NSExceptionRequiresForwardSecrecy: false
      },
      '127.0.0.1': {
        NSExceptionAllowsInsecureHTTPLoads: true,
        NSExceptionMinimumTLSVersion: '1.0',
        NSExceptionRequiresForwardSecrecy: false
      },
      '192.168.0.18': {
        NSExceptionAllowsInsecureHTTPLoads: true,
        NSExceptionMinimumTLSVersion: '1.0',
        NSExceptionRequiresForwardSecrecy: false
      }
    };
    
    return config;
  });

  return config;
}

module.exports = withSSLBypass; 