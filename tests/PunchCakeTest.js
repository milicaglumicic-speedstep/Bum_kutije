const { test, expect } = require('@playwright/test');

test.describe('Punch Torta Konfigurator - Dinamički QA Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    const baseUrl = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/';
    await page.goto(`${baseUrl}punch-torta.html`);
    await page.waitForLoadState('domcontentloaded');
  });

  // Pomoćna funkcija koja izvlači trenutno stanje forme i računa cenu preko tvog PricingEngine-a
  async function izracunajOcekivanuCenuUPozadini(page) {
    return await page.evaluate(() => {
      if (!window.PricingEngine || !window.punchCake) return 0;
      
      const holes = parseInt(document.getElementById('punchHolesInput')?.value, 10) || 16;
      const sweetsPerHole = window.punchCake.getSweetsPerHoleCount();
      const withToys = window.punchCake.withToys;
      const tiers = window.punchCake.calculatedTiers;
      
      let selectedSweets = [];
      document.querySelectorAll('#punchSweetsGroup input:checked').forEach(el => selectedSweets.push(el.value));

      return window.PricingEngine.calculatePunchCake({
        holes,
        tiers,
        sweetsPerHole,
        selectedSweets,
        withToys
      });
    });
  }

  /* ============================================================
     1. POZITIVNI TESTOVI (Happy Path & WhatsApp Validacija)
     ============================================================ */
  test('Pozitivan test: Ucitavanje forme i dinamicka provera pocetne cene', async ({ page }) => {
    const naslovTorte = page.locator('.box-card h2');
    await expect(naslovTorte).toContainText('PUNCH ROĐENDANSKA TORTA');
    
    const ocekivanaCena = await izracunajOcekivanuCenuUPozadini(page);
    const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;

    const prikazCene = page.locator('#punchPriceDisplay');
    await expect(prikazCene).toContainText(formatiranaCena);
  });

  test('Pozitivan test: Inicijalno su cekirana tacno 3 slatkisa', async ({ page }) => {
    const sviCheckboxovi = page.locator('#punchSweetsGroup input[type="checkbox"]');
    const ukupanBroj = await sviCheckboxovi.count();

    let brojacCekiranih = 0;
    for (let i = 0; i < ukupanBroj; i++) {
      if (await sviCheckboxovi.nth(i).isChecked()) {
        brojacCekiranih++;
      }
    }
    expect(brojacCekiranih).toBe(3);
  });

  test('Pozitivan test: Narucivanje torte na 1 SPRAT i provera WhatsApp poruke', async ({ page }) => {
    // 1. Popunjavamo formu podacima za 1 sprat (16 pregrada je podrazumevano)
    await page.locator('#punchColorInput').fill('Bela sa sljokicama');
    await page.locator('#punchThemeInput').fill('Barbie tema');
    await page.locator('#punchNotes').fill('Mila, 4 godine');

    // 2. Računamo dinamičku cenu u pozadini kako bismo znali šta da očekujemo u poruci
    const ocekivanaCena = await izracunajOcekivanuCenuUPozadini(page);
    const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;

    // 3. Presrećemo otvaranje novog prozora (window.open) za WhatsApp
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('button.submit-btn').click()
    ]);

    // 4. Uzimamo URL generisanog WhatsApp linka i dekodiramo tekst poruke
    const whatsappUrl = popup.url();
    const dekodiranTekst = decodeURIComponent(whatsappUrl);

    // 5. RASPАКIVANJE I PROVERA FORMATA PORUKE:
    expect(dekodiranTekst).toContain('Theme: Barbie tema');
    expect(dekodiranTekst).toContain('Boja torte: Bela sa sljokicama');
    expect(dekodiranTekst).toContain('Broj pregrada: 16 rupa (1 sprat/a)');
    expect(dekodiranTekst).toContain(`Cena: ${formatiranaCena}`);
    expect(dekodiranTekst).toContain('Slavljenik i zelje: Mila, 4 godine');
    
    await popup.close();
  });

  test('Pozitivan test: Narucivanje torte na 2 SPRATA sa igrackama i provera WhatsApp poruke', async ({ page }) => {
    // 1. Unosimo 24 pregrade što pokreće konstrukciju od 2 sprata
    const inputPregrade = page.locator('#punchHolesInput');
    await inputPregrade.fill('24');
    await inputPregrade.dispatchEvent('input');

    // 2. Biramo dodatak Slatkiši + Igračkice
    await page.locator('#fillOptMix').click();

    // 3. Popunjavamo ostale detalje
    await page.locator('#punchColorInput').fill('Plava i zuta');
    await page.locator('#punchThemeInput').fill('Paw Patrol');
    await page.locator('#punchNotes').fill('Pavle, 5 godina');
    await page.waitForTimeout(200);

    // 4. Dinamički računamo novu uvećanu cenu (baza + 2 sprata + doplate za igračke)
    const ocekivanaCena = await izracunajOcekivanuCenuUPozadini(page);
    const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;

    // 5. Klikćemo na dugme i hvatamo WhatsApp iskakanje
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('button.submit-btn').click()
    ]);

    const whatsappUrl = popup.url();
    const dekodiranTekst = decodeURIComponent(whatsappUrl);

    // 6. PROVERA ZAVRŠNOG TEKSTA ZA DVO SPRATNU TORTU SA DODACIMA:
    expect(dekodiranTekst).toContain('Theme: Paw Patrol');
    expect(dekodiranTekst).toContain('Boja torte: Plava i zuta');
    expect(dekodiranTekst).toContain('Broj pregrada: 24 rupa (2 sprat/a)');
    expect(dekodiranTekst).toContain('Dodaci: Slatkisi + Igrackice/Privesci');
    expect(dekodiranTekst).toContain(`Cena: ${formatiranaCena}`);
    expect(dekodiranTekst).toContain('Slavljenik i zelje: Pavle, 5 godina');

    await popup.close();
  });

  /* ============================================================
     2. LOGIČKI TESTOVI (Dinamička verifikacija kalkulacije)
     ============================================================ */
  test('Logicki test: Povecanje pregrada preko 16 dinamicki menja i poredi cenu', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');
    const prikazCene = page.locator('#punchPriceDisplay');
    const kutijaZaSpratove = page.locator('#tierInfoBox');

    await inputPregrade.fill('20');
    await inputPregrade.dispatchEvent('input');
    await page.waitForTimeout(300); 

    const ocekivanaCena = await izracunajOcekivanuCenuUPozadini(page);
    const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;

    await expect(prikazCene).toContainText(formatiranaCena);
    await expect(kutijaZaSpratove).toContainText('2 SPRATA');
  });

  test('Logicki test: Dodavanje igrackica uz slatkise dinamicki proverava uvecanje cene', async ({ page }) => {
    const prikazCene = page.locator('#punchPriceDisplay');
    const karticaSlatkisiIgrackice = page.locator('#fillOptMix');

    await karticaSlatkisiIgrackice.click();
    await page.waitForTimeout(300);

    const ocekivanaCena = await izracunajOcekivanuCenuUPozadini(page);
    const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;

    await expect(prikazCene).toContainText(formatiranaCena);
  });

  /* ============================================================
     3. NEGATIVNI TESTOVI (Validacija, Tastatura i Popup)
     ============================================================ */

  test('Negativan test: HTML5 restrikcija i auto-reset za nevalidne pregrade', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');

    await inputPregrade.fill('2');
    await inputPregrade.dispatchEvent('input');
    await expect(inputPregrade).toHaveValue('6');

    await inputPregrade.fill('60');
    await inputPregrade.dispatchEvent('input');
    let validnoIznad = await inputPregrade.evaluate(el => el.checkValidity());
    expect(validnoIznad).toBe(false);
  });

  test('Negativan test: Pokusaj gasenja svih slatkisa okida browser popup', async ({ page }) => {
    const sviCheckboxovi = page.locator('#punchSweetsGroup input[type="checkbox"]');
    
    let popupSePojavio = false;
    page.on('dialog', async dialog => {
      popupSePojavio = true;
      await dialog.accept();
    });

    const ukupanBroj = await sviCheckboxovi.count();
    for (let i = 0; i < ukupanBroj; i++) {
      if (await sviCheckboxovi.nth(i).isChecked()) {
        await sviCheckboxovi.nth(i).uncheck().catch(() => {});
        await sviCheckboxovi.nth(i).dispatchEvent('change');
      }
    }
    expect(popupSePojavio).toBe(true);
  });

  /* ============================================================
     4. FUNKCIONALNI I GRANIČNI TESTOVI
     ============================================================ */
  test('Funkcionalni test: Izbor opcije "Drugo" dinamicki prikazuje input polje', async ({ page }) => {
    const selektBrojaSlatkisa = page.locator('#sweetsPerHoleSelect');
    const customInputOmotac = page.locator('#customSweetsPerHoleWrap');

    await expect(customInputOmotac).toBeHidden();
    await selektBrojaSlatkisa.selectOption('custom');
    await expect(customInputOmotac).toBeVisible();
  });

  test('Granicni test: Unos maksimalnog i minimalnog broja pregrada', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');

    await inputPregrade.fill('6');
    await inputPregrade.dispatchEvent('input');
    let validnoMin = await inputPregrade.evaluate(el => el.checkValidity());
    expect(validnoMin).toBe(true);

    await inputPregrade.fill('50');
  });
    /* ============================================================
     5. FUNKCIONALNI TEST ZA ČEKIRANJE SLATKIŠA
     ============================================================ */
  test('Logicki test: Stikliranje novog slatkisa povecava cenu, a destikliranje smanjuje', async ({ page }) => {
    const prikazCene = page.locator('#punchPriceDisplay');
    
    // Inicijalno imamo 3 čekirana slatkiša. Uzimamo početnu cenu.
    const pocetnaCenaTekst = await prikazCene.innerText();
    const pocetnaCenaBroj = parseInt(pocetnaCenaTekst.replace(/\D/g, ''));

    // 1. Pronalazimo četvrti slatkiš (Krem bananica) koji je inicijalno ODČEKIRAN
    const bananicaCheckbox = page.locator('#punchSweetsGroup input[value="bananica"]');
    
    // Štikliramo Krem bananicu i simuliramo promenu na formi
    await bananicaCheckbox.check();
    await bananicaCheckbox.dispatchEvent('change');
    await page.waitForTimeout(300);

    // Proveravamo da li je cena uspešno PORASLA
    const cenaNakonStikliranjaTekst = await prikazCene.innerText();
    const cenaNakonStikliranjaBroj = parseInt(cenaNakonStikliranjaTekst.replace(/\D/g, ''));
    expect(cenaNakonStikliranjaBroj).toBeGreaterThan(pocetnaCenaBroj);

    // 2. Sada DEŠTIKLIRAMO isti slatkiš (isključujemo Krem bananicu)
    await bananicaCheckbox.uncheck();
    await bananicaCheckbox.dispatchEvent('change');
    await page.waitForTimeout(300);

    // Proveravamo da li se cena uspešno VRATILA na manju, početnu vrednost
    const krajnjaCenaTekst = await prikazCene.innerText();
    const krajnjaCenaBroj = parseInt(krajnjaCenaTekst.replace(/\D/g, ''));
    expect(krajnjaCenaBroj).toBeLessThan(cenaNakonStikliranjaBroj);
    expect(krajnjaCenaBroj).toBe(pocetnaCenaBroj);
  });

});
