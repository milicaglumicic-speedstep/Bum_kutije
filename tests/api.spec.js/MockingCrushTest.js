test('Obrada greške kada API za naplatu ili chat nije dostupan', async ({ page }) => {
  // Simuliramo pad servera (503 Service Unavailable)
  await page.route('**/api/chat', async route => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Sustav je trenutno nedostupan' })
    });
  });

  await page.goto('https://tvoj-username.github.io/Bum_kutije/');
  
  // Ovdje klikneš na svoj chatbot koristeći data-testid koji već imaš u kodu
  // await page.getByTestId('chat-submit').click();
});
