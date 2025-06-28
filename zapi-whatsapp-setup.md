# 📱 Setup Z-API WhatsApp para EventoPlus

## Passo 1: Criar Conta Z-API
1. Acesse: https://z-api.io
2. Clique em "Criar Conta Grátis"
3. Use seu e-mail: deividb15r@gmail.com
4. Confirme o e-mail
5. Faça login

## Passo 2: Criar Instância WhatsApp
1. No painel, clique em "Nova Instância"
2. Nome: "EventoPlus-Producao"
3. Clique em "Criar"
4. Anote:
   - **Instance ID**: (ex: 3C4E...)
   - **Token**: (ex: B6D48A...)

## Passo 3: Conectar WhatsApp
1. Clique em "Conectar WhatsApp"
2. Escaneie o QR Code com seu WhatsApp
3. Status deve ficar "Conectado"

## Passo 4: Testar Envio
1. No painel Z-API, vá em "Testar API"
2. Envie uma mensagem teste para seu número
3. Confirme que recebeu

## Passo 5: Configurar Webhook Z-API
1. No painel Z-API, vá em "Webhooks"
2. URL do Webhook: `SUA_URL_N8N` (copiar do n8n)
3. Eventos: Marque "Mensagem Recebida"
4. Salvar

## Credenciais para n8n:
```
Instance ID: [sua-instance-id]
Token: [seu-token]
URL Base: https://api.z-api.io
```

## Custo Mensal:
- Plano Starter: R$ 19/mês
- Inclui: 1000 mensagens
- Adicional: R$ 0,05 por mensagem extra