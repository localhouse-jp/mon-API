import * as fs from 'fs';
import * as path from 'path';
import { kintetsuBusCalendar } from './data/kintetsu-bus/calendar'; // Corrected import path
import { kintetsuBusRoutes } from './data/kintetsu-bus/routes'; // Corrected import path
import { parseJR } from './parsers/jr';
import { KintetsuParser } from './parsers/kintetsu';
import { getBusScheduleForDate, parsedBusData } from './parsers/kintetsu-bus';
import { DataCache } from './utils/cache';
import { loadConfig } from './utils/config';

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
    console.log('近鉄電車の時刻表データを取得しています...')
    const kintetsuConfig = config.parsers.find(p => p.name.toLowerCase() === 'kintetsu')
    if (!kintetsuConfig) {
      console.error('近鉄の設定が見つかりません。config.jsonのparsers配列に"kintetsu"設定が必要です。')
      return null
    }

    if (!kintetsuConfig.urls || kintetsuConfig.urls.length === 0) {
      console.error('近鉄の取得URLが設定されていません。config.jsonのkintetsu設定にurlsが必要です。')
      return null
    }

    console.log(`近鉄の時刻表URLを処理します: ${kintetsuConfig.urls.length}件`)

    const parser = new KintetsuParser()
    const result = await parser.parseUrls(kintetsuConfig.urls)

    // 空のデータの場合はエラーとみなす
    if (!result || Object.keys(result).length === 0) {
      throw new Error('近鉄時刻表の取得に失敗しました。データが空です。')
    }

    console.log(`近鉄時刻表の取得が完了しました。駅数: ${Object.keys(result).length}`)

    // データが取得できた場合のみファイルに保存
    const outputPath = path.join(outputDir, 'kintetsu-train.json')
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8')
    console.log(`近鉄時刻表データを保存しました: ${outputPath}`)

    return result
  } catch (error) {
    console.error('近鉄データの取得に失敗しました:', error)

    // エラーの詳細をログ出力
    if (error instanceof Error) {
      console.error(`エラー詳細: ${error.message}`)
      console.error(`スタックトレース: ${error.stack}`)
    }

    // 既存のキャッシュファイルを読み込む
    try {
      const kintetsuFilePath = path.join(outputDir, 'kintetsu-train.json')
      if (fs.existsSync(kintetsuFilePath)) {
        console.log('既存の近鉄時刻表キャッシュを使用します')
        const fileContent = fs.readFileSync(kintetsuFilePath, 'utf-8')

        // ファイルが空または無効なJSONの場合はnullを返す
        if (!fileContent.trim() || fileContent === '{}') {
          console.error('既存のキャッシュファイルが空か無効です')
          return null
        }

        const data = JSON.parse(fileContent)
        return data
      }
    } catch (e) {
      console.error('近鉄のキャッシュファイルの読み込みにも失敗しました:', e)
    }

    // デフォルトの空データを返さないようにする
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
export async function initData() {
  console.log('初期データを取得中...')
  try {
    // データディレクトリの存在確認
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
      console.log(`データ出力ディレクトリを作成しました: ${outputDir}`)
    }

    // 並行してデータ取得
    const results = await Promise.all([
      dataCache.get('kintetsu', fetchKintetsuData),
      dataCache.get('jr', fetchJRData)
    ])

    console.log('初期データの取得が完了しました')
    return results
  } catch (err) {
    console.error('初期データの取得中にエラーが発生しました:', err)
    throw err
  }
}

// バス関連の機能をエクスポート
export {
  getBusScheduleForDate,
  kintetsuBusCalendar,
  kintetsuBusRoutes,
  parsedBusData
};

