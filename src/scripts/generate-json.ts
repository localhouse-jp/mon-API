/**
 * JSONファイル生成スクリプト
 * 
 * このスクリプトは鉄道会社のパーサーを実行し、JSONファイルを生成するだけの機能を提供します。
 * サーバーを起動せずに時刻表データを更新したい場合に使用します。
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseJR } from '../parsers/jr';
import { KintetsuParser } from '../parsers/kintetsu';
import { ensureDirectoryExists, loadConfig } from '../utils/config';

// コマンドライン引数を処理
const args = process.argv.slice(2);
const targetParser = args[0]?.toLowerCase();

async function main() {
  const config = loadConfig();
  const outputDir = config.outputDir || './dist';
  ensureDirectoryExists(outputDir);

  console.log('JSONファイル生成を開始します...');

  // 特定のパーサーが指定されていない場合は全てのパーサーを実行
  if (!targetParser || targetParser === 'all') {
    await generateAllJson(outputDir, config);
  } else if (targetParser === 'kintetsu') {
    await generateKintetsuJson(outputDir, config);
  } else if (targetParser === 'jr') {
    await generateJRJson(outputDir);
  } else {
    console.error(`未知のパーサー: ${targetParser}`);
    console.log('使用方法: bun run src/scripts/generate-json.ts [kintetsu|jr|all]');
    process.exit(1);
  }
}

/**
 * 全てのパーサーを実行してJSONファイルを生成
 */
async function generateAllJson(outputDir: string, config: any) {
  try {
    // 並列実行
    await Promise.all([
      generateKintetsuJson(outputDir, config),
      generateJRJson(outputDir)
    ]);
    console.log('全てのJSONファイルの生成が完了しました。');
  } catch (error) {
    console.error('JSON生成中にエラーが発生しました:', error);
  }
}

/**
 * 近鉄パーサーを実行してJSONファイルを生成
 */
async function generateKintetsuJson(outputDir: string, config: any) {
  try {
    console.log('近鉄時刻表データの取得を開始...');
    const kintetsuConfig = config.parsers.find((p: any) => p.name.toLowerCase() === 'kintetsu');

    if (!kintetsuConfig) {
      console.error('近鉄の設定が見つかりません');
      return;
    }

    const parser = new KintetsuParser();
    const result = await parser.parseUrls(kintetsuConfig.urls);

    const outputPath = path.join(outputDir, 'kintetsu-train.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`近鉄データを ${outputPath} に保存しました`);
    return result;
  } catch (error) {
    console.error('近鉄データの取得に失敗しました:', error);
  }
}

/**
 * JRパーサーを実行してJSONファイルを生成
 */
async function generateJRJson(outputDir: string) {
  try {
    console.log('JR時刻表データの取得を開始...');
    const result = await parseJR();

    console.log(`JRデータを ${outputDir}/jr-train.json に保存しました`);
    return result;
  } catch (error) {
    console.error('JRデータの取得に失敗しました:', error);
  }
}

// スクリプト実行
main().catch(err => {
  console.error('エラーが発生しました:', err);
  process.exit(1);
});