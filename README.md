# 鉄道・バス時刻表 API

複数の鉄道会社とバス会社の時刻表データを収集し、JSON形式で提供するAPIサーバーです。
現在は近鉄・JRの鉄道時刻表と近鉄バスの時刻表に対応しています。

## ✨ 機能

- 複数の鉄道会社・バス会社の時刻表情報をスクレイピングまたは定義データから取得
- 時刻表データをJSON形式でAPI提供
- インメモリキャッシュによるパフォーマンス最適化（デフォルト1時間ごとに更新）
- ファイルベースのデータ永続化（オプション）

## 🛠️ 技術スタック

- **ランタイム:** [Bun](https://bun.sh/)
- **Webフレームワーク:** [Hono](https://hono.dev/)
- **HTMLパース:** [Cheerio](https://cheerio.js.org/)
- **言語:** TypeScript

## 📂 プロジェクト構成

```
research-kindai/
├── app/                  # アプリケーションソースコード
│   ├── app.ts            # Honoアプリケーション設定
│   ├── client.ts         # フロントエンド用クライアントサイドコード (未使用の可能性あり)
│   ├── global.d.ts       # グローバル型定義
│   ├── renderer.tsx      # JSXレンダラー (Hono用)
│   ├── server.ts         # APIサーバーエントリーポイント
│   ├── components/       # Reactコンポーネント (Hono JSX用)
│   │   ├── DateSelector.tsx
│   │   ├── ErrorPage.tsx
│   │   └── Layout.tsx
│   ├── lib/              # コアロジック・ライブラリ
│   │   ├── api.ts        # 外部API連携 (未使用の可能性あり)
│   │   ├── parsers/      # 各社時刻表パーサー
│   │   │   ├── jr.ts
│   │   │   ├── kintetsu.ts
│   │   │   └── kintetsu-bus.ts
│   │   ├── types/        # 型定義
│   │   └── utils/        # ユーティリティ関数
│   │       ├── cache.ts  # キャッシュ管理
│   │       └── config.ts # 設定読み込み
│   └── routes/           # ルーティング定義
│       ├── index.tsx     # トップページ (HTML)
│       ├── api/          # APIエンドポイント
│       │   ├── all.ts
│       │   ├── jr.ts
│       │   ├── kintetsu.ts
│       │   ├── kintetsu-bus.ts
│       │   ├── cache/    # キャッシュ操作API
│       │   │   └── clear.ts
│       │   └── kintetsu-bus/ # 近鉄バス関連API
│       │       ├── calendar/
│       │       │   └── [date].ts
│       │       └── stop/
│       │           └── [stopName].ts
│       └── view/         # HTMLビュー用ルート
│           └── kintetsu-bus/
│               ├── index.tsx
│               ├── calendar/
│               │   ├── [date].tsx
│               │   └── index.tsx
│               └── stop/
│                   └── [stopName].tsx
├── dist/                 # データ出力ディレクトリ (main.ts実行時)
├── bun.lockb             # Bunロックファイル
├── config.json           # 設定ファイル
├── main.ts               # データ生成・出力スクリプト
├── openapi.yaml          # OpenAPI仕様 (ドキュメント)
├── package.json          # プロジェクトメタデータ・依存関係
├── tsconfig.json         # TypeScript設定
├── vite.config.ts        # Vite設定 (未使用の可能性あり)
└── README.md             # このファイル
```

## 🚀 インストール

### 必要条件

- [Bun](https://bun.sh/) (v1.0.0以上推奨)

### セットアップ手順

1.  **リポジトリをクローン:**
    ```bash
    git clone https://github.com/localhouse-jp/mon-API.git
    cd research-kindai
    ```
2.  **依存関係をインストール:**
    ```bash
    bun install
    ```

## ▶️ 使い方

### 1. APIサーバーとして利用

開発モードでAPIサーバーを起動します。

```bash
bun run dev # package.jsonのscripts.devを参照 (例: bun run app/server.ts)
# または直接実行
bun run app/server.ts
```

サーバーはデフォルトで `http://localhost:3000` で起動します。

### 2. JSONファイルを直接生成 (サーバー不要)

時刻表データを直接JSONファイルとして生成し、`dist` ディレクトリに出力します。

```bash
# 設定ファイル(config.json)に基づいて全データを生成
bun run main.ts

# 個別のパーサーを実行して生成 (例: JRデータ)
# bun run app/lib/parsers/jr.ts # (パーサーが直接実行可能か要確認)
```

生成されるファイル例:
- `dist/kintetsu-train.json`
- `dist/jr-train.json`
- `dist/kintetsu-bus.json` (パーサー実装による)

## 🔌 APIエンドポイント

### 鉄道 (Train)

- `GET /api/kintetsu`: 近鉄の鉄道時刻表データを取得
- `GET /api/jr`: JRの鉄道時刻表データを取得

### バス (Bus)

- `GET /api/kintetsu-bus`: 近鉄バスの全時刻表データを取得
- `GET /api/kintetsu-bus/calendar/:date`: 指定日 (`YYYY-MM-DD`) の運行カレンダー情報 (運行日A/B/運休など) を取得
- `GET /api/kintetsu-bus/stop/:stopName`: 特定のバス停の時刻表を取得
    - クエリパラメータ `?date=YYYY-MM-DD` で日付指定可能 (例: `/api/kintetsu-bus/stop/近畿大学東門前?date=2025-05-07`)

### 統合 (All)

- `GET /api/all`: すべての鉄道・バス会社のデータを統合して取得

### キャッシュ (Cache)

- `POST /api/cache/clear`: APIサーバーのインメモリキャッシュをクリア
    - リクエストボディでクリア対象を指定可能 (例: `{"key": "kintetsu"}` や `{"key": "all"}`)

## 🖥️ HTMLビュー

HonoのJSX機能を利用した簡単なHTMLビューも提供されます。

- `/`: APIの簡単な説明ページ
- `/view/kintetsu-bus/calendar`: 近鉄バスの運行カレンダー表示ページ
- `/view/kintetsu-bus/calendar/:date`: 指定日のカレンダー情報表示
- `/view/kintetsu-bus/stop/:stopName`: 指定バス停の時刻表表示ページ

## 🔄 データの更新

- **APIサーバー:** デフォルトで1時間ごとにキャッシュが自動更新されます。
- **手動更新:** キャッシュを即時クリアして最新データを取得させたい場合は、キャッシュクリアAPIを利用します。
  ```bash
  # 例: すべてのキャッシュをクリア
  curl -X POST http://localhost:3000/api/cache/clear -H "Content-Type: application/json" -d '{"key":"all"}'
  ```
- **直接生成:** `bun run main.ts` を再実行すると、最新データで `dist` ディレクトリのJSONファイルが上書きされます。

## 🚌 近鉄バスの運行カレンダーについて

近鉄バスは日によって運行ダイヤが異なります。APIでは主に以下の区分で情報を提供します。

- **運行日 (A):** 主に平日ダイヤ
- **運行日 (B):** 主に土曜・休日ダイヤ
- **運休日:** バスが運行しない日

詳細は `/api/kintetsu-bus/calendar/:date` エンドポイントで確認できます。

## ⚙️ 設定 (`config.json`)

`config.json` でデータ取得元などの設定を行います。

```json
{
  "parsers": [
    {
      "name": "kintetsu", // パーサー名 (lib/parsers/ 内のファイル名と対応想定)
      "urls": [ // データ取得元URLリスト
        "https://eki.kintetsu.co.jp/norikae/T5?USR=PC&slCode=356-5&d=1&dw=0",
        "https://eki.kintetsu.co.jp/norikae/T5?USR=PC&slCode=350-8&d=1&dw=0"
      ]
    },
    {
      "name": "jr",
      "urls": [ /* JR用URL */ ]
    },
    {
      "name": "kintetsu-bus",
      "calendarUrl": "...", // カレンダー情報URL
      "stopUrls": { // バス停ごとのURLなど
        "近畿大学東門前": "..."
      }
    }
    // 他のパーサー設定...
  ],
  "outputDir": "./dist", // main.ts での出力先ディレクトリ
  "cacheTTL": 3600 // キャッシュ有効期間 (秒、デフォルト3600秒 = 1時間)
}
```
*注: `config.json` の正確な構造は `lib/utils/config.ts` の実装に依存します。上記は一例です。*

