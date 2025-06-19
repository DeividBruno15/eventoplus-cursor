#!/bin/bash

echo "Resolvendo problema do Git..."

# Remove arquivo de lock se existir
if [ -f .git/index.lock ]; then
    echo "Removendo .git/index.lock..."
    rm -f .git/index.lock
fi

# Remove outros possíveis locks
if [ -f .git/refs/heads/main.lock ]; then
    rm -f .git/refs/heads/main.lock
fi

if [ -f .git/HEAD.lock ]; then
    rm -f .git/HEAD.lock
fi

# Verifica se há processos git rodando
echo "Verificando processos Git..."
pkill -f git 2>/dev/null || true

# Espera um pouco
sleep 2

# Tenta verificar status
echo "Verificando status do Git..."
git status

echo "Git desbloqueado! Agora você pode fazer:"
echo "git add ."
echo "git commit -m 'Event creation fixes'"
echo "git push origin main"