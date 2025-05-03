# 鉄道・バス時刻表 API

複数の鉄道会社とバス会社の時刻表データを収集し、JSON形式で提供するAPIサーバーです。
現在は近鉄・JRの鉄道時刻表と近鉄バスの時刻表に対応しています。

## 機能

- 複数の鉄道会社・バス会社の時刻表情報をスクレイピングまたは定義データから提供
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
│   │   ├── kintetsu.ts   # 近鉄パーサー実装
│   │   └── kintetsu-bus.ts # 近鉄バスパーサー実装
│   ├── scripts/          # 実行スクリプト
│   │   └── generate-json.ts  # JSONファイル生成スクリプト
│   ├── types/            # 型定義ファイル
│   │   └── index.ts      # 共通型定義
│   ├── utils/            # ユーティリティ関数
│   │   ├── cache.ts      # キャッシュユーティリティ
│   │   └── config.ts     # 設定読み込みユーティリティ
│   └── index.ts          # アプリケーションのエントリーポイント
├── dist/                 # 出力データディレクトリ
├── config.json           # メイン設定ファイル
├── package.json          # パッケージ設定
├── openapi.yaml          # OpenAPIドキュメント
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

### JSONファイルの直接生成

APIサーバーを起動せずに、時刻表データのJSONファイルを直接生成することもできます：

```bash
# すべての鉄道会社のJSONファイルを生成
bun run src/scripts/generate-json.ts

# 特定の鉄道会社のみ生成
bun run src/scripts/generate-json.ts kintetsu  # 近鉄のデータのみ
bun run src/scripts/generate-json.ts jr        # JRのデータのみ
```

生成されるJSONファイルは `dist` ディレクトリに保存されます：
- `dist/kintetsu-train.json` - 近鉄の時刻表データ
- `dist/jr-train.json` - JRの時刻表データ

### 利用可能なエンドポイント

#### 鉄道関連

- `GET /api/kintetsu` - 近鉄の鉄道時刻表データを取得
- `GET /api/jr` - JRの鉄道時刻表データを取得

#### バス関連

- `GET /api/kintetsu-bus` - 近鉄バスの全時刻表データを取得
- `GET /api/kintetsu-bus/calendar/:date` - 指定日（YYYY-MM-DD形式）の運行情報を取得
- `GET /api/kintetsu-bus/stop/:stopName` - 特定のバス停の時刻表を取得
  - `date` クエリパラメータで日付指定可能（例: `/api/kintetsu-bus/stop/近畿大学東門前?date=2025-05-07`）

#### 総合

- `GET /api/all` - すべての鉄道・バス会社のデータを統合して取得
- `POST /api/cache/clear` - キャッシュをクリア（オプションで特定のキーのみをクリア可能）

### データの直接更新

すべてのデータは通常自動的にキャッシュされ、1時間ごとに更新されますが、必要に応じて以下のコマンドを実行して直接APIサーバーを通じてデータを更新できます：

```bash
# キャッシュをクリアして強制更新
curl -X POST http://localhost:3000/api/cache/clear -H "Content-Type: application/json" -d '{"key":"all"}'
```

## 近鉄バスの運行カレンダー

近鉄バスは運行日によって運行パターンが異なります：

- **運行日（A）** - 通常の平日運行
- **運行日（B）** - 土曜・休日など一部の日の運行
- **運行なし** - 日曜や祝日など運行しない日

運行日のカレンダーは各月ごとに定義されており、`/api/kintetsu-bus/calendar/:date` エンドポイントを使用して特定の日の運行情報を取得できます。

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

