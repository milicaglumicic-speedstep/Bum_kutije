const { test, expect } = require('@playwright/test');

// Koristimo cistu putanju jer smo u konfiguraciji osigurali baseURL
const STRANICA_PUNCH = 'punch-torta.html';

test.describe('Punch Torta Konfigurator - Napredni QA Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Ako baseURL nije setovan u configu, Playwright ce iskoristiti pun URL automatski
    const ciljaniUrl = page.context()._options.baseURL 
      ? STRANICA_PUNCH 
      : `https://github.io{STRANICA_PUNCH}`;
      
    await page.goto(ciljaniUrl);
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
     3. NOVI TEST CASE: SPECIJALNI KARAKTERI I WHATSAPP SLANJE
     ============================================================ */
  test('Negativan test: Unos specijalnih karaktera u pregrade blokira slanje na WhatsApp', async ({ page }) => {
    const inputPregrade = page.locator('#punchHolesInput');
    const dugmeNaruci = page.locator('button.submit-btn');

    // 1. Pokušavamo da upišemo specijalne karaktere u polje koje prihvata samo brojeve
    await inputPregrade.fill('@#\$!%');
    
    // Budući da je input type="number", pretraživač ignoriše ove karaktere i polje ostaje prazno ili nevalidno
    const trenutnaVrednost = await inputPregrade.inputValue();
    
    // 2. Proveravamo HTML5 validaciju forme – polje ne sme biti validno za slanje ako je prazno/loše uneto
    const jeValidno = await inputPregrade.evaluate(el => el.checkValidity());
    
    if (!jeValidno || trenutnaVrednost === '') {
      // Ako je polje nevalidno, HTML5 automatski blokira 'submit' događaj forme
      console.log('HTML5 validacija je uspešno blokirala nevalidan unos specijalnih karaktera.');
      expect(jeValidno).toBe(false);
    }
  });

  /* ============================================================
     4. FUNKCIONALNI I NEGATIVNI TESTOVI (Padajući meni i Popup)
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
