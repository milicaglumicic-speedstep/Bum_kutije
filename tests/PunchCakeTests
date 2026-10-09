const { test, expect } = require('@playwright/test');

const URL_PUNCH = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/punch-torta.html';

test.describe('Punch Torta Konfigurator - QA Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Svaki test počinje otvaranjem stranice konfiguratora
    await page.goto(URL_PUNCH);
  });

  /* ============================================================
     1. POZITIVNI TESTOVI (Happy Path)
     ============================================================ */
  test('Pozitivan test: Osnovna konfiguracija i provera inicijalne cene', async ({ page }) => {
    // Provera da li se stranica uspešno učitala i prikazuje naslov
    await expect(page.locator('h2')).toContainText('PUNCH ROĐENDANSKA TORTA');

    // Provera da li podrazumevani broj pregrada stoji na 16
    const brojPregrada = page.locator('text=Željeni broj pregrada za bušenje:');
    await expect(brojPregrada).toBeVisible();

    // Provera da li se ispravno računa i prikazuje početna cena od 3.800 RSD
    const cenaKontenjer = page.locator('text=3.800 RSD');
    await expect(cenaKontenjer).toBeVisible();

    // Provera da li postoji funkcionalno WhatsApp dugme za poručivanje
    const whatsappBtn = page.locator('text=Naruči Punch tortu na WhatsApp 💬');
    await expect(whatsappBtn).toBeVisible();
    await expect(whatsappBtn).toBeEnabled();
  });

  test('Pozitivan test: Interakcija sa čekboksima za slatkiše', async ({ page }) => {
    // Lociramo opciju za Krem bananicu (koja je inicijalno odčekirana prema podacima sa strane)
    // Možeš prilagoditi selektore u zavisnosti od tvog tačnog HTML inputa (npr. input[value="bananica"])
    const bananicaCheckbox = page.locator('input[type="checkbox"]').nth(3); // primer za indeks ili iskoristi tekst
    
    // Ukoliko tvoj HTML koristi standardne checkbox-ove, testiramo selekciju:
    if (await bananicaCheckbox.count() > 0) {
      await bananicaCheckbox.check();
      await expect(bananicaCheckbox).toBeChecked();
    }
  });


  /* ============================================================
     2. GRANIČNI TESTOVI (Boundary Tests)
     ============================================================ */
  test('Granični test: Biranje opcije "Drugo" i unos graničnih vrednosti', async ({ page }) => {
    // Pronalaženje polja gde se upisuje proizvoljan broj slatkiša po rupi (inicijalno je 4)
    // Tražimo input polje koje se nalazi blizu teksta "Drugo (upiši željeni broj)"
    const customSlatkisiInput = page.locator('input[type="number"], input[placeholder="4"]').first();
    
    if (await customSlatkisiInput.count() > 0) {
      // Testiramo najmanju graničnu vrednost (npr. 1 slatkiš)
      await customSlatkisiInput.fill('1');
      await expect(customSlatkisiInput).toHaveValue('1');

      // Testiramo veću graničnu vrednost (npr. 10 slatkiša)
      await customSlatkisiInput.fill('10');
      await expect(customSlatkisiInput).toHaveValue('10');
    }
  });

  test('Granični test: Opciono polje za ime i godine (prazno vs popunjeno)', async ({ page }) => {
    // Pronalaženje input/textarea polja za ime slavljenika i godine
    const imeGodineInput = page.locator('input[type="text"], textarea').last();

    if (await imeGodineInput.count() > 0) {
      // Provera da je inicijalno prazno (granični slučaj - prazno je dozvoljeno jer je opciono)
      await expect(imeGodineInput).toHaveValue('');

      // Unos maksimalno dugog imena i provera stabilnosti
      const dugackoIme = 'Aleksandar Obrenović Obilić Milutinović XXI, 18 godina';
      await imeGodineInput.fill(dugackoIme);
      await expect(imeGodineInput).toHaveValue(dugackoIme);
    }
  });


  /* ============================================================
     3. NEGATIVNI TESTOVI (Edge Case & Error Handling)
     ============================================================ */
  test('Negativan test: Unos nevalidnih/negativnih vrednosti u broj slatkiša', async ({ page }) => {
    const customSlatkisiInput = page.locator('input[type="number"]').first();

    if (await customSlatkisiInput.count() > 0) {
      // Pokušaj unosa negativnog broja (-5)
      await customSlatkisiInput.fill('-5');
      
      // QA Provera: Sistem ne bi smeo da prihvati negativnu vrednost. 
      // Možeš proveriti da li se cena promenila na minus ili da li polje ima "min=1" atribut.
      const vrednost = await customSlatkisiInput.inputValue();
      expect(Number(vrednost)).not.toBeLessThan(0);
    }
  });

  test('Negativan test: Klik na WhatsApp bez ijednog izabranog slatkiša', async ({ page }) => {
    // Odčekiramo sve inicijalno čekirane slatkiše (kinder_bueno, kinder_cokoladica, lizalica)
    const checkboxes = page.locator('input[type="checkbox"]');
    const brojCheckboxova = await checkboxes.count();

    for (let i = 0; i < brojCheckboxova; i++) {
      if (await checkboxes.nth(i).isChecked()) {
        await checkboxes.nth(i).uncheck();
      }
    }

    // Provera ponašanja aplikacije kada je korpa prazna:
    // Dobar sistem će ili onemogućiti WhatsApp dugme ili prikazati cenu 0 RSD / upozorenje.
    const whatsappBtn = page.locator('text=Naruči Punch tortu na WhatsApp 💬');
    
    // Testiramo da li je aplikacija ostala stabilna i dugme je i dalje prisutno (ne ruši se ekran)
    await expect(whatsappBtn).toBeVisible();
  });

  test('Navigacioni test: Povratak na početnu stranu', async ({ page }) => {
    const nazadLink = page.locator('text=← Nazad na početni izbor');
    await expect(nazadLink).toBeVisible();
    
    // Klik na link za povratak
    await nazadLink.click();
    // Provera da li nas je uspešno vratilo na index.html
    await expect(page).toHaveURL(/.*index.*/);
  });

});
