import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Use more workers locally (M1 Pro has 10 cores), limit on CI
  workers: process.env.CI ? 1 : 8,
  
  // Reporter to use - list for terminal output, HTML report generated but not served
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for the local server
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npx serve -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  // Snapshot path template for visual tests
  snapshotPathTemplate: '{testDir}/visual/snapshots/{projectName}/{testFilePath}/{arg}{ext}',
  
  // Expect settings
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 5000,
    
    // Threshold for visual comparisons
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
});
