import { defineEventHandler, getQuery } from 'h3'

export interface ContributionDay {
  date: string
  count: number
  level: number
  repos?: string[]
}

export interface ActivityRepo {
  name: string
  commits: number
  url: string
  language?: string
  date?: string
  action?: string
}

export interface MonthActivity {
  month: string
  year: number
  totalCommits: number
  repos: ActivityRepo[]
}

export interface ContributionsApiResponse {
  selectedYear: number
  availableYears: number[]
  totals: {
    [year: string]: number
    allTime: number
  }
  contributions: ContributionDay[]
  activityFeed: MonthActivity[]
  source: 'live-github' | 'cached-github' | 'fallback'
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const LEVEL_MAP: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

// In-memory cache for GitHub API data (15 minutes TTL)
interface CacheEntry<T> {
  timestamp: number
  data: T
}

const CACHE_TTL_MS = 15 * 60 * 1000
const memoryCache = new Map<string, CacheEntry<any>>()

function getFromCache<T>(key: string): T | null {
  const item = memoryCache.get(key)
  if (!item) return null
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key)
    return null
  }
  return item.data as T
}

function setToCache<T>(key: string, data: T): void {
  memoryCache.set(key, { timestamp: Date.now(), data })
}

// Full Fallback Activity Feed matching real GitHub profile records
const FALLBACK_ACTIVITY_FEED: MonthActivity[] = [
  {
    month: 'October',
    year: 2026,
    totalCommits: 3,
    repos: [
      {
        name: 'thealfin/Katalog-Web-PPDB-Pesantren-Smart-Digital',
        commits: 3,
        url: 'https://github.com/thealfin/Katalog-Web-PPDB-Pesantren-Smart-Digital',
        language: 'HTML',
        date: '2026-10-04',
      },
    ],
  },
  {
    month: 'September',
    year: 2026,
    totalCommits: 29,
    repos: [
      {
        name: 'thealfin/Couplecash-Native',
        commits: 16,
        url: 'https://github.com/thealfin/Couplecash-Native',
        language: 'TypeScript',
        action: 'Created repository',
        date: '2026-09-12',
      },
      {
        name: 'thealfin/couplecash',
        commits: 10,
        url: 'https://github.com/thealfin/couplecash',
        language: 'Vue',
        action: 'Created repository',
        date: '2026-09-14',
      },
      {
        name: 'thealfin/Portfolio-Alfin-Almustajab',
        commits: 3,
        url: 'https://github.com/thealfin/Portfolio-Alfin-Almustajab',
        language: 'Vue',
        date: '2026-09-29',
      },
    ],
  },
  {
    month: 'August',
    year: 2026,
    totalCommits: 10,
    repos: [
      {
        name: 'thealfin/Portfolio-Alfin-Almustajab',
        commits: 5,
        url: 'https://github.com/thealfin/Portfolio-Alfin-Almustajab',
        language: 'Vue',
        action: 'Created repository',
        date: '2026-08-21',
      },
      {
        name: 'thealfin/Katalog-Web-PPDB-Pesantren-Smart-Digital',
        commits: 3,
        url: 'https://github.com/thealfin/Katalog-Web-PPDB-Pesantren-Smart-Digital',
        language: 'HTML',
        action: 'Created repository',
        date: '2026-08-23',
      },
      {
        name: 'thealfin/Toko-Klontong',
        commits: 1,
        url: 'https://github.com/thealfin/Toko-Klontong',
        language: 'Vue',
        action: 'Created repository',
        date: '2026-08-24',
      },
      {
        name: 'thealfin/Cek-Ongkir-Cak-App',
        commits: 1,
        url: 'https://github.com/thealfin/Cek-Ongkir-Cak-App',
        language: 'TypeScript',
        action: 'Created repository',
        date: '2026-08-23',
      },
    ],
  },
  {
    month: 'February',
    year: 2026,
    totalCommits: 3,
    repos: [
      {
        name: 'thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa',
        commits: 3,
        url: 'https://github.com/thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa',
        language: 'HTML',
        date: '2026-02-10',
      },
    ],
  },
  {
    month: 'January',
    year: 2026,
    totalCommits: 37,
    repos: [
      {
        name: 'thealfin/KIOSK-Gateway-Padang-Sederhana',
        commits: 20,
        url: 'https://github.com/thealfin/KIOSK-Gateway-Padang-Sederhana',
        language: 'HTML',
        date: '2026-01-23',
      },
      {
        name: 'thealfin/Mbanking',
        commits: 10,
        url: 'https://github.com/thealfin/Mbanking',
        language: 'Vue',
        date: '2026-01-13',
      },
      {
        name: 'thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa',
        commits: 6,
        url: 'https://github.com/thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa',
        language: 'HTML',
        date: '2026-01-31',
      },
      {
        name: 'thealfin/Warung-Padang-Gateway',
        commits: 1,
        url: 'https://github.com/thealfin/Warung-Padang-Gateway',
        language: 'HTML',
        date: '2026-01-18',
      },
    ],
  },
  {
    month: 'December',
    year: 2025,
    totalCommits: 16,
    repos: [
      {
        name: 'thealfin/Web-digitek',
        commits: 13,
        url: 'https://github.com/thealfin/Web-digitek',
        language: 'HTML',
        date: '2025-12-23',
      },
      {
        name: 'thealfin/Web-Digital-Teknologi-Perkasa',
        commits: 3,
        url: 'https://github.com/thealfin/Web-Digital-Teknologi-Perkasa',
        language: 'HTML',
        date: '2025-12-24',
      },
    ],
  },
  {
    month: 'October',
    year: 2025,
    totalCommits: 12,
    repos: [
      {
        name: 'thealfin/ponpes-daruttaqwa',
        commits: 7,
        url: 'https://github.com/thealfin/ponpes-daruttaqwa',
        language: 'HTML',
        date: '2025-10-24',
      },
      {
        name: 'thealfin/ponpes-darussalam',
        commits: 5,
        url: 'https://github.com/thealfin/ponpes-darussalam',
        language: 'HTML',
        date: '2025-10-16',
      },
    ],
  },
  {
    month: 'September',
    year: 2025,
    totalCommits: 7,
    repos: [
      {
        name: 'thealfin/Web-E-Lapak-Pontren',
        commits: 7,
        url: 'https://github.com/thealfin/Web-E-Lapak-Pontren',
        language: 'Vue',
        date: '2025-09-04',
      },
    ],
  },
  {
    month: 'August',
    year: 2025,
    totalCommits: 4,
    repos: [
      {
        name: 'thealfin/Web-cari-item-mlbb',
        commits: 4,
        url: 'https://github.com/thealfin/Web-cari-item-mlbb',
        language: 'HTML',
        date: '2025-08-15',
      },
    ],
  },
  {
    month: 'July',
    year: 2025,
    totalCommits: 2,
    repos: [
      {
        name: 'thealfin/web.pribadi',
        commits: 2,
        url: 'https://github.com/thealfin/web.pribadi',
        language: 'HTML',
        action: 'Created repository',
        date: '2025-07-28',
      },
    ],
  },
]

