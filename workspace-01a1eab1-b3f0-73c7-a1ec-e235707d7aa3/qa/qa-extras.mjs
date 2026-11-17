import { chromium } from '/home/user/qa/node_modules/playwright-core/index.mjs'
import fs from 'node:fs'

const BASE = process.env.BASE || 'http://127.0.0.1:5173'
const OUT = '/home/user/qa/shots'
const errors = []
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: '/home/user/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  args: ['--no-sandbox'],
})
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text())
})
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` })

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await shot('01-surahs')

const credit = page.locator('text=Made by Ali Ihab').first()
console.log('credit box', JSON.stringify(await credit.boundingBox()))

await page.getByRole('navigation').getByRole('button', { name: 'Hadiths', exact: true }).click()
await page.waitForTimeout(1600)
await shot('02-extras-duas')
console.log('dua cards', await page.locator('article').count())
console.log('header', await page.locator('header p').first().innerText())

await page.getByPlaceholder(/Search duas/i).fill('forgive my parents')
await page.waitForTimeout(600)
await shot('03-search')
console.log('search articles', await page.locator('article').count())
console.log('search count label', await page.locator('text=/^[0-9,]+ duas/').first().innerText().catch(() => 'n/a'))

await page.getByPlaceholder(/Search duas/i).fill('ربنا')
await page.waitForTimeout(600)
console.log('arabic search articles', await page.locator('article').count())

await page.getByPlaceholder(/Search duas/i).fill('')
await page.getByRole('main').getByRole('button', { name: 'Travel', exact: true }).click()
await page.waitForTimeout(500)
await shot('04-chip-travel')
console.log('travel articles', await page.locator('article').count())

await page.getByRole('main').getByRole('button', { name: 'Hadiths', exact: true }).click()
await page.waitForTimeout(900)
await shot('05-hadiths')
console.log('first hadith:', (await page.locator('article').first().innerText()).slice(0, 240).replace(/\n/g, ' | '))

await page.locator('article').first().getByRole('button', { name: /Save|bookmark/i }).click()
await page.waitForTimeout(400)
await page.getByRole('navigation').getByRole('button', { name: 'Saved', exact: true }).click()
await page.waitForTimeout(600)
await shot('06-saved')
const savedText = await page.locator('main').innerText()
console.log('saved mentions source:', /Bukhari|Riyad|Nawawi|Muslim/.test(savedText))

await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(900)
await page.getByRole('navigation').getByRole('button', { name: 'Saved', exact: true }).click()
await page.waitForTimeout(400)
console.log('saved items after reload', await page.locator('main li').count())

await page.setViewportSize({ width: 320, height: 720 })
await page.waitForTimeout(500)
await shot('07-320-saved')
console.log('nav box', JSON.stringify(await page.locator('nav').boundingBox()))

// dark theme + arabic-only display mode on the new tab
await page.getByRole('navigation').getByRole('button', { name: 'Settings', exact: true }).click()
await page.waitForTimeout(500)
await shot('08-settings')

console.log('ERRORS', JSON.stringify(errors))
await browser.close()
