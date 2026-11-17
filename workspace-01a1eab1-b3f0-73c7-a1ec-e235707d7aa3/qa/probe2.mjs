import { chromium } from '/home/user/qa/node_modules/playwright-core/index.mjs'
const browser = await chromium.launch({ executablePath: '/home/user/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome', args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(e.message))

await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
await page.getByRole('navigation').getByRole('button', { name: 'Hadiths', exact: true }).click()
await page.waitForTimeout(1600)
console.log('read-full buttons:', await page.getByText('Read full text').count())
await page.screenshot({ path: '/home/user/qa/shots/20-hadiths.png' })

// 320 px
await page.setViewportSize({ width: 320, height: 720 })
await page.waitForTimeout(400)
await page.screenshot({ path: '/home/user/qa/shots/21-hadiths-320.png' })
await page.setViewportSize({ width: 390, height: 844 })

// Arabic-only display mode + dark theme via settings
await page.getByRole('navigation').getByRole('button', { name: 'Settings', exact: true }).click()
await page.waitForTimeout(600)
await page.screenshot({ path: '/home/user/qa/shots/22-settings.png', fullPage: true })
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
