#!/bin/bash

echo "🚀 Configurando ambiente móvel do Evento+..."

# Navegar para o diretório mobile
cd mobile

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Instalar Expo CLI globalmente se não existir
if ! command -v expo &> /dev/null; then
    echo "📱 Instalando Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Ambiente configurado!"
echo ""
echo "📱 Para testar o app móvel:"
echo "1. Baixe 'Expo Go' no seu celular (App Store ou Google Play)"
echo "2. Execute: expo start"
echo "3. Escaneie o QR code com Expo Go"
echo ""
echo "🖥️  Para testar no simulador:"
echo "- iOS: expo start --ios (apenas Mac)"
echo "- Android: expo start --android"
echo "- Web: expo start --web"
echo ""

# Iniciar expo com túnel para funcionar no Replit
echo "🔄 Iniciando servidor móvel..."
npx expo start --tunnel --non-interactive