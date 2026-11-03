const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://milicaglumicic-speedstep.github.io/Bum_kutije/';

test.describe('Bum Kutije - API & Network Performance Suite', () => {

  // =========================================================================
  // TEST 1: Čisti API Health Check & Performance (Status, Headers, SLA)
  // =========================================================================
  test('1. API Health Check: Provjera statusa, zaglavlja i performansi odziva', async ({ request }) => {
    const startTime = Date.now();
    
    // Šaljemo direktan HTTP GET zahtjev bez renderovanja browsera
    const response = await request.get(`${BASE_URL}bum-kutija.html`);
    const duration = Date.now() - startTime;

    // 1. Validacija statusnog koda
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // 2. Provjera Content-Type zaglavlja
    const contentType = response.headers()['content-type'];
    expect(contentType).toBeDefined();
    expect(contentType).toContain('text/html');

    // 3. Performance SLA: Odgovor statičke stranice/API-ja mora biti ispod 800ms
    expect(duration).toBeLessThan(800);
  });

  
