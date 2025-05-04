import { getKintetsuData } from '../../lib/api'

// キャッシュミドルウェアを一時的に無効化
export const GET = async (c) => {
  const data = await getKintetsuData()

  if (!data) {
    return c.json({ error: '近鉄のデータを取得できませんでした' }, 500)
  }

  return c.json(data)
}