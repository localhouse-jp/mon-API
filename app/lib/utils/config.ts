import * as fs from 'fs';

// 設定を直接コードとして定義
export const CONFIG = {
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

export function loadConfig() {
  // 設定を直接返す（外部ファイルに依存せず）
  return CONFIG;
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