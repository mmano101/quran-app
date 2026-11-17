import { chromium } from '/home/user/qa/node_modules/playwright-core/index.mjs'
const browser = await chromium.launch({ executablePath: '/home/user/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome', args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
const nav = (n) => page.getByRole('navigation').getByRole('button', { name: n, exact: true })
const inPage = (n) => page.getByRole('main').getByRole('button', { name: n, exact: true })
const report = {}
const countLine = () => page.locator('main p.text-\\[11px\\]').last().innerText().catch(() => 'n/a')

await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
await nav('Hadiths').click()
await page.waitForTimeout(1800)

// exact counts for searches
await page.getByPlaceholder(/Search duas/i).fill('travel')
await page.waitForTimeout(400)
report.travel = await countLine()
await page.getByPlaceholder(/Search duas/i).fill('اللهم اغفر')
await page.waitForTimeout(400)
report.arabicPhrase = await countLine()
await page.getByPlaceholder(/Search duas/i).fill('')
await inPage('Quranic Duas').click()
await page.waitForTimeout(400)
report.quranic = await countLine()
await inPage('All').click()
await page.waitForTimeout(300)

// English-only display mode
await nav('Settings').click()
await page.waitForTimeout(500)
await inPage('English').click()
await page.waitForTimeout(300)
await nav('Hadiths').click()
await page.waitForTimeout(1200)
await page.screenshot({ path: '/home/user/qa/shots/60-english-only.png' })
report.englishOnlyArabicCards = await page.locator('article p.arabic').count()

// back to both
await nav('Settings').click()
await page.waitForTimeout(400)
await inPage('Both').click()
await page.waitForTimeout(300)

// save a dua and a hadith, check Saved header wording
await nav('Hadiths').click()
await page.waitForTimeout(1200)
await page.locator('article').first().getByRole('button', { name: /Save/ }).click()
await inPage('Hadiths').click()
await page.waitForTimeout(600)
await page.locator('article').first().getByRole('button', { name: /Save/ }).click()
await nav('Saved').click()
await page.waitForTimeout(500)
report.savedHeader = await page.locator('header p').first().innerText()
await page.screenshot({ path: '/home/user/qa/shots/61-saved-mixed2.png' })

report.errors = errors
console.log(JSON.stringify(report, null, 2))
await browser.close()
