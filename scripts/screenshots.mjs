import puppeteer from 'puppeteer-core'
import { mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'docs', 'screenshots')
const BASE = process.env.BASE_URL || 'http://localhost:3000'

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]

const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p))
if (!executablePath) {
  console.error('Chrome/Edge not found. Set PUPPETEER_EXECUTABLE_PATH.')
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--hide-scrollbars'],
})

const shot = async (page, name, { fullPage = false, selector = null } = {}) => {
  await sleep(1200)
  if (selector) {
    const el = await page.$(selector)
    if (!el) {
      console.warn(`selector not found: ${selector} for ${name}`)
      return
    }
    await el.scrollIntoView()
    await sleep(800)
    await el.screenshot({ path: resolve(OUT, name), optimizeForSpeed: true, captureBeyondViewport: false })
  } else {
    await page.screenshot({ path: resolve(OUT, name), fullPage, optimizeForSpeed: true })
  }
  console.log('saved:', name)
}

// ---------- Desktop (1440x900) ----------
const desktop = await browser.newPage()
await desktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })

await desktop.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 })
await sleep(2500)

await shot(desktop, 'home-hero.png', { selector: '#home' })
await shot(desktop, 'home-about.png', { selector: '#about' })
await shot(desktop, 'home-projects.png', { selector: '#projects' })
await shot(desktop, 'home-experience.png', { selector: '#experience' })
await shot(desktop, 'home-stack.png', { selector: '#stack' })
await shot(desktop, 'home-thoughts.png', { selector: '#thoughts' })
await shot(desktop, 'home-testimonials.png', { selector: '#testimonials' })
await shot(desktop, 'home-contact.png', { selector: '#contact' })
await shot(desktop, 'home-full.png', { fullPage: true })

// ---------- Mobile (390x844) ----------
const mobile = await browser.newPage()
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
await mobile.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 })
await sleep(2500)
await shot(mobile, 'mobile-hero.png', { selector: '#home' })
await shot(mobile, 'mobile-projects.png', { selector: '#projects' })

// ---------- Admin login ----------
const login = await browser.newPage()
await login.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await login.goto(BASE + '/login', { waitUntil: 'networkidle2', timeout: 60000 })
await shot(login, 'admin-login.png', { fullPage: true })

await browser.close()
console.log('done ->', OUT)