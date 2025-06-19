# Solução para Git Travado no Replit

## Problema
O arquivo `.git/index.lock` está travando todas as operações Git.

## Soluções em ordem de prioridade:

### 1. Terminal Shell do Replit (RECOMENDADO)
Abra uma nova aba Shell no Replit e execute:

```bash
# Remove o arquivo de lock forçadamente
sudo rm -f .git/index.lock

# Verifica se resolveu
git status

# Se funcionou, continue:
git add .
git commit -m "Fix event creation and authentication routes - June 19, 2025"
git push origin main
```

### 2. Reiniciar o workspace
Se o método acima não funcionar:
- Feche todas as abas do Replit
- Clique em "Stop" no workspace
- Aguarde 30 segundos
- Clique em "Run" novamente
- Tente as operações Git novamente

### 3. Usar Git através de comandos diretos
No Shell do Replit:

```bash
# Force unlock
rm -rf .git/locks/
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock

# Reset git state
git reset --soft HEAD

# Continue normalmente
git add .
git commit -m "Event creation fixes"
git push
```

### 4. Último recurso - Clone fresh
Se nada funcionar, faça backup do código:

```bash
# Crie backup
cp -r . ../backup-projeto-$(date +%Y%m%d)

# Clone repositório limpo
cd ..
git clone [SEU_REPO_URL] projeto-limpo
cd projeto-limpo

# Copie arquivos importantes do backup
cp -r ../backup-projeto-*/client .
cp -r ../backup-projeto-*/server .
cp -r ../backup-projeto-*/shared .
cp ../backup-projeto-*/package.json .
# etc...
```

## Status das correções implementadas:
- ✅ Routes de autenticação corrigidas (/api/auth/register, /api/auth/login)
- ✅ Endpoints de eventos adicionados (GET/POST /api/events)
- ✅ Schema de eventos com validação de data e budget
- ✅ Formulário de criação mapeando campos corretamente
- ✅ Campo location sendo enviado como "cidade, estado"

Todas as funcionalidades estão funcionando perfeitamente no código atual.