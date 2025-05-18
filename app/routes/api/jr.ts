import { getJRData } from '../../lib/api'

// キャッシュミドルウェアを一時的に無効化
export const GET = async (c) => {
  const data = await getJRData()

  if (!data) {
    return c.json({ error: 'JRのデータを取得できませんでした' }, 500)
  }

  return c.json(data)
}