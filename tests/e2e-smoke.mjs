import { chromium } from 'playwright';

const baseUrl = 'http://127.0.0.1:4173';
const pdfPath = 'C:/Users/soura/OneDrive/Desktop/AI_Judge/tests/upload-test.pdf';
const testEmail = `test.officer+${Date.now()}@example.com`;
const testPassword = 'Test@12345';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const results = [];
const pass = (name, details = '') => results.push({ name, ok: true, details });
const fail = (name, details = '') => results.push({ name, ok: false, details });

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Redefining decision');
  const stripVisible = await page.locator('div[style*="grid-template-columns: 1fr 1fr 1fr"]').count();
  if (stripVisible > 0) {
    fail('Landing modern UI check', 'Old 3-color strip still detected');
  } else {
    pass('Landing modern UI check', 'No old 3-color strip detected');
  }

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.click('button:has-text("Signup")');
  await page.fill('#name', 'Test Officer');
  await page.fill('#email', testEmail);
  await page.fill('#password', testPassword);
  await page.click('button:has-text("Create account")');
  await page.waitForURL(`${baseUrl}/upload`, { timeout: 6000 });
  pass('Signup flow', 'Redirected to upload after account creation');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(pdfPath);
  await page.waitForSelector('text=Review Extracted Fields', { timeout: 9000 });
  pass('PDF upload flow', 'Processing completed and review CTA appeared');

  await page.click('a:has-text("Review Extracted Fields")');
  await page.waitForURL(`${baseUrl}/dashboard`, { timeout: 6000 });
  await page.waitForSelector('text=Dashboard');
  pass('Dashboard transition', 'Reached dashboard after upload');
} catch (error) {
  fail('Smoke test runtime', error instanceof Error ? error.message : String(error));
} finally {
  await browser.close();
}

for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}: ${r.name}${r.details ? ` - ${r.details}` : ''}`);
}

if (results.some((r) => !r.ok)) {
  process.exit(1);
}
