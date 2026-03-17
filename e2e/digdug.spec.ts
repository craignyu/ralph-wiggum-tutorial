import { test, expect } from '@playwright/test';

test.describe('Dig Dug Game Page', () => {
  test.beforeEach(async ({ request }) => {
    // Clean save slots for test isolation
    for (const slot of [1, 2, 3]) {
      await request.delete(`/api/game/saves/${slot}`);
    }
  });

  test('loads game page with correct title', async ({ page }) => {
    await page.goto('/game');
    await expect(page).toHaveTitle(/Dig Dug/i);
  });

  test('shows canvas within island mount point', async ({ page }) => {
    await page.goto('/game');
    const island = page.locator('[data-island="digdug"]');
    await expect(island).toBeVisible();

    const canvas = page.locator('canvas[aria-label="Dig Dug game"]');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('width', '560');
    await expect(canvas).toHaveAttribute('height', '480');
  });

  test('shows how to play section', async ({ page }) => {
    await page.goto('/game');
    await expect(page.getByText('How to Play')).toBeVisible();
    await expect(page.getByText(/Arrow keys or WASD/i)).toBeVisible();
  });

  test('pause and resume with P key', async ({ page }) => {
    await page.goto('/game');
    // Wait for game to initialize and start playing
    await page.waitForTimeout(1000);

    // Hold P long enough for the 16ms polling interval to catch it
    await page.keyboard.down('p');
    await page.waitForTimeout(50);
    await page.keyboard.up('p');

    await expect(page.getByTestId('pause-overlay')).toBeVisible();
    await expect(page.getByText('PAUSED')).toBeVisible();

    // Press P again to resume
    await page.waitForTimeout(100);
    await page.keyboard.down('p');
    await page.waitForTimeout(50);
    await page.keyboard.up('p');

    await expect(page.getByTestId('pause-overlay')).not.toBeVisible();
  });

  test('pause overlay shows action buttons', async ({ page }) => {
    await page.goto('/game');
    await page.waitForTimeout(1000);

    await page.keyboard.down('p');
    await page.waitForTimeout(50);
    await page.keyboard.up('p');

    await expect(page.getByText('PAUSED')).toBeVisible();
    await expect(page.getByRole('button', { name: /Resume/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Restart/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Save Game/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Quit/i })).toBeVisible();
  });

  test('save modal opens from pause menu', async ({ page }) => {
    await page.goto('/game');
    await page.waitForTimeout(1000);

    await page.keyboard.down('p');
    await page.waitForTimeout(50);
    await page.keyboard.up('p');
    await page.getByRole('button', { name: /Save Game/i }).click();

    await expect(page.getByTestId('save-modal')).toBeVisible();
    await expect(page.getByText('Save / Load')).toBeVisible();
    // Should show 3 save slots
    await expect(page.getByTestId('save-slot-1')).toBeVisible();
    await expect(page.getByTestId('save-slot-2')).toBeVisible();
    await expect(page.getByTestId('save-slot-3')).toBeVisible();
  });

  test('can save to slot and see saved data', async ({ page }) => {
    await page.goto('/game');
    await page.waitForTimeout(1000);

    // Pause and open save modal
    await page.keyboard.down('p');
    await page.waitForTimeout(50);
    await page.keyboard.up('p');
    await page.getByRole('button', { name: /Save Game/i }).click();
    await expect(page.getByTestId('save-modal')).toBeVisible();

    // Save to slot 1
    const slot1 = page.getByTestId('save-slot-1');
    await slot1.getByRole('button', { name: /Save Here/i }).click();

    // Wait for save to complete and UI to update
    await page.waitForTimeout(500);
    await expect(slot1.getByText(/Level/i)).toBeVisible();
  });

  test('restart with R key', async ({ page }) => {
    await page.goto('/game');
    await page.waitForTimeout(500);

    // Press R to restart
    await page.keyboard.press('r');
    await page.waitForTimeout(500);

    // Game should still be running (canvas visible)
    const canvas = page.locator('canvas[aria-label="Dig Dug game"]');
    await expect(canvas).toBeVisible();
  });

  test('home page has link to game', async ({ page }) => {
    await page.goto('/');
    const gameLink = page.getByRole('link', { name: /Play Dig Dug/i });
    await expect(gameLink).toBeVisible();
    await expect(gameLink).toHaveAttribute('href', '/game');
  });
});

test.describe('Dig Dug Save API', () => {
  test.beforeEach(async ({ request }) => {
    for (const slot of [1, 2, 3]) {
      await request.delete(`/api/game/saves/${slot}`);
    }
  });

  test('GET /api/game/saves returns empty array initially', async ({ request }) => {
    const response = await request.get('/api/game/saves');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual([]);
  });

  test('POST /api/game/saves creates a save (201)', async ({ request }) => {
    const response = await request.post('/api/game/saves', {
      data: { slot_number: 1, slot_name: 'Test', score: 500, high_score: 500, level: 2, lives: 3 },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.slot_number).toBe(1);
    expect(body.score).toBe(500);
  });

  test('POST same slot updates (200)', async ({ request }) => {
    await request.post('/api/game/saves', {
      data: { slot_number: 1, score: 100 },
    });
    const response = await request.post('/api/game/saves', {
      data: { slot_number: 1, score: 999 },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.score).toBe(999);
  });

  test('POST invalid slot returns 400', async ({ request }) => {
    const response = await request.post('/api/game/saves', {
      data: { slot_number: 5 },
    });
    expect(response.status()).toBe(400);
  });

  test('DELETE /api/game/saves/1 returns 204', async ({ request }) => {
    await request.post('/api/game/saves', {
      data: { slot_number: 1, score: 100 },
    });
    const response = await request.delete('/api/game/saves/1');
    expect(response.status()).toBe(204);
  });

  test('DELETE nonexistent returns 404', async ({ request }) => {
    const response = await request.delete('/api/game/saves/1');
    expect(response.status()).toBe(404);
  });
});
