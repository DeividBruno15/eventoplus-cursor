# 📱 Guia de Teste - Evento+ Mobile App

## Preparação do Ambiente Local

### 1. Requisitos
- Node.js 18+ instalado no computador
- Celular Android ou iPhone
- Conexão WiFi (mesmo que o computador)

### 2. Configuração Inicial

**No seu computador:**
```bash
# 1. Clone ou baixe o projeto
git clone [URL_DO_PROJETO] evento-plus
cd evento-plus

# 2. Instale dependências principais
npm install

# 3. Navegue para o diretório mobile
cd mobile

# 4. Instale dependências mobile
npm install

# 5. Instale Expo CLI globalmente
npm install -g @expo/cli
```

### 3. Download do Expo Go

**No seu celular:**
- **iPhone**: Baixe "Expo Go" na App Store
- **Android**: Baixe "Expo Go" no Google Play Store
- Crie uma conta gratuita (pode usar Google/GitHub)

## Executando o App

### 4. Iniciando o Servidor

**No terminal (dentro da pasta mobile):**
```bash
npx expo start
```

Você verá algo assim:
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

### 5. Conectando o Celular

**Opção A - QR Code (Android):**
1. Abra o Expo Go no celular
2. Toque em "Scan QR Code"
3. Escaneie o QR code do terminal

**Opção B - Camera (iPhone):**
1. Abra a câmera nativa do iPhone
2. Aponte para o QR code
3. Toque na notificação "Abrir no Expo Go"

**Opção C - Link Direto:**
1. No Expo Go, toque em "Enter URL manually"
2. Digite o link exp://SEU_IP:8081
3. Toque em "Connect"

## Funcionalidades para Testar

### 6. Fluxo de Teste Completo

**Autenticação:**
- [ ] Tela de registro (3 etapas)
- [ ] Login com email/senha
- [ ] Biometria (Face ID/Touch ID) se disponível

**Dashboard:**
- [ ] Métricas personalizadas por tipo de usuário
- [ ] Navegação bottom tabs
- [ ] Atualizações em tempo real

**Eventos:**
- [ ] Lista de eventos próximos
- [ ] Criar novo evento
- [ ] Detalhes do evento
- [ ] Candidatar-se como prestador

**Chat:**
- [ ] Lista de conversas
- [ ] Enviar/receber mensagens
- [ ] Notificações em tempo real

**Câmera:**
- [ ] Tirar foto de perfil
- [ ] Galeria de fotos
- [ ] Upload de imagens

**Perfil:**
- [ ] Editar dados pessoais
- [ ] Configurações de biometria
- [ ] Logout

### 7. Recursos Nativos

**Permissões que serão solicitadas:**
- Câmera (para fotos de perfil)
- Galeria (para selecionar imagens)
- Localização (para eventos próximos)
- Notificações (para alertas)
- Biometria (para login seguro)

**Funcionalidades Offline:**
- [ ] Use sem internet
- [ ] Verifique sincronização ao reconectar
- [ ] Dados salvos localmente

## Solução de Problemas

### 8. Problemas Comuns

**"Network response timed out":**
- Verifique se o computador e celular estão na mesma WiFi
- Teste com: `npx expo start --tunnel`

**"Something went wrong downloading":**
- Limpe cache: `npx expo start --clear`
- Reinstale: `npm install`

**App não carrega:**
- Feche e reabra o Expo Go
- Teste pressionar 'r' no terminal para reload
- Verifique se o servidor ainda está rodando

**Biometria não funciona:**
- Configure Face ID/Touch ID no celular
- Permita acesso nas configurações do app

### 9. Desenvolvimento Local

**Para modificar o código:**
1. Edite arquivos em `mobile/src/`
2. O app recarrega automaticamente
3. Pressione 'r' no terminal se necessário

**Estrutura do projeto:**
```
mobile/
├── src/
│   ├── screens/          # Telas do app
│   ├── components/       # Componentes reutilizáveis
│   ├── context/          # Context API (auth, etc)
│   ├── utils/            # Utilitários (camera, biometria)
│   └── services/         # APIs e WebSocket
├── assets/               # Imagens e ícones
├── app.json             # Configuração Expo
└── package.json         # Dependências
```

## Deploy para Produção

### 10. Build para Store

**Android (APK/AAB):**
```bash
eas build --platform android
```

**iOS (IPA):**
```bash
eas build --platform ios
```

**Submissão:**
```bash
eas submit --platform android
eas submit --platform ios
```

---

## ✅ Checklist de Teste

- [ ] Download Expo Go
- [ ] Configuração ambiente local
- [ ] App carregou no celular
- [ ] Registro/login funcionando
- [ ] Navegação entre telas
- [ ] Câmera e galeria
- [ ] Notificações push
- [ ] Chat em tempo real
- [ ] Sincronização offline
- [ ] Biometria configurada

**Dúvidas?** Consulte a [documentação oficial do Expo](https://docs.expo.dev/)