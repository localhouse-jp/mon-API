#!/bin/sh
set -e

# 環境変数DISABLE_APIが設定されていれば（trueなどの値）、実行をスキップ
if [ -n "$DISABLE_API" ] && [ "$DISABLE_API" != "false" ]; then
  echo "DISABLE_API環境変数が設定されているため、APIを実行しません。"
  # ここで無限ループなどを使ってコンテナを稼働させたままにするか、
  # エコーだけして終了するかを選択できます
  echo "コンテナは稼働状態を維持します。"
  # 無限ループでコンテナを稼働させ続ける
  tail -f /dev/null
else
  echo "APIを起動します..."
  # 通常のアプリケーション起動コマンド
  exec bun run dist/server.js
fi
