const { test, expect } = require('@playwright/test');

test('Provera dugmica, navigacije i CSS animacija', async ({ page }) => {
  const baseUrl = 'https://milicaglumicic-speedstep.github.io/Bum_kutije.';
  
  // 1. Otvori početnu stranicu
  await page.goto(`${baseUrl}index.html`);

  // ─── 1. PROVERA AUTOMATSKIH 3D ANIMACIJA KUTIJE ───────────────────
  // Proveravamo da li elementi makete eksplodirajuće kutije postoje na stranici
  const eksplodirajucaKutija = page.locator('.exploding-box');
  const poklopacKutije = page.locator('.box-lid');
  const stranicaKutije = page.locator('.wall-front');

  await expect(eksplodirajucaKutija).toBeVisible();
  await expect(poklopacKutije).toBeVisible();
  await expect(stranicaKutije).toBeVisible();

  // Proveravamo da li su CSS animacije ispravno dodeljene elementima iz CSS-a
  const animacijaKutije = await eksplodirajucaKutija.evaluate(el => window.getComputedStyle(el).animationName);
  const animacijaPoklopca = await poklopacKutije.evaluate(el => window.getComputedStyle(el).animationName);
  
  expect(animacijaKutije).toBe('boxAnticipateShake');
  expect(animacijaPoklopca).toBe('lidExplodeUp');

  // ─── 2. PROVERA HOVER ANIMACIJE NA PUNCH TORTA KARTICI ─────────────
  // Koristimo id="cardPunch" koji sigurno postoji u tvom HTML-u
  const punchKartica = page.locator('#cardPunch');

  const stilPreHovera = await punchKartica.evaluate(el => window.getComputedStyle(el).transform);

  await punchKartica.hover();
  await page.waitForTimeout(350);

  const stilPosleHovera = await punchKartica.evaluate(el => window.getComputedStyle(el).transform);
  expect(stilPreHovera).not.toBe(stilPosleHovera);

  // ─── 3. PROVERA DUGMIĆA I NAVIGACIJE PREKO TEKSTA ─────────────────
  // Playwright podržava pronalaženje elemenata preko tačnog teksta unutar spanova
  const dugmeBumKutija = page.locator('span.hub-btn', { hasText: 'Sklopi svoju BUM poklon kutiju →' });
  const dugmePunchTorta = page.locator('span.hub-btn', { hasText: 'Kreiraj Punch tortu →' });

  // Provera vidljivosti
  await expect(dugmeBumKutija).toBeVisible();
  await expect(dugmePunchTorta).toBeVisible()

  // Testiramo klik za Bum kutiju
  await dugmeBumKutija.click();
  await expect(page).toHaveURL(/.*bum_kutija.*/);

  // Vraćamo se nazad i testiramo klik za Punch tortu
  await page.goto(`${baseUrl}index.html`);
  await dugmePunchTorta.click();
  await expect(page).toHaveURL(/.*punch_torta.*/);
});
