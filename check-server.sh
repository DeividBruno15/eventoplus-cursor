#!/bin/bash

echo "🔍 Verificando status do servidor EventoPlus..."

# Verificar se há processos node rodando
NODE_PROCESSES=$(ps aux | grep node | grep -v grep | wc -l)
echo "📊 Processos node ativos: $NODE_PROCESSES"

# Verificar se a porta 5000 está em uso
PORT_5000_USED=$(ss -tlnp 2>/dev/null | grep :5000 | wc -l)
if [ $PORT_5000_USED -gt 0 ]; then
    echo "⚠️  Porta 5000 está sendo usada"
    echo "📋 Processos na porta 5000:"
    ss -tlnp 2>/dev/null | grep :5000
else
    echo "✅ Porta 5000 está livre"
fi

# Verificar se o servidor está rodando corretamente
echo "🌐 Testando conectividade do servidor..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Servidor está respondendo corretamente"
else
    echo "❌ Servidor não está respondendo"
    echo "🔄 Tentando reiniciar o servidor..."
    
    # Matar processos node se necessário
    if [ $NODE_PROCESSES -gt 0 ]; then
        echo "🛑 Parando processos node existentes..."
        pkill -f "node.*server" 2>/dev/null || true
        pkill -f "npm.*dev" 2>/dev/null || true
        sleep 2
    fi
    
    # Iniciar servidor
    echo "🚀 Iniciando servidor..."
    npm run dev &
    sleep 5
    
    # Verificar novamente
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ Servidor reiniciado com sucesso!"
    else
        echo "❌ Falha ao reiniciar servidor"
    fi
fi

echo "📊 Status final:"
echo "  - Processos node: $(ps aux | grep node | grep -v grep | wc -l)"
echo "  - Porta 5000: $(ss -tlnp 2>/dev/null | grep :5000 | wc -l) processo(s)"
echo "  - Conectividade: $(curl -s http://localhost:5000/api/health > /dev/null 2>&1 && echo "✅ OK" || echo "❌ FALHA")" 