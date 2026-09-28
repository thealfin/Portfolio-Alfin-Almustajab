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
  source: 'real-profile'
}

// 1. Exact Activity Breakdown matching Alfin's GitHub Profile data
const REAL_ACTIVITY_FEED: MonthActivity[] = [
  {
    month: 'September',
    year: 2026,
    totalCommits: 26,
    repos: [
      {
        name: 'thealfin/Couplecash-Native',
        commits: 16,
        url: 'https://github.com/thealfin/Couplecash-Native/commits?author=thealfin&since=2026-08-31&until=2026-09-28',
        language: 'TypeScript',
        date: 'Sep 12',
      },
      {
        name: 'thealfin/couplecash',
        commits: 10,
        url: 'https://github.com/thealfin/couplecash/commits?author=thealfin&since=2026-08-31&until=2026-09-28',
        language: 'Vue',
        date: 'Sep 6',
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
        url: 'https://github.com/thealfin/Portfolio-Alfin-Almustajab/commits?author=thealfin&since=2026-07-31&until=2026-08-31',
        language: 'Vue',
        date: 'Aug 20',
      },
      {
        name: 'thealfin/Katalog-Web-PPDB-Pesantren-Smart-Digital',
        commits: 3,
        url: 'https://github.com/thealfin/Katalog-Web-PPDB-Pesantren-Smart-Digital/commits?author=thealfin&since=2026-07-31&until=2026-08-31',
        language: 'HTML',
        date: 'Aug 23',
      },
      {
        name: 'thealfin/Toko-Klontong',
        commits: 1,
        url: 'https://github.com/thealfin/Toko-Klontong/commits?author=thealfin&since=2026-07-31&until=2026-08-31',
        language: 'Vue',
        date: 'Aug 24',
      },
      {
        name: 'thealfin/Cek-Ongkir-Cak-App',
        commits: 1,
        url: 'https://github.com/thealfin/Cek-Ongkir-Cak-App/commits?author=thealfin&since=2026-07-31&until=2026-08-31',
        language: 'TypeScript',
        date: 'Aug 23',
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
        url: 'https://github.com/thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa/commits?author=thealfin&since=2026-01-31&until=2026-02-28',
        language: 'HTML',
        date: 'Feb 9 - Feb 10',
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
        url: 'https://github.com/thealfin/KIOSK-Gateway-Padang-Sederhana/commits?author=thealfin&since=2025-12-31&until=2026-01-31',
        language: 'HTML',
        date: 'Jan 21',
      },
      {
        name: 'thealfin/Mbanking',
        commits: 10,
        url: 'https://github.com/thealfin/Mbanking/commits?author=thealfin&since=2025-12-31&until=2026-01-31',
        language: 'Vue',
        date: 'Jan 13',
      },
      {
        name: 'thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa',
        commits: 6,
        url: 'https://github.com/thealfin/Monitoring-Log-Error-Bug-Digital-Teknologi-Perkasa/commits?author=thealfin&since=2025-12-31&until=2026-01-31',
        language: 'HTML',
        date: 'Jan 30',
      },
      {
        name: 'thealfin/Warung-Padang-Gateway',
        commits: 1,
        url: 'https://github.com/thealfin/Warung-Padang-Gateway/commits?author=thealfin&since=2025-12-31&until=2026-01-31',
        language: 'HTML',
        date: 'Jan 18',
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
        url: 'https://github.com/thealfin/Web-digitek/commits?author=thealfin&since=2025-11-30&until=2025-12-31',
        language: 'HTML',
        date: 'Dec 23',
      },
      {
        name: 'thealfin/Web-Digital-Teknologi-Perkasa',
        commits: 3,
        url: 'https://github.com/thealfin/Web-Digital-Teknologi-Perkasa/commits?author=thealfin&since=2025-11-30&until=2025-12-31',
        language: 'HTML',
        date: 'Dec 23',
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
        url: 'https://github.com/thealfin/ponpes-daruttaqwa/commits?author=thealfin&since=2025-09-30&until=2025-10-31',
        language: 'HTML',
        date: 'Oct 23',
      },
      {
        name: 'thealfin/ponpes-darussalam',
        commits: 5,
        url: 'https://github.com/thealfin/ponpes-darussalam/commits?author=thealfin&since=2025-09-30&until=2025-10-31',
        language: 'HTML',
        date: 'Oct 15',
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
        url: 'https://github.com/thealfin/Web-E-Lapak-Pontren/commits?author=thealfin&since=2025-08-31&until=2025-09-30',
        language: 'Vue',
        date: 'Sep 3',
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
        url: 'https://github.com/thealfin/Web-cari-item-mlbb/commits?author=thealfin&since=2025-07-31&until=2025-08-31',
        language: 'HTML',
        date: 'Aug 15',
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
        url: 'https://github.com/thealfin/web.pribadi/commits?author=thealfin&since=2025-06-30&until=2025-07-31',
        language: 'HTML',
        date: 'Jul 28',
        action: 'Created their first repository (Public)',
      },
    ],
  },
]

// 2. Real Daily Contributions Map exactly matching Alfin's GitHub screenshot (86 in 2026, 49 in 2025)
const REAL_2026_DAYS: Record<string, { count: number; level: number; repos: string[] }> = {
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
}

const REAL_2025_DAYS: Record<string, { count: number; level: number; repos: string[] }> = {
  '2025-06-18': { count: 2, level: 2, repos: ['thealfin/web.pribadi'] },
  '2025-07-28': { count: 3, level: 4, repos: ['thealfin/web.pribadi (First repo created)'] },
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

// Helper to generate full calendar grid for a specific year
function generateYearGrid(year: number): ContributionDay[] {
  const list: ContributionDay[] = []
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const daysInYear = isLeap ? 366 : 365

  const dayMap = year === 2026 ? REAL_2026_DAYS : REAL_2025_DAYS

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

export default defineEventHandler((event): ContributionsApiResponse => {
  const query = getQuery(event)
  const reqYear = query.year ? parseInt(String(query.year), 10) : 2026
  const targetYear = reqYear === 2025 ? 2025 : 2026

  const contributions = generateYearGrid(targetYear)

  return {
    selectedYear: targetYear,
    availableYears: [2026, 2025],
    totals: {
      '2026': 86,
      '2025': 49,
      allTime: 135,
    },
    contributions,
    activityFeed: REAL_ACTIVITY_FEED.filter((a) => a.year === targetYear),
    source: 'real-profile',
  }
})
