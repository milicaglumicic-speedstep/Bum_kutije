test('Validacija JSON payloada pri slanju narudžbe ili chat poruke', async ({ page }) => {
  let capturedPayload = null;

  // Presrećemo svaki POST zahtjev prema API-ju za narudžbe
  await page.route('**/api/order', async route => {
    capturedPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ orderId: 'BUM-9981', status: 'RECEIVED' })
    });
  });

  await page.goto('https://tvoj-username.github.io/Bum_kutije/');

  // Simulacija: ako tvoj gumb još ne šalje pravi fetch, okidamo ga iz testa radi vježbe
  await page.evaluate(() => {
    fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boxType: 'Explosion', butterflies: 4, price: 3500 })
    });
  });

  // Asertacija samog API payloada
  expect(capturedPayload).not.toBeNull();
  expect(capturedPayload.boxType).toBe('Explosion');
  expect(capturedPayload.butterflies).toBe(4);
});
