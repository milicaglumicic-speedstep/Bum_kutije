const { test, expect } = require('@playwright/test');

test.describe('Bum Kutija Konfigurator - Dinamički QA Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    const baseUrl = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/';
    await page.goto(`${baseUrl}bum-kutija.html`);
    await page.waitForLoadState('domcontentloaded');
  });

  // Pomoćna funkcija koja u pozadini aktivnog DOM-a pokreće PricingEngine za Bum kutiju
  async function izracunajOcekivanuCenuBumKutije(page) {
    return await page.evaluate(() => {
      if (!window.PricingEngine) return 0;
      
      // Skupljamo vrednosti direktno iz formi i selektora na stranici
      const packageType = document.getElementById('packageTypeSelect')?.value || 'sweets_gift';
      const size = document.getElementById('boxSizeSelect')?.value || 'Standardna';
      const mechanism = document.getElementById('mechanismSelect')?.value || 'Kocke';
      
      let chosenSweets = [];
      document.querySelectorAll('#bumSweetsGroup input:checked').forEach(el => chosenSweets.push(el.value));

      // Pokrećemo tvoju calculateBumBox matematičku formulu iz pricing-engine.js
      return window.PricingEngine.calculateBumBox({
        packageType,
        size,
        mechanism,
        chosenSweets
      });
    });
  }

  /* ============================================================
     1. POZITIVNI TESTOVI (Happy Path & Inicijalno Stanje)
     ============================================================ */
  test('Pozitivan test: Ucitavanje stranice i provera pocetne cene', async ({ page }) => {
    // Provera naslova konfiguratora
    const glavniNaslov = page.locator('.box-card h2');
    await expect(glavniNaslov).toContainText('EKSPLODIRAJUĆA BUM KUTIJA');

    // Dinamički računamo početnu cenu u pozadini preko tvog PricingEngine-a
    const ocekivanaCena = await izracunajOcekivanuCenuBumKutije(page);
    const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;

    // Proveravamo da li se izračunata cena poklapa sa onom na ekranu
    const prikazCene = page.locator('#bumPriceDisplay');
    await expect(prikazCene).toContainText(formatiranaCena);
  });

  /* ============================================================
     2. LOGIČKI TESTOVI POSLOVNE LOGIKE (Promena Cena)
     ============================================================ */
  test('Logicki test: Promena velicine kutije mora dinamicki promeniti cenu na ekarnu', async ({ page }) => {
    const sizeSelect = page.locator('#boxSizeSelect');
    const prikazCene = page.locator('#bumPriceDisplay');

    // 1. Biramo opciju 'Velika' kutiju iz padajućeg menija
    await sizeSelect.selectOption('Velika');
    await sizeSelect.dispatchEvent('change');
    await page.waitForTimeout(300); // Pauza da JS obradi preračun

    // 2. Računamo dinamičku cenu za veliku kutiju u testu
    const ocekivanaCenaVelika = await izracunajOcekivanuCenuBumKutije(page);
    const formatiranaCenaVelika = `${ocekivanaCenaVelika.toLocaleString('sr-RS')} RSD`;

    // 3. Proveravamo da li ekran prikazuje tačnu sumu
    await expect(prikazCene).toContainText(formatiranaCenaVelika);
  });

  test('Logicki test: Promena mehanizma na Combo (Kocke + Leptiri) uvecava cenu', async ({ page }) => {
    const mechanismSelect = page.locator('#mechanismSelect');
    const prikazCene = page.locator('#bumPriceDisplay');

    const pocetnaCenaTekst = await prikazCene.innerText();
    const pocetnaCenaBroj = parseInt(pocetnaCenaTekst.replace(/\D/g, ''));

    // Biramo Combo mehanizam koji prema tvom pricing-engine.js dodaje 500 RSD doplate
    await mechanismSelect.selectOption('Combo');
    await mechanismSelect.dispatchEvent('change');
    await page.waitForTimeout(300);

    // Dinamički računamo cenu sa doplatom
    const ocekivanaCenaCombo = await izracunajOcekivanuCenuBumKutije(page);
    const formatiranaCenaCombo = `${ocekivanaCenaCombo.toLocaleString('sr-RS')} RSD`;

    // Potvrđujemo poklapanje na UI i da je cena matematički veća
    await expect(prikazCene).toContainText(formatiranaCenaCombo);
    
    const novaCenaBroj = parseInt(formatiranaCenaCombo.replace(/\D/g, ''));
    expect(novaCenaBroj).toBeGreaterThan(pocetnaCenaBroj);
  });

  /* ============================================================
     3. FUNKCIONALNI I VALIDACIONI TESTOVI (WhatsApp Poruka)
     ============================================================ */
  test('Pozitivan test: Simulacija porudzbine Bum kutije i provera WhatsApp poruke', async ({ page }) => {
    // 1. Popunjavamo tekstualna polja konfiguratora
    await page.locator('#bumColorInput').fill('Crvena sa crnom trakom');
    await page.locator('#bumThemeInput').fill('Godišnjica braka');
    await page.locator('#bumNotes').fill('Ispisati "Volim te" unutar kutije');

    // Menjamo selekciju na veliku kutiju sa standardnim mehanizmom
    await page.locator('#boxSizeSelect').selectOption('Velika');
    await page.locator('#boxSizeSelect').dispatchEvent('change');
    await page.waitForTimeout(200);

    // 2. Računamo dinamičku cenu u testu da bismo proverili poruku u dinar
    const ocekivanaCena = await izracunajOcekivanuCenuBumKutije(page);
    const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;

    // 3. Presrećemo otvaranje novog prozora (window.open) za slanje poruke
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('button.submit-btn').click()
    ]);

    const whatsappUrl = popup.url();
    // Čistimo plusiće iz URL-a pretvarajući ih u čiste razmake radi lakše provere stringova
    const dekodiranTekst = decodeURIComponent(whatsappUrl).replace(/\+/g, ' ');

    // 4. VERIFIKACIJA STRUKTURE WHATSAPP PORUKE ZA BUM KUTIJU:
    expect(dekodiranTekst).toContain('*Boja torte:* Crvena sa crnom trakom'); // u zavisnosti kako ti se zove labela u tekstu poruke
    expect(dekodiranTekst).toContain('*Tema:* Godišnjica braka');
    expect(dekodiranTekst).toContain('*Veličina:* Velika');
    expect(dekodiranTekst).toContain(`*Cena:* ${formatiranaCena}`);
    expect(dekodiranTekst).toContain('*Slavljenik i želje:* Ispisati "Volim te" unutar kutije');

    await popup.close();
  });

  /* ============================================================
     4. NAVIGACIONI TESTOVI
     ============================================================ */
  test('Navigacija: Povratak sa Bum kutije nazad na pocetnu stranu', async ({ page }) => {
    const nazadLink = page.locator('text=← Nazad na početni izbor');
    await expect(nazadLink).toBeVisible();
    await nazadLink.click();
    
    // Provera da li nas je uspešno vratilo na index.html ekran
    await expect(page).toHaveURL(/.*index.*/);
  });
});
