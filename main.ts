// 必要パッケージのインストール
// bun add cheerio iconv-lite fs

import * as fs from 'fs';
import { JRParser } from './parsers/jr';
import { KintetsuParser } from './parsers/kintetsu';
import { ParserResult, TimetableParser } from './types';

// 引数処理用の簡易インターフェース
interface ParserConfig {
  name: string;
  urls: string[];
}

// 設定ファイルのインターフェース（実行時引数がない場合に使用）
interface ConfigFile {
  parsers: ParserConfig[];
  outputPath?: string;
}

/**
 * 設定ファイルを読み込む
 * @returns 設定ファイルの内容
 */
function loadConfig(): ConfigFile {
  try {
    const configPath = './config.json';
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent);
    }
  } catch (err) {
    console.error('設定ファイルの読み込みに失敗しました:', err);
  }

  // デフォルト設定
  return {
    parsers: [
      {
        name: 'kintetsu',
        urls: [
          'https://eki.kintetsu.co.jp/norikae/T5?USR=PC&slCode=356-5&d=1&dw=0',
          'https://eki.kintetsu.co.jp/norikae/T5?USR=PC&slCode=350-8&d=1&dw=0'
        ]
      }
    ],
    outputPath: './timetable.json'
  };
}

/**
 * パーサー名から対応するパーサーインスタンスを取得
 * @param name パーサー名
 * @returns パーサーインスタンス
 */
function getParserByName(name: string): TimetableParser | null {
  switch (name.toLowerCase()) {
    case 'kintetsu':
      return new KintetsuParser();
    case 'jr':
      return new JRParser();
    // 他のパーサーを追加する場合はここに case を追加
    default:
      console.error(`未知のパーサー: ${name}`);
      return null;
  }
}

/**
 * メイン関数
 */
async function main() {
  // 設定を読み込む
  const config = loadConfig();
  const results: Record<string, ParserResult> = {};

  // 各パーサーを実行
  for (const parserConfig of config.parsers) {
    const parser = getParserByName(parserConfig.name);
    if (!parser) continue;

    console.log(`パーサー ${parserConfig.name} を実行中...`);
    try {
      const result = await parser.parseUrls(parserConfig.urls);
      results[parserConfig.name] = result;
      console.log(`パーサー ${parserConfig.name} の実行が完了しました`);
    } catch (err) {
      console.error(`パーサー ${parserConfig.name} の実行中にエラーが発生しました:`, err);
    }
  }

  // 結果を出力
  const outputPath = config.outputPath || './timetable.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`結果を ${outputPath} に出力しました`);
}

// スクリプト実行
main().catch(err => {
  console.error('エラーが発生しました:', err);
  process.exit(1);
});