// Static Fallback Data in case GitHub API is unreachable
const FALLBACK_2026_DAYS: Record<string, { count: number; level: number; repos: string[] }> = {
  '2026-01-13': { count: 10, level: 3, repos: ['thealfin/Mbanking'] },
  '2026-01-18': { count: 1, level: 1, repos: ['thealfin/Warung-Padang-Gateway'] },
  '2026-01-21': { count: 20, level: 4, repos: ['thealfin/KIOSK-Gateway-Padang-Sederhana'] },
  '2026-01-22': { count: 4, level: 2, repos: ['thealfin/KIOSK-Gateway-Padang-Sederhana'] },
  '2026-01-23': { count: 2, level: 1, repos: ['thealfin/KIOSK-Gateway-Padang-Sederhana'] },
  '2026-01-30': { count: 6, level: 2, repos: ['thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa'] },
  '2026-01-31': { count: 2, level: 1, repos: ['thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa'] },
  '2026-02-09': { count: 1, level: 1, repos: ['thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa'] },
  '2026-02-10': { count: 2, level: 1, repos: ['thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa'] },
  '2026-08-20': { count: 5, level: 2, repos: ['thealfin/Portfolio-Alfin-Almustajab'] },
  '2026-08-23': { count: 4, level: 2, repos: ['thealfin/Katalog-Web-PPDB-Pesantren-Smart-Digital', 'thealfin/Cek-Ongkir-Cak-App'] },
  '2026-08-24': { count: 1, level: 1, repos: ['thealfin/Toko-Klontong'] },
  '2026-08-28': { count: 1, level: 1, repos: ['thealfin/Portfolio-Alfin-Almustajab'] },
  '2026-09-06': { count: 10, level: 3, repos: ['thealfin/couplecash'] },
  '2026-09-07': { count: 1, level: 1, repos: ['thealfin/couplecash'] },
  '2026-09-08': { count: 1, level: 4, repos: ['thealfin/Couplecash-Native'] },
  '2026-09-10': { count: 1, level: 1, repos: ['thealfin/Couplecash-Native'] },
  '2026-09-12': { count: 13, level: 3, repos: ['thealfin/Couplecash-Native'] },
  '2026-09-14': { count: 1, level: 1, repos: ['thealfin/Couplecash-Native'] },
  '2026-09-29': { count: 3, level: 2, repos: ['thealfin/Portfolio-Alfin-Almustajab'] },
  '2026-10-04': { count: 3, level: 2, repos: ['thealfin/Katalog-Web-PPDB-Pesantren-Smart-Digital'] },
}

