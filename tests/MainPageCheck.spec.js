const { test, expect } = require('@playwright/test');

test('Provera dugmica i navigacije na stranici', async ({ page }) => {
  // Base URL za lakšu proveru stranica
  const baseUrl = 'https://github.io';

  // 1. Otvori početnu stranicu
  await page.goto(`${baseUrl}index.html`);

  // 2. Pronađi dugmiće na stranici
  const dugmeBumKutija = page.locator('text=Sklopi svoju BUM poklon kutiju →');
  const dugmePunchTorta = page.locator('text=Kreiraj Punch tortu →');

  // 3. Proveri da li su dugmići vidljivi i da li se može kliknuti na njih (clickable)
  await expect(dugmeBumKutija).toBeVisible();
  await expect(dugmeBumKutija).toBeEnabled();

  await expect(dugmePunchTorta).toBeVisible();
  await expect(dugmePunchTorta).toBeEnabled();

  // 4. Klikni na prvo dugme i proveri da li vodi na dobru stranicu
  await dugmeBumKutija.click();
  // Ovde proveravamo da li se URL promenio i da li sadrži naziv nove stranice
  await expect(page).toHaveURL(/.*bum_kutija.*/);

  // 5. Vrati se nazad na početnu stranicu da testiraš i drugo dugme
  await page.goto(`${baseUrl}index.html`);

  // 6. Klikni na drugo dugme i proveri navigaciju
  await dugmePunchTorta.click();
  await expect(page).toHaveURL(/.*punch_torta.*/);
});
