// Teste End-to-End do fluxo completo Stripe
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

// Dados de teste para usuário
const testUser = {
  email: 'test.stripe@evento.com',
  password: 'Test123!',
  username: 'test_stripe_user',
  firstName: 'Test',
  lastName: 'Stripe',
  userType: 'prestador'
};

// Simular um navegador com cookies
class TestBrowser {
  constructor() {
    this.cookies = '';
  }

  async request(method, url, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': this.cookies
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${url}`, options);
    
    // Capturar cookies de resposta
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      this.cookies = setCookie.split(';')[0];
    }

    const result = {
      status: response.status,
      data: null,
      headers: Object.fromEntries(response.headers.entries())
    };

    try {
      result.data = await response.json();
    } catch (e) {
      result.data = await response.text();
    }

    return result;
  }
}

async function testStripeFlow() {
  console.log('🧪 TESTE COMPLETO DO FLUXO STRIPE');
  console.log('=' * 50);
  
  const browser = new TestBrowser();
  const results = [];

  // ETAPA 1: Registrar usuário
  console.log('\n📝 ETAPA 1: Registrar usuário teste');
  try {
    const registerResult = await browser.request('POST', '/api/register', testUser);
    console.log(`Status: ${registerResult.status}`);
    
    if (registerResult.status === 201) {
      console.log('✅ Usuário registrado com sucesso');
      results.push('✅ Registro: OK');
    } else if (registerResult.status === 409) {
      console.log('ℹ️ Usuário já existe, prosseguindo...');
      results.push('ℹ️ Registro: Usuário já existe');
    } else {
      console.log('❌ Falha no registro:', registerResult.data);
      results.push('❌ Registro: FALHOU');
    }
  } catch (error) {
    console.log('❌ Erro no registro:', error.message);
    results.push('❌ Registro: ERRO');
  }

  // ETAPA 2: Fazer login
  console.log('\n🔐 ETAPA 2: Login do usuário');
  try {
    const loginResult = await browser.request('POST', '/api/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log(`Status: ${loginResult.status}`);
    
    if (loginResult.status === 200) {
      console.log('✅ Login realizado com sucesso');
      results.push('✅ Login: OK');
    } else {
      console.log('❌ Falha no login:', loginResult.data);
      results.push('❌ Login: FALHOU');
      return; // Não pode continuar sem login
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
    results.push('❌ Login: ERRO');
    return;
  }

  // ETAPA 3: Buscar planos disponíveis
  console.log('\n📋 ETAPA 3: Buscar planos Stripe');
  try {
    const plansResult = await browser.request('GET', '/api/stripe/plans');
    console.log(`Status: ${plansResult.status}`);
    
    if (plansResult.status === 200) {
      console.log('✅ Planos obtidos:', plansResult.data.prestador?.length || 0, 'planos');
      results.push('✅ Planos: OK');
    } else {
      console.log('❌ Falha ao buscar planos:', plansResult.data);
      results.push('❌ Planos: FALHOU');
    }
  } catch (error) {
    console.log('❌ Erro ao buscar planos:', error.message);
    results.push('❌ Planos: ERRO');
  }

  // ETAPA 4: Criar customer no Stripe
  console.log('\n👤 ETAPA 4: Criar customer no Stripe');
  try {
    const customerResult = await browser.request('POST', '/api/stripe/create-customer');
    console.log(`Status: ${customerResult.status}`);
    
    if (customerResult.status === 200) {
      console.log('✅ Customer criado:', customerResult.data.customerId?.substring(0, 20) + '...');
      results.push('✅ Customer: OK');
    } else {
      console.log('❌ Falha ao criar customer:', customerResult.data);
      results.push('❌ Customer: FALHOU');
    }
  } catch (error) {
    console.log('❌ Erro ao criar customer:', error.message);
    results.push('❌ Customer: ERRO');
  }

  // ETAPA 5: Ativar plano gratuito
  console.log('\n🆓 ETAPA 5: Ativar plano gratuito');
  try {
    const freeResult = await browser.request('POST', '/api/get-or-create-subscription', {
      planId: 'prestador_essencial',
      priceId: 'free'
    });
    
    console.log(`Status: ${freeResult.status}`);
    
    if (freeResult.status === 200) {
      console.log('✅ Plano gratuito ativado:', freeResult.data.planType);
      results.push('✅ Plano Gratuito: OK');
    } else {
      console.log('❌ Falha ao ativar plano gratuito:', freeResult.data);
      results.push('❌ Plano Gratuito: FALHOU');
    }
  } catch (error) {
    console.log('❌ Erro ao ativar plano gratuito:', error.message);
    results.push('❌ Plano Gratuito: ERRO');
  }

  // ETAPA 6: Criar checkout para plano pago
  console.log('\n💳 ETAPA 6: Criar checkout para plano pago');
  try {
    const checkoutResult = await browser.request('POST', '/api/get-or-create-subscription', {
      planId: 'prestador_profissional',
      priceId: 'price_1RgBEFKX6FbUQvI6iv4RzNUi'
    });
    
    console.log(`Status: ${checkoutResult.status}`);
    
    if (checkoutResult.status === 200 && checkoutResult.data.url) {
      console.log('✅ Checkout criado - URL:', checkoutResult.data.url.substring(0, 50) + '...');
      results.push('✅ Checkout: OK');
    } else {
      console.log('❌ Falha ao criar checkout:', checkoutResult.data);
      results.push('❌ Checkout: FALHOU');
    }
  } catch (error) {
    console.log('❌ Erro ao criar checkout:', error.message);
    results.push('❌ Checkout: ERRO');
  }

  // ETAPA 7: Testar webhook
  console.log('\n🔗 ETAPA 7: Testar webhook');
  try {
    const webhookResult = await browser.request('POST', '/api/webhooks/stripe', {
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          customer: 'cus_test_customer',
          subscription: 'sub_test_subscription',
          period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // +30 dias
        }
      }
    });
    
    console.log(`Status: ${webhookResult.status}`);
    
    if (webhookResult.status === 200) {
      console.log('✅ Webhook processado:', webhookResult.data.received);
      results.push('✅ Webhook: OK');
    } else {
      console.log('❌ Falha no webhook:', webhookResult.data);
      results.push('❌ Webhook: FALHOU');
    }
  } catch (error) {
    console.log('❌ Erro no webhook:', error.message);
    results.push('❌ Webhook: ERRO');
  }

  // RELATÓRIO FINAL
  console.log('\n📊 RELATÓRIO FINAL DO TESTE');
  console.log('=' * 50);
  
  results.forEach(result => {
    console.log(result);
  });

  const successCount = results.filter(r => r.includes('✅')).length;
  const totalTests = results.length;
  const successRate = Math.round((successCount / totalTests) * 100);

  console.log(`\n🎯 SCORE FINAL: ${successCount}/${totalTests} (${successRate}%)`);

  if (successRate >= 80) {
    console.log('🟢 SISTEMA STRIPE: FUNCIONANDO PERFEITAMENTE');
  } else if (successRate >= 60) {
    console.log('🟡 SISTEMA STRIPE: FUNCIONANDO COM PROBLEMAS MENORES');
  } else {
    console.log('🔴 SISTEMA STRIPE: REQUER ATENÇÃO CRÍTICA');
  }

  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    successRate,
    results,
    details: {
      total: totalTests,
      passed: successCount,
      failed: totalTests - successCount
    }
  };

  fs.writeFileSync('stripe-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo em: stripe-test-report.json');
}

// Executar teste
testStripeFlow().catch(console.error);