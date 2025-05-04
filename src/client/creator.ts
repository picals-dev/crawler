import got from 'got'
import { printObj } from '~/utils/printObj.ts'

type DebugOption = boolean | (() => boolean)

export interface HttpClientOptions {
  showReqInfo?: DebugOption
  showResInfo?: DebugOption
}

function isDebugEnabled(debug?: DebugOption): boolean {
  return typeof debug === 'function' ? debug() : !!debug
}

function formatRequest(opts: any) {
  return {
    method: opts.method,
    url: opts.url?.toString?.() ?? opts.url,
    headers: opts.headers,
    ...(opts.searchParams ? { searchParams: opts.searchParams } : {}),
    ...(opts.json ? { json: opts.json } : {}),
    ...(opts.body ? { body: opts.body } : {}),
  }
}

function formatResponse(res: any) {
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body,
  }
}

export function createHttpClient({ showReqInfo, showResInfo }: HttpClientOptions) {
  return got.extend({
    hooks: {
      beforeRequest: [
        (opts) => {
          if (isDebugEnabled(showReqInfo)) {
            printObj(formatRequest(opts), 2, '➡️  [Request]')
          }
        },
      ],
      afterResponse: [
        (res) => {
          if (isDebugEnabled(showResInfo)) {
            printObj(formatResponse(res), 2, '⬅️  [Response]')
          }
          return res
        },
      ],
    },
  })
}
