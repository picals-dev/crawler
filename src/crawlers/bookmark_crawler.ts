import type { Agents } from 'got'
import got from 'got'
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent'
import { StatusCodes } from 'http-status-codes'
import pLimit from 'p-limit'
import { Collector } from '~/collector/collector.ts'
import { collect } from '~/collector/collector_unit.ts'
import { selectBookmark } from '~/collector/selectors.ts'
import { debug_config, download_config, network_config, user_config } from '~/configs/index.ts'
import { Downloader } from '~/downloader/downloader.ts'
import { assertError, assertWarn, printInfo } from '~/utils/logMessage.ts'
import { sleep } from '~/utils/sleep.ts'

interface IBookmarkCrawler {
  imageNum: number
  userId: string
  userUrl: string
  downloader: Downloader
  collector: Collector
  _requestCount: () => Promise<void>
  collect: (perJsonWorkCount: number) => Promise<void>
  run: () => Promise<string[] | number>
}

export class BookmarkCrawler implements IBookmarkCrawler {
  public imageNum: number
  public userId: string
  public userUrl: string
  public downloader: Downloader
  public collector: Collector

  constructor(imageNum: number, capacity: number = 1024) {
    this.imageNum = imageNum
    this.userId = user_config.user_id
    this.userUrl = `https://www.pixiv.net/ajax/user/${this.userId}/illusts`
    this.downloader = new Downloader(capacity)
    this.collector = new Collector(this.downloader)
  }

  async _requestCount() {
    const url = `${this.userUrl}/bookmark/tags?lang=zh`
    printInfo('========== Bookmark crawler start ==========')

    const headers = { ...network_config.headers, COOKIE: user_config.cookie }

    for (let i = 0; i < download_config.retry_times; i++) {
      try {
        const agent: Agents | undefined = network_config.proxy.http
          ? { http: new HttpProxyAgent({ proxy: network_config.proxy.http }) }
          : network_config.proxy.https
            ? { https: new HttpsProxyAgent({ proxy: network_config.proxy.https }) }
            : undefined

        const response = await got(url, { headers, agent, timeout: { connect: download_config.timeout } })

        if (response.statusCode === StatusCodes.OK) {
          const body = JSON.parse(response.body)
          const totalCount = body.body.public[0].cnt
          this.imageNum = Math.min(this.imageNum, Number.parseInt(totalCount))
          printInfo(`Select ${this.imageNum}/${totalCount} artworks`)
          printInfo('========== Bookmark crawler end ==========')
          return
        }
      }
      catch (error) {
        assertWarn(!debug_config.show_error, `Failed to request count: ${error}`)
        assertWarn(!debug_config.show_error, `Retry ${i + 1} times`)
        await sleep(download_config.fail_delay)
      }
    }
    assertWarn(false, 'Please check your cookie configuration')
    assertError(false, '========== Fail to get bookmark count ==========')
  }

  async collect(perJsonWorkCount: number = 48) {
    const pageCount = Math.ceil((this.imageNum - 1) / perJsonWorkCount)
    printInfo(`========== Start collecting ${this.userId}'s bookmarks ==========`)

    const urls = new Set<string>()
    for (let i = 0; i < pageCount; i++) {
      const url = `${this.userUrl}/bookmarks?tag=&offset=${i * perJsonWorkCount}&limit=${perJsonWorkCount}&rest=show&lang=zh`
      urls.add(url)
      const additionalHeaders = { COOKIE: user_config.cookie }

      const limit = pLimit(download_config.num_threads)
      const tasks = Array.from(urls).map(url =>
        limit(async () => {
          try {
            const imageIds = await collect(url, selectBookmark, additionalHeaders)
            if (imageIds) {
              this.collector.add(imageIds)
            }
          }
          catch (error) {
            assertWarn(false, `Failed to collect bookmarks: ${error}`)
          }
        }),
      )
      await Promise.all(tasks)
    }

    printInfo(`========== End collecting ${this.userId}'s bookmarks ==========`)
    printInfo(`Total ${this.collector.idGroup.size} bookmarks collected`)
  }

  async run() {
    await this._requestCount()
    await this.collect()
    await this.collector.collect()
    return await this.downloader.download()
  }
}
