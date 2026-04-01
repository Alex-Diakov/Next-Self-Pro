import { test, expect } from '@playwright/test';

test.describe('Core Application Flow', () => {
  test('should allow creating a patient and starting a session', async ({ page }) => {
    // 1. Navigate to the app
    await page.goto('/');
    await expect(page).toHaveTitle(/NextSelfPro/);

    // 2. Navigate to Patients page
    await page.getByRole('navigation').getByRole('link', { name: /Patients/i }).click();
    await expect(page.getByRole('heading', { name: 'group Patients' })).toBeVisible();

    // 3. Create a new patient
    await page.getByRole('button', { name: /New Patient/i }).click();
    await page.getByLabel(/Patient Name/i).fill('E2E Test Patient');
    await page.getByRole('button', { name: /Create Patient/i }).click();

    // 4. Verify patient appears and navigate to profile
    const patientCard = page.getByText('E2E Test Patient');
    await expect(patientCard).toBeVisible();
    await patientCard.click();

    // 5. Verify we are on the patient profile page
    await expect(page.getByRole('heading', { name: 'E2E Test Patient', level: 1 })).toBeVisible();

    // 6. Start a new session (Upload)
    await page.getByRole('button', { name: /New Session/i }).click();
    await expect(page.getByText(/Upload New Session/i)).toBeVisible();

    // Mock file upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-session.mp3',
      mimeType: 'audio/mp3',
      buffer: Buffer.from('mock audio content'),
    });

    // 7. Verify processing starts
    await expect(page.getByRole('heading', { name: /Processing Session/i })).toBeVisible();
    await expect(page.getByText(/Analyzing with AI/i)).toBeVisible();
  });

  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/');
    
    // Check Dashboard
    await expect(page.getByText(/Therapy Progress/i)).toBeVisible();

    // Check Sessions
    await page.getByRole('navigation').getByRole('link', { name: /Sessions/i }).click();
    await expect(page.getByText(/Upload a new session/i)).toBeVisible();

    // Check Patients
    await page.getByRole('navigation').getByRole('link', { name: /Patients/i }).click();
    await expect(page.getByRole('heading', { name: 'group Patients' })).toBeVisible();
  });
});
