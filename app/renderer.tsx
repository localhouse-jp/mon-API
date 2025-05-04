import { html } from 'hono/html'

export const renderer = (content: string) => {
  return html`
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>近畿大学研究プロジェクト</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" />
        <style>
          body { font-family: sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
          code { background-color: #f5f5f5; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }
          th { background-color: #f5f5f5; }
          .endpoint { background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .method { font-weight: bold; color: #2c873a; }
          .path { font-family: monospace; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `
}