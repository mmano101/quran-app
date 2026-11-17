import { chromium } from '/home/user/qa/node_modules/playwright-core/index.mjs'
const browser = await chromium.launch({ executablePath: '/home/user/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome', args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(e.message))
const S = (n) => page.screenshot({ path: `/home/user/qa/shots/${n}.png` })

await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await S('30-surahs')

// Mushaf: credit vs back button
await page.getByRole('navigation').getByRole('button', { name: 'Mushaf', exact: true }).click()
await page.waitForTimeout(1800)
await S('31-mushaf')

// Extras: save a dua
await page.getByRole('navigation').getByRole('button', { name: 'Hadiths', exact: true }).click()
await page.waitForTimeout(1500)
await page.locator('article').first().getByRole('button', { name: /Save/i }).click()
await page.locator('article').nth(2).getByRole('button', { name: /Save/i }).click()
await page.waitForTimeout(300)
await page.getByRole('navigation').getByRole('button', { name: 'Saved', exact: true }).click()
await page.waitForTimeout(700)
await S('32-saved-mixed')
console.log('saved text:', (await page.locator('main').innerText()).slice(0, 300).replace(/\n/g, ' | '))

// dark theme
await page.getByRole('navigation').getByRole('button', { name: 'Settings', exact: true }).click()
await page.waitForTimeout(600)
await S('33-settings')
await browser.close()
console.log('ERRORS', JSON.stringify(errors))
