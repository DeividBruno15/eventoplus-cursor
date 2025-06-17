const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Servir arquivos estáticos do mobile
app.use(express.static(path.join(__dirname, 'mobile')));

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Rota principal para o app móvel
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Evento+ Mobile Preview</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                width: 80px;
                height: 80px;
                background: #3C5BFA;
                border-radius: 20px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #666;
                font-size: 18px;
            }
            .methods {
                display: grid;
                gap: 20px;
                margin: 30px 0;
            }
            .method {
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s ease;
            }
            .method:hover {
                border-color: #3C5BFA;
                box-shadow: 0 4px 12px rgba(60, 91, 250, 0.15);
            }
            .method-title {
                color: #3C5BFA;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .method-desc {
                color: #666;
                line-height: 1.6;
                margin-bottom: 15px;
            }
            .steps {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .steps li {
                padding: 8px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            .steps li:last-child {
                border-bottom: none;
            }
            .qr-placeholder {
                width: 200px;
                height: 200px;
                background: #f0f0f0;
                border-radius: 12px;
                margin: 20px auto;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #999;
                font-size: 14px;
                text-align: center;
            }
            .note {
                background: #FFF9E6;
                border: 1px solid #FFE066;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #B8860B;
            }
            .features {
                background: #F8F9FF;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
            }
            .features h3 {
                color: #3C5BFA;
                margin-top: 0;
            }
            .features ul {
                margin: 0;
                padding-left: 20px;
            }
            .features li {
                margin: 8px 0;
                color: #333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">E+</div>
                <h1>Evento+ Mobile App</h1>
                <p class="subtitle">Aplicativo móvel completo para eventos</p>
            </div>

            <div class="note">
                <strong>Status:</strong> O aplicativo móvel está pronto e configurado com React Native + Expo. 
                Aqui estão as formas de testá-lo:
            </div>

            <div class="methods">
                <div class="method">
                    <div class="method-title">📱 1. Expo Go (Recomendado)</div>
                    <div class="method-desc">
                        A forma mais rápida de testar o app no seu celular.
                    </div>
                    <ol class="steps">
                        <li>Baixe "Expo Go" na App Store ou Google Play</li>
                        <li>Crie uma conta gratuita no Expo</li>
                        <li>Execute: <code>cd mobile && npx expo start</code></li>
                        <li>Escaneie o QR code com o Expo Go</li>
                    </ol>
                    <div class="qr-placeholder">
                        QR Code aparecerá aqui<br>
                        após executar expo start
                    </div>
                </div>

                <div class="method">
                    <div class="method-title">💻 2. Simulador Local</div>
                    <div class="method-desc">
                        Para desenvolvedores com ambiente configurado.
                    </div>
                    <ol class="steps">
                        <li><strong>iOS:</strong> Xcode Simulator (apenas Mac)</li>
                        <li><strong>Android:</strong> Android Studio Emulator</li>
                        <li>Execute: <code>npx expo start</code></li>
                        <li>Pressione 'i' para iOS ou 'a' para Android</li>
                    </ol>
                </div>

                <div class="method">
                    <div class="method-title">🌐 3. Web Preview</div>
                    <div class="method-desc">
                        Visualização web do app mobile (limitada).
                    </div>
                    <ol class="steps">
                        <li>Execute: <code>cd mobile && npx expo start --web</code></li>
                        <li>Abra no navegador em modo mobile</li>
                        <li>Use DevTools para simular dispositivo móvel</li>
                    </ol>
                </div>
            </div>

            <div class="features">
                <h3>🚀 Funcionalidades Implementadas</h3>
                <ul>
                    <li><strong>Autenticação:</strong> Login/registro com validação</li>
                    <li><strong>Navegação:</strong> Stack e Tab navigation</li>
                    <li><strong>Dashboard:</strong> Personalizado por tipo de usuário</li>
                    <li><strong>Eventos:</strong> Listagem, criação e detalhes</li>
                    <li><strong>Serviços:</strong> Catálogo de prestadores</li>
                    <li><strong>Chat:</strong> Mensagens em tempo real</li>
                    <li><strong>Perfil:</strong> Gerenciamento de dados pessoais</li>
                    <li><strong>Câmera:</strong> Upload de fotos de perfil</li>
                    <li><strong>Notificações:</strong> Push notifications</li>
                    <li><strong>Biometria:</strong> Face ID / Touch ID</li>
                    <li><strong>Offline:</strong> Modo offline com sincronização</li>
                    <li><strong>Mapas:</strong> Localização de eventos e espaços</li>
                </ul>
            </div>

            <div class="note">
                <strong>Próximos Passos:</strong><br>
                1. Execute o comando expo start no diretório mobile<br>
                2. Use seu celular com Expo Go para testar<br>
                3. Para deployment: comandos de build já configurados
            </div>
        </div>
    </body>
    </html>
  `);
});

// Endpoint para informações do app
app.get('/api/app-info', (req, res) => {
  res.json({
    name: "Evento+",
    version: "1.0.0",
    platform: "React Native + Expo",
    features: [
      "Autenticação completa",
      "Dashboard personalizado",
      "Gestão de eventos",
      "Chat em tempo real",
      "Câmera integrada",
      "Notificações push",
      "Biometria",
      "Modo offline"
    ],
    status: "Pronto para teste"
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`📱 Mobile Preview Server rodando em http://localhost:${port}`);
  console.log(`🚀 Para testar o app mobile:`);
  console.log(`   1. Acesse: http://localhost:${port}`);
  console.log(`   2. Baixe Expo Go no seu celular`);
  console.log(`   3. Execute: cd mobile && npx expo start`);
});