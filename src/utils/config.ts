import * as fs from 'fs';
import * as path from 'path';

export function loadConfig() {
  try {
    const configPath = path.join(__dirname, '../../src/config/config.json');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent);
    }
  } catch (err) {
    console.error('設定ファイルの読み込みに失敗しました:', err);
  }

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

export function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`ディレクトリを作成しました: ${dir}`);
  }
}