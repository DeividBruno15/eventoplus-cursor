import { test, expect } from '@playwright/test';

test('fluxo completo: login e criação de local', async ({ page }) => {
  await page.goto('http://localhost:5000');

  await page.click('text=Login');
  await page.fill('input[name="username"]', 'Anunciante');
  await page.fill('input[name="password"]', 'senha123');
  await page.click('button[type="submit"]');

  await page.click('text=Adicionar Local');
  await page.fill('input[name="name"]', 'Salão Teste Replit');
  await page.fill('input[name="location"]', 'Rua Teste, Uberlândia/MG');
  await page.click('button:has-text("Salvar")');

  await expect(page.locator('text=Salão Teste Replit')).toBeVisible();
});
