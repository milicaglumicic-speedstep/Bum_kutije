const { test, expect } = require('@playwright/test');

const LOKALNA_PUTANJA = './punch-torta.html';

test.describe('Punch Torta Konfigurator - Napredni QA Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(LOKALNA_PUTANJA);
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
     2. NOVI TESTOVI: DINAMIČKA DINAMIKA SPRATOVA I RAČUNANJA CENE
     ============================================================ */
  test('Logicki test: Povecanje pregrada preko 16 menja cenu i prebacuje tortu na 2 sprata', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');
    const prikazCene = page.locator('#punchPriceDisplay');
    const kutijaZaSpratove = page.locator('#tierInfoBox');

    // 1. Uzimamo pocetnu cenu za 16 pregrada (3.800 RSD)
    const pocetnaCenaTekst = await prikazCene.innerText();

    // 2. Upisujemo 20 pregrada (sto je veće od 16 i aktivira drugi sprat)
    await inputPregrade.fill('20');
    await page.waitForTimeout(100); // Kratka pauza da kalkulator i JS ažuriraju dom

    // 3. Provera da li se cena promenila i porasla na više
    const novaCenaTekst = await prikazCene.innerText();
    expect(pocetnaCenaTekst).not.toBe(novaCenaTekst);

    // Pretvaramo tekst u broj kako bismo osigurali logičku ispravnost (veća cena)
    const pocetnaCenaBroj = parseInt(pocetnaCenaTekst.replace(/\D/g, ''));
    const novaCenaBroj = parseInt(novaCenaTekst.replace(/\D/g, ''));
    expect(novaCenaBroj).toBeGreaterThan(pocetnaCenaBroj);

    // 4. Provera teksta obaveštenja o spratnosti unutar #tierInfoBox elementa
    // Test proverava da li se pojavila reč "2" ili reč "sprat" u zavisnosti od tvoje JS poruke
    await expect(kutijaZaSpratove).toBeVisible();
    await expect(kutijaZaSpratove).toContainText(/.*(2|sprat).*/i);
  });

  test('Logicki test: Dodavanje igrackica uz slatkise mora da uveca krajnju cenu', async ({ page }) => {
    const prikazCene = page.locator('#punchPriceDisplay');
    const karticaSlatkisiIgrackice = page.locator('#fillOptMix');

    // 1. Snimamo trenutnu cenu kada su izabrani samo slatkiši
    const cenaSamoSlatkisiTekst = await prikazCene.innerText();
    const cenaSamoSlatkisiBroj = parseInt(cenaSamoSlatkisiTekst.replace(/\D/g, ''));

    // 2. Kliknemo na opciju "Slatkiši + Igračkice" da aktiviramo doplatu od 70 RSD po rupi
    await karticaSlatkisiIgrackice.click();
    await page.waitForTimeout(100);

    // 3. Proveravamo da li je cena porasla na više
    const cenaSaIgrackamaTekst = await prikazCene.innerText();
    const cenaSaIgrackamaBroj = parseInt(cenaSaIgrackamaTekst.replace(/\D/g, ''));
    
    expect(cenaSaIgrackamaBroj).toBeGreaterThan(cenaSamoSlatkisiBroj);
  });

  /* ============================================================
     3. FUNKCIONALNI TESTOVI: DIJALOZI I POLJA
     ============================================================ */
  test('Funkcionalni test: Izbor opcije "Drugo" dinamicki prikazuje input polje', async ({ page }) => {
    const selektBrojaSlatkisa = page.locator('#sweetsPerHoleSelect');
    const customInputOmotac = page.locator('#customSweetsPerHoleWrap');

    await expect(customInputOmotac).toBeHidden();
    await selektBrojaSlatkisa.selectOption('custom');
    await expect(customInputOmotac).toBeVisible();
  });

  /* ============================================================
     4. GRANIČNI I NEGATIVNI TESTOVI
     ============================================================ */
  test('Granicni test: Unos maksimalnog i minimalnog broja pregrada', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');

    await inputPregrade.fill('6');
    let validnoMin = await inputPregrade.evaluate(el => el.checkValidity());
    expect(validnoMin).toBe(true);

    await inputPregrade.fill('50');
    let validnoMax = await inputPregrade.evaluate(el => el.checkValidity());
    expect(validnoMax).toBe(true);
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
});
