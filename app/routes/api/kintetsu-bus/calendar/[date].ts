import { getBusScheduleForDate } from '../../../../lib/api'

// キャッシュミドルウェアを一時的に無効化
export const GET = (c) => {
  const date = c.req.param('date')

  // 日付形式の検証（YYYY-MM-DD）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: '日付形式が正しくありません。YYYY-MM-DD形式で指定してください。' }, 400)
  }

  return c.json(getBusScheduleForDate(date))
}