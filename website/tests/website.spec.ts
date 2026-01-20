import { test, expect } from '@playwright/test';

test.describe('MortAi Website', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('homepage loads correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/MortAi/);

    // Check scroll hero first stage is visible
    await expect(page.locator('h2:has-text("Cold Leads Everywhere")')).toBeVisible();
  });

  test('navigation works on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Check nav links exist (only visible on desktop)
    await expect(page.locator('nav a[href="#how-it-works"]')).toBeVisible();
    await expect(page.locator('nav a[href="#services"]')).toBeVisible();
    await expect(page.locator('nav a[href="#faq"]')).toBeVisible();

    // Click "How It Works" - note: may need to scroll past pinned hero first
    await page.click('nav a[href="#how-it-works"]');
    await page.waitForTimeout(1500); // Wait for scroll animation
    await expect(page.locator('#how-it-works h2:has-text("Three Steps")')).toBeVisible();
  });

  test('all sections are present', async ({ page }) => {
    // Hero section
    await expect(page.locator('text=Turn Cold Leads Into')).toBeVisible();

    // Problem section
    await expect(page.locator('text=Cold Outreach Is Broken')).toBeVisible();

    // Solution section
    await expect(page.locator('text=Outreach That Actually Works')).toBeVisible();

    // How It Works section
    await expect(page.locator('text=Three Steps to Booked Calls')).toBeVisible();

    // Services section
    await expect(page.locator('text=Choose Your Growth Path')).toBeVisible();

    // FAQ section
    await expect(page.locator('text=Got Questions?')).toBeVisible();

    // CTA section
    await expect(page.locator('text=Ready to Fill Your Calendar?')).toBeVisible();
  });

  test('FAQ accordion opens on click', async ({ page }) => {
    // Find first FAQ question
    const firstFaq = page.locator('button:has-text("How is this different from other lead gen agencies?")');
    await firstFaq.scrollIntoViewIfNeeded();

    // Click to open
    await firstFaq.click();

    // Check answer is visible (wait for animation)
    await page.waitForTimeout(400);
    await expect(page.locator('text=Most agencies blast generic templates')).toBeVisible();
  });

  test('services cards display correctly', async ({ page }) => {
    // Scroll to services section
    await page.locator('#services').scrollIntoViewIfNeeded();

    // Check all 4 service tier headings exist (use h3 to be specific)
    await expect(page.locator('#services h3:has-text("Business Audit")')).toBeVisible();
    await expect(page.locator('#services h3:has-text("AI Outreach")')).toBeVisible();
    await expect(page.locator('#services h3:has-text("Ad Creative")')).toBeVisible();
    await expect(page.locator('#services h3:has-text("Full Growth")')).toBeVisible();

    // Check "Most Popular" badge exists
    await expect(page.locator('text=Most Popular')).toBeVisible();
  });

  test('CTA buttons are present', async ({ page }) => {
    // Hero CTAs
    await expect(page.locator('button:has-text("Book Your $50 Audit")')).toBeVisible();
    await expect(page.locator('a:has-text("See How It Works")')).toBeVisible();

    // Final CTA
    await expect(page.locator('button:has-text("Book Your Audit Now")')).toBeVisible();
  });

  test('mobile responsive - nav collapses', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Desktop nav links should be hidden
    await expect(page.locator('nav .hidden.md\\:flex')).toBeHidden();

    // Logo and CTA should still be visible
    await expect(page.locator('nav button:has-text("Book Audit")')).toBeVisible();
  });

  test('logo is visible in nav and footer', async ({ page }) => {
    // Check logo in nav
    await expect(page.locator('nav img[alt="MortAi"]')).toBeVisible();

    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();

    // Check logo in footer
    await expect(page.locator('footer img[alt="MortAi"]')).toBeVisible();
  });
});
