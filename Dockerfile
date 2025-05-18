FROM oven/bun:latest as builder

WORKDIR /app

# 依存関係のインストールに必要なファイルをコピー
COPY package.json bun.lock ./

# 依存関係のインストール
RUN bun install --frozen-lockfile

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN bun run build

# 実行ステージ
FROM oven/bun:latest

WORKDIR /app

# ビルドステージから必要なファイルをコピー
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/openapi.yaml ./

# 必要なディレクトリを作成
RUN mkdir -p tmp/cache public

# 本番環境向けに依存関係をインストール（開発用依存関係はスキップ）
RUN bun install --production --frozen-lockfile

# アプリケーションがリッスンするポート
EXPOSE 3000

# コンテナ起動時に実行されるコマンド
CMD ["bun", "run", "dist/server.js"]