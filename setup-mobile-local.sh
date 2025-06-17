#!/bin/bash

echo "🚀 Configurando Evento+ Mobile para teste local"
echo "================================================"

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

echo "📦 Instalando dependências principais..."
npm install

echo "📱 Configurando diretório mobile..."
cd mobile

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Arquivo mobile/package.json não encontrado"
    exit 1
fi

echo "📦 Instalando dependências mobile..."
npm install

echo "🔧 Verificando Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "📲 Instalando Expo CLI globalmente..."
    npm install -g @expo/cli
else
    echo "✅ Expo CLI já instalado"
fi

echo "🔧 Configurando metro.config.js..."
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração para funcionar com Expo web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
EOF

echo "🔧 Configurando babel.config.js..."
cat > babel.config.js << 'EOF'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
EOF

echo "📝 Criando script de inicialização..."
cat > start-local.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando Evento+ Mobile"
echo "=========================="
echo ""
echo "📱 Instruções:"
echo "1. Baixe 'Expo Go' no seu celular"
echo "2. Conecte celular e computador na mesma WiFi"
echo "3. Escaneie o QR code que aparecerá"
echo ""
echo "🔄 Iniciando servidor..."
echo ""

npx expo start --clear
EOF

chmod +x start-local.sh

echo "✅ Configuração concluída!"
echo ""
echo "🔥 Para testar o app:"
echo "1. Baixe 'Expo Go' no celular (App Store/Google Play)"
echo "2. Execute: ./start-local.sh"
echo "3. Escaneie o QR code com Expo Go"
echo ""
echo "💡 Dica: Mantenha celular e computador na mesma WiFi"