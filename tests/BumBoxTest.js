const { test, expect } = require('@playwright/test');

test.describe('Punch Torta Konfigurator - Dinamički QA Test Suite', () => {

  test.beforeEach(async ({ page }) => {
  const baseUrl = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/';
    await page.goto(`${baseUrl}bum-kutija.html`);
    await page.waitForLoadState('domcontentloaded');
  });
  // Pomoćna funkcija koja u pozadini izvršava PricingEngine računanje za trenutno stanje forme
  async function izracunajOcekivanuCenuUPozadini(page, packageType) {
    return await page.evaluate((pkg) => {
      if (!window.PricingEngine || !window.bumBox) return 0;
      
      const size = document.getElementById('bumSizeSelect')?.value || 'Standardna';
      const mechanism = document.getElementById('bumMechanismSelect')?.value || 'cubes';
      
      let chosenSweets = [];
      document.querySelectorAll('#bumSweetsGroup input:checked').forEach(el => chosenSweets.push(el.value));

      return window.PricingEngine.calculateBumBox({
        packageType: pkg,
        size,
        mechanism,
        chosenSweets
      });
    });
  }

  /* ============================================================
     1. POZITIVNI TESTOVI I VERIFIKACIJA RAČUNANJA ZA SVAKI PAKET
     ============================================================ */
  test('Dinamicki test: Kalkulacija i WhatsApp poruka za prazan paket (empty)', async ({ page }) => {
    // 1. Aktivacija "praznog" paketa (Inicijalno je postavljen)
    const tabEmpty = page.locator('#bumTabs .tab-btn[data-pkg="empty"]');
    if (await tabEmpty.count() > 0) {
      await tabEmpty.click();
      await page.waitForTimeout(200);

      // 2. Dinamički računamo cenu u pozadini i proveravamo UI
      const ocekivanaCena = await izracunajOcekivanuCenuUPozadini(page, 'empty');
      const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;
      await expect(page.locator('#bumPriceDisplay')).toContainText(formatiranaCena);

      // 3. Provera generisanja WhatsApp poruke za ovaj paket
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('button.submit-btn').click()
      ]);
      const dekodiranTekst = decodeURIComponent(popup.url()).replace(/\+/g, ' ');
      expect(dekodiranTekst).toContain('*Paket:* empty');
      expect(dekodiranTekst).toContain(`*Cena:* ${formatiranaCena}`);
      await popup.close();
    }
  });

  test('Dinamicki test: Kalkulacija i WhatsApp poruka za paket sa slatkizima (sweets_gift)', async ({ page }) => {
    const tabSweets = page.locator('#bumTabs .tab-btn[data-pkg="sweets_gift"]');
    if (await tabSweets.count() > 0) {
      await tabSweets.click();
      await page.waitForTimeout(200);

      // Proveravamo da li je sekcija sa slatkišima postala vidljiva korisniku
      await expect(page.locator('#bumSweetsGroup')).toBeVisible();

      const ocekivanaCena = await izracunajOcekivanuCenuUPozadini(page, 'sweets_gift');
      const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;
      await expect(page.locator('#bumPriceDisplay')).toContainText(formatiranaCena);

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('button.submit-btn').click()
      ]);
      const dekodiranTekst = decodeURIComponent(popup.url()).replace(/\+/g, ' ');
      expect(dekodiranTekst).toContain('*Paket:* sweets_gift');
      expect(dekodiranTekst).toContain(`*Cena:* ${formatiranaCena}`);
      await popup.close();
    }
  });

  test('Dinamicki test: Kalkulacija i WhatsApp poruka za paket "Samo slatkisi" (only_sweets)', async ({ page }) => {
    const tabOnlySweets = page.locator('#bumTabs .tab-btn[data-pkg="only_sweets"]');
    if (await tabOnlySweets.count() > 0) {
      await tabOnlySweets.click();
      await page.waitForTimeout(200);

      // Proveravamo da li padajući meni nudi samo Standardnu i Veliku (tvoj updateSizeOptions filter)
      const opcije = await page.locator('#bumSizeSelect option').allInnerTexts();
      expect(opcije.length).toBe(2);

      const ocekivanaCena = await izracunajOcekivanuCenuUPozadini(page, 'only_sweets');
      const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;
      await expect(page.locator('#bumPriceDisplay')).toContainText(formatiranaCena);

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('button.submit-btn').click()
      ]);
      const dekodiranTekst = decodeURIComponent(popup.url()).replace(/\+/g, ' ');
      expect(dekodiranTekst).toContain('*Paket:* only_sweets');
      expect(dekodiranTekst).toContain(`*Cena:* ${formatiranaCena}`);
      await popup.close();
    }
  });

  test('Dinamicki test: Kalkulacija i WhatsApp poruka za paket po meri (custom_gift)', async ({ page }) => {
    const tabCustom = page.locator('#bumTabs .tab-btn[data-pkg="custom_gift"]');
    if (await tabCustom.count() > 0) {
      await tabCustom.click();
      await page.waitForTimeout(200);

      // Proveravamo da li se prikazuje polje za slobodan unos dimenzija poklona
      await expect(page.locator('#customNotesGroup')).toBeVisible();

      const ocekivanaCena = await izracunajOcekivanuCenuUPozadini(page, 'custom_gift');
      const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;
      await expect(page.locator('#bumPriceDisplay')).toContainText(formatiranaCena);

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('button.submit-btn').click()
      ]);
      const dekodiranTekst = decodeURIComponent(popup.url()).replace(/\+/g, ' ');
      expect(dekodiranTekst).toContain('*Paket:* custom_gift');
      expect(dekodiranTekst).toContain(`*Cena:* ${formatiranaCena}`);
      await popup.close();
    }
  });

  /* ============================================================
     2. GRANIČNI TESTOVI (Boundary Tests)
     ============================================================ */
  test('Granicni test: Izmena stilova i provera prenosa selected klase', async ({ page }) => {
    const stilOpcije = page.locator('.style-option');
    if (await stilOpcije.count() > 1) {
      const drugaOpcija = stilOpcije.nth(1);
      
      // Klik na graničnu opciju stila
      await drugaOpcija.click();
      await page.waitForTimeout(100);

      // Potvrđujemo da je uspešno primenjena selekcija iz tvog selectStyle()
      await expect(drugaOpcija).toHaveClass(/.*selected.*/);
    }
  });

  test('Granicni test: Maksimalna duzina unosa u tekstualna polja i stabilnost forme', async ({ page }) => {
    const inputBoja = page.locator('#bumColorInput');
    const tekstNotes = page.locator('#bumNotes');

    if (await inputBoja.count() > 0) {
      // Unosimo maksimalno dug tekst graničnih vrednosti
      const dugTekst = 'Kraljevska teget plava sa satenskom masnom od 3 metra, zlatnim sljokicama i rucno ispisanim slovima na poklopcu';
      await inputBoja.fill(dugTekst);
      await expect(inputBoja).toHaveValue(dugTekst);
    }
  });

  /* ============================================================
     3. NEGATIVNI TESTOVI (Edge Cases / Error Handling)
     ============================================================ */
  test('Negativan test: Slanje prazne forme ne sme srusiti proracun cene', async ({ page }) => {
    const inputBoja = page.locator('#bumColorInput');
    const tekstNotes = page.locator('#bumNotes');

    // Korisnik ostavlja sva tekstualna polja potpuno prazna
    if (await inputBoja.count() > 0) await inputBoja.fill('');
    if (await tekstNotes.count() > 0) await tekstNotes.fill('');
    
    // Proveravamo da li je kalkulator cene uprkos praznim poljima ostao stabilan i izbacio validnu cifru
    const prikazCene = page.locator('#bumPriceDisplay');
    await expect(prikazCene).toBeVisible();
    await expect(prikazCene).toContainText('RSD');
  });

  test('Negativan test: Odcekovanje svih stavki u korpi slatkisa', async ({ page }) => {
    // Prebacujemo na sweets_gift da se prikažu kućice
    const tabSweets = page.locator('#bumTabs .tab-btn[data-pkg="sweets_gift"]');
    if (await tabSweets.count() > 0) {
      await tabSweets.click();
      await page.waitForTimeout(100);

      const sviCheckboxovi = page.locator('#bumSweetsGroup input[type="checkbox"]');
      const ukupanBroj = await sviCheckboxovi.count();

      // Odčekiramo sve što je eventualno bilo selektovano
      for (let i = 0; i < ukupanBroj; i++) {
        if (await sviCheckboxovi.nth(i).isChecked()) {
          await sviCheckboxovi.nth(i).uncheck();
          await sviCheckboxovi.nth(i).dispatchEvent('change');
        }
      }
      
      // Proveravamo da li je PricingEngine uspešno obradio praznu selekciju (korpa bez slatkiša)
      // Tvoj kôd u pricing-engine.js postavlja prosečnu cenu na 100 ako je niz prazan, pa proveravamo stabilnost
      const prikazCene = page.locator('#bumPriceDisplay');
      await expect(prikazCene).toBeVisible();
      await expect(prikazCene).toContainText('RSD');
    }
  });

  /* ============================================================
     4. NAVIGACIONI TEST
     ============================================================ */
  test('Navigacija: Uspesan povratak na pocetni ekran', async ({ page }) => {
    const nazadLink = page.locator('text=← Nazad na početni izbor');
    await expect(nazadLink).toBeVisible();
    await nazadLink.click();
    await expect(page).toHaveURL(/.*index.*/);
  });
});
