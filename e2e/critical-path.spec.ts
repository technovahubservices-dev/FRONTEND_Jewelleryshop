import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

function generateUser() {
  const id = Date.now();
  return {
    name: `E2E User ${id}`,
    email: `e2e_${id}@test.com`,
    password: 'E2ePass123!',
  };
}

test.describe('Critical Path: Register → Login → Shop → Cart → Checkout → Order', () => {
  let user;

  test.beforeEach(async () => {
    user = generateUser();

    const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const data = await registerRes.json();
    expect(data._id).toBeTruthy();
  });

  test('completes full purchase flow', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input#email', user.email);
    await page.fill('input#password', user.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/account');

    await page.goto('/shop');
    await page.waitForSelector('text=Our Collection');

    await page.click('.product-card >> nth=0');
    await page.waitForSelector('text=Add to Cart');

    await page.click('text=Add to Cart');
    await page.waitForSelector('text=Your cart');

    await page.goto('/cart');
    await page.click('text=Proceed to Checkout');
    await page.waitForSelector('text=Shipping Address');

    await page.fill('input#fullName', 'E2E Tester');
    await page.fill('input#address', '123 Test Street');
    await page.fill('input#city', 'Chennai');
    await page.fill('input#state', 'Tamil Nadu');
    await page.fill('input#zip', '600001');
    await page.selectOption('select#country', 'India');

    await page.check('text=Cash on Delivery');
    await page.click('text=Place Order');

    await page.waitForSelector('text=Order placed successfully');
  });
});
