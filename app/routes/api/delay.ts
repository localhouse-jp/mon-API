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
      const status = $('font[size="+1"]').text().trim()
      return { kintetsu: { servertime, status }, jr: null }
    })
    return c.json(data)
  } catch (error) {
    console.error('遅延情報取得エラー:', error)
    return c.json({ error: '遅延情報の取得に失敗しました' }, 500)
  }
}
