import { createClient } from 'honox/client'
import { hydrate } from 'preact'; // preact/compat から preact に変更

createClient({
  hydrate: (elem, root) => hydrate(elem, root), // hydrate 関数を指定
})