const FALLBACK_2025_DAYS: Record<string, { count: number; level: number; repos: string[] }> = {
  '2025-06-18': { count: 2, level: 2, repos: ['thealfin/web.pribadi'] },
  '2025-07-28': { count: 3, level: 4, repos: ['thealfin/web.pribadi (Created repository)'] },
  '2025-08-15': { count: 4, level: 4, repos: ['thealfin/Web-cari-item-mlbb'] },
  '2025-09-03': { count: 7, level: 4, repos: ['thealfin/Web-E-Lapak-Pontren'] },
  '2025-09-04': { count: 2, level: 2, repos: ['thealfin/Web-E-Lapak-Pontren'] },
  '2025-10-15': { count: 5, level: 4, repos: ['thealfin/ponpes-darussalam'] },
  '2025-10-16': { count: 2, level: 2, repos: ['thealfin/ponpes-darussalam'] },
  '2025-10-23': { count: 7, level: 4, repos: ['thealfin/ponpes-daruttaqwa'] },
  '2025-10-24': { count: 1, level: 4, repos: ['thealfin/ponpes-daruttaqwa'] },
  '2025-12-23': { count: 13, level: 4, repos: ['thealfin/Web-digitek'] },
  '2025-12-24': { count: 3, level: 4, repos: ['thealfin/Web-Digital-Teknologi-Perkasa'] },
}

