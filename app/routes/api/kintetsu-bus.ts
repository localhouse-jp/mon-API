import { parsedBusData } from '../../lib/api'

// キャッシュミドルウェアを一時的に無効化
export const GET = async (c) => {
  return c.json(parsedBusData)
}