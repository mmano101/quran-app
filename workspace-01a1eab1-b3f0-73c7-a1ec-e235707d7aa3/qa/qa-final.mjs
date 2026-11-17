import { chromium } from '/home/user/qa/node_modules/playwright-core/index.mjs'
const browser = await chromium.launch({ executablePath: '/home/user/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome', args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, permissions: ['clipboard-read', 'clipboard-write'] })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
const S = (n) => page.screenshot({ path: `/home/user/qa/shots/${n}.png` })
const nav = (name) => page.getByRole('navigation').getByRole('button', { name, exact: true })
const inPage = (name) => page.getByRole('main').getByRole('button', { name, exact: true })
const report = {}

await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

// 1. tabs
report.tabs = await page.getByRole('navigation').getByRole('button').allInnerTexts()

// 2. extras loads
await nav('Hadiths').click()
await page.waitForTimeout(1800)
report.header = await page.locator('header p').first().innerText()

// 3. search english + arabic + chips
await page.getByPlaceholder(/Search duas/i).fill('travel')
await page.waitForTimeout(500)
report.searchTravel = await page.locator('text=/^[0-9,]+ duas/').first().innerText()
await page.getByPlaceholder(/Search duas/i).fill('اللهم اغفر')
await page.waitForTimeout(500)
report.searchArabic = await page.locator('text=/^[0-9,]+ duas/').first().innerText()
await page.getByPlaceholder(/Search duas/i).fill('')
await inPage('Quranic Duas').click()
await page.waitForTimeout(400)
report.quranicChip = await page.locator('text=/^[0-9,]+ duas/').first().innerText()
await inPage('All').click()

// 4. copy
await page.locator('article').first().getByRole('button', { name: 'Copy' }).click()
await page.waitForTimeout(400)
report.copyToast = await page.locator('text=/Copied|not available/').first().innerText().catch(() => 'none')

// 5. hadiths + grade + ref
await inPage('Hadiths').click()
await page.waitForTimeout(700)
await page.getByPlaceholder(/Search hadiths/i).fill('mosque')
await page.waitForTimeout(500)
await page.locator('article').first().screenshot({ path: '/home/user/qa/shots/50-hadith-search-card.png' })
report.hadithSearch = await page.locator('text=/^[0-9]+ hadiths/').first().innerText()
await page.getByPlaceholder(/Search hadiths/i).fill('')

// 6. save → saved tab → reload persistence
await page.locator('article').first().getByRole('button', { name: /Save/ }).click()
await page.waitForTimeout(300)
await nav('Saved').click()
await page.waitForTimeout(500)
report.savedHeader = await page.locator('header p').first().innerText()
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await nav('Saved').click()
await page.waitForTimeout(400)
report.savedAfterReload = await page.locator('header p').first().innerText()

// 7. empty search state + reset
await nav('Hadiths').click()
await page.waitForTimeout(1200)
await page.getByPlaceholder(/Search duas/i).fill('zzzzqqq')
await page.waitForTimeout(500)
report.emptyState = await page.locator('text=Nothing found').count()
await page.screenshot({ path: '/home/user/qa/shots/51-empty.png' })
await page.getByRole('button', { name: 'Reset filters' }).click()
await page.waitForTimeout(400)
report.afterReset = await page.locator('article').count()

// 8. 320 + 360 nav layout
for (const w of [320, 360]) {
  await page.setViewportSize({ width: w, height: 720 })
  await page.waitForTimeout(400)
  const box = await page.locator('nav > div').boundingBox()
  report[`nav${w}`] = `${Math.round(box.width)}x${Math.round(box.height)}`
  await page.screenshot({ path: `/home/user/qa/shots/52-nav-${w}.png` })
}
await page.setViewportSize({ width: 390, height: 844 })

// 9. settings round trip keeps extras themed
await nav('Settings').click()
await page.waitForTimeout(500)
await page.locator('button[title="Soft Sage"]').click()
await page.waitForTimeout(300)
await nav('Hadiths').click()
await page.waitForTimeout(1200)
await S('53-sage-extras')

report.errors = errors
console.log(JSON.stringify(report, null, 2))
await browser.close()