function generateFallbackGrid(year: number): ContributionDay[] {
  const list: ContributionDay[] = []
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const daysInYear = isLeap ? 366 : 365
  const dayMap = year === 2026 ? FALLBACK_2026_DAYS : FALLBACK_2025_DAYS

  for (let i = 0; i < daysInYear; i++) {
    const current = new Date(year, 0, 1 + i)
    const yyyy = current.getFullYear()
    const mm = String(current.getMonth() + 1).padStart(2, '0')
    const dd = String(current.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    const record = dayMap[dateStr]
    if (record) {
      list.push({
        date: dateStr,
        count: record.count,
        level: record.level,
        repos: record.repos,
      })
    } else {
      list.push({
        date: dateStr,
        count: 0,
        level: 0,
      })
    }
  }

  return list
}

const GITHUB_GRAPHQL_QUERY = `
query GetUserContributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection {
      contributionYears
    }
    targetCollection: contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
      commitContributionsByRepository(maxRepositories: 50) {
        repository {
          nameWithOwner
          name
          url
          primaryLanguage {
            name
          }
        }
        contributions(first: 100) {
          totalCount
          nodes {
            occurredAt
            commitCount
          }
        }
      }
      repositoryContributions(first: 50) {
        nodes {
          occurredAt
          repository {
            nameWithOwner
            name
            url
            primaryLanguage {
              name
            }
          }
        }
      }
    }
  }
}
`

export default defineEventHandler(async (event): Promise<ContributionsApiResponse> => {
  const query = getQuery(event)
  const reqYear = query.year ? parseInt(String(query.year), 10) : new Date().getFullYear()
  const targetYear = isNaN(reqYear) ? 2026 : reqYear

  const config = useRuntimeConfig(event)
  const token = (config.githubToken as string) || process.env.GITHUB_TOKEN || ''
  const username = (config.githubUsername as string) || process.env.GITHUB_USERNAME || ''

  const cacheKey = `gh_contrib_${username}_${targetYear}`
  const cachedResponse = getFromCache<ContributionsApiResponse>(cacheKey)
  if (cachedResponse) {
    return {
      ...cachedResponse,
      source: 'cached-github',
    }
  }

  // If no token or username is provided, return fallback immediately with filled activityFeed
  if (!token || !username) {
    return {
      selectedYear: targetYear,
      availableYears: [2026, 2025],
      totals: {
        '2026': 92,
        '2025': 49,
        allTime: 141,
      },
      contributions: generateFallbackGrid(targetYear),
      activityFeed: FALLBACK_ACTIVITY_FEED.filter((a) => a.year === targetYear),
      source: 'fallback',
    }
  }

  try {
    const fromDate = `${targetYear}-01-01T00:00:00Z`
    const toDate = `${targetYear}-12-31T23:59:59Z`

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Nuxt-Portfolio-App',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GITHUB_GRAPHQL_QUERY,
        variables: {
          login: username,
          from: fromDate,
          to: toDate,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`GitHub GraphQL API returned status ${response.status}`)
    }

    const resJson = await response.json()
    const userData = resJson.data?.user
    if (!userData || !userData.targetCollection) {
      throw new Error('Invalid user or contributions data returned from GitHub')
    }

    const availableYears: number[] = userData.contributionsCollection?.contributionYears || [2026, 2025]
    const targetCollection = userData.targetCollection
    const calendar = targetCollection.contributionCalendar

    // 1. Map commit dates & repo creations to repos
    const dateToRepos = new Map<string, Set<string>>()
    const monthMap = new Map<number, Map<string, {
      name: string
      commits: number
      url: string
      language?: string
      action?: string
      dates: string[]
    }>>()

    // Process commit contributions
    for (const item of targetCollection.commitContributionsByRepository || []) {
      const repoName = item.repository.nameWithOwner
      const repoUrl = item.repository.url
      const lang = item.repository.primaryLanguage?.name

      for (const node of item.contributions?.nodes || []) {
        const dateStr = node.occurredAt.split('T')[0]
        if (!dateToRepos.has(dateStr)) dateToRepos.set(dateStr, new Set())
        dateToRepos.get(dateStr)!.add(repoName)

        const d = new Date(node.occurredAt)
        const mIdx = d.getUTCMonth()
        if (!monthMap.has(mIdx)) monthMap.set(mIdx, new Map())
        const mRepos = monthMap.get(mIdx)!
        if (!mRepos.has(repoName)) {
          mRepos.set(repoName, {
            name: repoName,
            commits: 0,
            url: repoUrl,
            language: lang,
            dates: [],
          })
        }
        const rEntry = mRepos.get(repoName)!
        rEntry.commits += node.commitCount
        rEntry.dates.push(dateStr)
      }
    }

    // Process repo creation events
    for (const node of targetCollection.repositoryContributions?.nodes || []) {
      const dateStr = node.occurredAt.split('T')[0]
      const repoName = node.repository.nameWithOwner
      if (!dateToRepos.has(dateStr)) dateToRepos.set(dateStr, new Set())
      dateToRepos.get(dateStr)!.add(`${repoName} (Created repository)`)

      const d = new Date(node.occurredAt)
      const mIdx = d.getUTCMonth()
      if (!monthMap.has(mIdx)) monthMap.set(mIdx, new Map())
      const mRepos = monthMap.get(mIdx)!
      if (!mRepos.has(repoName)) {
        mRepos.set(repoName, {
          name: repoName,
          commits: 0,
          url: node.repository.url,
          language: node.repository.primaryLanguage?.name,
          action: 'Created repository',
          dates: [dateStr],
        })
      } else {
        mRepos.get(repoName)!.action = 'Created repository'
      }
    }

    // 2. Flatten calendar weeks into ContributionDay array
    const contributions: ContributionDay[] = []
    for (const week of calendar.weeks || []) {
      for (const day of week.contributionDays || []) {
        const repoSet = dateToRepos.get(day.date)
        const count = day.contributionCount || 0
        let level = LEVEL_MAP[day.contributionLevel] ?? 0
        if (count > 0 && level === 0) level = 1

        contributions.push({
          date: day.date,
          count,
          level,
          repos: repoSet && repoSet.size > 0 ? Array.from(repoSet) : undefined,
        })
      }
    }

    // 3. Build Activity Feed
    const activityFeed: MonthActivity[] = []
    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b - a)

    for (const mIdx of sortedMonths) {
      const reposMap = monthMap.get(mIdx)!
      const reposList = Array.from(reposMap.values()).sort((a, b) => b.commits - a.commits)
      const totalCommits = reposList.reduce((acc, curr) => acc + curr.commits, 0)

      activityFeed.push({
        month: MONTH_NAMES[mIdx],
        year: targetYear,
        totalCommits,
        repos: reposList.map(r => ({
          name: r.name,
          commits: r.commits,
          url: r.url,
          language: r.language,
          action: r.action,
          date: r.dates.length > 0 ? r.dates[0] : undefined,
        })),
      })
    }

    // If activityFeed from live is empty (e.g. earlier year without nodes), fallback to snapshot
    const finalActivityFeed = activityFeed.length > 0 
      ? activityFeed 
      : FALLBACK_ACTIVITY_FEED.filter((a) => a.year === targetYear)

    // 4. Totals per year
    const totals: Record<string, number> = {
      '2026': 92,
      '2025': 49,
      allTime: 141,
    }
    // Update targetYear total dynamically
    totals[String(targetYear)] = calendar.totalContributions
    let sumAll = 0
    for (const y of availableYears) {
      if (y === targetYear) {
        sumAll += calendar.totalContributions
      } else {
        sumAll += totals[String(y)] ?? 0
      }
    }
    totals.allTime = sumAll

    const result: ContributionsApiResponse = {
      selectedYear: targetYear,
      availableYears,
      totals,
      contributions,
      activityFeed: finalActivityFeed,
      source: 'live-github',
    }

    setToCache(cacheKey, result)
    return result
  } catch (error) {
    console.error('Error fetching live GitHub contributions:', error)
    return {
      selectedYear: targetYear,
      availableYears: [2026, 2025],
      totals: {
        '2026': 92,
        '2025': 49,
        allTime: 141,
      },
      contributions: generateFallbackGrid(targetYear),
      activityFeed: FALLBACK_ACTIVITY_FEED.filter((a) => a.year === targetYear),
      source: 'fallback',
    }
  }
})
