import type { Got } from 'got'
import got from 'got'
import { printObj } from '~/utils/printObj.ts'

export interface HttpClientOptions {
  debug?: boolean
}

export function createHttpClient(options: HttpClientOptions = {}): Got {
  const {
    debug = false,
  } = options

  return got.extend({
    hooks: {
      beforeRequest: [
        (opts) => {
          if (debug) {
            printObj(opts, 2, '➡️  [Request]')
          }
        },
      ],
      afterResponse: [
        (res) => {
          if (debug) {
            printObj(res, 2, '⬅️  [Response]')
          }
          return res
        },
      ],
    },
  })
}
