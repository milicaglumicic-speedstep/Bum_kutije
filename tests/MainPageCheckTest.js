const { test, expect } = require('@playwright/test');

test('Provera pocetne stranice - Elementi, navigacija i sve animacije', async ({ page }) => {
  const baseUrl = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/';
  
  // 1. Otvori početnu stranicu
  await page.goto(`${baseUrl}index.html`);

  // ─── 1. PROVERA INTEGRISANIH 3D ANIMACIJA (BUM KUTIJA) ─────────────
  // Ovi elementi se nalaze unutar gift-scene na samom početku
  const eksplodirajucaKutija = page.locator('.exploding-box');
  const poklopacKutije = page.locator('.box-lid');
  const prednjiZidKutije = page.locator('.wall-front');

  // Potvrđujemo da su svi 3D elementi generisani i vidljivi
  await expect(eksplodirajucaKutija).toBeVisible();
  await expect(poklopacKutije).toBeVisible();
  await expect(prednjiZidKutije).toBeVisible();

  // Čitamo nazive animacija iz tvog CSS-a da potvrdimo da se vrte u petlji
  const animacijaKutije = await eksplodirajucaKutija.evaluate(el => window.getComputedStyle(el).animationName);
  const animacijaPoklopca = await poklopacKutije.evaluate(el => window.getComputedStyle(el).animationName);
  
  expect(animacijaKutije).toBe('boxAnticipateShake');
  expect(animacijaPoklopca).toBe('lidExplodeUp');


  // ─── 2. PROVERA HOVER ANIMACIJA NA KARTICAMA ────────────────────────
  // Testiramo efekat pomeranja nagore (translateY) kada korisnik pređe mišem
  const bumKartica = page.locator('#cardBum');
  const punchKartica = page.locator('#cardPunch');

  const stilPreHovera = await bumKartica.evaluate(el => window.getComputedStyle(el).transform);
  
  // Prelazimo mišem iznad Bum kartice
  await bumKartica.hover();
  await page.waitForTimeout(350); // Kratka pauza za CSS prelaz (0.3s ease)

  const stilPosleHovera = await bumKartica.evaluate(el => window.getComputedStyle(el).transform);
  // Potvrđujemo da se transformacija promenila pod uticajem hover-a
  expect(stilPreHovera).not.toBe(stilPosleHovera);


  // ─── 3. PROVERA DUGMIĆA I PROVERA LINKOVA (NAVIGACIJA) ─────────────
  const dugmeBumKutija = page.locator('span.hub-btn', { hasText: 'Sklopi svoju BUM poklon kutiju →' });
  const dugmePunchTorta = page.locator('span.hub-btn', { hasText: 'Kreiraj Punch tortu →' });

  await expect(dugmeBumKutija).toBeVisible();
  await expect(dugmePunchTorta).toBeVisible();

  // Testiramo klik na prvu karticu - vodi na bum-kutija.html (sa crticom)
  await dugmeBumKutija.click();
  await expect(page).toHaveURL(/.*bum-kutija.*/);

  // Vraćamo se nazad na početni izbor
  await page.goto(`${baseUrl}index.html`);

  // Testiramo klik na drugu karticu - vodi na punch-torta.html (sa crticom)
  await dugmePunchTorta.click();
  await expect(page).toHaveURL(/.*punch-torta.*/);
});
