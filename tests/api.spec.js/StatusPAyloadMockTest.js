/**
 * tests/ApiSuiteTest.js
 * 
 * BUM KUTIJE - API, NETWORK INTERCEPT & PERFORMANCE TEST SUITE
 * 
 * Ovaj test suite pokriva 3 ključna nivoa operativne dubine:
 * 1. Čisti API Health Check & Performance SLA (koristeći ugrađeni APIRequestContext)
 * 2. Mrežno presretanje i validacija JSON Payloada (page.route & Client-side Mocking)
 * 3. Eksterna integracija, rukovanje asinhronim događajima i validacija URL parametara (wa.me)
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/';

test.describe('Bum Kutije - Inženjerski API & Network Suite', () => {

  // =========================================================================
  // TEST 1: ČISTI API POZIV, VALIDACIJA STATUSNOG KODA, ZAGLAVLJA I SLA VREMENA
  // =========================================================================
  test('1. API Health Check: Provera dostupnosti, Content-Type zaglavlja i brzine odziva', async ({ request }) => {
    // ZAŠTO { request } UMESTO { page }?
    // Koristimo Playwright-ov ugrađeni APIRequestContext. On ne podiže Chromium browser,
    // ne renderuje DOM i ne troši memoriju na CSS/JS. Šalje sirovi mrežni HTTP GET zahtev.
    // U CI/CD pipeline-u ovaj test traje svega 30-50 milisekundi i služi kao brzi "Smoke Gate".
    
    // ZAŠTO MERIMO VREME PREKO Date.now()?
    // U modernim sistemima i mikroservisima SLA (Service Level Agreement) je obavezan deo testiranja.
    // Ako server vrati status 200, ali mu treba 5 sekundi, servis je neupotrebljiv.
    const startTime = Date.now();
    
    const response = await request.get(`${BASE_URL}bum-kutija.html`);
    const duration = Date.now() - startTime;

    // ZAŠTO I status().toBe(200) I response.ok()?
    // status().toBe(200) proverava tačan HTTP kod.
    // response.ok() je Playwright-ov metod koji garantuje da je status u rasponu 200-299.
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // ZAŠTO PROVERAVAMO HEADERS?
    // Potvrđujemo da web server šalje ispravan MIME tip i enkoding pre nego što browser počne parsiranje.
    const contentType = response.headers()['content-type'];
    expect(contentType).toBeDefined();
    expect(contentType).toContain('text/html');

    // SHIFT-LEFT KONTROLA PERFORMANSI:
    // Statički resurs ili brzi mikroservis mora vratiti odgovor ispod 800 milisekundi.
    expect(duration).toBeLessThan(800);
  });

  // =========================================================================
  // TEST 2: MREŽNO PRESRETANJE (INTERCEPT) I VALIDACIJA JSON PAYLOAD-A
  // =========================================================================
  test('2. Network Payload Intercept: Presretanje odlaznog zahteva i validacija JSON ugovora', async ({ page }) => {
    let capturedPayload = null;

    // ZAŠTO page.route PRE page.goto?
    // page.route je mrežna zamka (Client-side Interceptor). Mora biti definisana PRE
    // navigacije ili slanja forme kako bismo bili 100% sigurni da nećemo propustiti odlazni HTTP poziv.
    await page.route('**/api/order', async (route) => {
      // Izvlačimo tačan JSON objekat koji je front-end poslao ka serveru
      capturedPayload = route.request().postDataJSON();

      // ZAŠTO route.fulfill()?
      // Simuliramo odgovor backenda (Mocking). Klijentskom kodu vraćamo status 201 Created
      // bez zavisnosti od prave baze podataka ili eksternog servera.
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ 
          orderId: 'BUM-PAR-2026', 
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        })
      });
    });

    await page.goto(`${BASE_URL}bum-kutija.html`);
    await page.waitForLoadState('domcontentloaded');

    // Popunjavamo formu koristeći stvarne ID selektore iz bum-kutija.html
    await page.locator('#bumColorInput').fill('Kraljevsko plava');
    await page.locator('#bumInteriorSelect').selectOption('Srca');

    // ZAŠTO page.evaluate()?
    // Izvršavamo JavaScript direktno unutar konteksta browsera.
    // Pozivamo bumBox.collectFormData() i šaljemo je putem fetch() poziva ka našoj ruti,
    // simulirajući moderni mikroservisni tok gde se telemetrija narudžbine beleži pre WhatsApp preusmeravanja.
    await page.evaluate(() => {
      const data = window.bumBox ? window.bumBox.collectFormData() : {};
      return fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    });

    // VALIDACIJA INTEGRITETA PODATAKA NA MREŽNOM NIVOU:
    // Proveravamo da li je front-end ispravno mapirao stanje forme u JSON ugovor
    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload.package).toBe('empty');
    expect(capturedPayload.color).toBe('Kraljevsko plava');
    expect(capturedPayload.interior).toBe('Srca');
    expect(capturedPayload.style).toContain('Koverat');
  });

  // =========================================================================
  // TEST 3: EKSTERNA INTEGRACIJA, RUKOVANJE POPUP-OM I VALIDACIJA URL PAYLOAD-A
  // =========================================================================
  test('3. WhatsApp API integracija: Asinhrono presretanje i validacija parametara poruke', async ({ page }) => {
    await page.goto(`${BASE_URL}bum-kutija.html`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Biramo Paket 2 (sa slatkišima)
    const tabSlatkisi = page.locator('#bumTabs .tab-btn[data-pkg="sweets_gift"]');
    await tabSlatkisi.click();
    await expect(tabSlatkisi).toHaveClass(/active/);

    // 2. Unosimo podatke u formu
    await page.locator('#bumSizeSelect').selectOption('18x18x18');
    await page.locator('#bumColorInput').fill('Zlatno-crna');
    await page.locator('#bumInteriorSelect').selectOption('Zvezdice');

    // 3. Proveravamo da li je Ferrero selektovan
    const ferreroCheckbox = page.locator('#bumSweetsList input[value="ferrero"]');
    if (!(await ferreroCheckbox.isChecked())) {
      await ferreroCheckbox.check();
    }

    await page.locator('#bumNotes').fill('Rođendansko iznenađenje za kolegu');

    // ZAŠTO Promise.all([page.waitForEvent('popup'), click()])?
    // OVO JE KLJUČNO ZA INTERVJU: Izbegavanje asinhronog problema trke (Race Condition).
    // Da smo stavili await click(), novi tab bi se mogao otvoriti pre nego što se registruje
    // listener, i test bi pao zbog timeouta. Promise.all garantuje da se osluškivač postavlja
    // u tačno istom milisekundu kada se okida klik.
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('button.submit-btn').click()
    ]);

    await popup.waitForLoadState('domcontentloaded');

    // Validacija baznog endpointa i broja telefona
    const rawUrl = popup.url();
    expect(rawUrl).toContain('https://wa.me/381644667485');

    // ZAŠTO new URL() I searchParams UMESTO OBIČNOG REGEXA?
    // Zato što su parametri u URL-u enkResourceURI kodirani (%20 umesto razmaka, itd.).
    // new URL(rawUrl).searchParams.get('text') vrši bezbedno dekodiranje na nivou protokola.
    const urlObj = new URL(rawUrl);
    const messagePayload = urlObj.searchParams.get('text');

    expect(messagePayload).not.toBeNull();

    // DUBINSKA PROVERA SADRŽAJA GENERISANOG PAYLOAD-A:
    expect(messagePayload).toContain('Pozdrav! Želim poručiti BUM kutiju:');
    expect(messagePayload).toContain('Paket: 2. BUM kutija sa punjenim stranama');
    expect(messagePayload).toContain('Veličina: 18x18x18');
    expect(messagePayload).toContain('Boja: Zlatno-crna');
    expect(messagePayload).toContain('Dekoracija enterijera: Zvezdice');
    expect(messagePayload).toContain('Mehanizam: Iskačuće pop-up kocke');
    expect(messagePayload).toContain('Ferrero Rocher');
    expect(messagePayload).toContain('Povod / opis želje: Rođendansko iznenađenje za kolegu');

    // ZAŠTO EKSPLICITNO ZATVARAMO TAB?
    // Memory leak prevencija na CI/CD pokretačima (GitHub Actions VM sa limitiranim RAM-om).
    await popup.close();
  });

});
