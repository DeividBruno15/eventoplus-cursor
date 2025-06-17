@echo off
echo 🚀 Configurando Evento+ Mobile para Windows
echo ==========================================

REM Verificar se está no diretório correto
if not exist package.json (
    echo ❌ Execute este script no diretório raiz do projeto
    pause
    exit /b 1
)

echo 📦 Instalando dependências principais...
call npm install

echo 📱 Configurando diretório mobile...
cd mobile

REM Verificar se package.json existe
if not exist package.json (
    echo ❌ Arquivo mobile/package.json não encontrado
    pause
    exit /b 1
)

echo 📦 Instalando dependências mobile...
call npm install

echo 🔧 Verificando Expo CLI...
where expo >nul 2>nul
if %errorlevel% neq 0 (
    echo 📲 Instalando Expo CLI globalmente...
    call npm install -g @expo/cli
) else (
    echo ✅ Expo CLI já instalado
)

echo 🔧 Configurando metro.config.js...
(
echo const { getDefaultConfig } = require('expo/metro-config'^);
echo.
echo const config = getDefaultConfig(__dirname^);
echo.
echo // Configuração para funcionar com Expo web
echo config.resolver.platforms = ['ios', 'android', 'native', 'web'];
echo.
echo module.exports = config;
) > metro.config.js

echo 🔧 Configurando babel.config.js...
(
echo module.exports = function(api^) {
echo   api.cache(true^);
echo   return {
echo     presets: ['babel-preset-expo'],
echo     plugins: [
echo       'react-native-reanimated/plugin',
echo     ],
echo   };
echo };
) > babel.config.js

echo 📝 Criando script de inicialização para Windows...
(
echo @echo off
echo echo 🚀 Iniciando Evento+ Mobile
echo echo ==========================
echo echo.
echo echo 📱 Instruções:
echo echo 1. Baixe 'Expo Go' no seu celular
echo echo 2. Conecte celular e computador na mesma WiFi
echo echo 3. Escaneie o QR code que aparecerá
echo echo.
echo echo 🔄 Iniciando servidor...
echo echo.
echo.
echo call npx expo start --clear
echo pause
) > start-local.bat

echo ✅ Configuração concluída!
echo.
echo 🔥 Para testar o app:
echo 1. Baixe 'Expo Go' no celular (App Store/Google Play)
echo 2. Execute: start-local.bat
echo 3. Escaneie o QR code com Expo Go
echo.
echo 💡 Dica: Mantenha celular e computador na mesma WiFi
pause