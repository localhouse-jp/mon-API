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

# スタートアップスクリプトを追加
COPY --from=builder /app/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# コンテナ起動時に実行されるコマンド
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# DISABLE_API 環境変数のチェック
ARG DISABLE_API
ENV DISABLE_API=${DISABLE_API}

RUN if [ "$DISABLE_API" = "true" ]; then \
  echo "API is disabled. Skipping API-related setup."; \
  else \
  echo "API is enabled. Proceeding with API-related setup."; \
  fi