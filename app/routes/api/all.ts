import { getAllData } from '../../lib/api'

// キャッシュミドルウェアを一時的に無効化
export const GET = async (c) => {
  const data = await getAllData()
  return c.json(data)
}