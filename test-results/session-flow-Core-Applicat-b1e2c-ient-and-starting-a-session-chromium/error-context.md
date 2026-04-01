# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: session-flow.spec.ts >> Core Application Flow >> should allow creating a patient and starting a session
- Location: tests/e2e/session-flow.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Processing/i)
Expected: visible
Error: strict mode violation: getByText(/Processing/i) resolved to 2 elements:
    1) <span class="font-bold flex items-center gap-1.5 text-[10px] uppercase px-2 py-1 rounded-xl border tracking-wide bg-accent/10 text-accent-hover border-accent/20">…</span> aka getByRole('button', { name: 'info Session Details sync' })
    2) <h4 class="text-xl font-bold text-primary mb-2 tracking-tight">Processing Session</h4> aka getByRole('heading', { name: 'Processing Session' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/Processing/i)

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: psychology
        - generic [ref=e8]: NextSelfPro
      - generic [ref=e9]: Patients > Profile > Upload
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
            - link "videocam Sessions" [ref=e29] [cursor=pointer]:
              - /url: /sessions
              - generic [ref=e30]: videocam
              - generic [ref=e31]: Sessions
            - link "group Patients" [ref=e32] [cursor=pointer]:
              - /url: /patients
              - generic [ref=e33]: group
              - generic [ref=e34]: Patients
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
            - heading "Session Analysis" [level=1] [ref=e56]
            - paragraph [ref=e57]: Reviewing and analyzing patient session
          - button "Help & Resources" [ref=e59]
        - generic [ref=e62]:
          - generic [ref=e63]:
            - button "arrow_back Back to Workspace" [ref=e64]:
              - generic [ref=e65]: arrow_back
              - text: Back to Workspace
            - generic [ref=e68]: play_circle
            - button "info Session Details sync Processing expand_more" [ref=e71]:
              - generic [ref=e72]:
                - generic [ref=e73]: info
                - text: Session Details
              - generic [ref=e74]:
                - generic [ref=e75]:
                  - generic [ref=e76]: sync
                  - text: Processing
                - generic [ref=e77]: expand_more
          - generic [ref=e78]:
            - generic [ref=e80]:
              - button "description Transcription" [ref=e81]:
                - generic [ref=e82]: description
                - text: Transcription
              - button "auto_awesome AI Analysis" [disabled] [ref=e83]:
                - generic [ref=e84]: auto_awesome
                - text: AI Analysis
            - generic [ref=e86]:
              - generic [ref=e90]:
                - heading "Processing Session" [level=4] [ref=e91]
                - paragraph [ref=e92]: Analyzing with AI...
              - generic [ref=e93]:
                - generic [ref=e94]:
                  - generic [ref=e96]: check_circle
                  - generic [ref=e97]: Uploading securely
                - generic [ref=e98]:
                  - generic [ref=e100]: check_circle
                  - generic [ref=e101]: Extracting audio track
                - generic [ref=e105]: AI transcription & diarization
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
  10 |     await page.getByRole('navigation').getByRole('link', { name: /Patients/i }).click();
  11 |     await expect(page.getByRole('heading', { name: 'group Patients' })).toBeVisible();
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
> 41 |     await expect(page.getByText(/Processing/i)).toBeVisible();
     |                                                 ^ Error: expect(locator).toBeVisible() failed
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
  52 |     await page.getByRole('navigation').getByRole('link', { name: /Sessions/i }).click();
  53 |     await expect(page.getByText(/Upload a new session/i)).toBeVisible();
  54 | 
  55 |     // Check Patients
  56 |     await page.getByRole('navigation').getByRole('link', { name: /Patients/i }).click();
  57 |     await expect(page.getByRole('heading', { name: 'group Patients' })).toBeVisible();
  58 |   });
  59 | });
  60 | 
```