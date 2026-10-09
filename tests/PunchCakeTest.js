const { test, expect } = require('@playwright/test');

const URL_PUNCH = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/punch-torta.html';

test.describe('Punch Torta Konfigurator - Napredni QA Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL_PUNCH);
  });

  /* ============================================================
     1. POZITIVNI TESTOVI (Happy Path)
     ============================================================ */
  test('Pozitivan test: Ucitavanje forme i provera pocetne cene', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('PUNCH ROĐENDANSKA TORTA');
    const inputPregrade = page.locator('#punchHolesInput');
    await expect(inputPregrade).toHaveValue('16');
    const prikazCene = page.locator('#punchPriceDisplay');
    await expect(prikazCene).toContainText('3.800 RSD');
    const whatsappBtn = page.locator('button.submit-btn');
    await expect(whatsappBtn).toBeVisible();
    await expect(whatsappBtn).toBeEnabled();
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
     2. NOVI TESTOVI: DINAMIČKA LOGIKA I INPUT POLJA
     ============================================================ */
  test('Funkcionalni test: Izbor opcije "Drugo" dinamicki prikazuje input polje', async ({ page }) => {
    const selektBrojaSlatkisa = page.locator('#sweetsPerHoleSelect');
    const customInputOmotac = page.locator('#customSweetsPerHoleWrap');
    const customInputPolje = page.locator('#customSweetsPerHoleInput');

    // 1. Proveravamo da je polje za proizvoljan unos sakriveno na početku (display: none)
    await expect(customInputOmotac).toBeHidden();

    // 2. Biramo opciju "custom" iz padajućeg menija
    await selektBrojaSlatkisa.selectOption('custom');

    // 3. Proveravamo da li je polje sada postalo vidljivo korisniku
    await expect(customInputOmotac).toBeVisible();

    // 4. Proveravamo da li polje ima podrazumevanu vrednost 4 i validna HTML5 ograničenja (min=1, max=10)
    await expect(customInputPolje).toHaveValue('4');
    
    await customInputPolje.fill('5');
    let validno = await customInputPolje.evaluate(el => el.checkValidity());
    expect(validno).toBe(true);
  });

  test('Funkcionalni test: Unos teksta za boju, temu i napomene slavljenika', async ({ page }) => {
    const inputBoja = page.locator('#punchColorInput');
    const inputTema = page.locator('#punchThemeInput');
    const tekstNapomena = page.locator('#punchNotes');

    // Simuliramo unos detaljnih tekstualnih podataka u konfigurator
    await inputBoja.fill('Kraljevsko plava sa zlatnim detaljima');
    await inputTema.fill('Spiderman i Avengers');
    await tekstNapomena.fill('Marko, 5 godina. Ispisati ime crvenim slovima.');

    // Potvrđujemo da su svi tekstovi ispravno upisani u polja
    await expect(inputBoja).toHaveValue('Kraljevsko plava sa zlatnim detaljima');
    await expect(inputTema).toHaveValue('Spiderman i Avengers');
    await expect(tekstNapomena).toHaveValue('Marko, 5 godina. Ispisati ime crvenim slovima.');
  });

  test('Funkcionalni test: Selekcija radio-kartica za izbor poklona', async ({ page }) => {
    const karticaSamoSlatkisi = page.locator('#fillOptSlatkisi');
    const karticaSlatkisiIgrackice = page.locator('#fillOptMix');

    // 1. Proveravamo da li je kartica "Samo slatkiši" inicijalno selektovana (ima klasu selected)
    await expect(karticaSamoSlatkisi).toHaveClass(/.*selected.*/);
    await expect(karticaSlatkisiIgrackice).not.toHaveClass(/.*selected.*/);

    // 2. Kliknemo na karticu "Slatkiši + Igračkice"
    await karticaSlatkisiIgrackice.click();
    await page.waitForTimeout(100); // Kratka pauza da JavaScript odradi svoje

    // 3. Proveravamo da li se klasa "selected" uspešno premestila na drugu karticu
    // Napomena: Pošto u tvom HTML-u postoji mali typo u onclick-u (punchCakeķ.ys), 
    // ovaj test će ti tačno pokazati da li tvoj JS kod uspešno menja klase na klik!
    await expect(karticaSlatkisiIgrackice).toHaveClass(/.*selected.*/);
  });

  /* ============================================================
     3. GRANIČNI I NEGATIVNI TESTOVI (Pregrade i Popup)
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

  test('Negativan test: HTML5 restrikcija za nevalidan broj pregrada', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');

    await inputPregrade.fill('2');
    let validnoIspod = await inputPregrade.evaluate(el => el.checkValidity());
    expect(validnoIspod).toBe(false);

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

    let konacanBrojCekiranih = 0;
    for (let i = 0; i < ukupanBroj; i++) {
      if (await sviCheckboxovi.nth(i).isChecked()) {
        konacanBrojCekiranih++;
      }
    }
    expect(konacanBrojCekiranih).toBeGreaterThan(0);
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
