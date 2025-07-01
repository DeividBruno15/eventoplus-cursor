// Script para criar automaticamente os Price IDs no Stripe
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = {
  // Prestadores
  prestador: [
    { name: 'Essencial', price: 0, currency: 'brl', interval: 'month', priceId: 'price_prestador_essencial' },
    { name: 'Profissional', price: 1490, currency: 'brl', interval: 'month', priceId: 'price_prestador_profissional' },
    { name: 'Premium', price: 2990, currency: 'brl', interval: 'month', priceId: 'price_prestador_premium' }
  ],
  
  // Contratantes
  contratante: [
    { name: 'Descubra', price: 0, currency: 'brl', interval: 'month', priceId: 'price_contratante_descubra' },
    { name: 'Conecta', price: 1490, currency: 'brl', interval: 'month', priceId: 'price_contratante_conecta' },
    { name: 'Premium', price: 2990, currency: 'brl', interval: 'month', priceId: 'price_contratante_premium' }
  ],
  
  // Anunciantes
  anunciante: [
    { name: 'Essencial', price: 0, currency: 'brl', interval: 'month', priceId: 'price_anunciante_essencial' },
    { name: 'Profissional', price: 1990, currency: 'brl', interval: 'month', priceId: 'price_anunciante_profissional' },
    { name: 'Premium', price: 3990, currency: 'brl', interval: 'month', priceId: 'price_anunciante_premium' }
  ]
};

async function createStripeProducts() {
  console.log('🚀 Iniciando criação de produtos e preços no Stripe...\n');
  
  const results = [];
  
  for (const [userType, userPlans] of Object.entries(plans)) {
    console.log(`📋 Criando planos para ${userType.toUpperCase()}:`);
    
    for (const plan of userPlans) {
      try {
        // Pular planos gratuitos (não precisam de Price ID no Stripe)
        if (plan.price === 0) {
          console.log(`⏭️  ${plan.name}: Gratuito - pulando criação no Stripe`);
          continue;
        }
        
        // 1. Criar produto
        const product = await stripe.products.create({
          name: `Evento+ ${userType.charAt(0).toUpperCase() + userType.slice(1)} - ${plan.name}`,
          description: `Plano ${plan.name} para ${userType}s da plataforma Evento+`,
          metadata: {
            userType: userType,
            planName: plan.name,
            platform: 'evento-plus'
          }
        });
        
        // 2. Criar preço
        const price = await stripe.prices.create({
          currency: plan.currency,
          unit_amount: plan.price, // Valor em centavos
          recurring: {
            interval: plan.interval
          },
          product: product.id,
          metadata: {
            userType: userType,
            planName: plan.name,
            internalId: plan.priceId
          }
        });
        
        results.push({
          userType,
          planName: plan.name,
          productId: product.id,
          priceId: price.id,
          amount: plan.price,
          internalId: plan.priceId
        });
        
        console.log(`✅ ${plan.name}: Produto ${product.id} | Preço ${price.id}`);
        
      } catch (error) {
        console.error(`❌ Erro ao criar ${plan.name}:`, error.message);
      }
    }
    
    console.log(''); // Linha em branco
  }
  
  // Mostrar resumo
  console.log('📊 RESUMO DA CRIAÇÃO:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(`${result.userType.toUpperCase()} ${result.planName}:`);
    console.log(`  💰 Valor: R$ ${(result.amount / 100).toFixed(2)}`);
    console.log(`  🆔 Price ID: ${result.priceId}`);
    console.log(`  🔗 Internal ID: ${result.internalId}`);
    console.log('');
  });
  
  // Gerar código para atualizar o backend
  console.log('🔧 CÓDIGO PARA ATUALIZAR NO BACKEND:');
  console.log('='.repeat(50));
  console.log('const STRIPE_PRICE_IDS = {');
  
  results.forEach(result => {
    console.log(`  "${result.internalId}": "${result.priceId}",`);
  });
  
  console.log('};');
  
  console.log('\n✅ Criação de produtos e preços concluída!');
  console.log('📝 Copie os Price IDs acima para usar no backend.');
}

// Executar script
createStripeProducts().catch(console.error);