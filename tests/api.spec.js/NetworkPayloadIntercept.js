// =========================================================================
  // TEST 2: Validacija odlaznog Payload-a (Presretanje narudžbe prije WhatsApp-a)
  // =========================================================================
  test('2. Network Payload Intercept: Provjera strukture podataka narudžbe', async ({ page }) => {
    let capturedPayload = null;

    // Postavljamo mrežnu zamku (mock route) za backend servis narudžbi
    await page.route('**/api/order', async (route) => {
      capturedPayload = route.request().postDataJSON();
      // Vraćamo simulirani uspješni odgovor backenda (201 Created)
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ 
          orderId: 'BUM-2026-PAR', 
          status: 'RECEIVED',
          timestamp: new Date().toISOString()
        })
      });
    });

    await page.goto(`${BASE_URL}bum-kutija.html`);
    await page.waitForLoadState('domcontentloaded');

    // Popunjavamo formu koristeći stvarne ID-jeve iz tvog bum-kutija.html
    await page.locator('#bumColorInput').fill('Kraljevsko plava');
    await page.locator('#bumInteriorSelect').selectOption('Srca');

    // Simuliramo slanje telemetrije/podataka narudžbe na backend API prije otvaranja chata
    await page.evaluate(() => {
      const data = window.bumBox ? window.bumBox.collectFormData() : {};
      return fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    });

    // Validacija presretnutog JSON payloada na nivou mrežnog saobraćaja
    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload.package).toBe('empty');
    expect(capturedPayload.color).toBe('Kraljevsko plava');
    expect(capturedPayload.interior).toBe('Srca');
    expect(capturedPayload.style).toContain('Koverat');
  });

  // =========================================================================
  // TEST 3: Mocking 503 Server Error (Testiranje otpornosti Chatbota na pad sistema)
  // =========================================================================
  test('3. API Resilience & Mocking: Simulacija 503 greške i provjera UI ponašanja', async ({ page }) => {
    // Simuliramo pad eksternog LLM servisa ili backend API-ja za asistenta
    await page.route('**/api/chat/assistant', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Service Unavailable',
          message: 'Chat servis je privremeno nedostupan zbog opterećenja.' 
        })
      });
    });

    await page.goto(`${BASE_URL}index.html`);
    await page.waitForLoadState('domcontentloaded');

   
