import { chromium } from '/home/user/qa/node_modules/playwright-core/index.mjs'
const browser = await chromium.launch({ executablePath: '/home/user/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome', args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(e.message))
const S = (n) => page.screenshot({ path: `/home/user/qa/shots/${n}.png` })
const nav = (name) => page.getByRole('navigation').getByRole('button', { name, exact: true })

await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
await nav('Settings').click()
await page.waitForTimeout(600)
await page.locator('button[title="Midnight"]').first().click().catch(async () => {
  const buttons = await page.locator('button[title]').evaluateAll(els => els.map(e => e.title))
  console.log('theme titles', buttons)
  await page.locator('button[title]').nth(3).click()
})
await page.waitForTimeout(500)
await nav('Hadiths').click()
await page.waitForTimeout(1600)
await S('40-dark-duas')
await page.getByRole('main').getByRole('button', { name: 'Hadiths', exact: true }).click()
await page.waitForTimeout(800)
await S('41-dark-hadiths')

// Arabic-only
await nav('Settings').click()
await page.waitForTimeout(500)
await page.getByRole('main').getByRole('button', { name: 'Arabic', exact: true }).click()
await page.waitForTimeout(300)
await nav('Hadiths').click()
await page.waitForTimeout(1200)
await S('42-arabic-only')

// 320
await page.setViewportSize({ width: 320, height: 700 })
await page.waitForTimeout(500)
await S('43-dark-320')
await page.getByRole('main').getByRole('button', { name: 'Duas & Adhkar', exact: true }).click()
await page.waitForTimeout(1000)
await S('44-dark-320-duas')
await browser.close()
console.log('ERRORS', JSON.stringify(errors))
