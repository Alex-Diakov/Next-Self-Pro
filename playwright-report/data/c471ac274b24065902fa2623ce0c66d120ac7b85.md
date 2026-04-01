# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: session-flow.spec.ts >> Core Application Flow >> should navigate between main sections
- Location: tests/e2e/session-flow.spec.ts:45:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('link', { name: /Sessions/i }) resolved to 2 elements:
    1) <a href="/sessions" data-discover="true" class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl overflow-hidden text-sm font-semibold transition-all duration-300 focus-ring relative group text-muted hover:bg-surface-hover hover:text-secondary">…</a> aka getByRole('link', { name: 'videocam Sessions' })
    2) <a href="/sessions" data-discover="true" class="inline-flex items-center justify-center px-12 py-4.5 bg-premium-gradient text-background rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-accent/40 border-t border-white/20 glow-accent">Go to Sessions</a> aka getByRole('link', { name: 'Go to Sessions' })

Call log:
  - waiting for getByRole('link', { name: /Sessions/i })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: psychology
        - generic [ref=e8]: NextSelfPro
      - generic [ref=e9]: Dashboard
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: search
        - textbox "Search..." [ref=e13]
      - button "notifications" [ref=e14]:
        - generic [ref=e15]: notifications
      - img "User" [ref=e18] [cursor=pointer]
  - generic [ref=e19]:
    - complementary [ref=e20]:
      - complementary [ref=e21]:
        - button "menu_open" [ref=e22]:
          - generic [ref=e23]: menu_open
        - generic [ref=e24]:
          - navigation [ref=e25]:
            - link "dashboard Dashboard" [ref=e26] [cursor=pointer]:
              - /url: /
              - generic [ref=e27]: dashboard
              - generic [ref=e28]: Dashboard
            - link "videocam Sessions" [ref=e30] [cursor=pointer]:
              - /url: /sessions
              - generic [ref=e31]: videocam
              - generic [ref=e32]: Sessions
            - link "group Patients" [ref=e33] [cursor=pointer]:
              - /url: /patients
              - generic [ref=e34]: group
              - generic [ref=e35]: Patients
            - link "monitoring AI Insights" [ref=e36] [cursor=pointer]:
              - /url: /insights
              - generic [ref=e37]: monitoring
              - generic [ref=e38]: AI Insights
          - generic [ref=e39]:
            - generic [ref=e40]:
              - generic [ref=e42]:
                - generic [ref=e43]: bolt
                - generic [ref=e44]: Upgrade to Pro
              - paragraph [ref=e45]: Unlock advanced AI insights and unlimited patient sessions.
              - button "View Plans" [ref=e46]
            - link "settings Settings" [ref=e47] [cursor=pointer]:
              - /url: /settings
              - generic [ref=e48]: settings
              - generic [ref=e49]: Settings
    - main [ref=e50]:
      - generic [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e55]:
            - heading "Dashboard" [level=1] [ref=e56]
            - paragraph [ref=e57]: Welcome back, Dr. Therapist
          - button "Help & Resources" [ref=e59]
        - generic [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e62]:
              - generic [ref=e64]: videocam
              - paragraph [ref=e65]: Total Sessions
              - paragraph [ref=e66]: "124"
            - generic [ref=e67]:
              - generic [ref=e69]: group
              - paragraph [ref=e70]: Active Patients
              - paragraph [ref=e71]: "32"
            - generic [ref=e72]:
              - generic [ref=e74]: psychology
              - paragraph [ref=e75]: AI Insights Generated
              - paragraph [ref=e76]: "89"
            - generic [ref=e77]:
              - generic [ref=e79]: trending_up
              - paragraph [ref=e80]: Patient Progress
              - paragraph [ref=e81]: +14%
          - generic [ref=e83]:
            - heading "Therapy Progress Overview" [level=2] [ref=e84]
            - paragraph [ref=e85]: Upload a new video or audio recording to get instant AI-powered clinical insights and transcriptions.
            - link "Go to Sessions" [ref=e86] [cursor=pointer]:
              - /url: /sessions
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Core Application Flow', () => {
  4  |   test('should allow creating a patient and starting a session', async ({ page }) => {
  5  |     // 1. Navigate to the app
  6  |     await page.goto('/');
  7  |     await expect(page).toHaveTitle(/NextSelfPro/);
  8  | 
  9  |     // 2. Navigate to Patients page
  10 |     await page.getByRole('link', { name: /Patients/i }).click();
  11 |     await expect(page.getByRole('heading', { name: /Patients/i })).toBeVisible();
  12 | 
  13 |     // 3. Create a new patient
  14 |     await page.getByRole('button', { name: /New Patient/i }).click();
  15 |     await page.getByLabel(/Patient Name/i).fill('E2E Test Patient');
  16 |     await page.getByRole('button', { name: /Create Patient/i }).click();
  17 | 
  18 |     // 4. Verify patient appears and navigate to profile
  19 |     const patientCard = page.getByText('E2E Test Patient');
  20 |     await expect(patientCard).toBeVisible();
  21 |     await patientCard.click();
  22 | 
  23 |     // 5. Verify we are on the patient profile page
  24 |     await expect(page.getByRole('heading', { name: 'E2E Test Patient' })).toBeVisible();
  25 | 
  26 |     // 6. Start a new session (Upload)
  27 |     await page.getByRole('button', { name: /New Session/i }).click();
  28 |     await expect(page.getByText(/Upload New Session/i)).toBeVisible();
  29 | 
  30 |     // Mock file upload
  31 |     const fileChooserPromise = page.waitForEvent('filechooser');
  32 |     await page.locator('input[type="file"]').click();
  33 |     const fileChooser = await fileChooserPromise;
  34 |     await fileChooser.setFiles({
  35 |       name: 'test-session.mp3',
  36 |       mimeType: 'audio/mp3',
  37 |       buffer: Buffer.from('mock audio content'),
  38 |     });
  39 | 
  40 |     // 7. Verify processing starts
  41 |     await expect(page.getByText(/Processing/i)).toBeVisible();
  42 |     await expect(page.getByText(/Analyzing with AI/i)).toBeVisible();
  43 |   });
  44 | 
  45 |   test('should navigate between main sections', async ({ page }) => {
  46 |     await page.goto('/');
  47 |     
  48 |     // Check Dashboard
  49 |     await expect(page.getByText(/Therapy Progress/i)).toBeVisible();
  50 | 
  51 |     // Check Sessions
> 52 |     await page.getByRole('link', { name: /Sessions/i }).click();
     |                                                         ^ Error: locator.click: Error: strict mode violation: getByRole('link', { name: /Sessions/i }) resolved to 2 elements:
  53 |     await expect(page.getByText(/Upload a new session/i)).toBeVisible();
  54 | 
  55 |     // Check Patients
  56 |     await page.getByRole('link', { name: /Patients/i }).click();
  57 |     await expect(page.getByRole('heading', { name: /Patients/i })).toBeVisible();
  58 |   });
  59 | });
  60 | 
```