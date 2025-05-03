// 必要パッケージのインストール
// bun add cheerio iconv-lite fs

import * as fs from 'fs';
import * as path from 'path';
import { KintetsuParser } from './parsers/kintetsu';
import { TimetableParser } from './types';
// JRパーサーは別ファイル（./jr.ts）で実装されているため、importしない

// 引数処理用の簡易インターフェース
interface ParserConfig {
  name: string;
  urls: string[];
}

// 設定ファイルのインターフェース（実行時引数がない場合に使用）
interface ConfigFile {
  parsers: ParserConfig[];
  outputDir?: string;
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
    outputDir: './dist'
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
    // JRパーサーは別ファイル（./jr.ts）で実装
    default:
      console.error(`未知のパーサー: ${name}`);
      return null;
  }
}

/**
 * 出力ディレクトリを確保
 * @param dir ディレクトリパス
 */
function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`ディレクトリを作成しました: ${dir}`);
  }
}

/**
 * メイン関数
 */
async function main() {
  // 設定を読み込む
  const config = loadConfig();
  const outputDir = config.outputDir || './dist';

  // 出力ディレクトリを作成
  ensureDirectoryExists(outputDir);

  // 近鉄パーサーを実行
  const kintetsuConfig = config.parsers.find(p => p.name.toLowerCase() === 'kintetsu');
  if (kintetsuConfig) {
    const parser = getParserByName('kintetsu');
    if (parser) {
      console.log(`パーサー kintetsu を実行中...`);
      try {
        const result = await parser.parseUrls(kintetsuConfig.urls);
        const outputPath = path.join(outputDir, 'kintetsu-train.json');
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
        console.log(`近鉄の結果を ${outputPath} に出力しました`);
      } catch (err) {
        console.error(`パーサー kintetsu の実行中にエラーが発生しました:`, err);
      }
    }
  }

  // JRパーサーは別ファイル（./jr.ts）で実行するため、ここでは何もしない
  console.log('JRパーサーは別ファイル（./jr.ts）で実行してください');
}

// スクリプト実行
main().catch(err => {
  console.error('エラーが発生しました:', err);
  process.exit(1);
});
