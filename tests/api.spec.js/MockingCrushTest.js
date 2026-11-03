const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/';

test.describe('Bum Kutije - WhatsApp API & Message Payload Validation', () => {

  test('WhatsApp Integracija: Provjera generiranja narudžbe, URL parametara i formata poruke', async ({ page }) => {
    await page.goto(`${BASE_URL}bum-kutija.html`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Odabir paketa (Paket 2: BUM kutija sa punjenim stranama)
    const tabSweets = page.locator('#bumTabs .tab-btn[data-pkg="sweets_gift"]');
    await tabSweets.click();
    await expect(tabSweets).toHaveClass(/active/);

    // 2. Unos parametara narudžbe kroz formu
    await page.locator('#bumSizeSelect').selectOption('18x18x18');
    await page.locator('#bumColorInput').fill('Zlatno-crna');
    await page.locator('#bumInteriorSelect').selectOption('Zvezdice');

    // 3. Odabir punjenja (provjera checkboxa)
    const ferreroCheckbox = page.locator('#bumSweetsList input[value="ferrero"]');
    if (!(await ferreroCheckbox.isChecked())) {
      await ferreroCheckbox.check();
    }

    // Unos napomene / povoda
    await page.locator('#bumNotes').fill('Rođendansko iznenađenje za kolegu');

    // 4. Presretanje otvaranja WhatsApp web servisa (wa.me)
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('button.submit-btn').click()
    ]);

    await popup.waitForLoadState('domcontentloaded');

    // 5. Validacija API endpointa i broja telefona
    const rawUrl = popup.url();
    expect(rawUrl).toContain('https://wa.me/381644667485');

    // 6. Dekodiranje mrežnog payloada (URL decode)
    const urlObj = new URL(rawUrl);
    const messagePayload = urlObj.searchParams.get('text');

    expect(messagePayload).not.toBeNull();

    // 7. Dubinska provjera strukture generirane poruke prema specifikaciji
    expect(messagePayload).toContain('Pozdrav! Želim poručiti BUM kutiju:');
    expect(messagePayload).toContain('Paket: 2. BUM kutija sa punjenim stranama');
    expect(messagePayload).toContain('Veličina: 18x18x18');
    expect(messagePayload).toContain('Boja: Zlatno-crna');
    expect(messagePayload).toContain('Dekoracija enterijera: Zvezdice');
    expect(messagePayload).toContain('Mehanizam: Iskačuće pop-up kocke');
    expect(messagePayload).toContain('Ferrero Rocher');
    expect(messagePayload).toContain('Povod / opis želje: Rođendansko iznenađenje za kolegu');

    // Zatvaranje popup prozora
    await popup.close();
  });

  // Dodatni negativni test: Provjera ponašanja kada korisnik ostavi prazna polja
  test('WhatsApp Integracija: Fallback vrijednosti kada forma nije popunjena', async ({ page }) => {
    await page.goto(`${BASE_URL}bum-kutija.html`);
    await page.waitForLoadState('domcontentloaded');

    // Ostavljamo formu potpuno praznom i klikćemo na narudžbu
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('button.submit-btn').click()
    ]);

    const urlObj = new URL(popup.url());
    const messagePayload = urlObj.searchParams.get('text');

    // Provjera definiranih default vrijednosti
    expect(messagePayload).toContain('Paket: 1. Prazna BUM kutija');
    expect(messagePayload).toContain('Boja: Standardna');
    expect(messagePayload).toContain('Dekoracija enterijera: Standardni');

    await popup.close();
  });

});
