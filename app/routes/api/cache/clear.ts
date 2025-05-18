import { clearCache } from '../../../lib/api'

export const POST = async (c) => {
  const { key } = await c.req.json()

  if (key) {
    clearCache(key)
    return c.json({ message: `キャッシュ "${key}" をクリアしました` })
  } else {
    clearCache()
    return c.json({ message: 'すべてのキャッシュをクリアしました' })
  }
}