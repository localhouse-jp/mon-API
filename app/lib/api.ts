import * as fs from 'fs'
import * as path from 'path'
import { parseJR } from './parsers/jr'
import { KintetsuParser } from './parsers/kintetsu'
import {
  getBusScheduleForDate,
  kintetsuBusCalendar,
  kintetsuBusRoutes,
  parsedBusData
} from './parsers/kintetsu-bus'
import { DataCache } from './utils/cache'
import { loadConfig } from './utils/config'

// 設定を読み込む
const config = loadConfig()
const outputDir = config.outputDir || './dist'
const DEBUG_MODE = process.env.DEBUG_MODE === 'true'

// キャッシュの有効期限
const CACHE_VALIDITY_MS = process.env.CACHE_VALIDITY_MS
  ? parseInt(process.env.CACHE_VALIDITY_MS)
  : 60 * 60 * 1000

// データキャッシュのインスタンスを作成
const dataCache = new DataCache(CACHE_VALIDITY_MS)

/**
 * JRの時刻表データを取得する
 */
export async function fetchJRData() {
  // デバッグモードの場合はキャッシュファイルのみを読み込む
  if (DEBUG_MODE) {
    try {
      const jrFilePath = path.join(outputDir, 'jr-train.json')
      if (fs.existsSync(jrFilePath)) {
        console.log('デバッグモード: JRデータをキャッシュから読み込みます')
        const data = JSON.parse(fs.readFileSync(jrFilePath, 'utf-8'))
        return data
      } else {
        console.error('デバッグモード: JRのキャッシュファイルが見つかりません')
        return null
      }
    } catch (e) {
      console.error('デバッグモード: JRのキャッシュファイルの読み込みに失敗しました:', e)
      return null
    }
  }

  // 通常モード
  try {
    return await parseJR()
  } catch (error) {
    console.error('JRデータの取得に失敗しました:', error)
    try {
      const jrFilePath = path.join(outputDir, 'jr-train.json')
      if (fs.existsSync(jrFilePath)) {
        const data = JSON.parse(fs.readFileSync(jrFilePath, 'utf-8'))
        return data
      }
    } catch (e) {
      console.error('JRのキャッシュファイルの読み込みにも失敗しました:', e)
    }
    return null
  }
}

/**
 * 近鉄の時刻表データを取得する
 */
export async function fetchKintetsuData() {
  // デバッグモードの場合はキャッシュファイルのみを読み込む
  if (DEBUG_MODE) {
    try {
      const kintetsuFilePath = path.join(outputDir, 'kintetsu-train.json')
      if (fs.existsSync(kintetsuFilePath)) {
        console.log('デバッグモード: 近鉄データをキャッシュから読み込みます')
        const data = JSON.parse(fs.readFileSync(kintetsuFilePath, 'utf-8'))
        return data
      } else {
        console.error('デバッグモード: 近鉄のキャッシュファイルが見つかりません')
        return null
      }
    } catch (e) {
      console.error('デバッグモード: 近鉄のキャッシュファイルの読み込みに失敗しました:', e)
      return null
    }
  }

  // 通常モード
  try {
    const kintetsuConfig = config.parsers.find(p => p.name.toLowerCase() === 'kintetsu')
    if (!kintetsuConfig) {
      console.log('近鉄の設定が見つかりません')
      return null
    }

    const parser = new KintetsuParser()
    const result = await parser.parseUrls(kintetsuConfig.urls)

    const outputPath = path.join(outputDir, 'kintetsu-train.json')
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8')

    return result
  } catch (error) {
    console.error('近鉄データの取得に失敗しました:', error)
    try {
      const kintetsuFilePath = path.join(outputDir, 'kintetsu-train.json')
      if (fs.existsSync(kintetsuFilePath)) {
        const data = JSON.parse(fs.readFileSync(kintetsuFilePath, 'utf-8'))
        return data
      }
    } catch (e) {
      console.error('近鉄のキャッシュファイルの読み込みにも失敗しました:', e)
    }
    return null
  }
}

/**
 * JRデータをキャッシュから取得する
 */
export async function getJRData() {
  return await dataCache.get('jr', fetchJRData)
}

/**
 * 近鉄データをキャッシュから取得する
 */
export async function getKintetsuData() {
  return await dataCache.get('kintetsu', fetchKintetsuData)
}

/**
 * すべての鉄道・バスデータを取得する
 */
export async function getAllData() {
  const [kintetsu, jr, kintetsuBus] = await Promise.all([
    getKintetsuData(),
    getJRData(),
    parsedBusData
  ])

  return {
    kintetsu,
    jr,
    kintetsuBus,
    lastUpdated: new Date().toISOString()
  }
}

/**
 * キャッシュをクリアする
 */
export function clearCache(key?: string) {
  if (key) {
    dataCache.clear(key)
    return { message: `キャッシュ "${key}" をクリアしました` }
  } else {
    dataCache.clear()
    return { message: 'すべてのキャッシュをクリアしました' }
  }
}

// データを事前に取得する
export function initData() {
  setTimeout(() => {
    console.log('初期データを取得中...')
    Promise.all([
      dataCache.get('kintetsu', fetchKintetsuData),
      dataCache.get('jr', fetchJRData)
    ]).then(() => {
      console.log('初期データの取得が完了しました')
    }).catch(err => {
      console.error('初期データの取得中にエラーが発生しました:', err)
    })
  }, 1000)
}

// バス関連の機能をエクスポート
export {
  getBusScheduleForDate,
  kintetsuBusCalendar,
  kintetsuBusRoutes,
  parsedBusData
}
