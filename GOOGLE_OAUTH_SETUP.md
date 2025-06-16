# Configuração Google OAuth - Correção do Erro 403

## URLs que precisam ser adicionadas no Google Cloud Console

Acesse: https://console.cloud.google.com/apis/credentials

### 1. Origens JavaScript autorizadas:
```
https://d797590d-a47b-43a2-948a-07f16f2e2817-00-3guspncus7p2n.picard.replit.dev
```

### 2. URIs de redirecionamento autorizados:
```
https://d797590d-a47b-43a2-948a-07f16f2e2817-00-3guspncus7p2n.picard.replit.dev/auth/google/callback
```

## Passos para corrigir o erro 403:

1. Vá para o Google Cloud Console
2. Selecione seu projeto
3. Navegue para "APIs e Serviços" > "Credenciais"
4. Clique no seu Client ID OAuth 2.0
5. Na seção "Origens JavaScript autorizadas", adicione a URL base
6. Na seção "URIs de redirecionamento autorizados", adicione a URL de callback
7. Clique em "Salvar"

## Status Atual:
- Client ID: 190052814958-tsi43i10m25irafgqvn7hnqike3f3eql.apps.googleusercontent.com
- Callback URL configurada: https://d797590d-a47b-43a2-948a-07f16f2e2817-00-3guspncus7p2n.picard.replit.dev/auth/google/callback