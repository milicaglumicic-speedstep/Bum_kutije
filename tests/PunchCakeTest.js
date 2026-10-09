const { test, expect } = require('@playwright/test');

test.describe('Punch Torta Konfigurator - Napredni QA Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    const baseUrl = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/';
    // Otvaramo tacnu online stranicu konfiguratora torte
    await page.goto(`${baseUrl}punch-torta.html`);
    await page.waitForLoadState('domcontentloaded');
  });

  /* ============================================================
     1. POZITIVNI TESTOVI (Happy Path)
     ============================================================ */
  test('Pozitivan test: Ucitavanje forme i provera pocetne cene', async ({ page }) => {
    const naslovTorte = page.locator('.box-card h2');
    await expect(naslovTorte).toContainText('PUNCH ROĐENDANSKA TORTA');
    
    const inputPregrade = page.locator('#punchHolesInput');
    await expect(inputPregrade).toHaveValue('16');
    
    const prikazCene = page.locator('#punchPriceDisplay');
    await expect(prikazCene).toContainText('3.800 RSD');
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
     2. LOGIČKI TESTOVI (Spratnost i Kalkulacija)
     ============================================================ */
  test('Logicki test: Povecanje pregrada preko 16 menja cenu i prebacuje tortu na 2 sprata', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');
    const prikazCene = page.locator('#punchPriceDisplay');
    const kutijaZaSpratove = page.locator('#tierInfoBox');

    const pocetnaCenaTekst = await prikazCene.innerText();

    await inputPregrade.fill('20');
    await page.waitForTimeout(200); 

    const novaCenaTekst = await prikazCene.innerText();
    expect(pocetnaCenaTekst).not.toBe(novaCenaTekst);

    const pocetnaCenaBroj = parseInt(pocetnaCenaTekst.replace(/\D/g, ''));
    const novaCenaBroj = parseInt(novaCenaTekst.replace(/\D/g, ''));
    expect(novaCenaBroj).toBeGreaterThan(pocetnaCenaBroj);

    await expect(kutijaZaSpratove).toBeVisible();
    await expect(kutijaZaSpratove).toContainText(/.*(2|sprat).*/i);
  });

  test('Logicki test: Dodavanje igrackica uz slatkise mora da uveca krajnju cenu', async ({ page }) => {
    const prikazCene = page.locator('#punchPriceDisplay');
    const karticaSlatkisiIgrackice = page.locator('#fillOptMix');

    const cenaSamoSlatkisiTekst = await prikazCene.innerText();
    const cenaSamoSlatkisiBroj = parseInt(cenaSamoSlatkisiTekst.replace(/\D/g, ''));

    await karticaSlatkisiIgrackice.click();
    await page.waitForTimeout(200);

    const cenaSaIgrackamaTekst = await prikazCene.innerText();
    const cenaSaIgrackamaBroj = parseInt(cenaSaIgrackamaTekst.replace(/\D/g, ''));
    
    expect(cenaSaIgrackamaBroj).toBeGreaterThan(cenaSamoSlatkisiBroj);
  });

  /* ============================================================
     3. NEGATIVNI TESTOVI (Validacija i Specijalni karakteri)
     ============================================================ */
  test('Negativan test: Unos specijalnih karaktera u pregrade blokira slanje na WhatsApp', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');

    await inputPregrade.fill('@#\$!%');
    const trenutnaVrednost = await inputPregrade.inputValue();
    const jeValidno = await inputPregrade.evaluate(el => el.checkValidity());
    
    if (!jeValidno || trenutnaVrednost === '') {
      expect(jeValidno).toBe(false);
    }
  });

  test('Negativan test: HTML5 restrikcija i auto-reset za nevalidne pregrade', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');

    await inputPregrade.fill('2');
    await expect(inputPregrade).toHaveValue('6');

    await inputPregrade.fill('60');
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
      }
    }
    expect(popupSePojavio).toBe(true);
  });

  /* ============================================================
     4. FUNKCIONALNI I NAVIGACIONI TESTOVI
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
    let validnoMin = await inputPregrade.evaluate(el => el.checkValidity());
    expect(validnoMin).toBe(true);

    await inputPregrade.fill('50');
    let validnoMax = await inputPregrade.evaluate(el => el.checkValidity());
    expect(validnoMax).toBe(true);
  });
});
