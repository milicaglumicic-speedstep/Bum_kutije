const { test, expect } = require('@playwright/test');

test('API Health Check i provjera statusnog koda', async ({ request }) => {
  const startTime = Date.now();
  // Gađamo tvoj produkcijski URL ili JSON datoteku s konfiguracijom
  const response = await request.get('https://tvoj-username.github.io/Bum_kutije/');
  const duration = Date.now() - startTime;

  // 1. Provjera je li server vratio status 200 OK
  expect(response.status()).toBe(200);
  expect(response.ok()).toBeTruthy();

  // 2. Provjera zaglavlja (Headers)
  expect(response.headers()['content-type']).toContain('text/html');

  // 3. Provjera performansi (odziv mora biti brži od 800ms)
  expect(duration).toBeLessThan(800);
});
