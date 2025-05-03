# 鉄道時刻表 API

複数の鉄道会社の時刻表データを収集し、JSON形式で提供するAPIサーバーです。
現在は近鉄とJRの時刻表に対応しています。

## 機能

- 複数の鉄道会社の時刻表情報をスクレイピング
- 時刻表データをJSON形式でAPI提供
- インメモリキャッシュによるパフォーマンス最適化（1時間ごとに更新）
- ファイルベースのデータ永続化

## 技術スタック

- [Bun](https://bun.sh/) - JavaScript/TypeScriptランタイム
- [Hono](https://hono.dev/) - 軽量WebフレームワークとHTTPサーバー
- [Cheerio](https://cheerio.js.org/) - サーバーサイドでのHTMLパース

## プロジェクト構成

```
research-kindai/
├── src/                  # ソースコードのルートディレクトリ
│   ├── api/              # APIルート定義
│   │   └── routes.ts     # APIエンドポイントの実装
│   ├── parsers/          # パーサーのコード
│   │   ├── jr.ts         # JRのパーサー実装
│   │   └── kintetsu.ts   # 近鉄パーサー実装
│   ├── utils/            # ユーティリティ関数
│   │   ├── cache.ts      # キャッシュユーティリティ
│   │   └── config.ts     # 設定読み込みユーティリティ
│   └── index.ts          # アプリケーションのエントリーポイント
├── dist/                 # 出力データディレクトリ
├── config.json           # メイン設定ファイル
├── package.json          # パッケージ設定
└── README.md             # このファイル
```

## インストール

### 必要条件

- [Bun](https://bun.sh/) 1.0.0以上

### セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/research-kindai.git
cd research-kindai

# 依存関係のインストール
bun install
```

## 使い方

### APIサーバーの起動

```bash
# 開発モードでサーバーを起動
bun run src/index.ts
```

サーバーはデフォルトで http://localhost:3000 で起動します。

### 環境変数

- `PORT`: サーバーのポート番号（デフォルト: 3000）
- `CACHE_VALIDITY_MS`: キャッシュの有効期間（ミリ秒、デフォルト: 3600000 = 1時間）

### 利用可能なエンドポイント

- `GET /api/kintetsu` - 近鉄の時刻表データを取得
- `GET /api/jr` - JRの時刻表データを取得
- `GET /api/all` - すべての鉄道会社のデータを統合して取得
- `POST /api/cache/clear` - キャッシュをクリア（オプションで特定のキーのみをクリア可能）

### データの直接更新

すべてのデータは通常自動的にキャッシュされ、1時間ごとに更新されますが、必要に応じて以下のコマンドを実行して直接APIサーバーを通じてデータを更新できます：

```bash
# キャッシュをクリアして強制更新
curl -X POST http://localhost:3000/api/cache/clear -H "Content-Type: application/json" -d '{"key":"all"}'
```

## 設定

`config.json` ファイルで設定を行います：

```json
{
  "parsers": [
    {
      "name": "kintetsu",
      "urls": [
        "https://eki.kintetsu.co.jp/norikae/T5?USR=PC&slCode=356-5&d=1&dw=0",
        "https://eki.kintetsu.co.jp/norikae/T5?USR=PC&slCode=350-8&d=1&dw=0"
      ]
    }
  ],
  "outputDir": "./dist"
}
```

## 拡張方法

### 新しいパーサーの追加

1. `src/parsers/` ディレクトリに新しいパーサーファイルを作成
2. `TimetableEntry` インターフェースに準拠した実装を行う
3. `src/api/routes.ts` ファイルに新しいパーサーのエンドポイントを追加

## ライセンス

MIT

## 注意事項

このプロジェクトは学習・研究目的で作成されています。各鉄道会社の時刻表データの利用については、各社の利用規約を確認してください。過度なリクエストを送信しないよう、適切なキャッシュ設定を行ってください。