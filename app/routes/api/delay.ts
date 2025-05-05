import * as cheerio from 'cheerio'
import * as iconv from 'iconv-lite'
import { DataCache } from '../../lib/utils/cache'

const delayCache = new DataCache(10 * 60 * 1000)

export const GET = async (c) => {
  try {
    const data = await delayCache.get('delay', async () => {
      const res = await fetch('https://www.kintetsu.jp/unkou/unkou.html')
      const dateHeader = res.headers.get('Date') || ''
      const buf = Buffer.from(await res.arrayBuffer())
      const html = iconv.decode(buf, 'Shift_JIS')
      const $ = cheerio.load(html)
      let servertime = ''
      if (dateHeader) {
        const sd = new Date(dateHeader)
        servertime = `${sd.getFullYear()}年${sd.getMonth() + 1}月${sd.getDate()}日 ${sd.getHours()}:${sd.getMinutes().toString().padStart(2, '0')}現在`
      } else {
        servertime = $('#servertime').text().trim()
      }
      const statusMsg = $('font[size="+1"]').text().trim()
      if (statusMsg) {
        return { kintetsu: { servertime, status: statusMsg }, jr: null }
      }
      const disruptions: Array<{ route: string; status: string; cause: string; detailUrl: string }> = []
      const table = $('table[style*="border-collapse"]').first()
      table.find('tbody tr').each((_, row) => {
        const tds = $(row).find('td')
        if (tds.length >= 4) {
          const route = tds.eq(0).text().trim()
          const stat = tds.eq(1).text().trim()
          const cause = tds.eq(2).text().trim()
          const onclick = tds.eq(3).find('input[onclick]').attr('onclick') || ''
          const match = onclick.match(/window\.open\(['"](.+?)['"]/)
          const detailPath = match ? match[1] : ''
          const detailUrl = detailPath ? new URL(detailPath, 'https://www.kintetsu.jp/unkou/unkou.html').toString() : ''
          disruptions.push({ route, status: stat, cause, detailUrl })
        }
      })
      return { kintetsu: { servertime, disruptions }, jr: null }
    })
    return c.json(data)
  } catch (error) {
    console.error('遅延情報取得エラー:', error)
    return c.json({ error: '遅延情報の取得に失敗しました' }, 500)
  }
}
