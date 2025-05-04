import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESモジュールでも__dirnameを使えるようにするためのヘルパー関数
const getDirname = () => {
  try {
    // ESモジュール環境では import.meta.url を使用
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {
    // CommonJS環境ではプロジェクトルートからの相対パスを返す
    return path.resolve('.');
  }
};

export function loadConfig() {
  try {
    // srcディレクトリ参照を削除し、プロジェクトルートのconfig.jsonを参照
    const configPath = path.join(getDirname(), '../../../config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configData);
    } else {
      // 設定ファイルが存在しない場合、デフォルト設定を返す
      return {
        outputDir: './dist',
        parsers: [
          {
            name: 'JR',
            urls: []
          },
          {
            name: 'Kintetsu',
            urls: []
          }
        ]
      };
    }
  } catch (error) {
    console.error('設定ファイルの読み込みに失敗しました:', error);
    return {
      outputDir: './dist',
      parsers: []
    };
  }
}

export function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`ディレクトリを作成しました: ${dirPath}`);
    } catch (error) {
      console.error(`ディレクトリの作成に失敗しました: ${dirPath}`, error);
    }
  }
}