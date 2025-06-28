# 🚀 Evolution API - Setup GRATUITO para WhatsApp

## 🎯 Por que Evolution API?
- **100% GRATUITA** (open source)
- Suporte a multi-dispositivos
- API compatível com WhatsApp Web
- Documentação em português
- Comunidade ativa no Brasil

## ⚡ Opção 1: Deploy no Railway (Mais Fácil)

### Passo 1: Criar conta no Railway
1. Acesse: https://railway.app
2. Login com GitHub
3. Clique em "New Project"

### Passo 2: Deploy da Evolution API
1. Clique em "Deploy from GitHub repo"
2. URL do repositório: `https://github.com/EvolutionAPI/evolution-api`
3. Clique em "Deploy"
4. Aguarde o build (5-10 minutos)

### Passo 3: Configurar variáveis
No Railway, vá em "Variables" e adicione:
```
AUTHENTICATION_API_KEY=SUA_CHAVE_SECRETA_AQUI
SERVER_URL=https://evolution-api-production.up.railway.app
STORE_MESSAGES=true
STORE_CONTACTS=true
WEBHOOK_GLOBAL=https://seu-workspace.app.n8n.cloud/webhook/eventoplus-notifications
```

### Passo 4: Testar a API
1. Copie a URL do deploy (ex: `https://evolution-api-production.up.railway.app`)
2. Teste no navegador: `URL/manager`
3. Crie uma instância WhatsApp
4. Escaneie o QR Code

### Custo Railway: ~R$ 25/mês

## ⚡ Opção 2: WhatsApp Business API Oficial (Recomendada)

### Vantagens:
- **1000 conversas GRATUITAS** por mês
- Oficialmente suportada pelo Meta
- Mais estável e confiável
- R$ 0,039 por conversa adicional

### Setup via Meta Business:
1. Acesse: https://business.facebook.com
2. Crie conta Business
3. Acesse "WhatsApp Business API"
4. Configure webhook para n8n
5. Solicite aprovação (1-3 dias)

### Custo: R$ 0-40/mês (dependendo do volume)

## 🔧 Atualizar Template n8n para Evolution API

Substitua no nó HTTP Request:
```
URL: https://sua-evolution-api.railway.app/message/sendText/INSTANCE_NAME
Headers:
  Authorization: Bearer SUA_API_KEY
  Content-Type: application/json

Body:
{
  "number": "{{ $json.phone }}",
  "textMessage": {
    "text": "{{ $json.message }}"
  }
}
```

## 🎯 Recomendação Final

### Para começar (MVP):
- **Evolution API + Railway**: ~R$ 25/mês
- Setup em 30 minutos
- Funcional para testes e primeiros clientes

### Para produção (escala):
- **WhatsApp Business API Oficial**: R$ 0-40/mês
- Mais estável e oficial
- Aprovação necessária do Meta

## 📋 Checklist de Setup

### Evolution API:
- [ ] Conta Railway criada
- [ ] Evolution API deployada
- [ ] Variáveis configuradas
- [ ] WhatsApp conectado via QR
- [ ] Teste de envio funcionando

### n8n Integration:
- [ ] Workflow importado
- [ ] URL da Evolution API configurada
- [ ] Teste de webhook funcionando
- [ ] EventoPlus conectado

### Próximo passo:
Escolha Evolution API (mais rápido) ou WhatsApp Business API (mais oficial) e siga o setup!