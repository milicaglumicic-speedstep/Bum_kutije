const { test, expect } = require('@playwright/test');

test.describe('Bum Kutije - Chatbot E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://milicaglumicic-speedstep.github.io/Bum_kutije/');
  });

  test('widget button exists and opens chat window', async ({ page }) => {
    const toggleBtn = page.getByTestId('chat-toggle-btn');
    await expect(toggleBtn).toBeVisible();

    // Otvaranje prozora
    await toggleBtn.click();
    const chatWindow = page.getByTestId('chat-window');
    await expect(chatWindow).toBeVisible();
  });

  test('answers questions about Bum kutija and displays suggestions', async ({ page }) => {
    await page.getByTestId('chat-toggle-btn').click();

    // Unos pitanja
    const input = page.getByTestId('chat-input');
    await input.fill('Koliko slika staje u bum kutiju?');
    await page.getByTestId('chat-send-btn').click();

    // Provera da li se pojavio odgovor asistenta
    const messages = page.getByTestId('chat-messages-container');
    await expect(messages).toContainText('fotografijama');
  });

  test('can close the chat window', async ({ page }) => {
    await page.getByTestId('chat-toggle-btn').click();
    await page.getByTestId('chat-close-btn').click();

    const chatWindow = page.getByTestId('chat-window');
    await expect(chatWindow).toHaveClass(/hidden/);
  });
});
