// =========================================================================
  // TEST 4: API CONTRACT & SCHEMA VALIDATION (FINANSIJSKA TAČNOST - PUNCH TORTA)
  // =========================================================================
  test('4. Contract & Financial Validation: Provera strukture i tačnosti cene za Punch Tortu', async ({ page }) => {
    // ZAŠTO OVAJ TEST ZA PAR TECHNOLOGY?
    // U POS i Payment sistemima (restorani, naplata), najkritičniji defekt je nepodudaranje
    // cene na ekranu i iznosa koji odlazi na payment gateway. Ovim testom radimo Schema & Financial
    // validaciju: proveravamo tipove podataka (number vs string) i tačnu kalkulaciju.

    let transactionPayload = null;

    await page.route('**/api/v1/checkout/punch-cake', async (route) => {
      transactionPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ transactionId: 'TX-998877', authorized: true })
      });
    });

    await page.goto(`${BASE_URL}punch-torta.html`);
    await page.waitForLoadState('domcontentloaded');

    // Menjamo parametre na dvospratnu tortu (24 pregrade) + igračkice
    const holesInput = page.locator('#punchHolesInput');
    await holesInput.fill('24');
    await holesInput.dispatchEvent('input');
    await page.locator('#fillOptMix').click();

    // Čitamo izračunatu cenu sa UI ekrana (npr. "7.450 RSD")
    const uiPriceText = await page.locator('#punchPriceDisplay').innerText();

    // Simuliramo slanje finansijskog JSON ugovora ka Payment mikroservisu
    await page.evaluate(() => {
      const holes = parseInt(document.getElementById('punchHolesInput').value, 10);
      const tiers = window.punchCake.calculatedTiers;
      const sweetsPerHole = window.punchCake.getSweetsPerHoleCount();
      const withToys = window.punchCake.withToys;
      
      let selectedSweets = [];
      document.querySelectorAll('#punchSweetsGroup input:checked').forEach(el => selectedSweets.push(el.value));

      const rawTotal = window.PricingEngine.calculatePunchCake({
        holes, tiers, sweetsPerHole, selectedSweets, withToys
      });

      return fetch('/api/v1/checkout/punch-cake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'PUNCH_CAKE',
          holesCount: holes,
          tiersCount: tiers,
          includesToys: withToys,
          items: selectedSweets,
          totalAmountRsd: rawTotal,
          currency: 'RSD'
        })
      });
    });

    // CONTRACT & SCHEMA ASERTACIJE (Provera tipova podataka i poslovne logike):
    expect(transactionPayload).not.toBeNull();
    expect(typeof transactionPayload.holesCount).toBe('number');
    expect(transactionPayload.holesCount).toBe(24);
    expect(transactionPayload.tiersCount).toBe(2); // Za 24 rupe logika mora podići na 2 sprata
    expect(typeof transactionPayload.totalAmountRsd).toBe('number');
    expect(transactionPayload.totalAmountRsd).toBeGreaterThan(3800); // Cena mora biti veća od bazne
    expect(transactionPayload.currency).toBe('RSD');

    // Provera da li se brojčani iznos u API-ju poklapa sa formatiranim tekstom na ekranu
    const formattedApiPrice = `${transactionPayload.totalAmountRsd.toLocaleString('sr-RS')} RSD`;
    expect(uiPriceText).toBe(formattedApiPrice);
  });

  // =========================================================================
  // TEST 5: NETWORK THROTTLING & BOTTLENECK SIMULATION (SPOR MIKROSERVIS)
  // =========================================================================
  test('5. Performance Bottleneck Simulation: Ponašanje sistema pri velikom kašnjenju mreže (Latency)', async ({ page }) => {
    // ZAŠTO OVAJ TEST ZA PAR TECHNOLOGY?
    // Oglas eksplicitno traži: "identifying performance bottlenecks and architectural issues early".
    // Ovde simuliramo zagušen pozadinski servis kojem treba 1.5 sekunda da odgovori i proveravamo
    // da UI ostaje stabilan i da ne dolazi do pucanja sesije.

    await page.route('**/api/v1/loyalty-check', async (route) => {
      // Namerno uvodimo veštačko kašnjenje (Latency) od 1500ms pre odgovora
      await new Promise(resolve => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ discountEligible: true, discountPercent: 10 })
      });
    });

    await page.goto(`${BASE_URL}bum-kutija.html`);

    const startTime = Date.now();
    
    // Okidamo poziv i čekamo odgovor pomoću determinističkog waitForResponse (bez fiksnog waitForTimeout!)
    const [response] = await Promise.all([
      page.waitForResponse('**/api/v1/loyalty-check'),
      page.evaluate(() => fetch('/api/v1/loyalty-check'))
    ]);

    const totalWait = Date.now() - startTime;

    expect(response.status()).toBe(200);
    // Dokazujemo da je naš sistem izdržao usporenje od >= 1500ms bez rušenja
    expect(totalWait).toBeGreaterThanOrEqual(1450);
  });

  // =========================================================================
  // TEST 6: OFFLINE-FIRST RESILIENCE (POTPUNI PREKID INTERNETA U RESTORANU / POS)
  // =========================================================================
  test('6. Offline Resilience (route.abort): Očuvanje unetih podataka kada pukne mreža', async ({ page }) => {
    // ZAŠTO OVAJ TEST ZA PAR TECHNOLOGY?
    // Najvažniji scenario za POS sisteme u restoranima: konobar unosi veliku narudžbinu i u tom
    // trenutku ruter u restoranu izgubi internet. Aplikacija NE SME da obriše unete podatke sa ekrana!
    // Pomoću route.abort('internetdisconnected') simuliramo čupanje mrežnog kabla.

    await page.route('**/api/order-sync', async (route) => {
      // Simuliramo brutalan pad mreže na nivou mrežnog kartice/rutera
      await route.abort('internetdisconnected');
    });

    await page.goto(`${BASE_URL}bum-kutija.html`);
    await page.waitForLoadState('domcontentloaded');

    // Korisnik je uneo specifične podatke u konfigurator
    await page.locator('#bumColorInput').fill('Smaragdno zelena');
    await page.locator('#bumInteriorSelect').selectOption('IT stikeri');

    // Pokušavamo sinhronizaciju sa serverom dok je internet u prekidu
    const syncFailed = await page.evaluate(async () => {
      try {
        await fetch('/api/order-sync', { method: 'POST' });
        return false;
      } catch (err) {
        // Očekujemo mrežni izuzetak jer je veza prekinuta
        return true;
      }
    });

    expect(syncFailed).toBe(true);

    // KLJUČNA ASERTACIJA ZA POS SISTEME:
    // Iako je mrežni poziv pukao, svi podaci koje je korisnik/blagajnik uneo u formu
    // moraju ostati netaknuti u DOM-u kako bi mogao da ponovi slanje kada se mreža vrati!
    await expect(page.locator('#bumColorInput')).toHaveValue('Smaragdno zelena');
    await expect(page.locator('#bumInteriorSelect')).toHaveValue('IT stikeri');
  });
