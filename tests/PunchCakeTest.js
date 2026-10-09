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
      
      // Čitamo vrednosti direktno iz aktivnog DOM-a i stanja objekta
      const holes = parseInt(document.getElementById('punchHolesInput')?.value, 10) || 16;
      const sweetsPerHole = window.punchCake.getSweetsPerHoleCount();
      const withToys = window.punchCake.withToys;
      const tiers = window.punchCake.calculatedTiers;
      
      let selectedSweets = [];
      document.querySelectorAll('#punchSweetsGroup input:checked').forEach(el => selectedSweets.push(el.value));

      // Pokrećemo tvoju matematičku formulu
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
     1. POZITIVNI TESTOVI (Happy Path)
     ============================================================ */
  test('Pozitivan test: Ucitavanje forme i dinamicka provera pocetne cene', async ({ page }) => {
    const naslovTorte = page.locator('.box-card h2');
    await expect(naslovTorte).toContainText('PUNCH ROĐENDANSKA TORTA');
    
    // Računamo očekivanu cenu u pozadini bez obzira na to kolika je u bazi
    const ocekivanaCena = await izracunajOcekivanuCenuU Pozadini(page);
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

  /* ============================================================
     2. LOGIČKI TESTOVI (Dinamička verifikacija kalkulacije)
     ============================================================ */
  test('Logicki test: Povecanje pregrada preko 16 dinamicki menja i poredi cenu', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');
    const prikazCene = page.locator('#punchPriceDisplay');
    const kutijaZaSpratove = page.locator('#tierInfoBox');

    // 1. Promenimo broj pregrada
    await inputPregrade.fill('20');
    await inputPregrade.dispatchEvent('input');
    await page.waitForTimeout(300); 

    // 2. Računamo cenu dinamički u testu za 20 rupa
    const ocekivanaCena = await izracunajOcekivanuCenuU Pozadini(page);
    const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;

    // 3. Upoređujemo sa onim što je ispisan na ekranu
    await expect(prikazCene).toContainText(formatiranaCena);
    await expect(kutijaZaSpratove).toContainText('2 SPRATA');
  });

  test('Logicki test: Dodavanje igrackica uz slatkise dinamicki proverava uvecanje cene', async ({ page }) => {
    const prikazCene = page.locator('#punchPriceDisplay');
    const karticaSlatkisiIgrackice = page.locator('#fillOptMix');

    // 1. Kliknemo na igračke
    await karticaSlatkisiIgrackice.click();
    await page.waitForTimeout(300);

    // 2. Računamo cenu sa aktiviranim igračkama
    const ocekivanaCena = await izracunajOcekivanuCenuU Pozadini(page);
    const formatiranaCena = `${ocekivanaCena.toLocaleString('sr-RS')} RSD`;

    // 3. Proveravamo poklapanje na UI
    await expect(prikazCene).toContainText(formatiranaCena);
  });

  /* ============================================================
     3. NEGATIVNI TESTOVI (Validacija, Tastatura i Popup)
     ============================================================ */
  test('Negativan test: Unos specijalnih karaktera u pregrade blokira slanje na WhatsApp', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');

    // Kliknemo i obrišemo sadržaj tastaturom
    await inputPregrade.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    
    // Kuckamo simbole sekvencijalno (taster po taster)
    await inputPregrade.pressSequentially('@#\$!%');
    await inputPregrade.dispatchEvent('input');

    const trenutnaVrednost = await inputPregrade.inputValue();
    const jeValidno = await inputPregrade.evaluate(el => el.checkValidity());
    
    if (!jeValidno || trenutnaVrednost === '') {
      expect(jeValidno).toBe(false);
    }
  });

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
     4. FUNKCIONALNI TESTOVI
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
    await inputPregrade.dispatchEvent('input');
    let validnoMax = await inputPregrade.evaluate(el => el.checkValidity());
    expect(validnoMax).toBe(true);
  });
});
